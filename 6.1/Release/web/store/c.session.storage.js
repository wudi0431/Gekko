define(["cBase","cAbstractStorage"],function(a,b){var c=new a.Class(b,{__propertys__:function(){},initialize:function($super,a){this.proxy=window.sessionStorage,$super(a)}});return c.getInstance=function(){return this.instance?this.instance:this.instance=new this},c.sessionStorage=c.getInstance(),c});