define(['libs', 'c', 'cPageView', 'text!Destination', 'cUICitylist', 'TourStore', 'Destcities', 'TourModel'], function (libs, c, pageview, destinationTemplate, cUICitylist, tourStore, destCityDataList, tourModel) {
    var destCityList = {}, prodListParam, isAndroid, delayClick;
    var cityList, showDestList, renderData = { hasHistory: 0 }, stopSearch = 0, formerValue, fromSearch, isInApp, baseLoading;
    var ProdListParamStore = tourStore.ProdListParamStore.getInstance();
    var cityHistoryStore = tourStore.CityHistoryStore.getInstance();
    var cityHistory = cityHistoryStore.get() || {};
    var destSearchListModel = tourModel.DestSearchList.getInstance();
    var destinationView = pageview.extend({
        render: function (data) {
            var tpl = _.template(destinationTemplate);
            this.$el.html(tpl({ "data": data }));
        },
        onCreate: function () {
            //this.injectHeaderView();
            //this.render();
        },
        events: {
            "focus .search_text": "doFocus",
            "click .search_text": "doClick",
            "click .area_subnav": "citySelect",
            "click .destionation_history": "citySelect",
            "click .area_title": "showCity",
            "click .city_tab": "cityTab",
            "keydown .search_text": "keySearch",
            "input .search_text": "placeSearch",
            "click .search_history li": "cityChoose",
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
            this.header.set({
                title: '选择目的地',
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
            prodListParam = ProdListParamStore.get() || { 'destKwd': '', 'selectorId': '', 'dCtyName': '上海', 'dCtyId': '2', 'sCtyId': '2', 'isLocal': 0, 'renew': 1, 'vLocal': {}, 'vDepart': {} };
            this.getCityList();
            this.headerview.show();
            baseLoading = self.$el.find(".base_loading");
        },
        getCityList: function () {
            var self = this;
            var hotCity = destCityDataList.hotCity;
            destCityList = {
                destSearHistory: cityHistory.destSearHistory,
                hasHistory: (!!cityHistory.destSearHistory && cityHistory.destSearHistory.length) ? 1 : 0,
                hotCity: hotCity,
                destInland: destCityDataList.destInland,
                destInter: destCityDataList.destInter,
                destSeleHistory: cityHistory.destSeleHistory,
                selectedDest: { inland: cityHistory.destCityInland != undefined ? cityHistory.destCityInland : 1 }
            };
            this.render(destCityList);
            //setTimeout(function () { $(".scrollalphabet")[0] && window.scroll(0, $(".scrollalphabet")[0].offsetTop) }, 0);
            setTimeout(function () { self.hideLoading(); }, 0);
        },
        place_Search: function (event) {
            var self = this;
            //这里不能使用focus，否则会有点透问题。 fastclick的ghost click
            //http://stackoverflow.com/questions/13064418/mobile-fast-click-prevent-ghost-focus
            //https://github.com/ftlabs/fastclick/issues/146
            event && event.stopImmediatePropagation();
            $(".cancel").show();
            $("#destionationSearch").attr("class", "search_header");
            // WinPhone上只能靠隐藏了
            !isInApp && $("#headerview").hide();
            $(".destionation_history").hide();
            $(".destlist").hide();
            $(".search_content").show();
            self.showDestSearch();
        },
        doFocus: function (event) {
            var self = this;
            //部分安卓设备不能触发focus事件，否则会有点透现象
            //IOS则必须使用focus，IOS中的input没有click事件
            //部分安卓设备却只能使用focus激活，click在input上没反应！！好蛋疼！！到底是啥问题啊！！我觉得是fastclick, 嗯一定是这样的！
            if (isAndroid) { delayClick = setTimeout(function () { self.place_Search(event); }, 500); }
            else { this.place_Search(event); }
        },
        doClick: function (event) {
            clearTimeout(delayClick);
            this.place_Search(event);
        },
        citySelect: function (e) {
            var $target = $(e.target || e.srcElement);
            if (!!$target.data("name")) {
                prodListParam.destKwd = $target.data("name") == '周边' ? 'mobi' : $target.data("name");
                prodListParam.cityId = $target.data("id");
                prodListParam.selectorId = $target.data("selectflag") ? 0 : $target.data("id");
                ProdListParamStore.set(prodListParam);
                /*
                // 保存历史选择,不需区分国内国外了
                if (!cityHistory.destSeleHistory) { cityHistory.destSeleHistory = []; }
                cityHistory.destSeleHistory = setHistoryArray(cityHistory.destSeleHistory, { city: $target.text(), id: $target.data("id") }, 6);
                //cityHistory.destCityInland = $target.closest(".inlandbox").length ? 1 : 0;
                */
                // 添加搜索记录
                if (!cityHistory.destSearHistory) { cityHistory.destSearHistory = []; }
                cityHistory.destSearHistory = setHistoryArray(cityHistory.destSearHistory, { city: $target.text(), id: $target.data("id"), selectFlag: $target.data("selectflag") }, 10);
                cityHistoryStore.set(cityHistory);
                this.goSearchList();
            }
        },
        showCity: function (e) {
            var $currTarget = $(e.currentTarget);
            $currTarget.toggleClass("area_cur");
            $currTarget.next(".area_subnav").toggleClass("hidden");
            if ($currTarget.hasClass("alphabet")) { $currTarget.siblings(".alphabet").removeClass("area_cur").next(".area_subnav").addClass("hidden"); }
            if ($currTarget.hasClass("area_cur")) { window.scroll(0, $currTarget[0].offsetTop); }
        },
        cityTab: function (e) {
            var currTarget = e.currentTarget;
            var $target = $(e.target || e.srcElement);
            $("li", currTarget).removeClass("on");
            $target.addClass("on");
            if ($target.hasClass("minland")) {
                $(".inlandbox").css("display", "block");
                $(".interbox").css("display", "none");
                cityHistory.destCityInland = 1;
            }
            else {
                $(".inlandbox").css("display", "none");
                $(".interbox").css("display", "block");
                cityHistory.destCityInland = 0;
            }
            cityHistoryStore.set(cityHistory);
        },
        
        onHide: function () {
            !isInApp && $("#headerview").show();
        },
        showDestSearch: function () {
            // 隐藏标题栏。这里不使用this.headerview.hide(), 因为会有布局问题
            this.headerview.set({});
            this.headerview.html = '';
            this.headerview.show();
            formerValue = undefined;
        },
        keySearch: function (e) {
            var keyCode = e.keyCode;
            if (keyCode == 13) {
                !isInApp && $("#headerview").show();
                e.preventDefault();
                if (!!$(e.currentTarget).val()) {
                    prodListParam.destKwd = e.currentTarget.value == '周边' ? 'mobi' : e.currentTarget.value;
                    prodListParam.selectorId = 0;
                    ProdListParamStore.set(prodListParam);
                    //cityHistory.destCityInland = 1;
                    // 添加搜索记录
                    if (!cityHistory.destSearHistory) { cityHistory.destSearHistory = []; }
                    cityHistory.destSearHistory = setHistoryArray(cityHistory.destSearHistory, { city: e.currentTarget.value, id: undefined }, 10);
                    cityHistoryStore.set(cityHistory);
                    this.goSearchList();
                }
            }
        },
        placeSearch: function (e) {
            var values = $(e.currentTarget).val();
            if (values != formerValue) {
                clearTimeout(showDestList);
                $(".associate").html('');
                $(".seahistory").hide();
                if (!!values && values.trim().length) { $(".sub_box").hide(); baseLoading.show(); $(".clear_input2").show(); stopSearch = 0; }
                else { this.clearInput(); }
                showDestList = setTimeout(function () {
                    var theCity, cityJson = [], cityNameList = [];
                    $(".associate").html('');
                    if (!!values && values.trim().length) {
                        destSearchListModel.param.key = values;
                        destSearchListModel.param.depCityId = !!document.selectedDest ? document.selectedDest.departId : 2;
                        destSearchListModel.excute(function (response) {
                            (response.errno == 0) && (cityList = response.data.senses);
                            var lastSearch = destSearchListModel.param.key == values;
                            if (!!cityList && !stopSearch && lastSearch) {
                                for (var i = 0, l = cityList.length; i < l; i++) {
                                    theCity = cityList[i];
                                    //cityNameList.push(theCity.name);
                                    cityJson.push('<li class="cityitem" data-ruler="item" data-id="' + theCity.Id + '">' + theCity.n1 + '</li>');
                                }
                                if (cityJson.length) { $(".no_result").hide(); $(".associate").html(cityJson.join('')); }
                                else { $(".no_result").show(); }
                            } else if (!cityList && !stopSearch && lastSearch) {
                                $(".no_result").show();
                            }
                            baseLoading.hide();
                        }, function (errorInfo) {
                            //$(".no_result").show();
                            baseLoading.hide();
                        }, this, false);
                        /*
                        for (var i = 0, l = cityList.length; i < l; i++) {
                        theCity = cityList[i];
                        if ($.inArray(theCity.name, cityNameList) < 0 && (theCity.name.indexOf(values) > -1 || theCity.py.indexOf(values) > -1 || theCity.ename.indexOf(values) > -1 || theCity.jp.indexOf(values) > -1)) {
                        cityNameList.push(theCity.name);
                        cityJson.push('<li class="cityitem" data-ruler="item" data-id="' + theCity.id + '">' + theCity.name + '</li>');
                        }
                        }
                        if (cityJson.length) { $(".no_result").hide(); $(".associate").append(cityJson.join('')); }
                        else { $(".no_result").show(); }
                        */
                    }
                }, 200);
            }
            formerValue = values;
        },
        cityChoose: function (e) {
            !isInApp && $("#headerview").show();
            var _target = e.target || e.srcElement;
            prodListParam.destKwd = $(_target).text() == '周边' ? 'mobi' : $(_target).text();
            prodListParam.cityId = 0;
            prodListParam.selectorId = $(_target).data("id");
            ProdListParamStore.set(prodListParam);
            //cityHistory.destCityInland = 1;
            // 添加搜索记录
            if (!cityHistory.destSearHistory) { cityHistory.destSearHistory = []; }
            cityHistory.destSearHistory = setHistoryArray(cityHistory.destSearHistory, { city: $(_target).text(), id: $(_target).data("id") }, 10);
            cityHistoryStore.set(cityHistory);
            this.goSearchList();
        },
        resetHistory: function () {
            cityHistory.destSearHistory = undefined;
            cityHistoryStore.set(cityHistory);
            $(".seahistory").empty();
            $(".re_history").hide();
            $(".no_history").show();
            $(".destionation_history").remove();
        },
        backFun: function (e) {
            !isInApp && $("#headerview").show();
            this.headerview.set({
                title: '选择目的地',
                back: true,
                view: this,
                tel: null,
                events: {
                    returnHandler: function () {
                        this.back()
                    }
                }
            });
            this.headerview.show();
            e.preventDefault();
            $(".search_text").blur();
            $(".destionation_history").show();
            $(".destlist").show();
            $(".search_content").hide();
            $(".cancel").hide();
            $("#destionationSearch").attr("class", "top_box destionation_search");
        },
        clearInput: function () {
            clearTimeout(showDestList);
            stopSearch = 1;
            formerValue = undefined;
            baseLoading.hide();
            $(".no_result").hide();
            $(".associate").html('');
            $(".search_text").val('');
            !isInApp && $(".search_text").focus();
            $(".clear_input2").hide();
            if ($(".seahistory li").length) {
                $(".seahistory").show();
                $(".re_history").show();
            }
            else {
                $(".no_history").show();
            }
        },
        mouseInSearchContent: function () {
            $(".search_text").removeAttr('autofocus');
            $(".search_text").blur();
        },
        goSearchList: function () {
            var action = window.isIpad ? "VacationListIpad" : "VacationList";
            /**url-schema*/
            //tour/index.html#vacationslist?salecity=2&scity=2&sname=上海&kwd=三亚&type=1&from=nopage 
            var params = [
                   Lizard.P('departId'),
                   Lizard.P('departId'),
                   Lizard.P('departName'),
                   prodListParam["destKwd"],
                   prodListParam["linetype"],
                   "nopage"
            ].join("/");

            this.forward(Lizard.appBaseUrl + action + "/" + params);
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
    return destinationView;
})