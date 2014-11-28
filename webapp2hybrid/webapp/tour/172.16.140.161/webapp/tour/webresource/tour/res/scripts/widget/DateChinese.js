//注：农历不是阴历，属于阴阳历的一种！即同时参考了月亮和太阳的运行规律
//参考：http://www.cftea.com/products/JSLunarDate/LunarDate_v0.2.js

define(['inherit'],
    function (inherit) {
        var getBit = function (m, n) {
            return (m >> n) & 1;
        }
        var heavenlyStems = "甲乙丙丁戊己庚辛壬癸"; // 天干
        var earthlyBranchs = "子丑寅卯辰巳午未申酉戌亥"; // 地支
        var animalYears = "鼠牛虎兔龙蛇马羊猴鸡狗猪"; //生肖
        var moonMonths = "正二三四五六七八九十冬腊";
        var chineseNumbers = "一二三四五六七八九十";
        var cData = [0x41A95, 0xD4A, 0xDA5, 0x20B55, 0x56A, 0x7155B, 0x25D, 0x92D, 0x5192B, 0xA95, 0xB4A, 0x416AA, 0xAD5, 0x90AB5, 0x4BA, 0xA5B, 0x60A57, 0x52B, 0xA93, 0x40E95];
        var madd = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

        var DateChinese = inherit({
            name: 'DateChinese',
            proto: {
                /*
                * @param {Date} date
                */
                __constructor: function (date) {
                    this.dDate = date;

                    this.year = null;
                    this.month = null;
                    this.date = null;
                    this.hour = null;

                    this.aYear = ""; // 生肖
                    this.lYear = ""; // 天干地支
                    this.lMonth = ""; // 农历月
                    this.lDay = ""; // 农历日
                    this.lHour = ""; // 农历时

                    this.e2c().convert();
                },
                e2c: function () {
                    var total, m, n, k;
                    var isEnd = false;
                    var tmp = this.dDate.getFullYear();
                    if (tmp < 1900) tmp += 1900;
                    total = (tmp - 2001) * 365 + Math.floor((tmp - 2001) / 4) + madd[this.dDate.getMonth()] + this.dDate.getDate() - 23;
                    if (this.dDate.getFullYear() % 4 == 0 && this.dDate.getMonth() > 1)
                        total++;
                    for (m = 0; ; m++) {
                        k = (cData[m] < 0xfff) ? 11 : 12;
                        for (n = k; n >= 0; n--) {
                            if (total <= 29 + getBit(cData[m], n)) {
                                isEnd = true;
                                break;
                            }
                            total = total - 29 - getBit(cData[m], n);
                        }
                        if (isEnd) break;
                    }
                    this.year = this.dDate.getFullYear();
                    if (this.year >= 2001) {
                        this.year = 2001 + m;
                    }
                    this.month = k - n + 1;
                    this.date = total;
                    if (k == 12) {
                        if (this.month == Math.floor(cData[m] / 0x10000) + 1)
                            this.month = 1 - this.month;
                        if (this.month > Math.floor(cData[m] / 0x10000) + 1)
                            this.month--;
                    }
                    this.hour = Math.floor((this.dDate.getHours() + 3) / 2);
                    return this;
                },
                convert: function () {
                    this.aYear = animalYears.charAt((this.year - 4) % 12);

                    this.lYear = heavenlyStems.charAt((this.year - 4) % 10) + earthlyBranchs.charAt((this.year - 4) % 12);

                    if (this.month < 1) {
                        this.lMonth = "闰" + moonMonths.charAt(-this.month - 1);
                    }
                    else {
                        this.lMonth = moonMonths.charAt(this.month - 1);
                    }

                    this.lDay = (this.date < 11) ? "初" : ((this.date < 20) ? "十" : ((this.date < 30) ? "廿" : "卅"));
                    if (this.date % 10 != 0 || this.date == 10) {
                        this.lDay += chineseNumbers.charAt((this.date - 1) % 10);
                    }
                    if (this.lDay == "廿") {
                        this.lDay = "二十";
                    }
                    else if (this.lDay == "卅") {
                        this.lDay = "三十";
                    }

                    this.lHour = earthlyBranchs.charAt((this.hour - 1) % 12);
                    return this;
                }
            }
        });
        return DateChinese;
    });