/**
* anything to do with updating the DOM
* @namespace Render
*/
var Render = (function (ns) {
  
  function addElem (parent, type , text) {
    
    var elem = document.createElement(type);
    parent.appendChild(elem);
    elem.innerHTML = typeof text === typeof undefined ? '' : text ;
    return elem;
  }
  
  /**
  * show the app data
  */
  ns.report = function () {
    
    // this is the report elemeent
    var div = App.globals.divs.report;

    
    // may be mutiple providers
    Object.keys (App.globals.result).forEach (function(providerKey) {
      var result = App.globals.result[providerKey].queryResults;
      var headings = App.globals.result[providerKey].headings;
      var feature = App.globals.result[providerKey].feature;
      
      if (!Object.keys(result).length) {
        App.reportMessage("no data found for " + providerKey);
      }
      else {
        
        // clear it
        div.innerHTML = "";
        
        // title
        addElem (div,"H2", feature + " (" + providerKey + ")");
        
        // table of results
        var table = addElem (div , 'TABLE');
        
        // headings
        var tr = addElem (table , 'TR');
        addElem (tr , 'TH' , 'file');
        addElem (tr , 'TH' , 'cached');
        headings.forEach(function (k) {
          addElem (tr , 'TH' , k);
        });
        addElem (tr , 'TH' , 'image');
        
        // data
        result.forEach(function (p) { 
          
          p.data.forEach (function (d,i,a) { 
            var tr = addElem (table , 'TR');
            
            // add the stuff that only appears on the first result
            if (!i) { 
              var td = addElem (tr , 'TD' , p.file.fileName)
              td.rowSpan = a.length.toString();
              var td = addElem (tr , 'TD' , p.requestIndex ? 'no' : 'yes' );
              td.rowSpan = a.length.toString();
            }
            
            // the results
            headings.forEach(function (k) { 
              addElem (tr , 'TD' , d[k]);
            }); 
            
            // the image
            if (!i) { 
              var td = addElem (tr,"TD");
              td.rowSpan = a.length.toString();
              var img = addElem (td,"IMG");
              img.style.width = App.globals.styles.image.width;
              img.style.height= App.globals.styles.image.height;
              img.src = "data:" + p.file.type + ";base64,"+p.file.b64;
            }
            
          });
        });
      }
    });
  };
  
  /**
  * show the scaled data as charts
  */
  ns.chart = function () {
    
    // this is the report elemeent
    var div = App.globals.divs.report;

    
    if (!Object.keys (App.globals.result).length) {
      App.reportMessage("no data found");
    }
    
    else {
      
      // shortcut
      var gr = App.globals.result;
      var gk = Object.keys(gr);
      var gh = gk.reduce(function (p,c) {
        p[c] = gr[c].headings;
        return p;
      },{});
      
      // color scale - use the one with the biggest number of headings
      var colorScale = chroma.scale(['blue','green','red']);
      var scaleLength = Math.max.apply(null,Object.keys(gh).map(function(k) { return gh[k].length }));
      
      // the chart options
      var options = {
        chartArea:{
          width:'50%'
        },
        hAxis: {
          minValue: 0,
          maxValue: 1,
          textStyle: {
            color: '#4d4d4d'
          },
        },
        legend: { position: "none" },
        width:App.globals.styles.chart.width,
        height:App.globals.styles.chart.width
      };
      
      
      // clear it
      div.innerHTML = "";
       
      // title
      addElem (div,"H2", App.globals.result[gk[0]].feature);
      
      // table of results
      var table = addElem (div , 'TABLE');
      
      // headings
      var tr = addElem (table , 'TR');
      addElem (tr , 'TH' , 'file');
      addElem (tr , 'TH' , 'image');
      
      gk.forEach (function(providerKey) {
        addElem (tr , 'TH' ,providerKey + ' emotion likelihood');
      });
      
      // organize the data a bit better - its kind of tranposed
      var transposed = [],index = 0;
      gk.forEach(function(k) {
        gr[k].queryResults.forEach(function (d,i) {
          transposed[i] = transposed[i] || {};
          transposed[i][k] = d;
        });
      });

      
      // check that filenames match - should never happen
      if (!transposed.every (function (d) {
        return gk.every(function(k) {
          return d[k].file.id === d[gk[0]].file.id;
        });
      })) { App.reportMessage ("damn it - mismatched file ids"); }
      
      // data
      transposed.forEach(function (p,index) { 
        
        // the filename - files should be the same in each
        var pFirst = p[gk[0]];
        var tr = addElem (table , 'TR');
        addElem (tr , 'TD' , pFirst.file.fileName);
        
        // the image
        var td = addElem (tr,"TD");
        var img = addElem (td,"IMG");
        img.style.width = App.globals.styles.image.width;
        img.style.height= App.globals.styles.image.height;
        img.src = "data:" + pFirst.file.type + ";base64,"+pFirst.file.b64;

        
        gk.forEach (function (provider, pidx) {
          var dataTable = google.visualization.arrayToDataTable([
            ['emotion ' , provider ,{ role: 'style' }]]
             .concat(gh[provider].map(function(k,i) {
               // there may not be a scaling.. so just use the first data item
                return [k , (p[provider].scales || p[provider].data[0])[k],  'color:' + colorScale(i/scaleLength).hex()]; 
              })));
        
          var td = addElem(tr,"TD");
          var chart = new google.visualization.BarChart(td);
          chart.draw (dataTable, options);
        });
      });
    }
    
  };
  
  
  
  // [{"mid":1,"description":1,"score":1},{"mid":1,"description":1,"score":1},{"mid":1,"description":1,"score":1}]
  /**
  * hide a div
  * @param {element} element
  * @param {boolean} visible whether to show or hide
  * @return {element} the div
  */
  ns.hide = function (element , hide) {
    element.style.display = hide ? "none" : "block";
    return element;
  };
  return ns;
}) (Render || {});
