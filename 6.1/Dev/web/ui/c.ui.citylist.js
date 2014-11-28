define(["libs","cBase","cUIBase"],function(a,b,c){var d=new b.Class({__propertys__:function(){this.element=null,this.groupOpenClass="cityListClick",this.selectedCityClass="citylistcrt",this.autoLocCity=null,this.selectedCity=null,this.defaultData="inland",this.itemClickFun=null,this.data=null,this.autoLoc=!!navigator.geolocation,this.listType=this.defaultData},initialize:function(a){this.setOption(a),this.assert(),this._init()},_init:function(){this.renderCityGroup(),this.data&&(this.renderData=this.data[this.defaultData]||[],this.bindClickEvent())},setOption:function(a){for(var b in a)switch(b){case"groupOpenClass":case"selectedCityClass":case"selectedCity":case"itemClickFun":case"defaultData":case"autoLoc":case"autoLocCity":case"data":this[b]=a[b];break;case"element":this[b]=$(a[b])}},assert:function(){if(!this.element&&0==this.element.length)throw"not override element property"},renderCityGroup:function(){var a=[];this.autoLocCity&&this.autoLocCity.listType==this.listType&&this.autoLocCity.name&&(a.push('<li id="'+c.config.prefix+'curCity" data-ruler="item"'),a.push(this.selectedCity&&this.autoLocCity.name!=this.selectedCity.name?' class="noCrt"':' class="'+this.selectedCityClass+'" '),a.push(' data-value="'+this.autoLocCity.name+'"'),a.push(">当前城市</li>")),a.push('<li id="hotCity" data-ruler="group" data-group="hotCity" class="'+this.groupOpenClass+'" >热门城市</li>');var b="ABCDEFGHJKLMNOPQRSTWXYZ".split("");for(var d in b)a.push('<li data-ruler="group" data-group="'+b[d]+'" id="'+b[d]+'">'+b[d]+"</li>");this.element.html(a.join(""))},groupClickHandler:function(a,b){var a=$(a),d=a.attr("data-group")||a.attr("id");if(0==a.children().length){var e=[];try{e=this.renderData[d]}catch(f){return void 0}var g=[];g.push("<ul>");for(var h=0,i=e.length;i>h;h++){var j=e[h];g.push('<li class data-ruler="item" data-id="'+j.id+'"'),g.push(">"+j.name+"</li>")}g.push("</ul>"),a.append(g.join(""))}var k=a.attr("class");b?a.addClass(this.groupOpenClass):k&&$.inArray(this.groupOpenClass,k)?a.removeClass(this.groupOpenClass):(this.element.find("."+this.groupOpenClass).removeClass(this.groupOpenClass),a.addClass(this.groupOpenClass));var l=c.getElementPos(a[0]);l&&"hotCity"!=a.attr("id")&&$(window).scrollTop(l.top-60),this.setSelectedCity(this.selectedCity)},bindClickEvent:function(){var a=this;this.element.delegate("li","click",function(){var b=$(this).attr("data-ruler");if("group"==b)a.groupClickHandler(this);else if("item"==b&&a.itemClickFun&&"function"==typeof a.itemClickFun){var c={id:$(this).attr("data-id"),name:$(this).attr("data-value")||$(this).html(),listType:a.listType};a.itemClickFun(c)}})},switchData:function(a){var b=this.data[a];b&&(this.listType=a,this.element.undelegate("li","click"),this.element.html(""),this.renderCityGroup(),this.renderData=b,this.groupClickHandler(this.element.find("#hotCity"),!0),this.setSelectedCity(this.selectedCity),this.bindClickEvent())},setSelectedCity:function(a){var b=this;if(a&&this.listType==a.listType&&a.name){var d=this.element.find("#"+c.config.prefix+"curCity");if(d.length>0)d.removeClass(this.selectedCityClass),d.addClass("noCrt");else if(b.autoLocCity&&b.autoLocCity.listType==this.listType&&b.autoLocCity.name){var e=[];e.push('<li id="'+c.config.prefix+'curCity"'),e.push('data-value="'+a.name+'" data-ruler="item">当前城市</li>'),this.element.prepend(e.join())}this.element.find("li").each(function(){var c=$(this);c.html()==a.name||c.attr("data-value")==a.name?(c.removeClass("noCrt"),c.addClass(b.selectedCityClass)):c.removeClass(b.selectedCityClass)}),this.selectedCity=a}},setData:function(a){this.element.html(""),this.data=a,this._init()},openHotCity:function(a){var b=this.element.find("#hotCity");b.length>0&&this.groupClickHandler(b,!!a)}});return d});