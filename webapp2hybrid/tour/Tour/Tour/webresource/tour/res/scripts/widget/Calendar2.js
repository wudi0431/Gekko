/*
* 团队游 -- 日历
*/
define(['inherit', 'text!Calendar2Frame', 'text!Calendar2Month', 'Util', 'DateChinese'],
    function (inherit, tplFrame, tplMonth, util, DateChinese) {

        var Calendar, Month, Day, utilCalendar = util.calendar, now = new Date(), i;

        var dayRender = function (day, dayIndexInWeek, week, weekIndex, month) {
            return '<td class="js-calendar-day"></td>';
        };
        var CALENDAR_CHINESE_HOLIDAY = {
            '1230': '除夕',
            '0101': '春节',
            '0115': '元宵',
            '0505': '端午',
            '0707': '七夕',
            '0815': '中秋',
            '0909': '重阳'
        };

        var CALENDAR_COMMON_HOLIDAY = {
            '0101': '元旦',
            '0214': '情人节',
            '0405': '清明',
            '0501': '劳动节',
            '1001': '国庆',
            '1225': '圣诞节'
        };

        var desArr = ['今天', '明天', '后天'];
        var DESCRIPTION = {};
        for (i = 0; i < 3; i++) {
            var date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
            DESCRIPTION[date.getTime()] = desArr[i];
        }

        var getDate = function (date) {
            var cnDate, dateStr, cnDateStr;
            date.cnDate = cnDate = new DateChinese(date);

            dateStr = util.pad(date.getMonth() + 1, 2, '0', true) + util.pad(date.getDate(), 2, '0', true);
            cnDateStr = util.pad(cnDate.month, 2, '0', true) + util.pad(cnDate.date, 2, '0', true);

            date.string = utilCalendar.format(date);
            date.festival = CALENDAR_COMMON_HOLIDAY[dateStr];
            date.cnFestival = CALENDAR_CHINESE_HOLIDAY[cnDateStr];
            date.description = DESCRIPTION[date.getTime()];
            return date;
        }

        Month = inherit({
            name: 'Month',
            proto: {
                /*
                * @param {Date|DateString} date
                * @param {Function} [dayRender]
                * @param {Int} [firstDayInWeek = 0] [0-6]
                */
                __constructor: function (opt) {
                    this.options = _.extend({
                        firstDayInWeek: 0
                    }, opt);
                    this.options.lastDayInWeek = (this.options.firstDayInWeek + 6) % 7;

                    this.getMonthData(this.options.date).getMonthHtml();
                },
                dayRender: function (day, dayIndexInWeek, week, weekIndex) {
                    var render = this.options.dayRender || dayRender;
                    var result = render(day, dayIndexInWeek, week, weekIndex, this);
                    return result;
                },
                getMonthData: function (date) {
                    date = utilCalendar.strToDate(date);
                    var year = date.getFullYear(), month = date.getMonth(), firstDate, lastDate, 
                        days, prevDays, postDays, day, i, j, weekDay, tmp, tmp2, week, daysInWeek;

                    this.year = date.getFullYear();
                    this.month = date.getMonth();
                    this.firstDate = firstDate = getDate(new Date(year, month, 1));
                    this.lastDate = lastDate = getDate(new Date(year, month + 1, 0));
                    this.days = days = [firstDate];
                    this.prevDays = prevDays = [];
                    this.postDays = postDays = [];
                    this.daysInWeek = daysInWeek = [];

                    for (i = 2; i < lastDate.getDate() ; i++) {
                        days.push(getDate(new Date(year, month, i)));
                    }
                    days.push(lastDate);

                    for (i = (firstDate.getDay() - this.options.firstDayInWeek) ; i > 0; i--) {
                        prevDays.push(getDate(new Date(year, month, 1 - i)));
                    }

                    for (i = this.options.lastDayInWeek - lastDate.getDay() ; i > 0; i--) {
                        postDays.unshift(getDate(new Date(year, month + 1, i)));
                    }
                    
                    this.countPrevDays = prevDays.length;
                    this.countPostDays = postDays.length;
                    this.countWeeks = Math.ceil((days.length + prevDays.length) / 7);

                    tmp = this.countPrevDays, tmp2 = this.countPrevDays + days.length;
                    for (i = 0, j = this.countPrevDays + days.length + this.countPostDays; i < j; i++) {
                        if (i % 7 == 0) weekDay = daysInWeek[Math.floor(i / 7)] = [];
                        weekDay.push(day = i < tmp ? prevDays[i] : i < tmp2 ? days[i - tmp] : postDays[i - tmp2]);
                    }

                    return this;
                },
                getMonthHtml: function () {
                    this.html = _.template(tplMonth, this);
                }
            }
        });

        Calendar = inherit({
            name: 'Calendar',
            proto: {
                /*
                * @param {Date} start
                * @param {Date} end
                * @param {Function} [dayRender] //可选，默认为上面的 dayRender 函数，可参考默认的回调函数
                */
                __constructor: function (options) {
                    var start, end, month, months, date;
                    this.start = start = date = utilCalendar.strToDate(options.start);
                    this.end = end = utilCalendar.strToDate(options.end);
                    this.months = months = [];
                    var endTimestamp = end.getTime();

                    do {
                        month = new Month({
                            date: date,
                            dayRender: options.dayRender
                        });
                        months.push(month);

                        date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                        //} while (date.getFullYear() < end.getFullYear() || date.getMonth() <= end.getMonth());
                    } while (date.getTime() <= endTimestamp);

                    this.html = _.template(tplFrame, {
                        monthesHTML: _.map(this.months, function (month) { return month.html }).join('')
                    });
                },
                getDayData: function (year, month, date) {
                    var month = _.find(this.months, function (mon) { return mon.year == year && mon.month == month });
                    return month && _.find(month.days, function (day) { return day.getDate() == date });
                }
            }
        });

        return Calendar;
    });