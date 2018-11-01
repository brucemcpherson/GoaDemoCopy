var Picker = (function myFunction(ns) {
  
  /**
  * get a picker
  * @param {string} accessToken
  * @param {string} developerKey
  * @param {function} callback when picked
  */
  ns.getFolderPicker = function (accessToken, developerKey , callback) {
    
    var docsView = new google.picker.DocsView()
    .setIncludeFolders(true) 
    .setMimeTypes('application/vnd.google-apps.folder')
    .setSelectFolderEnabled(true);
    
    
    var picker = new google.picker.PickerBuilder()
    .addView(docsView)
    .setOAuthToken(accessToken)
    .setCallback(callback)
    .setDeveloperKey(developerKey)
    .setOrigin(google.script.host.origin)
    .setTitle('Pick a folder with images to analyze')
    .build();
    
    picker.setVisible(true);
  };
  
  return ns;
})(Picker || {});
