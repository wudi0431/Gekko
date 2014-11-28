define(['libs', 'c', 'cPageView', 'text!VacationCity', 'cWidgetFactory', 'cWidgetGeolocation', 'cUICitylist', 'TourStore', 'Cities', 'text!DepartSearch'], function (libs, c, pageview, vacationcityTemplate, cWidgetFactory, cWidgetGeolocation, cUICitylist, tourStore, cityDataList, departSearchTemplate) {
    var GeoLocation, curCity, prodListParam, isInApp, isAndroid, delayClick;
    var cityHistoryStore = tourStore.CityHistoryStore.getInstance();
    var GeoLocationStore = tourStore.GeoLocationStore.getInstance();
    var ProdListParamStore = tourStore.ProdListParamStore.getInstance();
    var cityHistory = cityHistoryStore.get() || {};
    var cityList = cityDataList.pySort, renderData = { hasHistory: 0 }, fromSearch;
    var vacationCityView = pageview.extend({
        render: function (data) {
            var tpl = this.initTemplate();
            this.$el.html(tpl({ "data": data }));
            //this.$el.append(vacationcityTemplate);
        },
        onCreate: function () {
            //this.injectHeaderView();
            //this.render();
        },
        events: {
            "click .associate": "citySelect",
            "click .area_title": "showCity",
            "click .item_select": "citySelect",
            "click #keyword": "doClick",
            "focus #keyword": "doFocus",
            "input #keyword": "placeSearch",
            "click .search_history": "cityChoose",
            "click .re_history": "resetHistory",
            "click .cancel": "backFun",
            "click .clear_input2": "clearInput",
            "touchstart .search_content": "mouseInSearchContent"
        },
        onShow: function () {
            var self = this;
            isInApp = c.utility.isInApp();
            isAndroid = $.os && $.os.android;
            self.showLoading();
            this.headerview.set({
                title: '选择出发地',
                back: true,
                view: this,
                tel: null,
                events: {
                    returnHandler: function () {
                        this.back()
                    }
                }
            });
            cityHistory = cityHistoryStore.get() || {};
            prodListParam = ProdListParamStore.get() || { 'destKwd': '', 'selectorId': '', 'dCtyName': '', 'dCtyId': '', 'sCtyId': '', 'vLocal': {}, 'vDepart': {}, 'vDestino': {} };
            this.getCityList();
            this.headerview.show();
            !!fromSearch && (fromSearch = 0);
        },
        initTemplate: function () {
            return _.template(vacationcityTemplate);
        },
        getCityList: function () {
            var self = this;
            var geoLocation = GeoLocationStore.get() || {};
            var cityData = { hotCity: cityDataList.hotCity, zimu: cityDataList.Alphabet, hideCurrent: !geoLocation.startLocating || geoLocation.fail, selectedDepart: document.selectedDepart || {} };
            if (!!geoLocation.name) {
                cityData.geoLocation = geoLocation;
                cityData.hideCurrent = 0;
            }
            else if (!geoLocation.fail) {
                cityData.geoLocation = { name: "定位中...", id: 0 };
                // 定位失败及海外定位时不显示当前城市section
                setTimeout(function () {
                    geoLocation = GeoLocationStore.get() || {};
                    if (!!geoLocation.name) {
                        $("#curcity").text(geoLocation.name);
                        $("#curcity").data("id", geoLocation.id);
                    }
                    else {
                        $(".currentcity").hide();
                        geoLocation.fail = 1;
                        GeoLocationStore.set(geoLocation);
                    }
                    cityData.hideCurrent = geoLocation.fail;
                }, 20000);
            }

            if (!!cityHistory.departSeleHistory && !!cityHistory.departSeleHistory.length) {
                cityData.departSeleHistory = cityHistory.departSeleHistory;
            }
            else {
                cityData.departSeleHistory = undefined;
            }
            cityHistoryStore.set(cityHistory);
            this.render(cityData);
            //setTimeout(function(){$(".scrollalphabet")[0] && window.scroll(0, $(".scrollalphabet")[0].offsetTop)},0);
            setTimeout(function () { self.hideLoading(); }, 0);
        },
        citySelect: function (e) {
            var _target = e.target || e.srcElement;
            if (!!$(_target).data("id")) {
                //removed by luwei
                prodListParam = ProdListParamStore.get() || { 'destKwd': '', 'selectorId': '', 'dCtyName': '', 'dCtyId': '', 'sCtyId': '', 'vLocal': {}, 'vDepart': {}, 'vDestino': {} };
                prodListParam.dCtyName = $(_target).text();
                prodListParam.dCtyId = $(_target).data("id");
                ProdListParamStore.set(prodListParam);
                // 保存历史选择
                if (!cityHistory.departSeleHistory) { cityHistory.departSeleHistory = []; }
                cityHistory.departSeleHistory = setHistoryArray(cityHistory.departSeleHistory, { city: $(_target).text(), id: $(_target).data("id") }, 3);
                cityHistoryStore.set(cityHistory);
                //this.back("#index");
                
                var action = window.isIpad ? "indexIpad" : "index";
                Lizard.goTo(Lizard.appBaseUrl + action + '/' + $(_target).data("id") + '/' + (Lizard.P('key')?Lizard.P('key'):'目的地、主题或关键字') + '/' + $(_target).text());   
            }
        },
        showCity: function (e) {
            var $currTarget = $(e.currentTarget);
            $currTarget.toggleClass("area_cur");
            $currTarget.next(".item_select").toggleClass("hidden");
            if ($currTarget.hasClass("alphabet")) { $currTarget.siblings(".alphabet").removeClass("area_cur").next(".item_select").addClass("hidden"); }
            if ($currTarget.hasClass("area_cur")) { window.scroll(0, $currTarget[0].offsetTop); }
        },
        searchresult: function (event) {
            var self = this;
            event && event.stopImmediatePropagation();
                $(".cancel").show();
                $("#departSearch").attr("class", "search_header");
                // WinPhone上只能靠隐藏了
                !isInApp && $("#headerview").hide();
                $(".city_box").hide();
                $(".search_content").removeClass("hidden");
                self.showDepartSearch();
        },
        doFocus: function (event) {
            var self = this;
            //安卓设备不能触发focus事件，否则会有点透现象
            //IOS则必须使用focus，IOS中的input没有click事件
            if (isAndroid) { delayClick = setTimeout(function () { self.searchresult(event); }, 500); }
            else { this.searchresult(event); }
        },
        doClick: function (event) {
            clearTimeout(delayClick);
            this.searchresult(event);
        },
        
        onHide: function () {
            !isInApp && $("#headerview").show();
        },
        showDepartSearch: function () {
            var self = this;
            // 隐藏标题栏。这里不使用this.headerview.hide(), 因为会有布局问题
            this.headerview.set({});
            this.headerview.html = '';
            this.headerview.show();
        },
        renderDepartSearch: function (data) {
            var tpl = _.template(departSearchTemplate);
            this.$el.html(tpl({
                "data": data
            }));
        },
        placeSearch: function (e) {
            $(".associate").html('');
            var values = $(e.currentTarget).val().toLowerCase();
            if (values && values.trim().length) { $(".sub_box").hide(); $(".clear_input2").show(); }
            else { this.clearInput(); }
            var theCity, cityJson = [], cityNameList = [];
            if (!!values && values.trim().length) {
                for (var i = 0, l = cityList.length; i < l; i++) {
                    theCity = cityList[i];
                    if ($.inArray(theCity.name, cityNameList) < 0 && (theCity.name.indexOf(values) > -1 || theCity.py.indexOf(values) == 0 || theCity.ename.indexOf(values) == 0 || theCity.jp.indexOf(values) > -1)) {
                        cityNameList.push(theCity.name);
                        cityJson.push('<li class="cityitem" data-ruler="item" data-id="' + theCity.id + '">' + theCity.name + '</li>');
                    }
                }
                if (cityJson.length) { $(".no_result").hide(); $(".associate").html(cityJson.join('')); }
                else { $(".no_result").show(); }
            }
        },
        cityChoose: function (e) {
            !isInApp && $("#headerview").show();
            var _target = e.target || e.srcElement;
            if (!!$(_target).data("id")) {
                prodListParam.dCtyName = $(_target).text();
                prodListParam.dCtyId = $(_target).data("id");
                ProdListParamStore.set(prodListParam);
                // 添加搜索记录
                //if (!cityHistory.departSearHistory) { cityHistory.departSearHistory = []; }
                //cityHistory.departSearHistory = setHistoryArray(cityHistory.departSearHistory, { city: $(_target).text(), id: $(_target).data("id") }, 10);
                if (!cityHistory.departSeleHistory) { cityHistory.departSeleHistory = []; }
                cityHistory.departSeleHistory = setHistoryArray(cityHistory.departSeleHistory, { city: $(_target).text(), id: $(_target).data("id") }, 3);
                cityHistoryStore.set(cityHistory);
                this.back(Lizard.appBaseUrl + "index");
            }
        },
        resetHistory: function () {
            cityHistory.departSearHistory = undefined;
            cityHistoryStore.set(cityHistory);
            this.onLoad();
        },
        backFun: function (e) {
            !isInApp && $("#headerview").show();
            this.headerview.set({
                title: '选择出发地',
                back: true,
                view: this,
                tel: null,
                events: {
                    returnHandler: function () {
                        this.back(Lizard.appBaseUrl + 'index')
                    }
                }
            });
            this.headerview.show();
            e.preventDefault();
            $(".search_text").blur();
            $(".city_box").show();
            $(".search_content").addClass("hidden");
            $(".cancel").hide();
            $("#departSearch").attr("class", "top_box depart_search starting_top");
        },
        clearInput: function () {
            $(".no_result").hide();
            $(".associate").html('');
            $(".search_text").val('');
            !isInApp && $(".search_text").focus();
            $(".clear_input2").hide();
        },
        mouseInSearchContent: function () {
            $(".search_text").blur();
        }
    });
    function setHistoryArray(currArray, newItem, total) {
        for (var i = 0, length = currArray.length; i < length; i++) {
            if (newItem.city == currArray[i].city) {
                currArray.splice(i, 1);
                break;
            }
        }
        currArray.unshift(newItem);
        while (currArray.length > total) {
            currArray.pop();
        }
        return currArray;
    }
    return vacationCityView;
})