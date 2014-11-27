(function () {
  var slist=document.getElementsByTagName('script') || [];
  var reg=/_bfa\.min\.js/i;
  for(var i=0;i<slist.length;i++){
    if(reg.test(slist[i].src)){
      return;
    }
  }
  if((window.$_bf && window.$_bf.loaded) || window.$LAB || window.CtripJsLoader){
    return;
  }
  var d=new Date();
  var v='?v='+d.getFullYear()+d.getMonth()+'_'+d.getDate()+'.js';
  var bf = document.createElement('script');
  bf.type = 'text/javascript';
  bf.charset = 'utf-8';
  bf.async = true;
  try {
    var p = 'https:' == document.location.protocol;
  } catch (e) {
    var p = 'https:' == document.URL.match(/[^:]+/) + ":";
  }
  bf.src = '//webresource.c-ctrip.com/code/ubt/_mubt.min.js' + v;
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(bf, s);

})();