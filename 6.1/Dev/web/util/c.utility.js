define(["cUtilityHybrid","cUtilityHash","cUtilityDate","cUtilityServertime","Validate"],function(a,b,c,d,e){var f=function(a){return Object.prototype.toString.call(a)},g={};return $.extend(g,a),g.Date=c,g.Hash=b.Hash,g.trim=function(a){return a.replace(/(^[\s\u3000]*)|([\s\u3000]*$)/g,"")},g.stripTags=function(a){return(a||"").replace(/<[^>]+>/g,"")},g.mix=function(a,b){return _.extend(a,b)},g.indexOf=function(a,b){return _.indexOf(b,a)},g.each=_.each,g.grep=_.filter,g.getServerDate=d.getServerDate,g.getGuid=function(){function a(){return(65536*(1+Math.random())|0).toString(16).substring(1)}function b(){return a()+a()+"-"+a()+"-"+a()+"-"+a()+"-"+a()+a()+a()}var c=window.localStorage.GUID||"";if(!c){c=b();try{window.localStorage.setItem("GUID",c)}catch(d){}}return c},g.Object={},g.Object.set=function(a,b,c){if(!b)return null;var d=b.split(".");a=a||{};for(var e=0,f=d.length,g=Math.max(f-1,0);f>e;e++)g>e?a=a[d[e]]=a[d[e]]||{}:a[d[e]]=c;return a},g.Object.get=function(a,b){if(!a||!b)return null;var c=b.split(".");a=a||{};var d=0,e=c.length;for(Math.max(e-1,0);e>d;d++)if(a=a[c[d]],null===a||"undefined"==typeof a)return null;return a},g.SimpleQueue=function(){this.initialize()},g.SimpleQueue.prototype={initialize:function(){this.index=0,this.handlers=[],this.isStart=!1},add:function(a){this.handlers.push(a),this.isStart||(this.isStart=!0,this._next())},_next:function(a){var b=this.handlers.shift();b&&b.call(this,this,a)},next:function(){this._next.apply(this,arguments),this.stop()},stop:function(){this.isStart=!1}},g.tryUrl=function(a){var b=document.createElement("iframe");b.height=1,b.width=1,b.frameBorder=0,b.style.position="absolute",b.style.left="-9999px",b.style.top="-9999px",document.body.appendChild(b),g.tryUrl=function(a){b.src=a},U.tryUrl(a)},g.validate=e,g.JsonArrayToObject=function(a){if(!a)return[];for(var b=a.shift(),c=[],d=null,e=0,g=a.length;g>e;e++){d={};for(var h=0,i=a[e].length;i>h;h++)switch(f(a[e][h])){case"[object Array]":d[b[h]]=U.JsonArrayToObject(a[e][h]);break;default:d[b[h]]=a[e][h]}c.push(d)}return c},g.dateParse=function(a){var b=new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+$");if("string"==typeof a){if(b.test(a)||isNaN(Date.parse(a))){var c=a.split(/ |T/),d=c.length>1?c[1].split(/[^\d]/):[0,0,0],e=c[0].split(/[^\d]/);return new Date(e[0]-0,e[1]-1,e[2]-0,d[0]-0,d[1]-0,d[2]-0)}return new Date(a)}return new Date},g.deleteValue=function(a,b){var c=U.indexOf(a,b);return c>-1?b.splice(c,1):null},g});