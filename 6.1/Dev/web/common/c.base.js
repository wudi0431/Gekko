define(["libs","cCoreInherit","cUtility"],function(a,b,c){"use strict";"undefined"==typeof console&&(console={log:function(){},error:function(){}});var d={};d.isInApp=c.isInApp,d.Class=b.Class,d.extend=b.extend,d.implement=b.implement;[].slice;d.Object=new d.Class({});var e={keys:function(a){var b=[];if("object"==typeof a)if("function"==typeof Object.keys)Object.keys(a);else for(var c in a)a.hasOwnProperty(c)&&b.push(c);return b}};return d.extend(d.Object,e),d.Date=c.Date,d.Hash=c.Hash,d.getInstance=function(){return this.instance||new this},d.getServerDate=c.getServerDate,d});