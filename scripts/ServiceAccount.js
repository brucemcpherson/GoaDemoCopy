/**
 * demonstrate using service account
 * getting/refreshing service token is pretty much a one liner
 */
function usingServiceAccount () {
  logVision (Goth.getToken('cloudvision_serviceaccount',PropertiesService.getScriptProperties()));
}


