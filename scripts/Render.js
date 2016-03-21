/**
 * anything to do with updating the DOM
 * @namespace Render
 */
var Render = (function (ns) {
  
  /**
   * show the app data
   */
  ns.report = function () {
    
    function addElem (parent, type , text) {
    
      var elem = document.createElement(type);
      parent.appendChild(elem);
      elem.innerHTML = typeof text === typeof undefined ? '' : text ;
      return elem;
    }
    
    // this is the report elemeent
    var div = App.globals.divs.report;
    var result = App.globals.result;
    
    // clear it
    div.innerHTML = "";
    
    // title
    addElem (div,"H2", result.feature);
    
    // table of results
    var table = addElem (div , 'TABLE');
    
    // headings
    var tr = addElem (table , 'TR');
    addElem (tr , 'TH' , 'file');
    result.headings.forEach(function (k) {
      addElem (tr , 'TH' , k);
    });
    addElem (tr , 'TH' , 'image');
    
    // data
    result.data.forEach(function (p) { 
      p.rows.forEach (function (d,i,a) { 
        var tr = addElem (table , 'TR');
        addElem (tr , 'TD' , i ? '' : p.file.fileName);
        Object.keys(d).forEach(function (k) { 
          addElem (tr , 'TD' , d[k]);
        }); 
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

  };
  
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
