define(['libs', 'c', 'VaBaseView', 'TourModel', 'TourStore', 'cWidgetFactory', 'ImageSlider', 'Util', 'Timer', 'cUIAlert', 'cWidgetGuider'], function (libs, c, BookingBaseView, model, store, cfactory, cslide, util, Timer, uiAlert) {
    "use strict";
    var detailRouteTab, detailScoreTab;    
	var Guider = cfactory.create('Guider');
    var onceCount = 10, showIndex, scoreData, routeData, addmoreLoading, addmoreCompleted, showmore, isChildBook, minPerson, noComment, imgsData, noRoute, tabLoading, alertObject = null;
    var detailRequestData = undefined, commentPerson, commentScroll, $baseLoad;
    var currentTouch, scrollheight, fixtab, isInApp, fromPage, showFakeTemp;

    // C秒杀
    var inventory, productType, schedule,
        listTimer = new Timer();

    var View = BookingBaseView.extend({
        pageid: c.utility.isInApp() ? '220080' : '220003',
        detailModel: model.DetailModel.getInstance(),
        detailPicStore: store.DetailPicStore.getInstance(),
        detailCskillModel: model.CsKillModel.getInstance(),
        render: function (tpl) {
            this.$el.html(tpl);
            this.slide();
        },
        renderSocre: function (tpl) {
            this.$el.find(".score_box").html(tpl);
        },
        renderRoute: function (tpl) {
            this.$el.find(".route_box").html(tpl);
        },
        onCreate: function () {		      
            //this.injectHeaderView();
        },
        events: {
            'click #js_detail_pic_slide': 'toPicList',
            'click .detail_tab li': 'switchTab',
            'click .js_in_Footer': 'booking',
            'click .js_more_Content_btn': 'moreContent',
            'click .scenic_img': 'showImges',
            'click .js_telphone_btn': 'showAlert',
            'click .detail_question': 'to_question'
        },
        onShow: function (referrer) {
		    BookingBaseView.prototype.onShow.apply(this, arguments);
            this.referrer = referrer || '';
            var self = this, tabheight;
            var detailUrlparam = this.vaStorage.get('detail_url_param') || {};
            alertObject = null; // 初始化alert插件
            //需要传售卖站s和出发站d
            var pid = this.pid = Lizard.P('pid') || '';
            var saleCityId = this.saleCityId = Lizard.P("dcid") || 0;
            var departCityId = this.departCityId = Lizard.P("dcid") || 0;
            var pId = [pid, saleCityId, departCityId];

            // C秒杀
            productType = Lizard.P("productType") || Lizard.P("producttype") || "";

            //可以返回至fromPage
            fromPage = Lizard.P("from") || '';
            isInApp = c.utility.isInApp();
            if (!pid || !saleCityId) { self.showToast("产品ID/售卖站 错误， 请返回上页重新选择", function () { self.back(); }); }
            else {
                //fakeDetailTemplate
                showFakeTemp = setTimeout(function () {
                    self.setHead();
                    self.header.show();
                    //self.$el.html(_.template(fakeDetailTemplate)({ "data": { picWidth: document.body.offsetWidth, picHeight: document.body.offsetWidth * 360 / 640, pid: pid} }));
                    //self.turning();
                    //self.showLoading();
                }, 500);

                //请求的参数
                this.detailModel.param = {
                    pId: pid,
                    scId: saleCityId,
                    dcId: departCityId
                };
                //将详情页请求的参数放入localStorage以便其他页面使用
                this.vaStorage.set('detail_request_param', this.detailModel.param);
                this.vaStorage.set('detail_url_param', { Query: pId.join('.') });
                //if (!detailRequestData || detailUrlparam.Query != pId.join('.')) 
				{
                    //this.$el.empty();
                    scoreData = undefined;
                    routeData = undefined;
                    this.showLoading();
                    this.detailModel.setParam({ reqType: [1] });
                    //this.detailModel.excute(function (json) 
					{
                        //if (json.errno == 0) 
						{                            
							var renderData = this['datas'].data;
                            //拿到返现金额
                            var returnCashCount = !_.isEmpty(renderData.detailInfo) && renderData.detailInfo.cashBackAmount;
                            //拿到点评人数,等下传给点评Tab
                            commentPerson = renderData.commentPerson;
                            //设置缓存，避免回退到这个页面又重新请求
                            util.memoryCache.set('detail_request_data', renderData);
                            detailRequestData = util.memoryCache.get('detail_request_data');
                            imgsData = renderData.imgs;
                            isChildBook = renderData.isChildBook;
                            minPerson = renderData.minPerson;
                            renderData.showIndex = showIndex || 0;
                            clearTimeout(showFakeTemp);

							this.vaStorage.set(util.CONST.STORE_BOOKING_STEP1, {
                                ischildbook: isChildBook,
                                minperson: minPerson
                            });
                            var prevStoredCalendar = this.vaStorage.get(util.CONST.STORE_BOOKING_CALENDAR);
                            this.vaStorage.set(util.CONST.STORE_BOOKING_CALENDAR, {
                                nexturi: util.getPath('booking_step1'),
                                type: 'single',
                                pid: pid,
                                //departCityId-1+1是为了转成Int型
                                departure_city: departCityId - 1 + 1 || (!!renderData.detailInfo ? (renderData.detailInfo.departId || 2) : 2),
                                sale_city: saleCityId,
                                //selected_date: productType === "" ? false : schedule,
                                fromuri: ['detail', pid, departCityId, saleCityId, fromPage].join('/')
                            });
                            this.vaStorage.set(util.CONST.STORE_DETAIL_RETURN_CASH, {
                                returnCashCount: returnCashCount
                            });
							
                            if (productType){
                                //C 秒杀
                                this.detailCskillModel.param = ({ "EnvironmentType": "M640", "ProductIDs": pid });
                                this.detailCskillModel.excute(function (json) {
                                    var data = json.data;

                                    schedule = data.Products[0].Schedule;
                                    inventory = data.Products[0].Inventory;
                                    this.render(_.template(detailTemplate)({ "data": renderData, "cskillData": data.Products[0], "productType": productType, "secKillSetting": listTimer.getLocalTime(data.SecKillSetting) }));
                                    this.vaStorage.setAttr(util.CONST.STORE_BOOKING_CALENDAR, { "selected_date": schedule });

                                    listTimer.timered(this.cskillTimeer);

                                }, function () {

                                }, false, this);
                            }
                            
                            // 先把后面步骤的 localStorage 删掉，否则在产品不同的情况下会有问题
                            //this.storageCleaner(util.CONST.STORE_DETAIL);
                            
                        }
                        //else {
                        //    clearTimeout(showFakeTemp);
                        //    detailRequestData = undefined;
                        //    this.showToast(json.errmsg)
                        //}
                        this.setHead();
                        this.header.show();
                        this.hideLoading();
                        //this.turning();
                        noComment = !!detailRequestData && !detailRequestData.commentNum;
                        noRoute = !!detailRequestData && !detailRequestData.travelDay;                       
                    }
                }                
            }

            fixtab = function () {
                //$(".book_now_btn").text(document.body.scrollTop + "+" + event.targetTouches[0].pageY + "+" + event.targetTouches[0].clientY);
                if (document.body.scrollTop + 48 > tabheight) {
                    $(".detail_tab").addClass('detail_tab_fixed');
                    if (!!isInApp) { $(".detail_tab").css('top', 0); }
                    $(".js_tab_showbox").each(function (index, ele) {
                        if ($(ele).height()) { $(ele).css("margin-top", "43px"); }
                    })
                }
                else {
                    $(".detail_tab").removeClass('detail_tab_fixed').css('top', '');
                    $(".js_tab_showbox").css('margin-top', '');
                }
            };

            function movetouch() {
                event.preventDefault();
                if (currentTouch != event.targetTouches[0].clientY) {
                    //重写touchmove事件，阻止不可控的惯性滚动，使用自己的代码模拟touchmove事件，并在touchend中模拟惯性滚动
                    //这样可以让fixtab funciton始终处于计算scroll高度的状态中 
                    //(currentTouch - event.targetTouches[0].clientY)为正数：向下划，向上滚
                    //(currentTouch - event.targetTouches[0].clientY)为负数：向上划，向下滚
                    scrollheight = currentTouch - event.targetTouches[0].clientY;
                    window.scrollTo(0, document.body.scrollTop + scrollheight);
                    currentTouch = event.targetTouches[0].clientY;
                }
                else {
                    scrollheight = 0;
                }

                fixtab();
            }

            function beforetouch() {
                currentTouch = event.targetTouches[0].clientY;
            };

            function endtouch() {
                //event.preventDefault();
                var i = 0;
                //模拟惯性滚动
                //其实这个写的不好，不够平滑，应该在touchmove的时候，计算相对时间内滑动的距离（即滑动速度）
                //然后根据这个速度再计算需要继续惯性滑动多少距离
                //but it's really nonsense to do this!!!
                var InertialScroll = setInterval(function () {
                    //console.log(i);
                    if (i < 18) {
                        if (scrollheight > 0) {
                            window.scrollTo(0, document.body.scrollTop + 5);
                        }
                        else if (scrollheight < 0) {
                            window.scrollTo(0, document.body.scrollTop - 5);
                        }
                        fixtab();
                        //$(".book_now_btn").text(document.body.scrollTop);
                        i++;
                    }
                    else {
                        clearInterval(InertialScroll);
                    }
                }, 3);

            }
            commentScroll = function () {
                self.onWindowScroll(self);
            }
            
            if (this.referrer !== 'vacationslist') {
                this.restoreScrollPos();
            }
			
			detailRouteTab = Lizard.T('detail_route_tab');
			detailScoreTab = Lizard.T('detail_score_tab');
        },
        setHead: function () {
            var self = this;
            var isInApp = c.utility.isInApp();
            var content = isInApp ? { title: "分享", id: 'js_share', classname: 'share_ico'} : null;
            this.header.set({
                title: '产品详情',
                back: true,
                view: this,
                btn: content,
                events: {
                    returnHandler: function () {
                        fromPage == 'nopage' ? (
                        isInApp ? 
                        Guider.backToLastPage({}) : 
                        Lizard.goBack()) : 
                        Lizard.goBack(Lizard.appBaseUrl + (fromPage || 'vacationslist'));
                    },
					
					homeHandler: function() {
					    Lizard.goBack(Lizard.appBaseUrl + 'index');
					}
                },
                commit: { id: 'js_share', callback: function () { self.share(); } }
            });
        },
        slide: function () {
            var imgs = [],
                imgsArry = [],
                container = this.$el.find('#js_detail_pic_slide');
            //根据imgsData刷选轮播图片src
            _.each(imgsData, function (index, i) {
                imgsArry.push(imgsData[i].imgUrls[0].value);
            });
            _.each(imgsArry, function (k, v) {
                imgs.push({
                    title: imgsData[v].imgName,
                    src: k,
                    link: ''
                });
            });
            if (!imageSlide) {
                var imageSlide = new cslide({
                    container: container,
                    images: imgs,
                    autoPlay: false,
                    loop: true,
                    imageSize: { width: 500, height: 280 },
                    defaultImageUrl: 'http://pic.c-ctrip.com/vacation_v2/h5/group_travel/pic_none.png'
                });
                imageSlide.play();
            }
        },
        toPicList: function () {
            if (imgsData) {
                this.vaForward({}, util.getPath('detail_picture_list'));
            }
        },
        switchTab: function (event) {
            tabLoading = this.$el.find('.tab_loading');
            $(window).unbind("scroll", commentScroll);
            tabLoading.show();
            var $this = $(event.target);
            showIndex = this.$el.find('.detail_tab li').index($this);
            $this.addClass('current').siblings().removeClass('current');
            this.$el.find('.js_tab_showbox').hide().eq(showIndex).show();
            //fixtab();
            if (showIndex == 2) {
                if (productType === "") {
                this.showComments();
                } else {
                    this.showCskillArticles();
                }
            }
            else if (showIndex == 1) {
                $(".route_box").css('background-color', '#f5f5f5');
                this.showRoute();
            }
            else {
                tabLoading.hide();
            }
        },
        booking: function () {
            this.vaForward({}, util.getPath('booking_step1'));
        },
        share: function () {
            var self = this,
                imgUrl = !_.isEmpty(imgsData) ? imgsData[0].imgUrls[0].value : 'http://res.m.ctrip.com/html5/content/images/640.png',
                suffix = imgUrl.substring(imgUrl.lastIndexOf(".") + 1),
                text = self.$el.find('.product_wrap h2').html(),
                shareUrl = 'http://m.ctrip.com/webapp/tour/#detail?productId=' + this.pid + '&saleCityId=' + this.saleCityId + '&departCityId=' + this.departCityId;
            Guider.downloadData({
                callback: function (data) {
                    CtripUtil.app_call_system_share(data.savedPath, "这条旅游线路性价比挺高，有谁和我一起去吗？", text, shareUrl, false);
                },
                url: imgUrl,
                suffix: suffix
            });
        },
        showAlert: function () {
            var self = this
            if (!alertObject) {
                alertObject = new uiAlert({
                    title: '',
                    message: '为节省您的时间，请告知客服' + '<br>' + '此产品的编号 ' + '<span style="font-size:16px;font-weight:bold">' + self.pid + '</span>',
                    buttons: [{
                        text: '取消',
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: '确认',
                        click: function () {
                            this.hide();
                        }
                    }]
                });
            }
            alertObject.show();
            $('.cui-btns-sure').html('<a href="tel:4000086666" data-num="4000086666" style="display:block;color:#fff;text-align:center; margin:-10px 0; line-height:38px;">确认</a>');
            //在App环境下调用Guider.callPhone，在web环境下调用返回false
            $('.cui-btns-sure a').on('click', function (e) {
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
            });
        },
        moreContent: function (e) {
            var $this = $(e.currentTarget);
            $this.hide();
            $this.parent().prev().find('.js_more_Content').show();
        },
        showComments: function (e) {
            var self = this;
            this.detailModel.param.reqType = [3];
            this.detailModel.param.start = 0;
            this.detailModel.param.count = onceCount;
            if (noComment) {
                tabLoading.hide();
            }
            else if (!scoreData) {
                this.detailModel.excute(function (data) {
                    tabLoading.hide();
                    if (data.errno == 0) {
                        scoreData = data.data;
                        scoreData.commentPerson = commentPerson;
                        self.renderSocre(_.template(detailScoreTab)({ "data": scoreData }));
                    }
                    else {
                        self.renderSocre(_.template(detailScoreTab)({ "data": {} }));
                    }

                    if (scoreData && scoreData.pComment) {
                        $(window).bind("scroll", commentScroll);
                    }
                    else {
                        $(window).unbind("scroll", commentScroll);
                    }
                    $baseLoad = self.$el.find(".base_loading");
                }, function (errorInfo) {
                    tabLoading.hide();
                    self.renderSocre(_.template(detailScoreTab)({ "data": {} }));
                }, false, this);
            }
            else {
                tabLoading.hide();
                this.renderSocre(_.template(detailScoreTab)({ "data": scoreData }));
                $baseLoad = self.$el.find(".base_loading");
                if (scoreData && scoreData.pComment) {
                    $(window).bind("scroll", commentScroll);
                }
                else {
                    $(window).unbind("scroll", commentScroll);
                }
            }

        },

        cskillTimeer: function () {
            ///<summary> C秒杀定时器 读取手机端时间
            ///</summary>

            var $elLastTime = $(".js_dListime"),
                lastTime = {},
                className = "seckill_disable",
                status = listTimer.getTimerStatus();

            switch (status) {
                case "noStarted":
                    return;
                case "upcomingStart":
                    lastTime = listTimer.getLastTime(listTimer.d2);
                    $(".js_seckillttime").html("");
                    $elLastTime.html("即将开始&nbsp;" + lastTime.hour + ":" + lastTime.minute + ":" + lastTime.second);
                    break;
                case "start":
                    lastTime = listTimer.getLastTime(listTimer.d3);
                    $(".js_seckillttime").html("距离结束" + lastTime.hour + ":" + lastTime.minute + ":" + lastTime.second);
                    if (inventory != 0) {
                        $elLastTime.addClass("js_in_Footer").removeClass(className).html('<a href="javascript:;">立即抢购</a>');
                    }
                    break;
                case "end":
                    $(".js_seckillttime").html("");
                    $elLastTime.removeClass("js_in_Footer").addClass(className).html("抢光了");
                    break;
            }
        },

        showCskillArticles: function () {
            var self = this,
                pid = this.pid = this.getQuery("productId") || this.getQuery("productid") || '';

            this.detailCskillModel.param = ({ "EnvironmentType": "M480", "ProductIDs": pid, "RequestOption": "SecKillRule" });
            this.detailCskillModel.excute(function (data) {
                self.renderSocre(_.template(detailCskillTab)({ "data": data.SecKillSetting.SecKillRule }));
                tabLoading.hide();
            }, function () {

            }, false, this);

        },

        onWindowScroll: function (self) {
            if (!$baseLoad.height() && !addmoreLoading) {
                $baseLoad.show()
            }
            function showMore() {
                var checkHeight = $("#headerview")[0].clientHeight + $(".banner_box")[0].clientHeight + $(".detail_tab")[0].clientHeight + $(".score_box")[0].clientHeight;

                if (currentScroll + $(window).height() >= checkHeight) {
                    !addmoreLoading && self.addmore();
                }
            }

            if (addmoreCompleted) {
                $(".no_more").show();
                $(window).unbind("scroll", self.commentScroll);
            }
            else {
                var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
                // 300毫秒延时，防止连续请求
                clearTimeout(showmore);
                showmore = setTimeout(showMore, 300);
            }
        },
        addmore: function () {
            var self = this;
            //$baseLoad.show(); 
            self.detailModel.param.start += onceCount;
            self.detailModel.excute(function (response) {
                if (response.errno == 0) {
                    var responseData = response.data;
                    addmoreLoading = 1;
                    if (!!responseData.pComment && responseData.pComment.comments && responseData.pComment.comments.length) {
                        var tpl = '<%_.each(data.pComment.comments,function(v,k){ %>\
                            <li class="detail_wrap">\
                                <div class="name_wrap">\
                                    <span class="date"><%=v.cDate %></span>\
                                    <span class="name">***<%=v.uName.substr(3,3) %></span>\
                                </div>\
                                <div class="score_ico_wrap">\
                                    <ul class="score_ico star_<%=v.grade %>">\
                                        <li></li>\
                                        <li></li>\
                                        <li></li>\
                                        <li></li>\
                                        <li></li>\
                                    </ul>\
                                    <span class="score_num"><%=v.grade %></span>\
                                </div>\
                                <dl class="score_txt">\
                                    <dt><%=v.title %></dt>\
                                    <dd><%=v.content %></dd>\
                                </dl>\
                            </li>\
                        <%}) %>';
                        var template = _.template(tpl);
                        self.$el.find(".score_detail").append(template({ data: responseData }));
                        scoreData.pComment.comments = scoreData.pComment.comments.concat(responseData.pComment.comments);
                        if (responseData.pComment.comments.length == onceCount) { addmoreLoading = 0; }
                        else { $(".no_more").show(); addmoreCompleted = 1; }
                    }
                    else {
                        $(".no_more").show();
                        addmoreCompleted = 1;
                    }
                    $baseLoad.hide();
                }
            },
            function (errorInfo) {
            }, false, this);
        },
        showRoute: function () {
            this.detailModel.param.reqType = [2];
            this.detailModel.param.start = undefined;
            this.detailModel.param.count = undefined;
            if (noRoute) {
                tabLoading.hide();
                this.renderRoute(_.template(detailRouteTab)({ "data": {} }));
            }
            else if (!routeData) {
                this.detailModel.excute(function (data) {
                    tabLoading.hide();
                    if (data.errno == 0) {
                        routeData = data.data;
                        this.renderRoute(_.template(detailRouteTab)({ "data": data.data }));
                        $(".route_box").css('background-color', '');
                    }
                    else {
                        this.showToast("暂无行程介绍");
                    }
                }, function (errorInfo) {
                    tabLoading.hide();
                    this.showToast("暂无行程介绍");
                }, false, this);
            }
            else {
                tabLoading.hide();
                this.renderRoute(_.template(detailRouteTab)({ "data": routeData }));
                $(".route_box").css('background-color', '');
            }
            //$(window).bind("scroll", function () { self.onWindowScroll(self); });

        },
        showImges: function (e) {
            e.preventDefault();
            //当click到div本身层时,不做处理
            if (e.target != e.currentTarget) {
                var detailPic = this.detailPicStore.get() || {};
                var imageIndex = $(e.target).closest('a').index() - 1 + 2;
                if (!!detailPic.data) {
                    detailPic.data.imgs = [];
                }
                else {
                    detailPic.data = { imgs: [] };
                }
                var Images = $(e.currentTarget).find('img');
                for (var i = 0, len = Images.length; i < len; i++) {
                    detailPic.data.imgs.push({ imgName: (Images[i].alt || ''), imgUrls: [{ key: ($(Images[i]).data('key') || ''), value: (Images[i].src || '')}] });
                }
                this.detailPicStore.set(detailPic);
                this.forward('#detail.picture.detail?picid=' + imageIndex);
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
        onHide: function () {
            $(window).unbind("scroll");
            $(window).unbind("touchmove");
            $(window).unbind("touchend");
            $("body").unbind("touchstart");
        },
        to_question: function () {
            var param = '?productId=' + this.pid + '&saleCityId=' + this.saleCityId + '&departCityId=' + this.departCityId;
            this.forward(Lizard.appBaseUrl + 'question' + param);
        }
    })
    return View;
});
