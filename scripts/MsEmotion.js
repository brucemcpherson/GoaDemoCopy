function mstest() {
  
  Logger.log (MsEmotion.query ( Globals.getToken() , '0B92ExLh4POiZZDNKcVN0QTJJMGs', 'MSEMOTION' , 1 , true ).map(function(d) {
    return d.data;
  }));
  
}
var MsEmotion = (function (ns) {

  ns.params = {
    endPoint:"https://api.projectoxford.ai/emotion/v1.0/recognize",
    getApiKey:function () {
      return Globals.getGoa().getProperty ('msEmotionKey');
    },
    maxFiles:10,
    keyPrefix:'ms',
    resultProperties:{
      LABEL_DETECTION:'labelAnnotations',
      FACE_DETECTION:'faceAnnotations',
      MSEMOTION:'scores'
    }
  };
  

  /** 
  * do a cloudvision query, but get it from cache if possible
  * @param {string} apikey the api key
  * @param {string} folderId the folder id containing the images
  * @param {string} type the feature detection
  * @param {number} maxResults max results to get
  * @param {boolean} [noCache] whether to skip using cache
  * @return {[*]} an array of objects with the keys (cacheKey,data,file,requestIndex,feature) .. if requestindex = 0 it came from cache
  */
  ns.query = function (accessToken, folderId , feature, maxResults,noCache) {
    
    // get all the files .. same as for cloud vision
    var files =  CloudVision.getFiles(accessToken, folderId);
    if (!files.length) {
      throw ('couldnt find any images in folder ' +  folder.getName());
    }
    
    var cache = CacheService.getScriptCache();
    // see what we can get from cache     .. same as for cloudvision
    var dataPackage = CloudVision.tryCache ( cache , files, ns.params.keyPrefix, maxResults,noCache , feature);
    
    // now generate requests for those that were not in cache
    var requests = [];
    dataPackage.forEach(function(d) {

      if (!d.data) {
        
        // generate a request package
        requests.push(d.file.b64);
        d.requestIndex = requests.length;
      }
    });
  
    // if there were any requests, need to get them and mix in to cached
    if (requests.length) {
      // do the query
      var responses = requests.map ( function (d) {
        var r = cUseful.Utils.expBackoff ( function () {
          return UrlFetchApp.fetch ( ns.params.endPoint, {
            method: "POST",
            payload: Utilities.base64Decode(d),
            contentType: "application/octet-stream",
            headers: {
              "Ocp-Apim-Subscription-Key":ns.params.getApiKey()
            }
          });
        });
       // objectify the result
        return JSON.parse(r.getContentText())[0];
      });

      // write it to cache for next time & store the data in the datapackage
      dataPackage.forEach(function(d) {
        // should have a result
        if (d.requestIndex) {
          if (d.requestIndex > responses.length) {
            throw 'didnt get a result for request index ' + d.requestIndex;
          }
          var resultProperty = ns.params.resultProperties[d.feature];
          if (!resultProperty) {
            throw 'result property to use for ' + d.feature + ' is not defined'
          }
          Logger.log(Object.keys(responses[d.requestIndex-1]));
          d.data = responses[d.requestIndex-1][resultProperty];

          // use a big expiration time
          cache.put (d.cacheKey , JSON.stringify(
            {data:d.data,
             verify:{
               digest:d.file.digest,
               id:d.file.id,
             }}), 60 * 60 * 4);
        }
      });
    }
    
    return dataPackage;
  };

  
  /**
  * get all the image files to process and encode them
  * even if result is in cache, we still need to get the image anyway
  *@param {string} accessToken the access token
  * @param {string} folderId the folder id containing the images
  * @return {[*]} the files encoded
  */
  ns.getFiles = function (accessToken, folderId) {
    
    // get the folder 
    var folder = DriveApp.getFolderById(folderId);
    if (!folder) {
      throw 'cant find image folder ' + folderId;
    }
  
    // get all the files in the folder
    var iterator = folder.searchFiles("mimeType contains 'image/'");
    var files = [];
    while (iterator.hasNext()) {
      var file = iterator.next();
      if (files.length >= ns.params.maxFiles) {
        throw 'choose a smaller folder - max files allowed is ' + ns.params.maxFiles;
      }
      var b64 = Utilities.base64Encode(file.getBlob().getBytes());
      files.push({
        fileName:file.getName(),
        b64:b64,
        type:file.getMimeType(),
        id:file.getId(),
        digest:cUseful.Utils.keyDigest(b64)
      });
    }
    
    return files;
    
  };
  
  return ns;
}) (MsEmotion || {});
/**
 * log out the result of both tests
 * @param {string} accessToken the access token
 */
function logMsEmotion (accessToken) {

  // i have some animal images in this folder
  // findout what they are of

  var result = Pull.pets (accessToken);
  Logger.log ( JSON.stringify(result.map(function(d) {
    return {
      name:d.file.fileName,
      data:d.data,
      scales:d.scales
    };
  })));
  
  // some faces
  var result = Pull.faces (accessToken);
  
  // just summarize
  Logger.log ( JSON.stringify(result.map(function(d) {
    return {
      name:d.file.fileName,
      data:d.data,
      scales:d.scales
    };
  })));
  
}
