/**
 * this is how  to do a webapp which needs authentication
 * @param {*} e - parameters passed to doGet
 * @return {HtmlOurput} for rendering
 */

// since Im using the same webapp for multiplt purposes
// these describe what each do
// change TYPE to the run required
var PARAMS = {
  TYPE:'asuser',              // or asme
  PACKAGE_NAME:'cloudvision',     // always this
  asuser: {
    props:PropertiesService.getUserProperties(),
    clone:true,
    html:'asuser'
  },
  asme: {
    props:PropertiesService.getScriptProperties(),
    clone:false,
    html:'asme'
  }    
};

function doGet (e) {
  
  // this is pattern for a WebApp.
  // passing the doGet parameters (or anything else)
  // will ensure they are preservered during the multiple oauth2 processes
  
  // im using this same for each, so need a way to swicth between
  var demo = PARAMS[PARAMS.TYPE];
  if (!demo) {
    throw 'set PARAMS.TYPE to match one of the properties of PARAMS';
  }
  
  // it may need cloning if user props required
  if (demo.clone) {
    cGoa.GoaApp.userClone( 
      PARAMS.PACKAGE_NAME, 
      PropertiesService.getScriptProperties() , 
      demo.props
    );
  }
 
  // get the goa
  var goa = cGoa.GoaApp.createGoa(
    PARAMS.PACKAGE_NAME, 
    demo.props
  ).execute(e);
  
  
  // it's possible that we need consent - this will cause a consent dialog
  if (goa.needsConsent()) {
    return goa.getConsent();
  }
  
  // if we get here its time for your webapp to run 
  // and we should have a token, or thrown an error somewhere
  if (!goa.hasToken()) { 
    throw 'something went wrong with goa - did you check if consent was needed?';
  }

  // now return the evaluated page
  return HtmlService
  .createTemplateFromFile(demo.html)
  .evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .setTitle('Web app Oauth2 ' + demo.html)

}



