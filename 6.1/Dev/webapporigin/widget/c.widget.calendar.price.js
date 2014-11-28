define(['cCoreInherit', 'cUtility', 'cUIBase', 'cWidgetFactory', 'cWidgetAbstractCalendar', 'cWidgetGuider'], function (cCoreInherit, util, Tools, WidgetFactory) {
    "user strict";

    var WIDGET_NAME = 'Calendar.Price';
    var xmCount = 0;
    // 如果WidgetFactory已经注册了ListView，就无需重复注册
    if (WidgetFactory.hasWidget(WIDGET_NAME)) {
        return;
    }

    var Guider = WidgetFactory.create('Guider');

    var AbstractCalendar = WidgetFactory.create('Abstract.Calendar');

    var PriceCalendar = new cCoreInherit.Class(AbstractCalendar, {
        __propertys__: function () {

            this.chineseHoliday = this.CONSTANT.CALENDAR_CHINESE_HOLIDAY;     //中国特色节日
            this.holiday = this.CONSTANT.CALENDAR_COMMON_HOLIDAY;             //中西共同节日
            this.DAYTITLE = this.CONSTANT.CALENDAR_WEEKDAY_SHORTNAME;         //按周排布
            this.SDAYTITLE = this.CONSTANT.CALENDAR_WEEKDAY_SHORTNAME2;         //按周排布
            this.addClass(Tools.config.prefix + this.CONSTANT.CALENDAR);
            this.showChineseHoliday = true;                     //是否显示农历
            this.showHoliday = true;                            //是否显示节假日
            this.startMonth = util.getServerDate();         //开始月份
            this.startMonth.setDate(this.CONSTANT.CALENDAR_INIT_DATE);
            this.Months = this.CONSTANT.CALENDAR_MONTH;         //显示几个月
            this.validStartDate = util.getServerDate();     //有效选择开始时间
            this.validStartDate.setHours(this.CONSTANT.INIT_DATE_TIME.H, this.CONSTANT.INIT_DATE_TIME.M, this.CONSTANT.INIT_DATE_TIME.S, this.CONSTANT.INIT_DATE_TIME.MS);
            this.validEndDate;                                  //有效选择结束时间
            this.date;                                          //被选中时间
            this.onlyread = false;                              //是否只读
            this.dateVal = {};                                  //时间值
            this.cls = [this.CONSTANT.CALENDAR];                //类
            this.curDate;                                       //当前时间
            this.dateDoms = {};
            this.html;
            this.windowResizeHander;
            this.animatSwitch = false;
            this.lowerPriceClass = '';
            this.holidayClass = '';
            this.todayClass = '';           
            this.lowestpriceMap = {};
            this._chineseHoliday = {};
            //格式化价格
            this._formatPrice = function (price, sformat) {
                return sformat(price);
            };

            this.callback = function () { };

            //为门票需求增加title，若是设置了的话便需要处理
            this.title = false;
            this.returnCallback = function () { };

        },
        initialize: function ($super, options) {
            this.setOption(function (k, v) {
                switch (k) {
                    case 'Months':
                    case 'curDate':
                    case 'root':
                    case 'callback':
                    case 'onlyread':
                    case 'title':
                    case 'returnCallback':
                    case 'showChineseHoliday':
                    case 'animatSwitch':
                    case 'lowerPriceClass':
                    case 'holidayClass':
                    case 'todayClass':
                        this[k] = v;
                        break;
                    case 'date':
                        if (v) {
                            for (var i in v) {
                                this.dateVal[i] = v[i].value;
                            }
                        }
                        this[k] = v;
                        break;
                    case 'formatPrice':
                        this._formatPrice = v;
                        break;
                    case 'showHoliday':
                        this[k] = v;
                        break;
                    case 'validDates':
                        this[k] = v;
                        break;
                    case 'cls':
                        this.cls.push(v);
                        break;
                    case 'validStartDate':
                    case 'validEndDate':
                        this[k] = v;
                        this[k].setHours(1, 1, 1, 0);
                        break;
                    case 'startMonth':
                        this[k] = v;
                        this[k].setDate(1);
                        break;
                }
            });
            $super(options);
            this.buildEvent();
            if (this.lowerPriceClass && this.validDates)
            {
                this.sortMonthPrice();
            }
        },
        
        sortMonthPrice: function()
        {
            this.lowestpriceMap = {};
            var self = this;
            $.each(this.validDates, function(index, item){
                var date = self.validDates[index]['date'];
                if (typeof self.lowestpriceMap[date.getFullYear().toString() + date.getMonth().toString()] === 'undefined')
                {
                    self.lowestpriceMap[date.getFullYear().toString() + date.getMonth().toString()] = self.validDates[index]['price'];
                    return;
                }
                if (self.lowestpriceMap[date.getFullYear().toString() + date.getMonth().toString()] >  self.validDates[index]['price'])
                {
                    self.lowestpriceMap[date.getFullYear().toString() + date.getMonth().toString()] = self.validDates[index]['price'];
                    return;
                }
            });
        },
        
        selectedDate: function () {
            var el;
            for (var i in this.date) {
                el = this.root.find('.' + this.buildSelectCls(i))[0];
                this.dateDoms[i] = el;
                this.dateVal[i] = this.date[i].value;
            }
            !this.curDate && (this.curDate = i);
        },
        buildEvent: function () {
            this.addEvent('onCreate', this.onCreate);
            this.addEvent('onShow', this.onShow);
            this.addEvent('onHide', this.onHide);
        },
        onCreate: function () {
            this.selectedDate();
            this.buildElementsEvent();
            this.root.css({
                position: 'absolute'
            });
            this.windowResizeHander = $.proxy(this.position, this);
        },
        onShow: function () {
            $(window).bind('resize', this.windowResizeHander);
            //      this.setzIndexTop();

            this.root.css('z-index', '1000');

            this.windowResizeHander();

            //解决hybrid偶尔错位BUG
            setTimeout(this.windowResizeHander, 100);

            var scope = this;

            //解决header问题偶尔错位BUG
            Guider.apply({
                hybridCallback: function () {
                    scope.root.find('.cui_cldweek').css('top', '0');
                },
                callback: function () {
                }
            });
             //若是开启动画
            if (this.animatSwitch) {
                var scope = this;
                window.scrollTo(0, 0);
                this.root.animate({ '-webkit-transform': 'translate(100%, 0px) translateZ(0px)', top: '0px' }, 0, function () {
                  scope.root.animate({
                    '-webkit-transform': 'translate(0px, 0px) translateZ(0px)'
                  }, scope.timeNum, function () {
                    scope.windowResizeHander();
                  });
                });
            }
        },
        position: function () {
            this.root.css({
                left: '0px',
                top: '0px'
            });

            var size = Tools.getPageSize();
            this.root.css({
                width: $(window).width(),
                height: size.height
            });

        },
        onHide: function () {
            $(window).unbind('resize', this.windowResizeHander);
        },
        createHtml: function () {
            return this.createCalendar();
        },
        buildElementsEvent: function () {
            var self = this;
            this.root.delegate('li.valid', 'click', function () {
                b = $(this);
                if (!b.hasClass('valid')) {
                    b = b.closest('.valid');
                }
                var date = util.Date.parse(b.attr('data-date')).valueOf();
                if (self.isAccordBound(date)) {
                    self._setDate(date, b);
                }
            });

            this.root.delegate('#js_return', 'click', $.proxy(function () {
                this.returnCallback && this.returnCallback();
                this.hide();
            }, this));

        },
         _hide: function () {
          //若是开启动画
          if (this.animatSwitch) {
            var scope = this;
            this.root.animate({ '-webkit-transform': 'translate(0px, 0px) translateZ(0px)', top: '0px' }, 0, function () {
              scope.root.animate({
                '-webkit-transform': 'translate(100%, 0px) translateZ(0px)'
              }, scope.timeNum, function () {
                scope.hide();
              });
            });
          } else {
            this.hide();
          }
        },
        isAccordBound: function (date) {
            var curDateObj = this.date[this.curDate];
            if (!curDateObj.bound) return true;
            if (!curDateObj.bound.rules || !curDateObj.bound.error) return true;
            var rules = curDateObj.bound.rules, compare;

            for (var i in rules) {
                compare = typeof rules[i] === 'string' ? this.dateVal[rules[i]] : (this._isDate(rules[i]) && rules[i]);
                switch (i) {
                    case '<':
                        if (!(date < compare)) {
                            curDateObj.bound.error.call(this, date, this.curDate, this.dateVal);
                            return false;
                        }
                        break;
                    case '>':
                        if (!(date > compare)) {
                            curDateObj.bound.error.call(this, date, this.curDate, this.dateVal);
                            return false;
                        }
                        break;
                    case '<=':
                        if (!(date <= compare)) {
                            curDateObj.bound.error.call(this, date, this.curDate, this.dateVal);
                            return false;
                        }
                        break;
                    case '>=':
                        if (!(date >= compare)) {
                            curDateObj.bound.error.call(this, date, this.curDate, this.dateVal);
                            return false;
                        }
                        break;
                }
            }
            return true;
        },
        _setDate: function (date, el) {
            if (this.onlyread) return;
            if (this.dateDoms[this.curDate]) {
                var rel = $(this.dateDoms[this.curDate]);

                // rel.html(this.formatTitle(util.Date.parse(rel.attr('data-date')).valueOf()));
                rel.removeClass(this.buildSelectCls(this.curDate));
                rel.removeClass(this.buildSelectCls());
            }
            this.dateDoms[this.curDate] = el;
            var tel = $(el);
            var formatTitle,
          self = this,
          format = this.date[this.curDate].title;
            if (typeof format === 'function') {
                formatTitle = function (date) {
                    return format(date, function (date) {
                        return self.formatTitle(date);
                    });
                };
            } else {
                formatTitle = this.formatTitle;
            }
            var price = parseFloat(parseInt((el.attr('data-price') || 0) * 100) / 100),
        formatPrice = $.proxy(this.formatPrice, this);

            //current click
            // tel.html(formatTitle.call(this, date) + this._formatPrice(price, formatPrice, true));
            tel.addClass(this.buildSelectCls(this.curDate));
            tel.addClass(this.buildSelectCls());
            this.dateVal[this.curDate] = date;
            var arr = $.grep(this.validDates, function (n, i) {
                var b = (n.date.valueOf() == date.valueOf());
                return b;
            });
            // var price = 0;
            // if (arr.length > 0) {
            //     price = arr[0].price;
            // }
            // console.log(arr);
            // console.log(price);

            var dayname = tel.html().replace(/^\d+/mg, '');
            if (isNaN(dayname) === false) {
                dayname = this.DAYTITLE[date.getDay()];
            }
            this.callback && this.callback.call(this, date, price, dayname, this.dateVal);
            //this.callback && this.callback.call(this, date, price, this.curDate, this.dateVal);
        },
        setCurDate: function (curDate) {
            this.curDate = curDate;
        },
        buildSelectCls: function (suffix) {
            return suffix ? 'selected-' + suffix : 'cui_cld_daycrt';
        },
        createCalendar: function () {
            var html = [], Month;

            if (this.title) {
                html.push([
            '<header>',
            '<h1>' + this.title + '</h1><i class="returnico i_bef" id="js_return"></i>',
            '</header>'
        ].join(''));
            }

            html.push([
        '<article class="cont_wrap" style="margin: 0 0 0">',
        '<div class="cui_cldwrap">'
      ].join(''));

            html.push(this.createWeek());
            for (var i = 0; i < this.Months; i++) {
                Month = new Date(this.startMonth);
                Month.setMonth(Month.getMonth() + i);
                html.push(this.createMonth(Month));
            }
            html.push([
        '</div></atricle>'
      ].join(''));

            return html.join('');
        },

        createWeek: function () {
            var whtml = ['<ul class="cui_cldweek">'];
            for (i in this.SDAYTITLE) {
                whtml.push('<li>' + this.SDAYTITLE[i] + '</li>');
            }
            whtml.push('</ul>');
            return whtml.join('');
        },
        createMonth: function (month) {
            var data = this.calcStructData(month),
            mhtml = [],
            i;
            mhtml.push('<section class="cui_cldunit">');
            mhtml.push('<h1 class="cui_cldmonth">' + util.Date.format(month, 'Y年n月') + '</h1>');
            mhtml.push('<ul class="cui_cld_daybox">');

            var cls, wln,
            dln = data.days.length,
            self = this;
            console.log(data);
       
            for (var i = 0; i < dln; i++) {
                wln = data.days[i].length;
                for (var t = 0; t < wln; t++) {
                    xmCount++;
                    cls = {};
                    //日期是否可用
                    var tmpDate = data.days[i][t];
                    if (tmpDate) {
                        var start = this.validStartDate || data.start;
                        var end = this.validEndDate || data.end;
                        if (tmpDate >= start && tmpDate <= end) {
                            cls['cui_cld_dayfuture'] = true;
                            cls['valid'] = true;
                        } else {
                            cls['cui_cld_daypass'] = true;
                            cls['invalid'] = true;
                        }
                    } else {
                        //为空时使用将来的样式
                        cls['cui_cld_dayfuture'] = true;
                        cls['invalid'] = true;
                    }

                    var price = '', dateYMStr = '';
                    if (this.validDates && tmpDate) {
                            
                        var arr = $.grep(this.validDates, function (n, i) {
                            if (n.date.getFullYear() === tmpDate.getFullYear() &&
              n.date.getMonth() === tmpDate.getMonth() &&
              n.date.getDate() === tmpDate.getDate()) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        });
                     
                        if (arr.length === 0) {
                            delete cls['valid'];
                            cls['invalid'] = true;
                        }
                        else {
                            cls['cui_cld_day_havetxt'] = true;
                            price = arr[0].price;
                            dateYMStr = tmpDate.getFullYear().toString() + tmpDate.getMonth().toString();
                        }
                    }
                    var formatTitle = this.formatTitle;
                    if (this.date) {
                        for (var o in this.date) {
                            if (this.dateVal[o] && cls['valid'] && util.Date.format((this.dateVal[o] || this.date[o].value), 'Y-m-d') == util.Date.format(data.days[i][t], 'Y-m-d')) {
                                delete cls['cui_cld_dayfuture'];
                                delete cls['cui_cld_day_hint'];
                                cls[this.buildSelectCls()] = true;
                                cls[this.buildSelectCls(o)] = true;
                                formatTitle = (function (fun) {
                                    return function (date) {
                                        return fun(date, function (date) {
                                            return self.formatTitle(date);
                                        });
                                    }
                                })(this.date[o].title);
                            }
                        }
                    }
                    
                    var formatPrice = $.proxy(this.formatPrice, this);
                    var formatPriceStr = this._formatPrice(price, formatPrice, !!cls['valid']);
                    if (price && this.lowerPriceClass && dateYMStr && this.lowestpriceMap[dateYMStr] === price)
                    {
                        formatPriceStr = formatPriceStr.split('<i>').join('<i class="' + this.lowerPriceClass + '">');
                    }
                    var dayTitle = formatTitle.call(this, tmpDate);
                    if (tmpDate && dayTitle != tmpDate.getDate())
                    {
                        var today = util.getServerDate();
                        var _date = new Date(tmpDate);
                        _date.setHours(1, 1, 1, 0);
                        today.setHours(1, 1, 1, 0);
                        var day = (_date - today) / (3600000 * 24);
                        if (day <=2) {
                            dayTitle = '<em class="' + this.todayClass + '">' + dayTitle + '</em>'; 
                        }
                        else if (this.holidayClass) {
                            dayTitle = '<em class="' + this.holidayClass + '">' + dayTitle + '</em>'; 
                        }
                        else {
                            dayTitle = '<em>' + dayTitle + '</em>';
                        }
                    }
                    else {
                        dayTitle = '<em>' + dayTitle + '</em>';
                    }
                    mhtml.push('<li data-price="' + price + '" data-date="' + util.Date.format(tmpDate, 'Y-m-d') + '" ' + (cls ? ' class="' + this._objectKey(cls).join(' ') + '"' : '') + '>' + dayTitle  + formatPriceStr + '</li>');
                }
            }
            mhtml.push('</ul></section>');
            return mhtml.join('');
        },
        formatPrice: function (price) {
            //如果价格=0，则不显示价格
            return price > 0 ? '<i>&yen;' + price + '</i>' : '';
        },
        formatTitle: function (date) {
            if (!date) {
                return "";
            }
            var today = util.getServerDate();
            if (util.Date.format(today, 'Ymd') == util.Date.format(date, 'Ymd')) {
                return '今天';
            }
            var _date = new Date(date);
            _date.setHours(1, 1, 1, 0);
            today.setHours(1, 1, 1, 0);
            var day = (_date - today) / (3600000 * 24);
            if (day == 1) {
                return '明天';
            }
            if (day == 2) {
                return '后天';
            }
            //是否显示农历
            if (this.showChineseHoliday === true) {                
                var ckey = this.solarDay2(date);
                //农历节日过前不够后
                if (this.chineseHoliday[ckey] && !this._chineseHoliday[ckey]) {
                    this._chineseHoliday[ckey] = 1;
                    return this.chineseHoliday[ckey];
                }
            }
            //是否显示节假日
            if (this.showHoliday == true) {
                var gkey = util.Date.format(date, 'md')
                if (this.holiday[gkey]) {
                    return this.holiday[gkey];
                }
            }
            return util.Date.format(date, 'j');
        },
        
        //计算这个月第一天和最后一天是周几
        calcStructData: function (month) {
            var st = new Date(month),
        et = new Date(month);
            st.setDate(1);
            st.setHours(0, 0, 0, 0);
            var startDay = st.getDay();
            et.setMonth(et.getMonth() + 1, 1);
            et.setHours(-24, 0, 0, 0);
            var endDay = et.getDay(),
        loops = (et.getDate() + (startDay + (6 - endDay))) / 7,
        days = [],
        temp;

            for (var i = 0, ii = 0; i < loops; i++) {
                days[i] = [];
                for (var t = 0; t < 7; t++) {
                    if (i == 0 && t < startDay) {
                        days[i].push("");
                    } else {
                        temp = new Date(st);
                        temp.setDate(temp.getDate() + ii);
                        if (temp > et) {
                            break;
                        } else {
                            days[i].push(temp);
                            ii++;
                        }
                    }
                }
            }
            return {
                start: st,
                end: et,
                days: days,
                loops: loops
            };
        },
        setDate: function (dates) {
            for (var i in dates) {
                if (this.date[i]) {
                    if (this._isDate(dates[i])) {
                        dates[i].setHours(1, 1, 1, 0);
                        this.date[i].value = dates[i];
                        this.dateVal[i] = dates[i];
                        var el = $(this.dateDoms[i]);
                        el.removeCls(this.buildSelectCls(i));
                        el.removeCls(this.buildSelectCls());
                        var cur = $(this.root.query('[data-date="' + util.Date.format(dates[i], 'Y-m-d') + '"]')[0]);
                        if (cur.hasClass('valid')) {
                            cur.addClass(this.buildSelectCls(i));
                            cur.addClass(this.buildSelectCls());
                        }
                        this.dateDoms[i] = cur;
                    }
                }
            }
        },
        getDate: function () {
            return this.dateVal;
        }
    });

    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: PriceCalendar
    });

});