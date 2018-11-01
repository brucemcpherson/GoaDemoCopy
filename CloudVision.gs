/**
 * used to do cloudvision queries
 * @namespace Cloudvision
 */
var CloudVision = (function (ns) {

  ns.params = {
    endPoint:"https://vision.googleapis.com/v1/images:annotate",
    maxFiles:10,
    keyPrefix:'cv',
    resultProperties:{
      LABEL_DETECTION:'labelAnnotations',
      FACE_DETECTION:'faceAnnotations'
    }
  };
  

  /**
   * try cache first of all
   * @param {CacheService} cache
   * @param {[object]} files the files to look at 
   * @param {string} keyPrefix any key prefix for cache
   * @param {number} maxResults the max results
   * @param {boolean} noCache whether to suppress cache
   * @param {string} feature the feature
   * @return [object] the result
   */
  ns.tryCache = function (cache, files, keyPrefix,maxResults, noCache, feature) {
    
    // generate the request list based on whether they are already in cache
   
    return files.map (function (d) {
      
      var cacheKey = cUseful.Utils.keyDigest (keyPrefix , d.id , maxResults , feature);
      var cacheData = noCache ? '': cache.get (cacheKey);
      
      // ensure we have the right thing
      var data, 
          cachePackage = cacheData ? JSON.parse(cacheData) : null;
      if (cachePackage) {
        if (cachePackage.verify.id !== d.id) {
          throw 'cache item ' + cacheKey + ' contained data for file id ' + cachePackage.verify.id + ' instead of ' + d.id;
        }
        // if file has been updated then this cache entryis no good
        if (cachePackage.verify.digest === d.digest) {
          data = cachePackage.data;
        } 
        else {
          cache.remove(cacheKey);
        }
      }
      
      return {
        cacheKey:cacheKey,
        data:data,
        file:d,
        feature:feature
      };
      
    });
  };
  
  /** 
  * do a cloudvision query, but get it from cache if possible
  * @param {string} accessToken the access token
  * @param {string} folderId the folder id containing the images
  * @param {string} type the feature detection
  * @param {number} maxResults max results to get
  * @param {boolean} [noCache] whether to skip using cache
  * @return {[*]} an array of objects with the keys (cacheKey,data,file,requestIndex,feature) .. if requestindex = 0 it came from cache
  */
  ns.query = function (accessToken, folderId , feature, maxResults,noCache) {
    
    // get all the files
    var files =  ns.getFiles(accessToken, folderId);
    if (!files.length) {
      throw ('couldnt find any images in folder ' +  folder.getName());
    }
    
    var cache = CacheService.getScriptCache();
    // see what we can get from cache    
    var dataPackage = ns.tryCache ( cache , files, ns.params.keyPrefix, maxResults,noCache , feature);
    

    // now generate requests for those that were not in cache
    var requests = [];
    dataPackage.forEach(function(d) {

      if (!d.data) {
        
        // generate a request package
        requests.push({
          features: [{
            "type":d.feature,
            "maxResults":maxResults
          }],
          image: { 
            content: d.file.b64
          }   
        });
        d.requestIndex = requests.length;
      }
    });
  
    // if there were any requests, need to get them and mix in to cached
    if (requests.length) {
      
      // do the query
      var response = cUseful.Utils.expBackoff ( function () {
        return UrlFetchApp.fetch ( ns.params.endPoint, {
          method: "POST",
          payload: JSON.stringify({requests:requests}),
          contentType: "application/json",
          headers: {
            Authorization:'Bearer ' + accessToken
          }
        });
      });
      
      // objectify the result
      var result = JSON.parse(response.getContentText());

      
      // write it to cache for next time & store the data in the datapackage
      dataPackage.forEach(function(d) {
        // should have a result
        if (d.requestIndex) {
          if (d.requestIndex > result.length) {
            throw 'didnt get a result for request index ' + d.requestIndex;
          }
          var resultProperty = ns.params.resultProperties[d.feature];
          if (!resultProperty) {
            throw 'result property to use for ' + d.feature + ' is not defined'
          }
          d.data = result.responses[d.requestIndex-1][resultProperty];
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
}) (CloudVision || {});

