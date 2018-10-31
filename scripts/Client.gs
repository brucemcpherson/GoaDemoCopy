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
    
    // shortcut
    var ag = App.globals;
    var action = ag.actions[ag.actions.selected];
    
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
      ag.result = result;
      
      // select the appropriate reporting
      
      
      // do the report/chart
      Render[action.render] ();

      // adjust what's shown
      Render.hide (ag.divs.control,true);
      Render.hide (ag.divs.render,false);
      
      // clear any messages
      App.reportMessage('');
      
    })
    
    .expose(
      'Server',
      'provoke', {
        folderId:ag.divs.folderId.value, 
        feature:action.feature,
        dataFilters:action.dataFilters,
        maxResponses:parseInt(ag.divs.maxResponses.value,10),
        noCache:ag.noCache,
        providers:action.providers
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

