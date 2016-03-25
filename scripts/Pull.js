var Pull = (function (ns) {

  ns.dataFilters =  {
    scales: {
      "VERY_LIKELY":0.95, 
      "VERY_UNLIKELY":0,
      "POSSIBLE":0.5,
      "LIKELY":0.7,
      "UNLIKELY":0.3,
      "UNKNOWN":0
    },
    "EMOTION":{
      labels: {
        joy:"joyLikelihood",
        sorrow:"sorrowLikelihood",
        anger:"angerLikelihood",
        surprise:"surpriseLikelihood",
        headwear:"headwearLikelihood"
      },
      scale:function (value) {
        var r = ns.dataFilters.scales[value];
        if (typeof r === typeof undefined) {
          throw 'unexpected scale value ' + value;
        }
        return r;
      }
    },
    "MSEMOTION": {
      labels: {
        joy:"happiness",
        sorrow:"sadness",
        anger:"anger",
        surprise:"surprise",
        contempt:"contempt",
        disgust:"disgust",
        fear:"fear",
        neutral:"neutral"
      }
    }
  };

  
  /**
  * do the general analysis
  * @param {string} accessToken the accessToken
  * @param {string} folderId the folder id with the images
  * @param {string} type the type of feature
  * @param {number} maxResults max number of results
  * @param {string} [dataFilter] the name of the data filter to apply
  * @param {boolean} [noCache] whether to suppress using cache 
  * @param {boolean} 
  * @return {object} the  result
  */
  ns.get = function (accessToken, folderId , type , maxResults, dataFilter,noCache) {
    
    
    var result =  CloudVision.query (
      accessToken, folderId, 
      type , maxResults  , noCache
    );
    
    
    // select only the fields required
    // and change their names
    if (dataFilter) {
      
      // select and change the labels
      var labels = ns.dataFilters[dataFilter].labels;
      result.forEach(function(d) {
        d.data = d.data.map(function(e) {
          return Object.keys(labels).reduce (function (p,c) {
            p[c] =  e[labels[c]];
            return p;
          },{});
        });
      });
      
      // any scaling
      var scaling = ns.dataFilters[dataFilter].scale;
      if (scaling) {
        result.forEach(function(d) {
          d.scales = Object.keys(labels).reduce(function (p,c) {
            p[c] = d.data.reduce(function (pp,cc) {
              return pp + scaling(cc[c]);
            },0)/d.data.length;
            return p;
          },{}); 
        });
      }
      
    }
    
    // make the headers
    result.forEach(function (d) {
      if (d.data.length) {
        d.headings = Object.keys(d.data[0]);
      }
    });
    
    return result;
  };
  
  /**
  * get data and change it around depending on the type of request
  * @param {string} accessToken the token to use
  * @param {number} package the options
  * @return {object} the  result
  */
  ns.getDataFor = function (accessToken, package) {
    
    // do the analysis
    var data = ns.get ( 
      accessToken, package.folderId, package.feature, 
      package.maxResponses , package.dataFilter , package.noCache
    );
    
    // if its an emotion chart, going to compare against ms results
    if (package.dataFilter === "EMOTION")    {
      var msData = MsEmotion.query (accessToken , package.folderId, 'MSEMOTION' , 1 , package.noCache ).map(function(d) {
        return d.data;
      });
      return {
        ms:{
          data:msData,
          headings:Object.keys(ns.dataFilters.MSEMOTION.labels)
        },
        google:data
      }
    }
    else {
      return data;
    }
    
  };
  

  /**
  * do the pets image analysis
  * @param {string} accessToken the accessToken
  * @param {string} folderId the folder id with the images
  * @return {object} the pets result
  */
  ns.pets = function (accessToken,folderId) {
    return ns.get (
      accessToken, folderId || '0B92ExLh4POiZYzZZT3d0aU9VV1U', 
      'LABEL_DETECTION' , 3 
    );
  };
  
  /**
  * do the faces image analysis
  * @param {string} accessToken the accessToken
  * @return {object} the pets result
  */
  ns.faces = function (accessToken,folderId) {
    // some people images here
    return ns.get (
      accessToken, folderId || '0B92ExLh4POiZZDNKcVN0QTJJMGs', 
      "FACE_DETECTION" , 1 , 'EMOTION'
    );
    
  };
  
  return ns;
})({});