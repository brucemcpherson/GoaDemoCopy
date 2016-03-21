function usingAppsScriptsToken () {


  // we need to provoke a drive dialog
  // a comment is fine for that
  // DriveApp.getFiles()
  // that should provoke some scopes
  // https://www.googleapis.com/auth/drive
  // https://www.googleapis.com/auth/script.external_request
  // https://www.googleapis.com/auth/script.scriptapp
  
  
  // if the scope for drive is available in apps script
  // we can use the scripts access token
  // to access the Drive API
  // but we also need to enable it in the cloud console
  
  // get some files using the appssscript token
  var filesMeta = getMetaFromDriveApi ( ScriptApp.getOAuthToken() );
  
  // convert result
  Logger.log (JSON.stringify(filesMeta.files));
}

function getMetaFromDriveApi (accessToken) {
  
  // the API end point
  var endPoint = "https://www.googleapis.com/drive/v3/files";

  // get 10 files matching some namee
  var response = UrlFetchApp.fetch (
    endPoint + "?pageSize=10&q=" + 
    encodeURIComponent(
      "name contains 'goa'" +
      " and trashed=false"
    ) + "&fields=" +
    encodeURIComponent(
      "files(id,mimeType,name),nextPageToken"
    )
    , {
    headers: {
      Authorization:'Bearer ' + accessToken
    }
  });
  
  // objectify the result
  return JSON.parse (response.getContentText());
}

