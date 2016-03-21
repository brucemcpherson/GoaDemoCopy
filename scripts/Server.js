
function expose (namespace , method) {
   return this[namespace][method]
  .apply(this,Array.prototype.slice.call(arguments,2));
}

/**
 * runs on the server side
 * for testing whether libraries have an effect
 * @namespace Server
 */
var Server = (function (ns) {
  
  
  /**
   * doesnt do anything except provoke a script load 
   * and return some stats
   * return {object} stats updated stats object
   */
  ns.provoke = function (package) {
    return Pull.getDataFor ( Goth.getToken(PARAMS.PACKAGE_NAME, PARAMS[PARAMS.TYPE].props), package);
  };
 
  /**
   * return s tokens and keys needed for pcier
   * @return {object}
   */
  ns.pickerKeys = function () {
    return {
      token:Goth.getToken(PARAMS.PACKAGE_NAME, PARAMS[PARAMS.TYPE].props),
      key:Goth.getGoa (PARAMS.PACKAGE_NAME, PARAMS[PARAMS.TYPE].props).getProperty ('apiKey') 
    }
  };

  return ns;
  
}) (Server || {});
