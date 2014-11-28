define(['libs', 'c', 'cPageView', 'cWidgetFactory', 'cWidgetGeolocation', 'TourStore', 'Cities', 'TourModel', 'cWidgetGuider', 'Timer'], function (libs, c, pageview, cWidgetFactory, cWidgetGeolocation, tourStore, cityDataList, tourModel, cWidgetGuider, Timer) {
    var GeoLocationWidget, getLocation, geoLocation, cityList = cityDataList.pySort, $g_depart, $g_dest, prodListParam;
    var defaultDepartCity = "上海", defaultDepartCityId = "2";
    var ProdListParamStore = tourStore.ProdListParamStore.getInstance();
    var GeoLocationStore = tourStore.GeoLocationStore.getInstance();
    var Guider = cWidgetFactory.create('Guider');
    var listTimer = new Timer();
    var localTime;
    var groupView = pageview.extend({
        hasAd: true,
        pageid: c.utility.isInApp() ? '220078' : '220001',
        homeInfoModel: tourModel.homeInfoModel.getInstance(),
        render: function () {
            this.$el.html(indexTemplate);
        },
        onCreate: function () {
            //this.injectHeaderView();
            //this.render();
            this.getCskill();
        },
        events: {
            "click .starting": "getDepart",
            "click #g_dest": "getDest",
            "click .hot_motif": "goHot",
            "click .motif_list td": "goMot",
            "click #c_seckill": "goCsList",
            "click li[type='selected_prod_item']": "goDetail"
        },
        onShow: function () {

            var self = this;
            getLocation = false;
            geoLocation = GeoLocationStore.get() || {};
            $g_depart = this.$el.find('#g_depart');
            $g_dest = this.$el.find("#g_dest");
            prodListParam = ProdListParamStore.get() || { 'destKwd': '', 'selectorId': '', 'dCtyName': '', 'dCtyId': '', 'sCtyId': '', 'vLocal': {}, 'vDepart': {}, 'vDestino': {} };
            // 如果是从选择城市列表返回的，则不再进行定位，直接取选择的城市
            //alert(ProdListParamStore.get().dCtyName + "index2");
            if (Lizard.P('depetId')) {
                var textItem = _.filter(cityDataList.pySort, function (x) {
                    return x.id == Lizard.P('depetId');
                })[0];
                if (textItem) {
                    $g_depart.text(textItem.name);
                    $g_depart.data("id", Lizard.P('depetId'));
                }
            }
            else if (prodListParam.dCtyName) {
                $g_depart.text(prodListParam.dCtyName);
                $g_depart.data("id", prodListParam.dCtyId);
                getLocation = 1;
            }
            else if (!!geoLocation.name) {
                getLocation = 1;
                $g_depart.text(geoLocation.name);
                $g_depart.data("id", geoLocation.id);
                prodListParam.dCtyName = geoLocation.name;
                prodListParam.dCtyId = geoLocation.id;
                ProdListParamStore.set(prodListParam);
            }
            else {
                $g_depart.text(defaultDepartCity);
                $g_depart.data("id", defaultDepartCityId);
                self.Locating();
            }
            var self = this;
            this.header.set({
                title: '团队游2',
                back: true,
                view: this,
                tel: null,
                home: true,
                events: {
                    returnHandler: function () {

                        Guider.apply({ callback: function () { self.back(Lizard.appBaseUrl + 'vacations'); }, hybridCallback: function () { Guider.backToLastPage({}); } });
                    },
                    homeHandler: function () {
                      
                        this.jump('/html5/');
                    }
                }
            });

            prodListParam = ProdListParamStore.get() || { 'destKwd': '', 'selectorId': '', 'dCtyName': '', 'dCtyId': '', 'sCtyId': '', 'vLocal': {}, 'vDepart': {} };
            this.header.show();
            //this.turning();
            this.getHomeInfo();
            //alert(prodListParam.dCtyName + "onload1");
        },
        getCskill: function () {
            var self = this;
            var cskillAjax = tourModel.CsKillAdModel.getInstance();
            cskillAjax.param = { "EnvironmentType": "M640" };
            cskillAjax.excute(function (json) {
                var data = json.data;

                if (json.ResponseStatus.Ack === "Success") {
                    localTime = listTimer.getLocalTime(data.SecKillSetting);
                    self.showCskill(data);          //初次初始化显示
                    listTimer.timered(self.cskillTimeer);       //每秒刷新
                } else {
                    this.showToast(json.ResponseStatus.Errors[0].Message);
                }
            }, function () {       //异常
                this.showToast('网络错误，请稍候重试。');
            }, false, this);
        },
        showCskill: function (cskillData) {
            var imgSrc = cskillData.ImageUrl ? cskillData.ImageUrl : "http://pic.c-ctrip.com/vacation_v2/h5/group_travel/pic_none.png",
                lastTime = {},
                status = listTimer.getTimerStatus();
            var html = '<table class="c_seckill"><tbody><tr>'
                        + '<td>'
                        + '<i class="icon_seckill">秒杀</i>';
            if (status === "noStarted") {
                lastTime = localTime.lastTime;
                html += '<p class="date_seckill">' + lastTime.month + '月' + lastTime.date + '日开抢</p>';
            } else if (status === "upcomingStart") {
                lastTime = listTimer.getLastTime(listTimer.d2);
                html += '<p class="time_seckill"><span>' + lastTime.hour + '</span><em>:</em><span>' + lastTime.minute + '</span><em>:</em><span>' + lastTime.second + '</span></p>';
            } else if (status === "start") {
            } else { }
            html += '</td>'
                    + '<td>'
                    + '<div class="index_seckill_banner">'
                    + '<img src="' + imgSrc + '">'
                    + '</div>'
                    + '</td>';
+'</tr></tbody></table>';

            this.$el.find("#c_seckill").html(html);
        },
        cskillTimeer: function () {
            if (!this.$el) {
                return;
            }
            var $elLastTime = this.$el.find("#c_seckill p"),
                lastTime = {},
                status = listTimer.getTimerStatus();
            switch (status) {
                case "noStarted":
                    lastTime = localTime.lastTime;
                    $elLastTime.removeClass().addClass("date_seckill")
                        .html(lastTime.month + '月' + lastTime.date + '日开抢');
                    break;
                case "upcomingStart":
                    lastTime = listTimer.getLastTime(listTimer.d2);
                    $elLastTime.removeClass().addClass("time_seckill")
                        .html('<span>' + lastTime.hour + '</span><em>:</em><span>' + lastTime.minute + '</span><em>:</em><span>' + lastTime.second + '</span>');
                    break;
                case "start":
                    $elLastTime.remove();
                    break;
                case "end":
                    $elLastTime.remove();
                    break;
            }
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
        getDepart: function () {
            this.showLoading();
            var reload = !localStorage.length;
            if (!(GeoLocationStore.get() || {}).startLocating) { this.Locating(); }
            document.selectedDepart = $g_depart.data("id") != undefined ? { name: $g_depart.text(), id: $g_depart.data("id")} : undefined;
            /****			
            if (reload) {
            $('body').html(''); location.hash = "#vacationcity"; location.reload();
            }
            else {
            this.forward("#vacationcity");
            }
            ****/
            var action = window.isIpad ? "vacationcityipad" : "vacationcity"
            Lizard.goTo(Lizard.appBaseUrl + action + '/' + $g_depart.data("id") + '/' + (Lizard.P('key') ? Lizard.P('key') : ''), true);
        },
        getDest: function () {
            this.showLoading();
            if (!prodListParam.dCtyName) {
                prodListParam.dCtyName = $g_depart.text();
                prodListParam.dCtyId = $g_depart.data("id");
            }
            prodListParam.sCtyId = prodListParam.dCtyId;
            prodListParam.linetype = 1;
            prodListParam.renew = 1;
            ProdListParamStore.set(prodListParam);
            var reload = !localStorage.length;
            //document.selectedDest = $g_dest.data("id") != undefined ? { name: $g_dest.text(), id: $g_dest.data("id"), departId: $g_depart.data("id") || 2} : { name: "三亚", id: 43, initial: "S", inland: 1, departId: $g_depart.data("id") || 2 };
            var action = window.isIpad ? "destinationipad" : "destination"
            Lizard.goTo(Lizard.appBaseUrl + action + '/' + $g_depart.data("id") + '/' + $g_depart.text(), true);

        },
        groupSearch: function () {
            if (Lizard.P('depetId')) {
                prodListParam.dCtyName = $g_depart.text();
                prodListParam.dCtyId = Lizard.P('depetId');
            }
            else {
                if (!prodListParam.dCtyName) {
                    prodListParam.dCtyName = $g_depart.text();
                    prodListParam.dCtyId = $g_depart.data("id");
                }
                if (!prodListParam.destKwd) {
                    prodListParam.destKwd = $g_dest.text();
                    prodListParam.selectorId = $g_dest.data("sltid");
                }
            }
            prodListParam.sCtyId = prodListParam.dCtyId;
            prodListParam.linetype = 1;
            prodListParam.renew = 1;
            ProdListParamStore.set(prodListParam);
            var action = window.isIpad ? "VacationListIpad" : "VacationList";
            /**url-schema*/
            //tour/index.html#vacationslist?salecity=2&scity=2&sname=上海&kwd=三亚&type=1&from=nopage 
            var params = [
                   prodListParam["dCtyId"],
                   prodListParam["dCtyId"],
                   prodListParam["dCtyName"],
                   prodListParam["destKwd"],
                   prodListParam["linetype"],
                   "nopage"
            ].join("/");

            Lizard.goTo(Lizard.appBaseUrl + action + "/" + params);
        },
        onHide: function () {
        },
        Locating: function () {
            geoLocation = GeoLocationStore.get() || {};
            geoLocation.startLocating = 1;
            GeoLocationStore.set(geoLocation);
            GeoLocationWidget = cWidgetFactory.create('Geolocation');
            GeoLocationWidget.requestCityInfo(function (jsonData) {
                for (var i = 0, len = cityList.length; i < len; i++) {
                    if (jsonData.city.indexOf(cityList[i].name) > -1) {
                        if (!prodListParam.dCtyName) {
                            $g_depart.text(cityList[i].name);
                            $g_depart.data("id", cityList[i].id);
                        }
                        geoLocation = { name: cityList[i].name, id: cityList[i].id };
                        getLocation = 1;
                        break;
                    }
                }
                if (!getLocation) {
                    if (!prodListParam.dCtyName) {
                        $g_depart.text(defaultDepartCity);
                        $g_depart.data("id", defaultDepartCityId);
                        //document.departCity = defaultDepartCity;
                        //document.departCityId = defaultDepartCityId;
                    }
                    geoLocation = { fail: 1 };
                    getLocation = 1;
                }
                GeoLocationStore.set(geoLocation);
                prodListParam.dCtyName = $g_depart.text();
                prodListParam.dCtyId = $g_depart.data("id");
                ProdListParamStore.set(prodListParam);
            }, function (err) {
                if (!getLocation) {
                    //self.showToast(err + "<br />将为您默认设置成北京。");
                    if (!prodListParam.dCtyName) {
                        $g_depart.text(defaultDepartCity);
                        $g_depart.data("id", defaultDepartCityId);
                    }
                    getLocation = 1;
                    geoLocation = { fail: 1 };
                    GeoLocationStore.set(geoLocation);
                    prodListParam.dCtyName = $g_depart.text();
                    prodListParam.dCtyId = $g_depart.data("id");
                    ProdListParamStore.set(prodListParam);
                }
            });
        },
        goHot: function () {
            prodListParam.destKwd = $(event.target).data('name');
            prodListParam.selectorId = 0;
            this.groupSearch();
        },
        goMot: function (event) {
            prodListParam.destKwd = $(event.target).closest('td').find('i').data('name');
            prodListParam.selectorId = 0;
            this.groupSearch();
        },
        getHomeInfo: function () {
            var self = this;
            var baseLoading = self.$el.find(".home_base_loading"), siftProduct = self.$el.find(".sift_product");
            baseLoading.show();
            siftProduct.hide();
            self.homeInfoModel.param.SalesCityID = $("#g_depart").data("id") || defaultDepartCityId;
            self.homeInfoModel.excute(function (response) {
                if ((response.errno == 0) && response.data && response.data.rcmPros) {
                    //var responseData = response.data || {};
                    //限制为只显示前5条
                    var responseData = { rcmPros: [] };
                    var _rcmPros = response.data.rcmPros;
                    for (var i = 0, lengs = _rcmPros.length; i < 5 && i < lengs; i++) {
                        responseData.rcmPros.push(_rcmPros[i]);
                    }
                    responseData.saleCityId = self.homeInfoModel.param.SalesCityID;
                    var rcmTpl = '<h2>精选产品</h2>\
                        <ul>\
                        <%_.each(data.rcmPros, function(v,k){ %>\
                            <li type="selected_prod_item" productId="<%=v.proID%>" saleCityId="<%=data.saleCityId%>" departCityId=0 from="index">\
                                <div class="product_pic"><img src="<%=v.bPic %>" alt=""></div>\
                                    <div class="product_title">\
                                        <strong class="base_price"><%if(v.price){ %><dfn>¥</dfn><%=v.price %><%} else{%>实时计价<%} %></strong>\
                                        <h3><em><%=v.proNm %></em></h3>\
                                    </div>\
                                    <%if(v.talks && v.talks.length){ %><span class="product_tips"><em><%=v.talks[0] %></em><%if(v.talks[1]){ %><em><%=v.talks[1] %></em><%} %></span><%} %>\
                            </li>\
                        <%}) %>\
                        </ul>';
                    baseLoading.hide();
                    var homerecommend = _.template(rcmTpl)({ data: responseData });
                    siftProduct.html(homerecommend).show();
                }
                else {
                    baseLoading.hide();
                    siftProduct.hide();
                }
            }, function (errorInfo) {
                baseLoading.hide();
                siftProduct.hide();
            }, false, this);

        },
        goCsList: function () {
            if (c.utility.isInApp() === undefined) {
                this.forward("#cskill.list");
            } else {
                this.jump("http://pages.ctrip.com/commerce/promote/201404/other/khd/index.html");
            }
        },
        goDetail: function (e) {
            var action = window.isIpad ? "detailipad" : "detail";
            var target = $(e.target).parents('li');
            Lizard.goTo(Lizard.appBaseUrl + action + '/' + target.attr('productId') + '/' + target.attr('saleCityId') + '/' + target.attr('saleCityId') + '/index');
        }
    });
    return groupView;
})
