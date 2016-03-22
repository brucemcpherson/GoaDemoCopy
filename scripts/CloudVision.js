/**
 * log out the result of both tests
 * @param {string} accessToken the access token
 */
function logVision (accessToken) {

  // i have some animal images in this folder
  // findout what they are of
  var result = Pull.pets (accessToken);
  Logger.log ( JSON.stringify(result.map(function(d) {
    return {
      name:d.file.fileName,
      annotation:d.annotation
    };
  })));
  
  // some faces
  var result = Pull.faces (accessToken);
  
  // just summarize
  Logger.log ( JSON.stringify(result.map(function(d) {
    return {
      name:d.file.fileName,
      annotation:d.annotation
    };
  })));
  
}



function cloudVisionAnnonate (accessToken, folderId , type, maxResults) {
  
  // the API end point
  var endPoint = "https://vision.googleapis.com/v1/images:annotate";
  var MAX_FILES = 10;
  
  // get the images and encode them
  var folder = DriveApp.getFolderById(folderId);
  if (!folder) {
    throw 'cant find image folder ' + folderId;
  }
  
  // get all the files in the folder
  var iterator = folder.searchFiles("mimeType contains 'image/'");
  var files = [];
  while (iterator.hasNext()) {
    var file = iterator.next();
    if (files.length >= MAX_FILES) {
      throw 'choose a smaller folder - max files allowed is ' + MAX_FILES;
    }
    files.push({
      fileName:file.getName(),
      b64:Utilities.base64Encode(file.getBlob().getBytes()),
      type:file.getMimeType(),
      id:file.getId()
    });
  }
  if (!files.length) {
    Logger.log ('couldnt find any images in folder ' +  folder.getName());
  }
  
  // now create the post body
  maxResults = maxResults || 1;
  type = type || "LABEL_DETECTION"
  
  var body = { 
    requests: files.map (function (d) { 
      return { 
        features: [{
          "type":type || "LABEL_DETECTION",
          "maxResults":maxResults
        }],
        image: { 
          content: d.b64
        }
      }
    })};
  // can cost money so use cache
  var cache = CacheService.getScriptCache();
  var cacheKey = cUseful.Utils.keyDigest(files.map(function(d) { 
      return d.id; 
    }),type,maxResults);;
  

  
  var cacheData = cache.get(cacheKey);
  var result;
  
  if (!cacheData) {
    // do the cloud vision request 
    var response = UrlFetchApp.fetch ( endPoint, {
      method: "POST",
      payload: JSON.stringify(body),
      contentType: "application/json",
      headers: {
        Authorization:'Bearer ' + accessToken
      }
    });
    
    // objectify the result
    result = JSON.parse(response.getContentText());
    
    // use a big expiration time
    cache.put (cacheKey , response.getContentText(), 60 * 60 * 4);
    
  }
  else {
    result = JSON.parse(cacheData);
  }
  
  return files.map (function (d,i) {
    return {
      file:d,
      annotation:result.responses[i]
    }
  });
}

