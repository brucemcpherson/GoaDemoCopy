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
    var result = App.globals.result;
    
    if (!result.length) {
      App.reportMessage("no data found");
    }
    else {
      // generate headings - same for eeach item
      var headings = result[0].headings;
      
      // clear it
      div.innerHTML = "";
      
      // title
      addElem (div,"H2", result.feature);
      
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
  };
  

        
  /**
  * show the scaled data as charts
  */
  ns.emotion = function () {
    
    // this is the report elemeent
    var div = App.globals.divs.report;
    var result = App.globals.result;
    
    
    if (!result.google.length) {
      App.reportMessage("no data found");
    }
    else {
      // generate headings - same for eeach item
      var headings = result.google[0].headings;
      var msHeadings = result.ms.headings;
      
      // clear it
      div.innerHTML = "";
    
      // title
      addElem (div,"H2", result.google.feature);
    
      // table of results
      var table = addElem (div , 'TABLE');
    
      // headings
      var tr = addElem (table , 'TR');
      addElem (tr , 'TH' , 'file');
      addElem (tr , 'TH' , 'image');
      addElem (tr , 'TH' ,'google emotion likelihood');
      addElem (tr , 'TH' ,'ms emotion likelihood');

      // color scale
      var colorScale = chroma.scale(['blue','red']);
      var scaleLength = Math.max (headings.length, msHeadings.length);
      console.log(colorScale);
      
      // data
      result.google.forEach(function (p,index) { 
      
      // the filename
        var tr = addElem (table , 'TR');
        addElem (tr , 'TD' , p.file.fileName);

        // the image
        var td = addElem (tr,"TD");
        var img = addElem (td,"IMG");
        img.style.width = App.globals.styles.image.width;
        img.style.height= App.globals.styles.image.height;
        img.src = "data:" + p.file.type + ";base64,"+p.file.b64;

        
        // the chart
        var dataTable = google.visualization.arrayToDataTable([
          ['emotion', 'google cloud vision',{ role: 'style' }]].concat(headings.map(function(k,i) {
            return [k,p.scales[k],  'color:' + colorScale(i/scaleLength).hex()]; 
          })));
        
        // the ms chart
        var msDataTable = google.visualization.arrayToDataTable([
          ['emotion', 'ms emotion api',{ role: 'style' }]].concat(msHeadings.map(function(k,i) {
            return [k,result.ms.data[index][k],  'color:' + colorScale(i/scaleLength  ).hex()]; 
          })));
        
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
        
        var td = addElem(tr,"TD");
        var chart = new google.visualization.BarChart(td);
        chart.draw (dataTable, options);
        
        var td = addElem(tr,"TD");
        var chart = new google.visualization.BarChart(td);
        chart.draw (msDataTable, options);
        
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
