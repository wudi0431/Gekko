define(["libs","cBase","cUILayer","cUIMask"],function(a,b,c,d){var e={},f={prefix:"cui-"},g=new d({classNames:[f.prefix+"warning-mask"]}),h={};return h["class"]=f.prefix+"warning",h.onCreate=function(){this.contentDom.html('<div class="'+f.prefix+'warning"><div class="blank"></div><p class="blanktxt">'+this.warningtitle+"</p></div>"),this.warningDom=this.contentDom.find(".blanktxt"),this.root.bind("click",$.proxy(function(){this.callback&&this.callback()},this)),g.create(),g.root.bind("click",$.proxy(function(){this.callback&&this.callback()},this))},h.onShow=function(){g.show()},h.onHide=function(){g.hide()},h.setTitle=function(a,b){a&&(this.create(),this.warningDom.html(a),this.warningtitle=a),this.callback=b?b:function(){}},h.getTitle=function(){return this.warningtitle},e.__propertys__=function(){this.warningDom,this.warningtitle="",this.callback=function(){}},e.initialize=function($super,a){this.setOption(function(a,b){switch(a){case"title":this.warningtitle=b}}),$super($.extend(h,a))},new b.Class(c,e)});