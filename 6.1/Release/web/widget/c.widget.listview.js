define(["cBase","cUICore","cWidgetFactory"],function(a,b,c){"use strict";var d="ListView";if(!c.hasWidget(d)){var e=function(b){for(var c=new a.Hash,d=0;d<b.length;d++)c.add($(b[d]).data("hash"),$(b[d]));return c},f=f||{};f.__propertys__=function(){},f.initialize=function($super,a){if(a.container&&(this.rootBox=a.container),this.noResultText="您还没有记录哦",this.autoEmptyView="undefined"!=typeof a.autoEmptyView?a.autoEmptyView:!0,a.noResultText&&(this.noResultText=a.noResultText),a.listadapter&&(this.listadapter=a.listadapter,this.listadapter.regiseterObserver(this)),a.origin&&(this.origin=a.origin),!a.itemView)throw"ListView:no item view template";this.templateFactory=this.template(a.itemView),this.bindItemViewEvent=a.bindItemViewEvent,this.onUpdatePrepared=a.onUpdatePrepared,this.onUpdateFinished=a.onUpdateFinished,$super(a)},f.createHtml=function(){return this.update()},f.createItemView=function(a,b){var c=this.templateFactory(a);return $(c).addClass("c-item-view").data("hash",b)},f.update=function(){var b=this.rootBox.find(".c-item-view");this.map=e(b),this.onUpdatePrepared&&"function"==typeof this.onUpdatePrepared&&this.onUpdatePrepared();var c=new a.Hash,d=this,f=function(a,b,e){var f=d.map.getItem(b);f||(a.C_ITEM_INDEX=e,a.__origin__=d.origin,f=d.createItemView(a,b),d.bindItemViewEvent(f)),c.add(b,f)};if(this.listadapter.map.each(f),this.rootBox.hide(),this.rootBox.empty(),this.listadapter.list.length>0){var g=function(a){d.rootBox.append(a)};c.each(g)}else this.autoEmptyView&&this.rootBox.append('<div class="cui-load-error"><div class="cui-i cui-wifi cui-exclam"></div>'+this.noResultText+"</div>");this.rootBox.show(),this.onUpdateFinished&&"function"==typeof this.onUpdateFinished&&this.onUpdateFinished()},f.onUpdatePrepared=function(){},f.onUpdateFinished=function(){},f.openAutoEmptyView=function(){this.autoEmptyView=!0},f.closeAutoEmptyView=function(){this.autoEmptyView=!1};var g=new a.Class(b.AbstractView,f);c.register({name:d,fn:g})}});