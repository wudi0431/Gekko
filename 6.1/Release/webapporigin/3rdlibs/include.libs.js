
(function() {

var libs = 'libs.js';
var iswinphone = window.navigator.userAgent.indexOf('IEMobile') > -1 ? true : false;
var isie = window.navigator.userAgent.indexOf('MSIE') > -1 ? true : false;
var version = 0;
var SUPPORT_VERSION = 10;

if (iswinphone) {
  version = window.navigator.userAgent.match(/IEMobile\/\d+/);
  if (version.length > 0) {
    version = version[0].split('/');
    version = version[1];
  };
};

  //add by byl  将原来的IE10以下，改成现在的IE11以下
if (!('__proto__' in {}) || (iswinphone && version < 11)) {
//if ( (isie && !iswinphone) || (iswinphone && version < 10)){
  libs = 'libs_jq_r_1.1.js';
}
document.write('<script type="text/javascript" src="//webresource.c-ctrip.com/code/lizard/1.1/web/3rdlibs/' + libs + '"></' + 'script>');
})();

