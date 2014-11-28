define(['libs', 'cCoreDate', 'cCoreInherit', 'cStorage', 'cBusinessServertime', 'Validate'], function (libs, cCoreDate, cCoreInherit, cStorage, cBusinessServertime, Validate) {
  var U = {},
    _slice = Array.prototype.slice,
    _push = Array.prototype.push,
  // _toString = function (obj) {
  //     return Object.prototype.toString.call(obj);
  // },
    CDate = cCoreDate,
    nStorage = cStorage.localStorage;

  /**
  * 对个数组格式json格式转换为正常的json格式
  */
  // U.JsonArrayToObject = function (arr) {
  //   if (!arr) return [];
  //   var Keys = arr.shift(),
  //           List = [], obj;
  //   for (var i = 0, I = arr.length; i < I; i++) {
  //     obj = {};
  //     for (var t = 0, T = arr[i].length; t < T; t++) {
  //       switch (_toString(arr[i][t])) {
  //         case '[object Array]':
  //           obj[Keys[t]] = U.JsonArrayToObject(arr[i][t]);
  //           break;
  //         default:
  //           obj[Keys[t]] = arr[i][t];
  //       }
  //     }
  //     List.push(obj);
  //   }
  //   return List;
  // }

  /**
  * @method U.deleteValue
  * @param obj1 {Object|Array} 对象1
  * @param obj2 {Object|Array} 对象2
  * @descrption 交合
  */
  // U.mix = function (obj, obj2, isEmtpy) {
  //   return _.extend(obj, obj2);
  // }

  /**
  * @method indexOf
  * @param val {String} 要搜索的值
  * @param arr {arr} 要搜索的数组
  * @descrption 交合
  */
  // U.indexOf = function (val, arr) {
  //   return _.indexOf(arr, val);
  // };

  /**
  * 迭代函数
  * @method indexOf
  * @param obj {Object|Array} 要循环的对象
  * @param fun {Function} 处理函数,会给该函数传递两个参数，第一个为key，第二个为value
  * @param scope {Object} 可选 ，设置处理函数this指向的对象，如不设置则为当前元素
  * @return void
  */
  // U.each = _.each;

  /**
  * 筛选函数
  * @param list {Array|Object} 要筛选的一个列表
  * @param filter {Function} 筛选函数
  * @return list {Array|Object} 被筛选过的结果
  */
  // U.grep = _.filter;

//  U.grep = function (obj, fun, onlyValue) {
//    var result;
//    obj = obj || {};
//    fun = fun || function () { };
//    var type = Object.prototype.toString.call(obj),
//        i;
//    if (type === '[object Array]') {
//      result = [];
//      for (i = 0; i < obj.length; i++) {
//        if (fun(obj[i], i)) result.push(obj[i]);
//      }
//    } else if (type === '[object Object]') {
//      onlyValue ? (result = []) : (result = {});
//      for (i in obj) {
//        if (obj.hasOwnProperty(i) && fun(obj[i], i)) {
//          onlyValue ? result.push(obj[i]) : (result[i] = obj[i]);
//        }
//      }
//    }
//    return result;
//  };



  /**
  * 删除数组中的指定的值
  * @method U.deleteValue
  * @singleton
  * @param val {Object}
  * @param arr {Array}
  * @param {Array} 被删除的值
  */
  // U.deleteValue = function (val, arr) {
  //   var index = U.indexOf(val, arr);
  //   if (index > -1) {
  //     return arr.splice(index, 1);
  //   }
  //   return null;
  // };

  /**
  * 获取GUID
  * @returns {string}
  */
  // U.getGuid = function () {
  //   function S4() {
  //     return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  //   }

  //   function NewGuid() {
  //     return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  //   }

  //   var guid = localStorage.GUID || '';
  //   if (!guid) {
  //     guid = NewGuid();
  //     localStorage.GUID = guid;
  //   }
  //   return guid;
  // }

  /**
  * 去空格
  * @param {string} str
  * @returns {string}
  */
  // U.trim = function () {
  //     //return str.replace(/(^\s*)|(\s*$)/g, "");
  //     //包括全角空格
  //     return function (str) {
  //         return str.replace(/(^[\s\u3000]*)|([\s\u3000]*$)/g, "");
  //     }
  // };

  /**
  * 去掉字符串中的html标签
  * @param {string} str
  * @returns {string}
  */
  // U.stripTags = function (str) {
  //     return (str || '').replace(/<[^>]+>/g, '');
  // }

  //  U.jsonToQuery = (function () {
  //    var _fdata = function (data, isEncode) {
  //      data = data == null ? '' : data;
  //      data = U.trim(data.toString());
  //      if (isEncode) {
  //        return encodeURIComponent(data);
  //      } else {
  //        return data;
  //      }
  //    };
  //    return function (JSON, isEncode) {
  //      var _Qstring = [];
  //      if (typeof JSON == "object") {
  //        for (var k in JSON) {
  //          if (JSON[k] instanceof Array) {
  //            for (var i = 0, len = JSON[k].length; i < len; i++) {
  //              _Qstring.push(k + "=" + _fdata(JSON[k][i], isEncode));
  //            }
  //          } else {
  //            if (typeof JSON[k] != 'function') {
  //              _Qstring.push(k + "=" + _fdata(JSON[k], isEncode));
  //            }
  //          }
  //        }
  //      }
  //      if (_Qstring.length) {
  //        return _Qstring.join("&");
  //      } else {
  //        return "";
  //      }
  //    };
  //  })();

  //  U.queryToJson = (function () {
  //    function isArray(o) {
  //      return Object.prototype.toString.call(o) === '[object Array]';
  //    }
  //    return function (QS, isDecode) {
  //      var _Qlist = U.trim(QS).split("&");
  //      var _json = {};
  //      var _fData = function (data) {
  //        if (isDecode) {
  //          return decodeURIComponent(data);
  //        } else {
  //          return data;
  //        }
  //      };
  //      for (var i = 0, len = _Qlist.length; i < len; i++) {
  //        if (_Qlist[i]) {
  //          _hsh = _Qlist[i].split("=");
  //          _key = _hsh[0];
  //          _value = _hsh[1];

  //          // 如果只有key没有value, 那么将全部丢入一个$nullName数组中
  //          if (_hsh.length < 2) {
  //            _value = _key;
  //            _key = '$nullName';
  //          }
  //          // 如果缓存堆栈中没有这个数据
  //          if (!_json[_key]) {
  //            _json[_key] = _fData(_value);
  //          }
  //          // 如果堆栈中已经存在这个数据，则转换成数组存储
  //          else {
  //            if (isArray(_json[_key]) != true) {
  //              _json[_key] = [_json[_key]];
  //            }
  //            _json[_key].push(_fData(_value));
  //          }
  //        }
  //      }
  //      return _json;
  //    };
  //  })();

  /**
  * 数据类型检测，及表单效验
  * @param obj | {string}
  * @return  {Boolean}
  * @example
  * U.validate.isString(obj)
  * U.validate.isEmail(obj)
  */
  /** @todo l_wang与c.validate.js做比较，将c.validate引用到c.utility.js中做委托 */
  // U.validate = (function () {
    // var result = function () { };

    // $.each("String Function Boolean RegExp Number Date Object Null Undefined".split(" "), function (i, name) {
    //   var fn;

    //   switch (name) {
    //     case 'Null':
    //       fn = function (obj) { return obj === null; };
    //       break;
    //     case 'Undefined':
    //       fn = function (obj) { return obj === undefined; };
    //       break;
    //     default:
    //       fn = function (obj) { return new RegExp(name + ']', 'i').test(_toString(obj)) };
    //   }
    //   result['is' + name] = fn;

    // });

    /**
    * validator的申明，key用来定义validator的名字，调用的时候可以使用
    * c.validate.is{Key}(value) 来调用，value用来定义validating的具体
    * 方法，方法可以定义为RegExp或者Function。
    */
    // var validators = {
    //   Email: Validate.isEmail, //email
    //   Qq: /^[1-9]\d{4,}$/,                   //qq
    //   Phone: /^[0-9]{3,4}-[0-9]{7,8}$/,      //座机
    //   //Url : /[a-zA-z]+://[^s]*/,              //网址
    //   Url: /^http(s)?:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\:+!]*([^<>])*$/,
    //   Mobile: Validate.isMobile,                   //手机
    //   //IdCard : /^\d{15}$|^\d{18}$|^\d{17}[Xx]$/,//身份证
    //   Postcode: Validate.isZip,                //邮编

    //   IP: function (obj) {                 //是否为IP
    //     if (!obj || result.isNull(obj)) return false;

    //     var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/g //匹配IP地址的正则表达式
    //     if (re.test(obj)) {
    //       if (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256) return true;
    //     }

    //     return false;
    //   },

    //   EmptyObject: function (obj) {
    //     for (var name in obj) {
    //       return false;
    //     }

    //     return true;
    //   },

    //   IdCard: Validate.isIdCard,

    //   CharsLenWithinRange: function (value, max) {
    //     if (!result.isString(value)) return false;

    //     var reg = value.match(/\W/g);
    //     var length = reg == null ? value.length : value.length + reg.length;
    //     isValidate = length >= 0 && length <= max;

    //     if (!isValidate) {
    //       return false;
    //     } else {
    //       this.cutLen = value.length;
    //     }

    //     return true;
    //   },

    //   /**
    //   *  联系人输入控制
    //   *  0-13个汉字，0-26个字符
    //   */
    //   ContactName: function (value) {
    //     if (!result.isString(value)) return false;
    //     return validators.CharsLenWithinRange.call(this, value, 26);
    //   },

    //   /**
    //   * 备注输入控制
    //   * 0-50个汉字，0-100个字符
    //   */
    //   BookPS: function (value) {
    //     if (!result.isString(value)) return false;
    //     return validators.CharsLenWithinRange.call(this, value, 100);
    //   },

    //   /**
    //   * 备注输入控制
    //   * 0-50个汉字，0-100个字符
    //   */
    //   InvTitle: function (value) {
    //     if (!result.isString(value)) return false;
    //     return validators.CharsLenWithinRange.call(this, value, 100);
    //   },

    //   /**
    //   *
    //   */
    //   BoardTitle: function (value) {
    //     if (!result.isString(value)) return false;
    //     return validators.CharsLenWithinRange.call(this, value, 40);
    //   },

    //   /* 送达地输入控制
    //   *  0-40个汉字，80个字符
    //   */
    //   AreaTitle: function (value) {
    //     if (!result.isString(value)) return false;
    //     return validators.CharsLenWithinRange.call(this, value, 80);
    //   },

    //   /**
    //   * 11位规则
    //   * 不判非1规则。
    //   */
    //   MobileNumber: function (number) {
    //     if (!result.isString(number)) return false;
    //     var LEN = 11;
    //     return number.length == LEN && /^(\d| )+$/g.test(number);
    //   },

    //   /**
    //   * 少于3位或多于7位、输入含特殊字符、输入汉字等不符合航班号查询规则
    //   */
    //   FlightNumber: function (flightNumber) {
    //     if (!result.isString(flightNumber)) return false;

    //     var minLen = 3,
    //                 maxLen = 7;

    //     return flightNumber.length >= minLen && flightNumber.length <= maxLen && /^(\d|\w)+$/g.test(flightNumber);
    //   }
    // };

  //   $.each(validators, function (key, value) {

  //     result["is" + key] = function (obj) {
  //       if (!obj || result.isNull(obj) || result.isNull(value)) { return false; }

  //       if (result.isFunction(value)) {
  //         return value.call(this, obj);
  //       }

  //       if (result.isRegExp(value)) {
  //         return value.test(obj);
  //       }

  //       return false;
  //     }
  //   });

  //   return result;

  // })();

  // U.cookie = (function () {
  /**
  * 读取cookie,注意cookie名字中不得带奇怪的字符，在正则表达式的所有元字符中，目前 .[]$ 是安全的。
  * @param {Object} cookie的名字
  * @return {String} cookie的值
  * @example
  * var value = co.getCookie(name);
  */
  // var co = {};
  // co.getCookie = function (name) {
  //     name = name.replace(/([\.\[\]\$])/g, '\\\$1');
  //     var rep = new RegExp(name + '=([^;]*)?;', 'i');
  //     var co = document.cookie + ';';
  //     var res = co.match(rep);
  //     if (res) {
  //         return unescape(res[1]) || "";
  //     }
  //     else {
  //         return "";
  //     }
  // };

  /**
  * 设置cookie
  * @param {String} name cookie名
  * @param {String} value cookie值
  * @param {Number} expire Cookie有效期，单位：小时
  * @param {String} path 路径
  * @param {String} domain 域
  * @param {Boolean} secure 安全cookie
  * @example
  * co.setCookie('name','sina',null,"")
  */
  // co.setCookie = function (name, value, expire, path, domain, secure) {
  //     var cstr = [];
  //     cstr.push(name + '=' + escape(value));
  //     if (expire) {
  //         var dd = new Date();
  //         var expires = dd.getTime() + expire * 3600000;
  //         dd.setTime(expires);
  //         cstr.push('expires=' + dd.toGMTString());
  //     }
  //     if (path) {
  //         cstr.push('path=' + path);
  //     }
  //     if (domain) {
  //         cstr.push('domain=' + domain);
  //     }
  //     if (secure) {
  //         cstr.push(secure);
  //     }
  //     document.cookie = cstr.join(';');
  // };

  /**
  * 删除cookie
  * @param {String} name cookie名
  */
  // co.deleteCookie = function (name) {
  //     document.cookie = name + '=;' + 'expires=Fri, 31 Dec 1999 23:59:59 GMT;';
  // };
  // return co;
  // })();

  /**
  * 将目标字符串转换成日期对象
  * 2010/5/10 | July,2010,3,23 | Tuesday November 9 1996 7:30 PM | 2010-01-01 12:23:39
  * @param {string} source
  * @return  {Date}
  * @example
  * U.dateParse(source)
  */
  // U.dateParse = function (source) {
  //   var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
  //   if ('string' == typeof source) {
  //     if (reg.test(source) || isNaN(Date.parse(source))) {
  //       var d = source.split(/ |T/),
  //                   d1 = d.length > 1
  //                           ? d[1].split(/[^\d]/)
  //                           : [0, 0, 0],
  //                   d0 = d[0].split(/[^\d]/);
  //       return new Date(d0[0] - 0,
  //                               d0[1] - 1,
  //                               d0[2] - 0,
  //                               d1[0] - 0,
  //                               d1[1] - 0,
  //                               d1[2] - 0);
  //     } else {
  //       return new Date(source);
  //     }
  //   }
  //   return new Date();
  // };

  /**
  * 获取系统时间
  * @return  {Date}
  * @example
  * U.getServerTime()
  */
  // U.getServerTime = function () {
  //   var serverTime = U.cookie.getCookie('WAP_SERVERDATE');
  //   return U.dateParse(serverTime);
  // }

  /**
  * 获得服务器时间
  */
  // U.getServerDate = function (callback) {
  //   return cBusinessServertime.getServerDate(callback);
  // };

  /**
  * 是否在APP中访问
  */
  // U.isInApp = function () {
  //     // var data = nStorage.get('isInApp');

  //     // 首先检查UserAgent是不是含有了ctripwireless
  //     var useragent = window.navigator.userAgent;
  //     if (useragent.indexOf('CtripWireless') > -1) {
  //       return true;
  //     };

  //     // 旧版本
  //     var oldData = nStorage.oldGet('isInApp');
  //     if (oldData) {
  //       return oldData == '1' ? true : false;
  //     };

  //     // 新版本
  //     var data = nStorage.oldGet('ISINAPP');
  //     if (data) {
  //       return data == '1' ? true : false;
  //     };

  // };


  // U.isPreProduction = function () {
  //     var data = nStorage.oldGet('isPreProduction');
  //     return data
  // };


  /**
  * 设置获取对象某个路径的值
  *
  */
  // U.Object = {
    /**
    *   设置对象某个路径上的值
    */
    // set: function (obj, path, value) {
    //   if (!path) return null;
    //   var ps = path.split('.');
    //   obj = obj || {}, tmp = obj;
    //   for (var i = 0, len = ps.length, last = Math.max(len - 1, 0); i < len; i++) {
    //     if (i < last) {
    //       tmp = (tmp[ps[i]] = tmp[ps[i]] || {});
    //     } else {
    //       tmp[ps[i]] = value;
    //     }
    //   }
    //   return obj;
    // },
    /**
    *   获得对象在某个路径上的值
    */
    // get: function (obj, path) {
    //   if (!obj || !path) return null;
    //   var ps = path.split('.');
    //   obj = obj || {}, tmp = obj;
    //   for (var i = 0, len = ps.length, last = Math.max(len - 1, 0); i < len; i++) {
    //     tmp = tmp[ps[i]];
    //     if (typeof tmp === 'null' || typeof tmp === 'undefined') {
    //       return null;
    //     }
    //   }
    //   return tmp;
    // }
  // };

  /*****************
  * @description: 简单队列
  * @k
  */
  // U.SimpleQueue = new cCoreInherit.Class({
  //   initialize: function () {
  //     this.index = 0;
  //     this.handlers = [];
  //     this.isStart = false;
  //   },
  //   add: function (handler) {
  //     this.handlers.push(handler);

  //     if (!this.isStart) {
  //       this.isStart = true;
  //       this._next();
  //     }
  //   },
  //   _next: function (args) {
  //     var handler = this.handlers.shift();
  //     if (handler) {
  //       handler.call(this, this, args);
  //     }
  //   },
  //   next: function () {
  //     this._next.apply(this, arguments);
  //     this.stop();

  //   },
  //   stop: function () {
  //     this.isStart = false;
  //   }
  // });

  /************************
  * @description: 触发一个url
  * @author:  ouxz
  */
  // U.tryUrl = function (url) {
  //   var iframe = document.createElement('iframe');
  //   iframe.height = 1;
  //   iframe.width = 1;
  //   iframe.frameBorder = 0;
  //   iframe.style.position = 'absolute';
  //   iframe.style.left = '-9999px';
  //   iframe.style.top = '-9999px';
  //   document.body.appendChild(iframe);
  //   U.tryUrl = function (url) {
  //     iframe.src = url;
  //   };
  //   U.tryUrl(url);
  // };
  return U;
});
