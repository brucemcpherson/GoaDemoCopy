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
        headwear:"headwearLikelihood",
        underExposed:"underExposedLikelihood",
        blurred:"blurredLikelihood"       
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
  * get data and change it around depending on the type of request
  * @param {string} accessToken the token to use
  * @param {number} package the options
  * @return {object} the  result
  */
  ns.getDataFor = function (accessToken, package) {
    
    var index = 0;
    return package.providers.reduce(function (p,c) {
      
      var dataFilter =  package.dataFilters ? package.dataFilters[index] : null;

      // different namespaces depending on provider
      var r;
      if ( c === "GOOGLE") {
        r = CloudVision.query (
          accessToken, package.folderId, 
          package.feature , package.maxResponses  , package.noCache
        );
      }
      else if (c==="MICROSOFT") {
        r = MsEmotion.query (
          accessToken , package.folderId, 
          dataFilter , package.maxResponses  , package.noCache
        );
 
      }
      else {
        throw 'unkown provider ' + c;
      }
      


      // select only the fields required
      // and change their names      
      if (dataFilter) {
        // select and change the labels

        var labels = ns.dataFilters[dataFilter].labels;

        r.forEach(function(d) {
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
          r.forEach(function(d) {
            d.scales = Object.keys(labels).reduce(function (p,c) {
              p[c] = d.data.reduce(function (pp,cc) {
                return pp + scaling(cc[c]);
              },0)/d.data.length;
              return p;
            },{}); 
          });
        }
        
      }
      
      p[c]  = {
        feature:package.feature,
        queryResults:r,
        headings: r.length  && r[0].data && r[0].data.length ? Object.keys(r[0].data[0]) : []
      };
      index++;
      return p;
    },{});
    /**
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
    */
  };
  
  
  /**
  * do the pets image analysis
  * @param {string} accessToken the accessToken
  * @param {string} folderId the folder id with the images
  * @return {object} the pets result
  */
  ns.pets = function (accessToken,folderId) {
    return ns.getDataFor (accessToken, {
      folderId : folderId || '0B92ExLh4POiZYzZZT3d0aU9VV1U',
      feature : 'LABEL_DETECTION', 
      maxResponses : 3,
      providers:["GOOGLE"],
      noCache:true
    } 
                         );
    
  };
  
  /**
  * do the faces image analysis
  * @param {string} accessToken the accessToken
  * @return {object} the pets result
  */
  ns.faces = function (accessToken,folderId) {
    return ns.getDataFor (accessToken, {
      folderId : folderId || '0B92ExLh4POiZZDNKcVN0QTJJMGs',
      feature : 'FACE_DETECTION', 
      maxResponses : 3,
      providers:["GOOGLE"]
    } 
                         );
    
    
  };
  
  return ns;
})({});