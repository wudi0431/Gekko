define(["cBase","cAbstractStorage"],function(a,b){var c=new a.Class(b,{__propertys__:function(){},initialize:function($super,a){this.proxy=window.localStorage,$super(a)},oldGet:function(b){var c=localStorage.getItem(b),d=c?JSON.parse(c):null;if(d&&d.timeout){var e=new Date,f=a.Date.parse(d.timeout).valueOf();if(d.timeby){if(f-e>=0)return d}else if(f-a.Date.parse(a.Date.format(e,"Y-m-d")).valueOf()>=0)return d;return localStorage.removeItem(b),null}return d},oldSet:function(a,b){localStorage.setItem(a,b)},getExpireTime:function(b){var c=localStorage.getItem(b),d=c?JSON.parse(c):null;return d&&d.timeout?d.timeout:new a.Date(a.getServerDate()).addDay(2).format("Y-m-d")},oldRemove:function(a){localStorage.removeItem(a)}});return c.getInstance=function(){return this.instance?this.instance:this.instance=new this},c.localStorage=c.getInstance(),c});