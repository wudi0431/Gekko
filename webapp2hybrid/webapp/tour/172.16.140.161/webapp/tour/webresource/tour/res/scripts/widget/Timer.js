/**********************************
* @author:       chenzx@Ctrip.com
* @description:  C秒杀 超值预售 倒计时
*/
define([], function () {
    "use strict";

    function Timer() {
    }

    Timer.prototype = {
        constructor: "Timer",

        timered: function (callback) {
            ///<summary> 计时器
            ///<para> callback fn 回调函数 </para>
            ///</summary>
            var self = this;
          
            this.timer = setTimeout(function () {
                clearTimeout(self.timer);
                callback();
                self.timered(callback);
            }, 1000);

        },

        mend: function (value) {
            return value.toString().length === 1 ? "0" + value : value;
        },

        getTimerStatus: function () {
            var self = this,
                d1 = self.d1,
                d2 = self.d2,
                d3 = self.d3;

            if (d2 > 24 * 60 * 60 * 1000) {
                self.d2 = d2 - 1000;
                return "noStarted";
            }

            if (d2 < 24 * 60 * 60 * 1000 && d2 > 1000) {
                self.d2 = d2 - 1000;
                return "upcomingStart";
            } else if (d3 > 1000) {
                self.d3 = d3 - 1000;
                return "start";
            } else {
                return "end";
            };
        },

        getLastTime: function (nS) {
            ///<summary> 获取倒计时时间(注：只对小于等于24小时进行计算)
            ///<para> nS string 传入的时间戳 </para>
            ///</summary>

            var leave1, leave2, leave3,
                hours, minutes, seconds;

            //计算出小时数
            leave1 = nS % (24 * 3600 * 1000);    //计算天数后剩余的毫秒数
            hours = Math.floor(leave1 / (3600 * 1000));

            //计算相差分钟数
            leave2 = leave1 % (3600 * 1000);        //计算小时数后剩余的毫秒数
            minutes = Math.floor(leave2 / (60 * 1000));

            //计算相差秒数
            leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
            seconds = Math.round(leave3 / 1000)

            return {
                hour: this.mend(hours),
                minute: this.mend(minutes),
                second: this.mend(seconds)
            }
        },

        getLocalTime: function (time) {
            ///<summary> 获取倒计时状态 { "noStarted", "upcomingStart", "start", "end"}
            ///<para> time object 传入的时间对象 </para>
            ///</summary>

            var localTime = new Date(),
                saleStartTime = new Date(time.SaleStartTime),
                saleEndTime = new Date(time.SaleEndTime),
                serverTime = new Date(time.ServerTime),
                result = {},
                d1 = 0, d2 = 0, d3 = 0;

            this.d1 = d1 = serverTime.getTime() - localTime.getTime();
            this.d2 = d2 = saleStartTime.getTime() - localTime.getTime() -d1;
            this.d3 = d3 = saleEndTime.getTime() - localTime.getTime() - d1;

            // cskillStatus { "noStarted", "upcomingStart", "start", "end"}
            if (d2 > 24 * 60 * 60 * 1000) {
                result = {
                    cskillStatus: "noStarted",
                    lastTime: {
                        month: saleStartTime.getMonth() + 1,
                        date: saleStartTime.getDate()
                    }
                };
            } else if (d2 < 24 * 60 * 60 * 1000 && d2 > 0) {
                result = {
                    cskillStatus: "upcomingStart",
                    lastTime: this.getLastTime(d2)
                };
            } else if (d3 > 0) {
                result = {
                    cskillStatus: "start",
                    lastTime: this.getLastTime(d3)
                };
            } else {
                result = {
                    cskillStatus: "end"
                };
            };

            return result;
        }

    }

    return Timer;
});