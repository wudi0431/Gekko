define(["libs"],function(){"use strict";var a=a||{};return a.products={},a.hasWidget=function(b){return!!a.products[b]},a.register=function(b){if(!(b&&b.name&&b.fn))throw"WidgetFactory: widget is lack of necessary infomation.";if(a.products[b.name])throw"WidgetFactory: widget has been register in WidgetFactory";a.products[b.name]=b.fn},a.create=function(b){return a.products[b]},a});