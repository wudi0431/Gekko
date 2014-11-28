define(['libs', 'c', 'BookingBaseView', 'text!BookingStep1', 'text!WidgetPriceDetail',
    'text!Calendar2Day', 'Util', 'NumberPicker', 'cUIAlert',
    'Calendar2', 'TourModel', 'TourStore'],
    function (libs, c, BookingBaseView, tplBookingStep1, tplPriceDetail, tplDay, util, NumberPicker, Alert, Calendar, model, Store) {
        
        var modelCalendar = model.BookingPriceCalendar.getInstance();
        var resourceSearchModel = model.BookingResourceSearch.getInstance();

        var storeStep2 = Store.BookStep2Store.getInstance();

        var storageDataStep1, storageDataCalendar, getPriceXHR;
        var isInApp = c.utility.isInApp();
        var view, mask;
        var ErrorAjaxGetPriceJson;
        var alert = {
            _alert: null,
            _init: function () {
                if (!this._alert) {
                    this._alert = new Alert({
                        title: '提示信息',
                        message: '',
                        buttons: [{
                            text: '取消',
                            click: function () {
                                this.hide();
                            }
                        },{
                            text: '确定',
                            click: function () {
                                this.hide();
                                var store = view.vaStorage.get(util.CONST.STORE_BOOKING_CALENDAR);
                                //delete store.selected_date;
                                //view.vaStorage.set(util.CONST.STORE_BOOKING_CALENDAR, store);
                                //view && view.vaBack({}, util.getPath('detail', {
                                //    pid: storageDataCalendar.pid + 's' + storageDataCalendar.sale_city
                                //}));
                                view && view.vaBack({}, store.fromuri);
                            }
                        }]
                    });
                }
                return this;
            },
            get: function () {
                return this._init()._alert;
            },
            setMessage: function (msg) {
                this.get().setViewData({
                    message: msg
                });
                return this;
            }
        };

        var setSelectDateStorage = function (select_date) {
            var storage = this.vaStorage.get(util.CONST.STORE_BOOKING_CALENDAR);
            storageDataCalendar.selected_date = storage.selected_date = select_date;
            this.vaStorage.set(util.CONST.STORE_BOOKING_CALENDAR, storage);
        };

        var ViewMethod = {
            valid: function () {
                var error = this.error = {};
                var numAdult = this.numberPickerAdult.getValue();
                var numChild = storageDataStep1.ischildbook ? this.numberPickerChild.getValue() : 0;
                if (!storageDataCalendar.selected_date) {
                    error.type = 'date';
                    return false;
                }
                if (numAdult + numChild < storageDataStep1.minperson) {
                    error.type = 'minperson';
                    return false;
                }
                return true;
            },
            initComponents: function () {
                this.numberPickerAdult = new NumberPicker({
                    node: this.$el.find('.man_box .room_num'),
                    min: 1,
                    max: 9
                });
                this.numberPickerAdult.on('change', _.bind(this.onAdultNumberChange, this));
                this.numberPickerChild = new NumberPicker({
                    node: this.$el.find('.child_box .room_num'),
                    min: 0,
                    max: 9
                });
                this.numberPickerChild.on('change', _.bind(this.onChildNumberChange, this));
            },
            getStep2NeedParam: function () {
                return {
                    sale_city: storageDataCalendar.sale_city,
                    departure_city: storageDataCalendar.departure_city,
                    depart_date: storageDataCalendar.selected_date,
                    adult_num: this.numberPickerAdult.getValue(),
                    child_num: this.numberPickerChild.getValue() || 0,
                    oc_mode: 2,
                    guid: '',
                    pid: storageDataCalendar.pid
                };
            },
            onAdultNumberChange: function (count) {
                this.loadStep2Data();

                storageDataStep1.adult_num = count;
                this.vaStorage.set(util.CONST.STORE_BOOKING_STEP1, storageDataStep1);
            },
            onChildNumberChange: function (count) {
                this.loadStep2Data();

                storageDataStep1.child_num = count;
                this.vaStorage.set(util.CONST.STORE_BOOKING_STEP1, storageDataStep1);
            },
            onNextStepClick: function (event) {
                getPriceXHR && getPriceXHR.abort();
                // 那价格的时候一经发现有错误了，不必再进入下一步了
                if (ErrorAjaxGetPriceJson) {
                    this.showToast(ErrorAjaxGetPriceJson.errmsg, 3);
                }
                else {
                    var result = this.valid();
                    if (result) {
                        //this.vaStorage.set(util.CONST.STORE_BOOKING_STEP2, this.getStep2NeedParam());
                        storeStep2.set(this.getStep2NeedParam());
                        this.vaForward({
                            type: 'forward'
                        }, util.getPath('booking_step2'));
                    }
                    else {
                        var msg;
                        switch (this.error.type) {
                            case 'date':
                                msg = '请选择出发日期';
                                break;
                            case 'minperson':
                                msg = '最小起订人数为' + storageDataStep1.minperson;
                                break;
                        }
                        this.showToast(msg, 3);
                    }
                }
            },
            onSelectDateClick: function (e) {
                storageDataCalendar.fromuri = util.getPath('booking_step1');
                this.vaStorage.set(util.CONST.STORE_BOOKING_CALENDAR, storageDataCalendar);
                this.vaForward({}, util.getPath('select_calendar'));
            },
            onCalendarDayClick: function (e) {
                var nodeDay, nodeTable;
                nodeDay = $(e.currentTarget);
                if (nodeDay.data('available')) {
                    nodeTable = nodeDay.parents('.js-calendar-month');
                    var date = this.calendar.getDayData(nodeTable.data('year'), nodeTable.data('month'), nodeDay.data('date'));

                    setSelectDateStorage(date.string);
                    //this.vaBack({}, storageDataCalendar.fromuri);

                    this.$el.find('.js-calendar-day.on').removeClass('selected');
                    nodeDay.addClass('selected');

                    // 最后， 加载价格
                    this.loadStep2Data(date);
                }
            },
            onChildNoticeClick: function () {
                this.$el.find('.js-notice-pop-step1').toggle();
            },
            onPriceDetailClick: function () {
                if (mask) {
                    mask.show();
                    var pop = $('.js-pop-price-detail').show();
                    $('#' + mask.id).one('click', function () {
                        mask.hide();
                        pop.hide();
                    });
                }
            }
        };

        var View = BookingBaseView.extend(_.extend(ViewMethod, {
            pageid: c.utility.isInApp() ? '220081' : '220004',
            events: {
                'click .book_next .btn_next': 'onNextStepClick',
                'click .js-select-date': 'onSelectDateClick',
                'click .js-date-show': 'onSelectDateClick',
                'click .js-calendar-day': 'onCalendarDayClick',
                'click .js-notice-step1': 'onChildNoticeClick',
                'click .js-price-detail': 'onPriceDetailClick'
            },
            _getDefaultMinPerson: function () {
                return Math.max(2, storageDataStep1.minperson);
            },
            render: function (data) {
                var tplFn = _.template(tplBookingStep1);
                var tplHtml = tplFn({
                    ischildbook: storageDataStep1.ischildbook,
                    minperson: storageDataStep1.minperson,
                    adult_num: storageDataStep1.adult_num || this._getDefaultMinPerson(),
                    child_num: storageDataStep1.child_num || 0,
                    selected_date: storageDataCalendar.selected_date,
                    isInApp: isInApp
                });
                this.$el.html(tplHtml);
            },
            onCreate: function () {
                
                mask = new c.ui.Mask({
                    classNames: 'order-layer'
                });

                //this.injectHeaderView();
            },
            /**
            * @param 
            * @param {Date} selected_date 已选中的出发日期
            */
            vaOnLoad: function (data) {
                ErrorAjaxGetPriceJson = null;

                var self = this;
                
                storageDataStep1 = data[util.CONST.STORE_BOOKING_STEP1] || {};
                storageDataCalendar = data[util.CONST.STORE_BOOKING_CALENDAR] || {};

                // 把后面步骤的清除
                //this.storageCleaner(util.CONST.STORE_BOOKING_STEP1);

                //this.vaStorage.set(util.CONST.STORE_BOOKING_CALENDAR, storageDataCalendar);

                this.render();

                this.initComponents();

                modelCalendar.param = {
                    pId: util.int(storageDataCalendar.pid),
                    saleCity: storageDataCalendar.sale_city,
                    departureCity: storageDataCalendar.departure_city,
                    // 起始日期是写死的
                    sDate: '2000-01-01',
                    eDate: '2099-12-31'
                };

                this.vaShowLoading();
                modelCalendar.vaExec({
                    scope: this,
                    onComplete: function (calendarData, checkNotError) {
                        if (checkNotError(util.ensureAll(calendarData, ['dailys']), "产品已售完")) {
                            this.loadStep2Data();
                            var title = '选择日期和人数',
                                subtitle = '最少起订:' + storageDataStep1.minperson + '人';
                            this.headerview.set({
                                title: isInApp ? title : undefined,
                                subtitle: isInApp ? subtitle : undefined,
                                customtitle: isInApp ? undefined : '<h1 class="list">' + title + '<span class="sum">' + subtitle + '</span></h1>',
                                back: true,
                                view: this,
                                events: {
                                    returnHandler: function () {
                                        view = self;
                                        //this.hideToast();
                                        alert.setMessage('您的订单尚未填写完成，是否确定要离开当前页面？').get().show();
                                    }
                                }
                            });
                            this.headerview.show();

                            this.startDate = util.calendar.strToDate(_.first(calendarData.dailys).date);
                            this.endDate = util.calendar.strToDate(_.last(calendarData.dailys).date);

                            var dailys = calendarData.dailys;
                            this.calendar = new Calendar({
                                start: this.startDate,
                                end: this.endDate,
                                dayRender: function (day, dayIndexInWeek, week, weekIndex, month) {
                                    var dayStr, daily = _.find(dailys, function (_day) {
                                        return _day.date == util.calendar.format(day)
                                    });
                                    dayStr = _.template(tplDay, {
                                        data: {
                                            day: day,
                                            dayIndexInWeek: dayIndexInWeek,
                                            description: day.description || day.festival || day.cnFestival,
                                            isThisMonth: day.getMonth() == month.month,
                                            available: daily,
                                            selected: storageDataCalendar.selected_date == day.string,
                                            havePrice: daily && !_.isUndefined(daily.price),
                                            strPrice: (daily && daily.price === 0) ? '实时计价' : '',
                                            price: daily && daily.price,
                                            isGroup: daily && daily.isGroup
                                        }
                                    });
                                    return dayStr;
                                }
                            });

                            this.$el.find('#js-calendar-wrapper').html(this.calendar.html);
                            //this.turning();
                        }
                    },
                    onError: function (err) {
                        this.showToast(err.errmsg || '网络错误，请重试', 3, function () {
                            self.vaBack({}, storageDataCalendar.fromuri);
                        }, true);
                    },
                    onAlways: function () {
                        this.vaHideLoading();
                    }
                });
            },
            loadStep2Data: function () {
                if (this.valid()) {
                    ErrorAjaxGetPriceJson = null;
                    getPriceXHR && getPriceXHR.abort();

                    var data = this.getStep2NeedParam(), view = this;

                    this.showLoadingPrice().hideTotalPrice().hidePriceDetailField();

                    resourceSearchModel.param = {
                        // ProductId
                        pId: data.pid,
                        // DepartureCityId
                        departCId: data.departure_city,
                        // DepartureDate
                        departDate: util.calendar.format(data.depart_date),
                        // AdultQuantity
                        adultNum: data.adult_num,
                        // ChildQuantity
                        childNum: data.child_num,
                        // SaleCityId
                        saleCId: data.sale_city,
                        ocMode: data.oc_mode,
                        // chosedResource: step2AjaxData ? JSON.stringify(step2AjaxData.chosedResource) : ''
                        chosedResource: '',
                        guid: '',
                        reqType: [1]
                    };
                    var ajaxParam = {
                        type: 'POST',
                        url: 'http://' + resourceSearchModel.baseurl.domain + '/' + resourceSearchModel.baseurl.path + resourceSearchModel.url,
                        data: JSON.stringify(resourceSearchModel.param),
                        contentType: 'application/json',
                        success: function (json) {
                            if (json.errno === 0) {
                                view.setTotalPrice(json.data.tPrice).setPriceDetailContent(_.template(tplPriceDetail, json.data)).showTotalPrice().showPriceDetailField();
                            }
                            else {
                                ErrorAjaxGetPriceJson = json;
                                ajaxParam.error();
                            }
                        },
                        error: function (xhr, type) {
                            view.setTotalPrice();
                        },
                        complete: function () {
                            view.hideLoadingPrice();
                        }
                    };
                    getPriceXHR = $.ajax(ajaxParam);
                }
            },
            setTotalPrice: function (price) {
                if (price) {
                    this.$el.find('.js-price-step1').children('span').text(Math.floor(price));
                }
                else {
                    this.hideLoadingPrice();
                }
                return this;
            },
            setPriceDetailContent: function (html) {
                this.$el.find('.js-pop-price-detail').remove();
                this.$el.append(html);
                return this;
            },
            showTotalPrice: function () {
                this.$el.find('.js-price-step1').show();
                return this;
            },
            hideTotalPrice: function () {
                this.$el.find('.js-price-step1').hide(); 
                return this;
            },
            showLoadingPrice: function () {
                this.$el.find('.js-loading-step1').show();
                return this;
            },
            hideLoadingPrice: function () {
                this.$el.find('.js-loading-step1').hide();
                return this;
            },
            showPriceDetailField: function () {
                this.$el.find('.js-price-detail').show();
                return this;
            },
            hidePriceDetailField: function () {
                this.$el.find('.js-price-detail').hide();
                return this;
            },
            onHide: function () {
            }
        }));

        return View;
    });