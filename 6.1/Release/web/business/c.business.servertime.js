define(["cWidgetFactory","cWidgetGuider"],function(a){var b=a.create("Guider"),c={};return c.getServerDate=function(a){var c=function(b){return"function"==typeof a?a(b):b},d=function(){var a=new Date,b=window.localStorage.getItem("SERVERDATE");if(!b)return c(a);try{if(b=JSON.parse(b),b&&b.server&&b.local){var d=window.parseInt(b.server),e=window.parseInt(b.local),f=(new Date).getTime(),g=new Date(d+f-e);return c(g)}return c(a)}catch(h){return c(a)}},e=function(){if(location.pathname.match(/^\/?html5/i))return c(now);if("undefined"==typeof __SERVERDATE__||!__SERVERDATE__.server)return 0,c(now);var a=new Date(__SERVERDATE__.server.valueOf()+((new Date).valueOf()-__SERVERDATE__.local.valueOf()));return c(a)};b.apply({hybridCallback:d,callback:e})},c});