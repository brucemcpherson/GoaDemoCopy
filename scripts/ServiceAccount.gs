/**
 * demonstrate using service account
 * getting/refreshing service token is pretty much a one liner
 */
function usingServiceAccount () {
  logVision (Goth.getToken('cloudvision_serviceaccount',PropertiesService.getScriptProperties()));
}

/**
 * log out the result of both tests
 * @param {string} accessToken the access token
 */
function logVision (accessToken) {

  // i have some animal images in this folder
  // findout what they are of

  var result = Pull.pets (accessToken);

  Logger.log ( JSON.stringify(result.GOOGLE.queryResults.map(function(d) {
    return {
      name:d.file.fileName,
      data:d.data,
      scales:d.scales
    };
  })));
  
  // some faces
  var result = Pull.faces (accessToken);
  
  // just summarize
  Logger.log ( JSON.stringify(result.GOOGLE.queryResults.map(function(d) {
    return {
      name:d.file.fileName,
      data:d.data,
      scales:d.scales
    };
  })));
  
}
