define(['libs', 'c', 'cPageView', 'TourModel', 'TourStore', 'cWidgetFactory', 'cWidgetGeolocation', 'Cities', 'IScroll', 'cWidgetGuider'],
    function (libs, c, pageview, tourModel, tourStore, cWidgetFactory, cWidgetGeolocation, DepartCityDataList) {

        var filterType, totalCount = { vLocal: 0, vDepart: 0, vDestino: 0 }, renderData = {}, currentScroll, showmore, onceCount = 26, destKwd4Tour, showFakeTemp,
    linetype, salecity, scity, kwd, sname, currentTouch, currentTouch2, isInApp, currTourType, $baseLoad, districtListScroll, productListScroll, productBox, filterParam, filterLabelsParam = [];
        var typeDic = { B: "目的地", U: "行程天数", T: "产品等级", F: "交通", P: "产品类型" };
        var filterParamDic = { d: 'B', g: 'T', h: 'F', n: 'P', u: 'U' };
        var defaultDepartCity = '上海', defaultDepartCityId = 2;
        var ProdListParamStore = tourStore.ProdListParamStore.getInstance();
        var ProdListParam = ProdListParamStore.get() || { vLocal: {}, vDepart: {}, vDestino: {} };
        var Guider = cWidgetFactory.create('Guider');
        var GeoLocationStore = tourStore.GeoLocationStore.getInstance(), geoLocation, GeoLocationWidget;
        var TourType = ['', 'vDepart', 'vDestino', 'vLocal'],
    origProdListParam = { vLocal: {}, vDepart: {}, vDestino: {} },
        //vStoreData = { vLocal: {}, vDepart: {}, vDestino: {} },
    TourFilter = { vLocal: {}, vDepart: {}, vDestino: {} },
    tabScrollY = { vLocal: 0, vDepart: 0, vDestino: 0 },
    addmoreLoading = { vLocal: 0, vDepart: 0, vDestino: 0 },
    countStart = { vLocal: 0, vDepart: 0, vDestino: 0 },
    districtData = { vLocal: {}, vDepart: {}, vDestino: {} },
    tabStatistics = {},
    baseDestination = { vLocal: 0, vDepart: 0, vDestino: 0 },
    changeDestination = { vLocal: 1, vDepart: 1, vDestino: 1 },
    DepartCityList = DepartCityDataList.pySort;

        var vacationslistTemplate = $("#vacationslistTemplate"),
        shaixuanTemplate = $("#shaixuanTemplate"),
        filterlistTemplate = $("#filterlistTemplate"),
        fakeVlistTemplate = $("#fakeVlistTemplate"),
        isFirstRender = true;

        var vacationslistView = pageview.extend({
            vacationsListModel: tourModel.VacationsListModel.getInstance(),
            pageid: c.utility.isInApp() ? '220079' : '220002',
            render: function (data) {
                /* var tpl = this.initTemplate();
                this.$el.html(tpl({
                "data": data
                }));*/
               // $baseLoad = this.$el.find('.base_loading');
            },
            onCreate: function () {
                //  this.injectHeaderView();
            },
            events: {
                "click .districtsum": "districtSelect",
                "click .crecommend": "crecommend",
                "click .shaixuan": "displaySX",
                "click .js_filters_li": "filterChoose",
                "click .js_onOff": "filterOnOff",
                "click .btn_blue": "filterSubmit",
                "click .item_select": "filterSelect",
                "click .hot_list_tab": "detail",
                "click .tpye_tab li": "tabSwitch",
                "click .try_again": "tryAgain",
                "touchstart .warp_z": "warp_zTouch",
                "touchmove .warp_z": "stopMove",
                //"touchmove .product_list": "stopMove",
                "touchmove .districtlist": "stopMove",
                "touchstart .product_list_box": "getScroll",
                "touchmove .product_list_box": "BarHiding",
                "click .dial_btn": "Dial"
            },
            stopMove: function () {
                event.preventDefault();
                //event.stopPropagation();
                //event.stopImmediatePropagation();
            },
            warp_zTouch: function () {
                $(".districtlist").hide();
                $(".crecommend dl").hide();
                $(".warp_z").hide();
            },
            getScroll: function () {
                //currentTouch = document.body.scrollTop;
                currentTouch = event.targetTouches[0].clientY;
            },
            showTemplate: function (el) {
                return false;
                if (!el) { return false; }
                var doms = $("script[data-id='multi_template']").css("display", "none");
                el.css("display", "");
            },
            BarHiding: function () {
                //console.log("BarHiding " + event.target.nodeName);
                //console.log(currentTouch);
                //currentTouch = event.layerY;
                if (event.targetTouches && !$(".districtlist").height()) {
                    //$(".sum").text(document.body.scrollTop + " " + (event.targetTouches ? event.targetTouches[0].clientY : "n/a"));
                    if ($(".product_list_box").height() > document.body.offsetHeight && currentTouch - 70 > event.targetTouches[0].clientY && document.body.scrollTop > 42) {
                        //hide
                        if (!!$(".tpye_tab").height()) {
                            $(".tpye_tab").hide();
                            $(".footer").hide();
                        }
                        currentTouch = event.targetTouches[0].clientY;
                    }
                    else if (currentTouch + 70 < event.targetTouches[0].clientY || document.body.scrollTop < 42) {
                        //show
                        if (!$(".tpye_tab").height()) {
                            $(".tpye_tab").show();
                            $(".footer").show();
                        }
                        currentTouch = event.targetTouches[0].clientY;
                    }
                    currentTouch2 = undefined
                }
                else if (!$(".districtlist").height()) {
                    //$(".sum").text(document.body.scrollTop);
                    if (currentTouch2 == undefined) { currentTouch2 = document.body.scrollTop; }
                    if ($(".product_list_box").height() > document.body.offsetHeight && currentTouch2 + 70 < document.body.scrollTop && document.body.scrollTop > 42) {
                        //hide
                        if (!!$(".tpye_tab").height()) {
                            $(".tpye_tab").hide();
                            $(".footer").hide();
                        }
                        currentTouch2 = document.body.scrollTop;
                    }
                    else if (currentTouch2 - 70 > document.body.scrollTop || document.body.scrollTop < 42) {
                        //show
                        if (!$(".tpye_tab").height()) {
                            $(".tpye_tab").show();
                            $(".footer").show();
                        }
                        currentTouch2 = document.body.scrollTop;
                    }

                }
            },
            getDepartCity: function (departCity) {
                var _DepartCity = { CityId: defaultDepartCityId, CityName: defaultDepartCity }, len = DepartCityList.length;
                //支持传入的departCity可为城市id或者城市中文名
                if (isNaN(departCity)) {
                    for (var i = 0; i < len; i++) {
                        if (departCity.indexOf(DepartCityList[i].name) > -1) {
                            _DepartCity = { CityId: DepartCityList[i].id, CityName: DepartCityList[i].name };
                            break;
                        }
                    }
                }
                else {
                    for (var j = 0; j < len; j++) {
                        if (departCity == DepartCityList[j].id) {
                            _DepartCity = { CityId: DepartCityList[j].id, CityName: DepartCityList[j].name };
                            break;
                        }
                    }

                }
                return _DepartCity;
            },
            showNext: function () {
                var self = this;
                self.onWindowScroll(self);
            },

            onWindowScroll: function (self) {
                //addmoreLoading的值：0：未加载，1：正在加载，2：全部加载完毕
                if (!!renderData.products && !$baseLoad.height() && !addmoreLoading[currTourType]) {
                    $baseLoad.show()
                }

                function showMore() {
                    var checkHeight = $("#headerview")[0].clientHeight + $(".product_list")[0].clientHeight;

                    if (currentScroll + $(window).height() > checkHeight) {
                        //console.log("scrollDown");
                        !addmoreLoading[currTourType] && renderData.products && self.addmore()
                    }
                }

                if (addmoreLoading[currTourType] == 2) {
                    $(window).unbind("scroll", $.proxy(self.showNext, self));
                    !!renderData.products && $(".no_more").show();
                }
                else {
                    currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
                    // 300毫秒延时，防止连续请求
                    clearTimeout(showmore);
                    showmore = setTimeout(showMore, 300);
                }
            },
            iScrollStart: function (self, my) {
                //console.log(my.directionY);
                if (my.directionY > 0) {
                    if (!!$(".tpye_tab").height()) {
                        $(".tpye_tab").hide();
                        $(".footer").hide();
                    }
                }
                else if (my.directionY < 0) {
                    if (!$(".tpye_tab").height()) {
                        $(".tpye_tab").show();
                        $(".footer").show();
                    }
                }
                if (!!renderData.products && !$baseLoad.height() && !addmoreLoading[currTourType]) {
                    $baseLoad.show()
                }
                //productListScroll.refresh();
            },
            iScrollEnd: function (self, my) {
                //console.log(my.directionY);
                if (my.directionY > 0) {
                    if (!!$(".tpye_tab").height()) {
                        $(".tpye_tab").hide();
                        $(".footer").hide();
                    }
                }
                else if (my.directionY < 0) {
                    if (!$(".tpye_tab").height()) {
                        $(".tpye_tab").show();
                        $(".footer").show();
                    }
                }
                var productListHeight = self.$el.find(".product_list_box").height();
                var productBoxHeight = productBox.height();
                //console.log(my.y);
                if (addmoreLoading[currTourType] == 2) {
                    !!renderData.products && $(".no_more").show();
                }
                else if (my.y + productListHeight < productBoxHeight + 300) {
                    !addmoreLoading[currTourType] && renderData.products && self.addmore('', function () { /*productListScroll.refresh();*/ });
                }
            },
            initTemplate: function () {
                return _.template(vacationslistTemplate);
            },
            addmore: function (isLocal, callback) {
                var self = this;
                countStart[currTourType] += onceCount; self.vacationsListModel.param.start = countStart[currTourType]; self.vacationsListModel.param.line = linetype;
                self.vacationsListModel.excute(function (response) {
                    if (self.vacationsListModel.param.line != linetype) {
                    }
                    else if (response.errno == 0) {
                        var responseData = response.data;
                        responseData.sCityId = self.vacationsListModel.param.saleCity;
                        addmoreLoading[currTourType] = 1;
                        if (!!responseData.products && !!responseData.products.length) {
                            var tpl = '<%_.each(data.products, function(v,k){%>\
                            <ul class="hot_list_tab btn_active" data-pid="<%=v.pId %>&saleCityId=<%=data.sCityId %>&departCityId=<%=v.departCId %>">\
                                <li class="hot_img">\
                                    <img width="142px" height="80px" src="<% if(v.img && !!v.img.trim()){%><%=v.img%><%}else{ %>http://pic.c-ctrip.com/vacation_v2/h5/group_travel/no_product_pic.png<%} %>">\
                                </li>\
                                <li class="hot_vacation">\
                                    <%if(v.isPromo){ %><i class="benefit">惠</i><%} %>\
                                    <div class="ellipsis"><p class="xname"><%=v.title%></p></div>\
                                    <div class="price_wrap">\
                                        <div class="pices">\
                                            <%if(!!v.price){ %>\
                                            <dfn>¥</dfn>\
                                            <span><%=v.price%></span>起\
                                            <%}else{ %>\
                                            <span class="font14">实时计价</span>\
                                            <%} %>\
                                        </div>\
                                        <%if(v.level && v.level>1){ %><i class="diamond diamond_<%=v.level %>"></i><%} %>\
                                    </div>\
                                    <div class="other">\
                                        <%if(!!v.score){ %><p class="score"><span><%=v.score.toFixed(1) %></span>分</p><%} %>\
                                        <%if(!!v.departCName && v.departCId!=data.sCityId){ %><span class="city"><%=v.departCName %>出发</span><%} %>\
                                        <div class="float_right">\
                                            <%if(v.isCashBack){ %><i class="orange"><dfn>返</dfn><%if(v.cashBackAmount && !isNaN(v.cashBackAmount)){ %><%=parseInt(v.cashBackAmount) %><%} %></i><%} %>\
                                            <%if(v.isWifi){ %><i class="wifi"></i><%} %>\
                                            <%if(!!v.specialTag && !!v.specialTag.trim()){ %> <i class="green"><%=v.specialTag %></i><%} %>\
                                        </div>\
                                    </div>\
                                </li>\
                            </ul>\
                            <%})%>';
                            var template = _.template(tpl);
                            var vList = $(template({ data: responseData }));
                            self.$el.find(".product_list").append(vList);
                            self.correctImage(vList);
                            var _storeData = vStoreData[currTourType];
                            _storeData.products = (_storeData.products && _storeData.products.length ? _storeData.products : []).concat(responseData.products);
                            if (responseData.products.length == onceCount) {
                                addmoreLoading[currTourType] = 0;
                            }
                            else {
                                addmoreLoading[currTourType] = 2;
                                $(".no_more").show();
                            }
                        }
                        else {
                            addmoreLoading[currTourType] = 2;
                            $(".no_more").show();
                        }

                        if (callback && $.type(callback) == 'function') {
                            callback.apply(null);
                        }

                        $baseLoad.hide();
                    }
                    else {
                        $(".no_more").show();
                        $baseLoad.hide();
                    }
                },
            function (errorInfo) {
                //console.info(errorInfo);
                addmoreLoading[currTourType] = 2;
                $(".no_more").show();
                $baseLoad.hide();
            }, false, this);
            },
            districtSelect: function (e) {
                var currTarget = e.currentTarget,
                target = e.target || e.srcElement,
                $target = $(target);
                if (target == currTarget || target.nodeName.toLowerCase() == "i" || target.nodeName.toLowerCase() == "span" || $target.data("districtname")) {
                    $(".districtlist", $(currTarget)).toggle();
                    $("dl", $(currTarget).siblings()).hide();
                    if ($target.data("districtname")) {
                        var _districtname = $target.data("districtname");
                        var _districtlabel = $target.data("districtlabel") || "B";
                        $("span", $(currTarget)).text(_districtname);
                        var noParam = 1;
                        var keyValue = $target.data("districtid");
                        //同步3个tab的目的地
                        for (var j = 1; j < 4; j++) {
                            var tempParams = ProdListParam[TourType[j]];
                            //在当前tab做目的地筛选时，标记为不需要重新获取目的地列表
                            if (j == linetype) { changeDestination[TourType[j]] = 0; }
                            else { changeDestination[TourType[j]] = 1; }
                            //查找之前是否已设定过目的地
                            if (tempParams.qparams) {
                                for (var i = 0, len = tempParams.qparams.length; i < len; i++) {
                                    if ((tempParams.qparams[i].lType == 'B' || tempParams.qparams[i].lType == 'G') && keyValue != 'notset') {
                                        tempParams.qparams[i].lType = _districtlabel;
                                        tempParams.qparams[i].lKey = keyValue;
                                        tempParams.qparams[i].lText = _districtname;
                                        noParam = 0;
                                        break;
                                    }
                                    else if (tempParams.qparams[i].lType == 'B' || tempParams.qparams[i].lType == 'G') {
                                        tempParams.qparams.splice(i, 1);
                                        break;
                                    }
                                }

                            }
                            if (noParam && keyValue != "notset") {
                                tempParams.qparams = [];
                                tempParams.qparams.push({
                                    "lType": _districtlabel,
                                    "lKey": keyValue,
                                    "lText": _districtname
                                });
                            }
                            tempParams.DSName = _districtname;
                        }
                        ProdListParamStore.set(ProdListParam);
                        var self = this;
                        var opt = {
                            "dialogName": "district@" + (+new Date())
                        };
                        this.updateView("viewportTmpl", self.updateCallback, self.updateParam(), false, opt);
                        //this.onShow();
                    }
                    if ($(".districtlist", $(currTarget)).height()) {
                        //需要重新刷新，获取高度
                        // productListScroll.disable();
                        districtListScroll.refresh();
                    }
                }

                if ($target.hasClass("area_title")) {
                    //收起其他省份
                    $target.siblings(".area_title").removeClass("area_cur");
                    //收起所有其他菜单时提前记录其子菜单状态
                    var nextSubnav = $target.next(".area_subnav");
                    var _isOpen = !nextSubnav.hasClass("hidden");
                    $target.siblings(".area_subnav").addClass("hidden");
                    $target.toggleClass("area_cur");
                    _isOpen ? nextSubnav.addClass("hidden") : nextSubnav.removeClass("hidden");
                    //展开和收起时需要重新计算高度
                    districtListScroll.refresh();
                    //productListScroll.disable();
                }


                if (!$(".districtlist", $(currTarget))[0].offsetHeight && !$("dl", $(currTarget).siblings())[0].offsetHeight) {
                    $(".warp_z").hide();
                }
                else {
                    $(".warp_z").show();
                }
            },
            crecommend: function (e) {
                var currTarget = e.currentTarget,
                target = e.target || e.srcElement;
                $("dl", $(currTarget)).toggle();
                $(".districtlist", $(currTarget).siblings()).hide();
                if ($(target.parentNode).hasClass("hide_div")) {
                    var sortBy = [0, 5, 3, 4];
                    ProdListParam[currTourType].sortType = sortBy[$(target).index()];
                    ProdListParamStore.set(ProdListParam);
                    var self = this;
                    var opt = {
                        "dialogName": "crecommend@" + (+new Date())
                    };
                    this.updateView("viewportTmpl", self.updateCallback, self.updateParam(), false, opt);
                    //this.onShow();
                }

                if (!$("dl", $(currTarget)).height() && !$(".districtlist", $(currTarget).siblings()).height()) {
                    $(".warp_z").hide();
                }
                else {
                    $(".warp_z").show();
                }
            },
            displaySX: function () {
                var self = this;
                $(window).unbind("scroll", $.proxy(self.showNext, self));
                //使用iscroll的坐标记录
                //tabScrollY[TourType[ProdListParam.linetype]] = productListScroll.y;
                tabScrollY[TourType[ProdListParam.linetype]] = window.scrollY;
                this.shaixuan();
            },
            shaixuan: function (filterType) {
                var self = this;
                var shaixuandata = [];
                var filters = TourFilter[currTourType];
                var tempParams = ProdListParam[currTourType];
                for (var x in filters) {
                    var hasSet = 0;
                    filterData = {
                        type: x,
                        name: typeDic[x],
                        key: -1,
                        text: "不限"
                    };

                    if (tempParams.qparams) {
                        for (var j = 0, jlen = tempParams.qparams.length; j < jlen; j++) {
                            if (tempParams.qparams[j].lType == filterData.type) {
                                filterData.key = tempParams.qparams[j].lKey;
                                filterData.text = tempParams.qparams[j].lText;
                                hasSet = 1;
                                break;
                            }
                        }
                    }
                    //当从第三方直接跳转到列表页，且穿了筛选参数时，筛选text会没有，需要在返回的结果中查找
                    if (hasSet && !filterData.text) {
                        for (var t = 0, tlen = filters[x].length; t < tlen; t++) {
                            if (filters[x][t].key == filterData.key) {
                                filterData.text = filters[x][t].text;
                            }
                        }
                    }
                    !!typeDic[x] && shaixuandata.push(filterData);
                }
                var isSelfSale = tempParams.isSale || 0, isProm = tempParams.isPromo || 0;

                shaixuandata.push({
                    type: "isSale",
                    key: isSelfSale,
                    name: '只看携程自营产品'
                });
                shaixuandata.push({
                    type: "isPromo",
                    key: isProm,
                    name: '只看优惠促销产品'
                });
                // 为了符合PRD上图中的排序, WTF!! VAC140101A-270
                shaixuandata.sort(function (a, b) {
                    var sq = "P,U,T,F,isSale,isPromo";
                    return sq.indexOf(a.type) - sq.indexOf(b.type);
                });
                var opt = {
                    "dialogName": "shaixuan@" + (+new Date())
                };
                // this.updateHeader("shaixuan", "");
                if (this.navigationType != "back") {
                    this.updateView("shaixuanTemplate", self.updateDialogCallback, shaixuandata, true, opt);
                } else {
                    this.refresh({ "data": shaixuandata });
                }
                
                /*this.$el.html(_.template(shaixuanTemplate.text())({
                "data": shaixuandata
                }));*/

                // this.showTemplate(shaixuanTemplate)
            },
            setDefault: function () {
                ProdListParam[currTourType] = {};
                //ProdListParamStore.set(ProdListParam);
                this.shaixuan();
            },
            filterSubmit: function () {
                ProdListParamStore.set(ProdListParam);
                var self = this;
                var opt = {
                    "dialogName": "filtersubmit@" + (+new Date())
                };
                this.updateView("viewportTmpl", self.updateCallback, self.updateParam(), false, opt);
            },
            filterChoose: function () {
                var self = this;
                filterType = $(arguments[0].currentTarget).data('type');

                var currentFilter = TourFilter[currTourType][filterType];/* tpl = _.template(filterlistTemplate.html());*/
                if (currentFilter[0].key != "notset") { currentFilter.unshift({ key: "notset", text: "不限" }); }
                var setSelect = 0;
                var tempParams = ProdListParam[currTourType];
                if (tempParams.qparams) {
                    var qparams = tempParams.qparams;
                    for (var j = 0, jlength = qparams.length; j < jlength; j++) {
                        if (qparams[j].lType == filterType) {
                            for (var k = 0, klength = currentFilter.length; k < klength; k++) {
                                currentFilter[k].isSelect = 0;
                                if (currentFilter[k].key == qparams[j].lKey) {
                                    currentFilter[k].isSelect = 1;
                                }
                            }
                            setSelect = 1;
                            break;
                        }
                    }
                }
                if (!setSelect) {
                    for (var k = 0, klength = currentFilter.length; k < klength; k++) {
                        currentFilter[k].isSelect = (k == 0) ? 1 : 0;
                    }
                }
                var self = this;
                var opt = {
                    "dialogName": "filter@"+ (+new Date())
                };

                this.updateView("filterlistTemplate", self.updateDialogCallback, currentFilter, true, opt);
                //this.$el.html(tpl({ "data": currentFilter }));
            },
            filterSelect: function (e) {
                var self = this;
                var target = e.target || e.srcElement;
                var noParam = 1;
                var keyValue = $(target).data("key");
                var tempParams = ProdListParam[currTourType];
                if (tempParams.qparams) {
                    for (var i = 0, len = tempParams.qparams.length; i < len; i++) {
                        if (tempParams.qparams[i].lType == filterType && keyValue != "notset") {
                            tempParams.qparams[i].lKey = keyValue;
                            tempParams.qparams[i].lText = $(target).text();
                            noParam = 0;
                        }
                        else if (tempParams.qparams[i].lType == filterType) {
                            tempParams.qparams.splice(i, 1);
                        }
                    }

                } else {
                    tempParams.qparams = [];
                }
                if (noParam && keyValue != "notset") {
                    tempParams.qparams.push({
                        "lType": filterType,
                        "lKey": keyValue,
                        "lText": $(target).text()
                    });
                }
                ProdListParamStore.set(ProdListParam);

                Lizard.goBack();
               // self.shaixuan(filterType);

            },
            filterOnOff: function () {
                var _target = arguments[0].currentTarget;
                var tempParams = ProdListParam[currTourType];
                $("i", _target).toggleClass("btn_on btn_off");
                filterType = $(_target).data('type');
                var isOn = $("i", _target).hasClass("btn_on");
                if (filterType == "isSale") {
                    tempParams.isSale = isOn;
                }
                else {
                    tempParams.isPromo = isOn;
                }
                //ProdListParamStore.set(ProdListParam);
            },
            tabSwitch: function (e) {
                e.preventDefault();
                $(window).unbind("scroll");
                //使用iscroll的坐标记录
                //tabScrollY[TourType[ProdListParam.linetype]] = productListScroll.y;
                tabScrollY[TourType[ProdListParam.linetype]] = window.scrollY;
                var self = this;
                var target = e.target || e.srcElement;
                var $target = $(target);
                if (!$target.hasClass('on')) {
                    $target.addClass('on');
                    $target.siblings('li').removeClass('on');
                    ProdListParam.linetype = $target.data('linetype');
                    ProdListParamStore.set(ProdListParam);
                    var action = window.isIpad ? "VacationListIpad" : "VacationList";
                    //productid=51542&salecityid=2&departcityid=2&from=nopage 
                    //alert("linetype:" + ProdListParam.linetype);
                    var params = [
                   ProdListParam["dCtyId"],
                   ProdListParam["dCtyId"],
                   ProdListParam["dCtyName"],
                   ProdListParam["destKwd"],
                   ProdListParam.linetype,
                   "nopage"
                    ].join("/");
                    var tempFilterLabels = self.vacationsListModel.param.filterLabels;
                    var tempGetFilterLabels = [];
                    for (var i = 0, l = tempFilterLabels.length; i < l; i++) {
                        if(tempFilterLabels[i]["lType"] == "B"){
                            tempGetFilterLabels.push(tempFilterLabels[i]);
                        }
                    }
                    var filterlabels = tempGetFilterLabels.length>0?"?filterlabels=" + JSON.stringify({"filterlabels": tempGetFilterLabels}) : "";
                    //console.log("======post data=====");
                    //console.log(self.vacationsListModel.param);
                    Lizard.goTo(Lizard.appBaseUrl + action + "/" + params + filterlabels);
                    
                }
            },
            headerUpdate: function (hData) {
                var self = this;

                /********************************
                * @description:  设置HeaderView数据
                * @param:        [optional]{data.title} String 设置HeaderView的显示的栏目标题
            
                * @param:        [optional]{data.tel} JSON 设置电话链接按钮 tel:{number: 56973183}
                * @param:        [optional]{data.home} boolean 是否需要显示Home按钮
                * @param:        [optional]{data.btn} JSON {title: "完成", id: 'confirmBtn', classname: 'bluebtn'}
                * @param:        [optional]{data.back} boolean 是否需要显示返回按钮
                * @param:        [optional]{data.custom} String 需要设置的自定义html
                * @param:        [optional]{data.events} JSON 设置需要的按钮点击回调事件 { homeHandler: function, returnHandler: function}
                * @param:        [optional]{data.view} function 当前的作用域constructor
                * @param:        [optional]{data.bindEvents} function($el){} $el是当前headerview的$对象，与btn或custom共同设置
                * @param:        [optional]{data.openAds} boolen 是否显示广告，默认为不显示
                * @param:        [optional]{data.commit} JSON {id: '', callback: ''}
                * @return:       $对象
                *
                * 举例来说 data{title: "选择出发地", home: 'true', back: true, events: {homeHandler: function(){console.log('click home')}}};
                *
                */

                self.header.set({
                    title: hData.title,
                    //tclass: hData.class||'',
                    subtitle: hData.subtitle, //目前无法使用subtitle
                    customtitle: hData.customtitle, //title和customtitle只能选择其一
                    back: true,
                    view: this,
                    tel: null,
                    home: hData.home,
                    custom: hData.custom ? hData.custom.html : '',
                    btn: hData.btn,
                    bindEvents: function ($el) {
                        if (hData.custom && hData.custom.class) {
                            $el.on('click', hData.custom.class, hData.custom.func)
                        }
                        if (hData.btn && hData.btn.classname) {
                            $el.on('click', '.' + hData.btn.classname, hData.btn.func)
                        }
                    },
                    events: {
                        returnHandler: hData.returnfunc,
                        homeHandler: hData.homefunc
                    },
                    commit: hData.commit
                });
                //self.header.show();
                //self.header.htmlMap.title = '<h1 class="title"><%=title %></h1>';

            },
            onShow: function () {
                var self = this, _startY = 0;

                linetype = (!!Lizard.P('type') && !isNaN(Lizard.P('type')) ? Lizard.P('type') : ProdListParam.linetype) || 1;
                //如果linetype大于4或者小于1，则默认设为1 当等于4时，改为3，为了配合语音接口
                if (linetype - 1 + 1 == 4) { linetype = 3; } else if (linetype - 1 + 1 > 4 || linetype - 1 + 1 < 1) { linetype = 1; }

                currTourType = TourType[linetype];
                if (JSON.stringify(vStoreData[currTourType]) == "{}") {
                    vStoreData[currTourType] = self["datas"].data;
                }
                var firstData = [{ "data": vStoreData[currTourType]}].concat();
                
                if (self.config && self.config.model.apis && self.config.model.apis[0].postdata.filterLabels.length == 0) {
                    localStorage.setItem("P_VACATIONS_TABSTATISTICS", JSON.stringify(vStoreData[currTourType].tabStatistics));
                }

                self.updateParam();
                console.log("STATE:" , self.navigationType);
                var dialogName = (self["dialogName"] || '').replace(/@\d+$/, '');
                /*首次进入或者筛选之后进入列表，需要根据数据重新刷新页面**/
                if (!dialogName || dialogName == "filtersubmit" || dialogName == "district") {
                    self.updateCallback(firstData);
                    self.updateHeader(dialogName, firstData[0].data);
                } else {
                    if (self.navigationType == "back" && dialogName == "shaixuan") {
                        self.shaixuan(ProdListParam[TourType[linetype]])
                    }
                    
                    self.updateHeader(dialogName);
                }

                this.correctImage($(".product_list"));
                //            if (self.referrer != 'index') {
                //                _startY = tabScrollY[currTourType] || 0;
                //            }
                //            //使用iscroll来展示列表
                //            productBox = self.$el.find(".scrollproduct");
                //            productListScroll = new IScroll('.scrollproduct', { bindToWrapper: true, startY: _startY });
                //            productListScroll.on('scrollStart', function () { var my = this; self.iScrollStart(self, my); });
                //            productListScroll.on('scrollEnd', function () { var my = this; self.iScrollEnd(self, my); });
                //使用iscroll来展示目的地

                $districtList = this.$el.find('.scroll_districtlist');
                if ($districtList[0] && $districtList[0].children[0]) {
                    districtListScroll = new IScroll($districtList[0], { bindToWrapper: true, mouseWheel: true });
                }
                $baseLoad = this.$el.find('.base_loading');
                $(window).bind("scroll", $.proxy(self.showNext, self));

            },
            onHide: function () {
                $(window).unbind("scroll");
                //tabScrollY[currTourType] = productListScroll.y;
                //            tabScrollY[currTourType] = window.scrollY
                //            this.tabScrollY = tabScrollY;
            },
            /**更新获取数据的参数**/
            /**vlocal是一日游，vdepart是出发地参团，vdestino是目的地参团**/
            updateParam: function (referrer) {
                var self = this;
                //记录来源，通过参数传递
                self.referrer = referrer || '';
                isInApp = c.utility.isInApp();
                !!self.tabScrollY && (tabScrollY = self.tabScrollY);

                ProdListParam = ProdListParamStore.get() || { vLocal: {}, vDepart: {}, vDestino: {} };

                linetype = (!!Lizard.P('type') && !isNaN(Lizard.P('type')) ? Lizard.P('type') : ProdListParam.linetype) || 1;
                //如果linetype大于4或者小于1，则默认设为1 当等于4时，改为3，为了配合语音接口
                if (linetype - 1 + 1 == 4) { linetype = 3; } else if (linetype - 1 + 1 > 4 || linetype - 1 + 1 < 1) { linetype = 1; }

                salecity = Lizard.P('salecity') || ProdListParam.sCtyId;
                scity = Lizard.P('scity') || ProdListParam.dCtyId;
                kwd = Lizard.P('kwd') || ProdListParam.destKwd;
                sname = Lizard.P('sname') || ProdListParam.dCtyName;
                filterParam = Lizard.P('filter') ? Lizard.P('filter').match(/\D\d+-?\d*/g) : '';
                if (!ProdListParam.frompage) { ProdListParam.frompage = Lizard.P('from'); ProdListParamStore.set(ProdListParam); }

                currTourType = TourType[linetype];
                var tempParams = ProdListParam[currTourType];
                var tempOriginalParams = origProdListParam[currTourType];

                /***vStoreData用来存放tab切换时的缓存数据
                ***每次进行筛选之后都会更新对应TAB的数据
                ***/
                renderData = vStoreData[currTourType];

                //获取筛选项
                if (filterParam) {
                    filterLabelsParam = [];
                    var tempfilterArray;
                    for (var x = 0, filterlength = filterParam.length; x < filterlength; x++) {
                        tempfilterArray = filterParam[x].match(/\D|\d+-?\d*/g) || [];
                        if ((tempfilterArray.length > 1) && (tempfilterArray[0])) {
                            filterLabelsParam.push({ lType: filterParamDic[tempfilterArray[0]], lKey: tempfilterArray[1] });
                        }
                    }
                }

                //配合语音接口，接受以文字方式传入出发站
                if ((scity != undefined) && isNaN(scity)) {
                    var _tempDepartCity = self.getDepartCity(scity);
                    scity = _tempDepartCity.CityId;
                    sname = _tempDepartCity.CityName;
                };

                //配合语音接口，接受以文字方式传入售卖站
                //新增定位判断，当第三方接入且无售卖站传入时定位
                if ((salecity != undefined) && (isNaN(salecity) || !sname || self.vacationsListModel.param.saleCity != salecity)) {
                    var _tempDepartCity = self.getDepartCity(salecity);
                    salecity = _tempDepartCity.CityId;
                    sname = _tempDepartCity.CityName;
                    self.preUpdateView();
                }
                else if (!salecity) {
                    //self.showToast('正在定位您所在的位置');
                    self.Locating(function () {
                        var geo = GeoLocationStore.get();
                        if (geo.fail) {
                            //self.showToast('定位失败<br/>将加载默认出发地：上海');
                        }
                        else {
                            salecity = geo.id;
                            sname = geo.name;
                        }
                        self.preUpdateView();
                    });
                }
                else {
                    self.preUpdateView();
                }

                return self.vacationsListModel.param;
            },

            /**
            更新View之前，需要判断vStoreData中是否有数据，决定了updateView的Data是从缓存中取还是从URL中获取
            **/
            preUpdateView: function () {
                var self = this;

                /**判断是否是回退的状态，如果参数没有改变，可以直接从vStoreData中获取数据**/
                /**if (!ProdListParam.renew && !!renderData.products && renderData.products.length && self.vacationsListModel.param.saleCity == salecity
                && tempParams.sortType == tempOriginalParams.sortType && destKwd4Tour == kwd && compareArray(tempParams.qparams, tempOriginalParams.qparams)
                && tempParams.isSale == tempOriginalParams.isSale && tempParams.isPromo == tempOriginalParams.isPromo && ProdListParam.selectorId == self.vacationsListModel.param.selectorId) {
               
                var _title = sname + ' - ' + (self.vacationsListModel.param.key == 'mobi' ? '周边' : self.vacationsListModel.param.key), _subtitle = '共' + totalCount[currTourType] + '条';
                var hdata = {
                title: !!isInApp ? _title : undefined,
                subtitle: _subtitle,
                customtitle: !!isInApp ? undefined : ('<h1 class="list">' + _title + '<span class="sum">' + _subtitle + '</span>' + '</h1>'), //title和customtitle只能选择其一
                home: true,
                homefunc: function (event) {
                ProdListParam.frompage = undefined; ProdListParamStore.set(ProdListParam);
                self.jump("/html5/");
                },
                returnfunc: function () {
                var backpage = ProdListParam.frompage || '';
                ProdListParam.frompage = undefined; ProdListParamStore.set(ProdListParam);
                //当from参数值为nopage时，直接返回上一页，不做固定返回页
                !backpage ? self.back("#index") : (backpage == 'nopage' ? (isInApp ? Guider.backToLastPage({}) : self.back()) : self.jump(backpage));
                }
                };
                self.headerUpdate(hdata, 1);
                this.updateView("viewportTmpl", self.updateCallback);
                //self.render(renderData);
                // self.hideLoading();
                //self.turning();
                if (renderData.products && renderData.products.length < onceCount) { $(".no_more").show(); }
                $(window).bind("scroll", $proxy(self.showNext, self));
                //改用iscroll，以下代码不需要
                if (self.referrer != 'index') {
                //来源不是列表页的时候进行重定位，列表和查询页进来没必要使用该方法
                window.scrollTo((self.scrollPos ? self.scrollPos.x : 0), tabScrollY[currTourType]);
                }
                }
                else {**/
                vStoreData[currTourType] = {};
                renderData = {};
                // self.getRenderData();
                var tempParams;
                //重新查询时重置滚动高度
                tabScrollY[currTourType] = 0;

                //当从首页进入或者搜索城市发生改变时，初始化相关值。不支持浏览器刷新，即当使用浏览器刷新时，会进入下面条件初始化。
                if (ProdListParam.renew || self.vacationsListModel.param.saleCity != salecity || self.vacationsListModel.param.key != kwd) {
                    ProdListParam.renew = 0;
                    ProdListParam.vLocal = {};
                    ProdListParam.vDepart = {};
                    ProdListParam.vDestino = {};
                    ProdListParamStore.set(ProdListParam);
                    vStoreData = { vLocal: {}, vDepart: {}, vDestino: {} };
                    TourFilter = { vLocal: {}, vDepart: {}, vDestino: {} };
                    districtData = { vLocal: {}, vDepart: {}, vDestino: {} };
                    tabStatistics = {};
                    baseDestination = { vLocal: 0, vDepart: 0, vDestino: 0 };
                    changeDestination = { vLocal: 1, vDepart: 1, vDestino: 1 };
                }

                tempParams = ProdListParam[currTourType];
                addmoreLoading[currTourType] = undefined;
                countStart[currTourType] = 0;

                destKwd4Tour = kwd;

                //存入筛选项，当点击筛选页时，需要显示已经选择的筛选
                if (filterLabelsParam.length) {
                    tempParams.qparams = filterLabelsParam;
                    ProdListParamStore.set(ProdListParam);
                }

                self.vacationsListModel.param = {
                    "saleCity": salecity || defaultDepartCityId,
                    "startCity": 0, //目前不需要传出发站
                    "key": (kwd == "周边" ? "mobi" : kwd) || "三亚",
                    "selectorId": ProdListParam.selectorId || 0,
                    "line": linetype,
                    "start": 0,
                    "count": onceCount,
                    "filterLabels": (tempParams.qparams && tempParams.qparams.length) ? tempParams.qparams : (filterLabelsParam || []),
                    "isSale": tempParams.isSale ? 1 : 0,
                    "isPromo": tempParams.isPromo ? 1 : 0,
                    "orderType": tempParams.sortType || 0
                };
                /**}**/

                //记录之前获取的各值
                ProdListParam.linetype = linetype;
                ProdListParam.sCtyId = salecity || defaultDepartCityId;
                ProdListParam.dCtyId = scity || salecity || defaultDepartCityId;
                ProdListParam.destKwd = kwd || '三亚';
                ProdListParam.dCtyName = sname || defaultDepartCity;
                (ProdListParam.selectorId == undefined) && (ProdListParam.selectorId = 0);
                ProdListParamStore.set(ProdListParam);
                this.tempParams = tempParams;

                //tab切换时会触发滚动事件，我也不知道为什么。。。
                /*setTimeout(function () { $(window).bind("scroll", function () { self.BarHiding(); }); }, 0);*/
            },
            /***
            ** template:模板
            ** filterCallback:数据回调函数
            ** params:请求URL的参数
            ** datas:直接用来更新的数据
            **/
            updateView: function (template, filterCallback, params, isRenderData, opt) {
                var self = this;
                if (isRenderData) {
                    self.viewParams = {
                        "model": {
                            "data": params,
                            "filter": $.proxy(filterCallback, self)
                        },
                        "view": {
                            "header": "", //optional
                            "viewport": Lizard.T(template)
                        },
                        "controller": 'VacationListController'
                    }
                } else {
                    self.viewParams = {
                        "model": {
                            "apis": [{
                                runat: "server",
                                url: 'http://m.ctrip.com/restapi/vacationapi/product/productsearch',
                                postdata: params
                            }],
                            "filter": $.proxy(filterCallback, self)
                        },
                        "view": {
                            "header": Lizard.T("headTmpl"), //optional
                            "viewport": Lizard.T(template)
                        },
                        "controller": 'VacationListController'
                    }
                }

                Lizard.showDialog(self.viewParams, opt);
            },
            updateHeader: function (dialogName, responseData) {
                var self = this;
                var hdata = {};
                /*if (typeof dialogName != "undefined") {
                    var temp = dialogName.split("_");
                    if (temp.length > 0) {
                        dialogName = temp[0];
                    }
                }*/
                //console.log("dialogName:" + dialogName);
                switch (dialogName) {
                    case "shaixuan":
                        hdata = {
                            title: '筛选',
                            btn: {
                                title: "恢复默认",
                                id: 'confirmBtn',
                                classname: 'righthead',
                                func: function (event) {
                                    self.setDefault();
                                }
                            }, //设置头部右边的按钮，例如：完成按钮
                            commit: { id: 'confirmBtn', callback: function () { self.setDefault(); } },
                            returnfunc: function () {
                                ProdListParam[currTourType] = origProdListParam[currTourType];
                                ProdListParamStore.set(ProdListParam);
                                Guider.apply({
                                    callback: function () { Lizard.goBack(); },
                                    hybridCallback: function () {
                                        self.showLoading();
                                        Lizard.goBack(); 
                                        self.$el.html('');
                                        setTimeout(function () { self.onShow() }, 10)
                                    }
                                });
                            }
                        };
                        break;
                    case "filter":
                        hdata = {
                            title: typeDic[filterType],
                            returnfunc: function () {
                                Lizard.goBack();
                            }
                        };
                        break;
                    default:
                        /**默认刚进入页面或者在列表页进行目的地筛选和排序的时候**/
                        //console.log("default header");
                        var _title = (sname || defaultDepartCity) + ' - ' + (self.vacationsListModel.param.key == 'mobi' ? '周边' : self.vacationsListModel.param.key), _subtitle = '共' + responseData.tCount + '条';

                        hdata = {
                            title: !!isInApp ? _title : undefined,
                            subtitle: _subtitle,
                            customtitle: !!isInApp ? undefined : ('<h1 class="list">' + _title + '<span class="sum">' + _subtitle + '</span>' + '</h1>'), //title和customtitle只能选择其一
                            home: true,
                            homefunc: function (event) {
                                ProdListParam.frompage = undefined;
                                ProdListParamStore.set(ProdListParam);
                                Lizard.goTo(Lizard.appBaseUrl+"index/");
                            },
                            returnfunc: function () {
                                var backpage = ProdListParam.frompage || '';
                                ProdListParam.frompage = undefined;
                                ProdListParamStore.set(ProdListParam);
                                !backpage ? Lizard.goBack() : (backpage == 'nopage' ? (isInApp ? Guider.goBack({}) : Lizard.goBack()) : Lizard.goTo(backpage));
                            }
                        };
                        break;
                }
                self.headerUpdate(hdata);
            },
            updateDialogCallback: function (datas) {
                var self = this;
                return { "data": datas[0] };
            },
            updateCallback: function (datas) {
                //if (response.errno == 0) {
                var self = this;
                var responseData = datas[0].data;
                totalCount[currTourType] = responseData.tCount;
                var _title = (sname || defaultDepartCity) + ' - ' + (self.vacationsListModel.param.key == 'mobi' ? '周边' : self.vacationsListModel.param.key), _subtitle = '共' + responseData.tCount + '条';

                // this.updateHeader(self["dialogName"], responseData);

                if (!!self.tempParams) {
                    renderData.sortType = self.tempParams.sortType || 0;
                }
                var _filter = TourFilter[currTourType];
                //当筛选条件不存在时，进行赋值，且只在首次查询时获取
                if (JSON.stringify(_filter) == '{}' && responseData.filterLabels) {
                    for (var i = 0, filterLength = responseData.filterLabels.length; i < filterLength; i++) {
                        if (!_filter[responseData.filterLabels[i].lType]) { _filter[responseData.filterLabels[i].lType] = [] };
                        _filter[responseData.filterLabels[i].lType].push({ key: responseData.filterLabels[i].lKey, text: responseData.filterLabels[i].lText + (responseData.filterLabels[i].lType == "U" ? "日" : "") }); //添加"日" VAC140101A-271
                    }
                }

                //判断filter里是否已设定目的地筛选
                var hasDestination = 0;
                var _filterLabels = self.vacationsListModel.param.filterLabels;
                for (var fi = 0, fl = _filterLabels.length; fi < fl; fi++) {
                    if (_filterLabels[fi].lType == 'B' || _filterLabels[fi].lType == 'G') {
                        hasDestination = 1;
                        break;
                    }
                }
                //获取目的地列表，当首次进入，且无筛选参数时，获取最全列表，此列表获取之后不再重新获取
                //当首次进入或多次进入，且有筛选参数时，获取基于筛选参数的列表，此列表并不会永久保留

                if (!baseDestination[currTourType] && responseData.districtSum && !hasDestination) {
                    districtData[currTourType] = responseData.districtSum;
                    baseDestination[currTourType] = 1;
                }
                else if (!baseDestination[currTourType] && hasDestination && changeDestination[currTourType]) {
                    districtData[currTourType] = responseData.districtSum || { pdLst: [], tCount: 0 };
                    districtData[currTourType].tCount = 0;
                }

                //获取各tab返回数量，只在首次查询时获取
                if (JSON.stringify(tabStatistics) == '{}') {
                    tabStatistics = { vLocal: 0, vDepart: 0, vDestino: 0, tabs: 0 };
                    if (responseData.tabStatistics) {
                        var _tabStatistics = responseData.tabStatistics;
                        for (var i = 0, lens = _tabStatistics.length; i < lens; i++) {
                            var _value = _tabStatistics[i].value;
                            if (!!_value) {
                                tabStatistics[TourType[_tabStatistics[i].key]] = _tabStatistics[i].value;
                                tabStatistics.tabs += 1;
                            }
                        }
                    }
                } else {
                    tabStatistics = JSON.parse(localStorage.getItem("P_VACATIONS_TABSTATISTICS"));
                }

                var pstore = ProdListParamStore.get();
                var tempParams = self.tempParams;

                //尝试从URL中获取DSName
                var tempFilterLabels = Lizard.P("filterlabels")?JSON.parse(Lizard.P("filterlabels"))["filterlabels"]:false;
                var tempDSName = '目的地';
                if(tempFilterLabels){
                    for(var i=0,l=tempFilterLabels.length; i<l; i++){
                        if(tempFilterLabels[i]["lType"] == "B"){
                            tempDSName = tempFilterLabels[i]["lText"];
                            break;
                        }
                    }
                }
                renderData.products = responseData.products;
                renderData.districtSum = JSON.parse(localStorage.getItem("P_VACATIONS_DISTRICTDATA"));
                renderData.tabStatistics = tabStatistics;
                renderData.districtSelectedName = tempParams.DSName || tempDSName;
                renderData.linetype = linetype;
                renderData.localCity = self.vacationsListModel.param.key;
                renderData.sCityId = self.vacationsListModel.param.saleCity;
                //原目的地从筛选页移出，所以目前判断一个tab是否做过筛选，要先剔除目的地选择
                renderData.hasfilter = !!tempParams.isSale || !!tempParams.isPromo || (tempParams.qparams && (tempParams.qparams.length > 1 || (tempParams.qparams.length == 1 && tempParams.qparams[0].lType != 'B' && tempParams.qparams[0].lType != 'G')));
                renderData.isInApp = isInApp;
                renderData.scrollproductHeight = document.body.offsetHeight - 48;
                renderData.tCount = totalCount[currTourType];
                vStoreData[currTourType] = renderData;
                //clearTimeout(showFakeTemp);
                //self.render(renderData);
                //self.hideLoading();
                //self.turning();
                if (responseData.tCount < onceCount) { addmoreLoading[currTourType] = 2; !!responseData.tCount && $(".no_more").show(); }
                origProdListParam[currTourType] = (ProdListParamStore.get() || { vLocal: {}, vDepart: {}, vDestino: {} })[currTourType];
                //$(window).bind("scroll", showNext);
                console.log("updateCallback", renderData);
                return { data: renderData };
                /*}
                else {
                clearTimeout(showFakeTemp);
                //self.hideLoading();
                self.showToast(response.errmsg + "<br/>请返回重新选择城市。", function () { self.back("#index"); });

                }*/
            },

            detail: function (e) {
                tabScrollY[currTourType] = window.scrollY;
                this.tabScrollY = tabScrollY;
                // fix bug VAC140101A-377
                $(".tpye_tab").show();
                $(".footer").show();
                console.log(ProdListParam);

                var action = window.isIpad ? "DetailIpad" : "Detail";
                //productid=51542&salecityid=2&departcityid=2&from=nopage 
                var params = [
                  $(e.currentTarget).data("pid"),
                  ProdListParam["sCtyId"],
                  ProdListParam["dCtyId"],
                  "nopage"
            ].join("/");
                //Lizard.goTo(Lizard.appBaseUrl + action + "/" + params);
            },
            showToast: function (msg, fun) {
                if (!fun) {
                    fun = function () { }
                }
                if (!this.toast) {
                    this.toast = new c.ui.Toast();
                }
                this.toast.show(msg, 2, fun, true);
            },
            correctImage: function (container) {
                var $imgs = $("img", container);
                $imgs.each(function (index, element) {
                    var $this = $(element);
                    element.onload = function () { $this.show("fast"); };
                    // 增加error判断，当图片加载错误时，显示元素，alt文字会替代图片
                    element.onerror = function () {
                        $this.attr("src", "http://pic.c-ctrip.com/vacation_v2/h5/group_travel/no_product_pic.png");
                        //$this.show();        
                    };
                })
            },
            tryAgain: function () {
                this.onShow();
            },
            Dial: function (e) {
                var curNumber = $(e.currentTarget).data('num');
                return Guider.apply({
                    hybridCallback: function () {
                        e.preventDefault();
                        Guider.callPhone({ tel: curNumber });
                        return false;
                    },
                    callback: function () {
                        return true;
                    }
                });
            },
            Locating: function (callback) {
                var getLocation = 0;
                geoLocation = GeoLocationStore.get() || {};
                if (!geoLocation.fail && !geoLocation.name) {
                    GeoLocationWidget = cWidgetFactory.create('Geolocation');
                    GeoLocationWidget.requestCityInfo(function (jsonData) {
                        //console.log(jsonData);
                        for (var i = 0, len = DepartCityList.length; i < len; i++) {
                            if (jsonData.city.indexOf(DepartCityList[i].name) > -1) {
                                geoLocation = { name: DepartCityList[i].name, id: DepartCityList[i].id };
                                getLocation = 1;
                                break;
                            }
                        }
                        if (!getLocation) {
                            geoLocation = { fail: 1 };
                        }
                        GeoLocationStore.set(geoLocation);
                        ($.type(callback) == 'function') && callback();
                    }, function (err) {
                        geoLocation = { fail: 1 };
                        GeoLocationStore.set(geoLocation);
                        ($.type(callback) == 'function') && callback();
                    });
                }
                else {
                    callback();
                }
            }
        });

        function compareArray(arrA, arrB) {
            var same = 1;
            var getA = [], getB = [];
            if (!!arrA && !!arrB && (arrA.length == arrB.length)) {
                for (var m = 0, Alen = arrA.length; m < Alen; m++) {
                    getA.push(arrA[m]);
                }
                for (var n = 0, Blen = arrB.length; n < Blen; n++) {
                    getB.push(arrB[n]);
                }
                var l = getA.length;
                for (var i = 0; i < l; i++) {
                    if (!same) { break; }
                    for (var j = 0; j < l; j++) {
                        if ($.type(getA[i]) == $.type(getB[j])) {
                            if ($.type(getA[i]) == "object") {
                                var xcount = 1, x_count = 1, ycount = 1;
                                for (var x in getA[i]) {
                                    xcount += 1;
                                    if (getA[i][x] == getB[j][x]) {
                                        x_count += 1;
                                    }
                                }
                                for (var y in getB[j]) {
                                    ycount += 1;
                                }

                                if (xcount == x_count && xcount == ycount) {
                                    getB.splice(j, 1);
                                    getA.splice(i, 1);
                                    i--; l--;
                                    break;
                                }
                            }
                            else if (getA[i] == getB[j]) {
                                getB.splice(j, 1);
                                getA.splice(i, 1);
                                i--; l--;
                                break;
                            }
                        }

                        if (j == l - 1) {
                            same = 0;
                            break;
                        }

                    }
                }
            }
            else if (!arrA && !arrB) {
                same = 1;
            }
            else {
                same = 0;
            }
            return same;
        }

        return vacationslistView;
    })

/*define(['cPageView'],function(pageView){
	var groupView = pageView.extend({
		pagebeforehide:function(){
			console.log('pagebeforehide',this.id)
		},
		pagehide:function(){
			console.log('pagehide',this.id)
		},
		pagebeforeshow:function(){
			console.log('pagebeforeshow',this.id)
		},
		pageshow:function(){
			console.log('pageshow',this.id)
		},
		events: {
			"click .hot_list_tab": "detail"
		},
		detail: function (e) {
		    //<!--http://m.ctrip.com/webapp/tour/#detail?productid=34678&salecityid=2&departcityid=2&from=nopage-->
			var el = $(e.target).parents(".hot_list_tab");
			if (!el) { return false;}
			var pid =el.attr("data-pid").replace(/[^\d].*$/,"");
			var action = window.isIpad ? "detailIpad" : "detail";
			var params = [
                  
			];
			Lizard.goTo(Lizard.appBaseUrl + action + "/" + pid + "/" + Lizard.P("salecity"));
		}
	})
	return groupView;
});*/


