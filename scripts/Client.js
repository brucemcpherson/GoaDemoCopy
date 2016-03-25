/**
* runs on the client side
* for testing whether libraries have an effect
* @namespace Client
*/
var Client = (function (ns) {
  
  /**
  * provoke a server activity and time it
  * @return {object} the provoked item
  */
  ns.provoke = function () {
    
    App.reportMessage('starting...',true);
    
    google.script.run
    
    .withFailureHandler ( function (err) {
      App.reportMessage (err);
    })
    
    /**
    * called back from server
    */
    .withSuccessHandler ( function (result) {
      
      // render result
      App.reportMessage('rendering...');
      App.globals.result = result;
      if (App.globals.divs.feature.value === "EMOTION_DETECTION") {
        Render.emotion();
      }
      else {
        Render.report();
      }

      // adjust what's shown
      Render.hide (App.globals.divs.control,true);
      Render.hide (App.globals.divs.render,false);
      
      // clear any messages
      App.reportMessage('');
      
    })
    
    .expose(
      'Server',
      'provoke', {
        folderId:App.globals.divs.folderId.value, 
        feature:App.globals.divs.feature.value === "EMOTION_DETECTION" ? "FACE_DETECTION" : App.globals.divs.feature.value,
        maxResponses:parseInt(App.globals.divs.maxResponses.value,10),
        dataFilter:App.globals.divs.feature.value === "EMOTION_DETECTION" || 
          App.globals.divs.feature.value === "FACE_DETECTION" ? "EMOTION" : "",
        noCache:App.globals.noCache
      }
    );
  };
  
  /**
  * for the picker we need to get the access token 
  * @param {function} func what to do after we have it
  */
  ns.getPickerKeys = function (func) {
    
    google.script.run
    
    .withFailureHandler ( function (err) {
      App.reportMessage (err);
    })
    
    /**
    * called back from server
    */
    .withSuccessHandler ( function (result) {
      return func (result);
      
    })
    
    .expose('Server','pickerKeys');
    
  };
  
  
  
  return ns;
})(Client || {});

