var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-3748357-1']);
_gaq.push(['_setDomainName', '.ctrip.com']);
_gaq.push(['_setAllowHash', false]);
_gaq.push(['_addOrganic', 'soso', 'w']);
_gaq.push(['_addOrganic', 'sogou', 'query']);
_gaq.push(['_addOrganic', 'youdao', 'q']);
_gaq.push(['_addOrganic', 'so.360.cn', 'q']);
_gaq.push(['_addOrganic', 'so.com', 'q']);
_gaq.push(['_addOrganic', 'm.baidu.com', 'word']);
_gaq.push(['_addOrganic', 'wap.baidu.com', 'word']);
_gaq.push(['_addOrganic', 'wap.soso.com', 'key']);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

//google 再营销代码，可能单页应用有问题 shbzhang 2014/9/9
;(function () {
  var _img = new Image();
  _img.onload = function () {
  }
  _img.onerror = function () {
  }
  _img.src = ('https:' == document.location.protocol ? 'https:' : 'http:') +
    "//googleads.g.doubleclick.net/pagead/viewthroughconversion/1066331136/?value=1.000000&amp;label=cG9hCIyRngMQgNi7_AM&amp;guid=ON&amp;script=0";
})();