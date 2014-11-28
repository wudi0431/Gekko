/**
 * @author cmli@ctrip.com / oxz欧新志 <ouxz@Ctrip.com> / vzyq张有泉 <yq.zhang@Ctrip.com>
 * @class Class类，框架的基础类体系
 * @description Class类，框架的基础类体系
 */
define('cCoreInherit',['libs'], function(libs) {

  var slice = [].slice;
  var Core = function() {};

  /**
   * @description Class方法，js的继承
   * @param {function} supClass 可选，要继承的类
   * @param {object} subProperty 被创建类的成员
   * @return {function} 被创建的类
   */
  // Core.Class = function(supClass, subProperty) {

  //   if (typeof supClass === 'object') {
  //     subProperty = supClass;
  //     supClass = function() {};
  //   }

  //   var supProto = supClass.prototype;

  //   var emptyClass = function() {};
  //   var newClass = function() {
  //     this.__propertys__();
  //     this.initialize.apply(this, arguments);
  //   };

  //   emptyClass.prototype = supProto;
  //   newClass.prototype = new emptyClass();
  //   newClass.prototype.constructor = supClass;

  //   var supInitialize = newClass.prototype.initialize || function() {};
  //   var subInitialize = subProperty.initialize || function() {};

  //   var sup__propertys__ = newClass.prototype.__propertys__ || function() {};
  //   var sub__propertys__ = subProperty.__propertys__ || function() {};

  //   var argslist = /^\s*function\s*\(([^\(\)]*?)\)\s*?\{/i.exec(subInitialize.toString())[1].replace(/\s/i, '').split(',');

  //   var key = null;
  //   for (key in subProperty) {
  //     if(subProperty.hasOwnProperty(key))
  //       newClass.prototype[key] = subProperty[key];
  //   }

  //   /** 初始化方法 */
  //   if (arguments.length > 0 && arguments[0].prototype && arguments[0].prototype.initialize === supInitialize) {
  //     newClass.prototype.initialize = function() {
  //       var scope = this;

  //       var args = [
  //         function() {
  //           supInitialize.apply(scope, arguments);
  //         }
  //       ];

  //       subInitialize.apply(this, args.concat(slice.call(arguments)));
  //     };
  //   }

  //   /** 预设成员定义区 */
  //   newClass.prototype.__propertys__ = function() {
  //     sup__propertys__.call(this);
  //     sub__propertys__.call(this);
  //   };

  //   for (key in supClass) {
  //     if (supClass.hasOwnProperty(key) && key !== 'prototype')
  //       newClass[key] = supClass[key];
  //   }

  //   return newClass;
  // };


  /**
  * @description Class方法，js的继承
  * @param {function} supClass 可选，要继承的类
  * @param {object} subProperty 被创建类的成员
  * @return {function} 被创建的类
  */
 Core.Class = function () {
   if (arguments.length == 0 || arguments.length > 2) throw '参数错误';

   var parent = null;
   //将参数转换为数组
   var properties = slice.call(arguments);

   //如果第一个参数为类（function），那么就将之取出
   if (typeof properties[0] === 'function')
     parent = properties.shift();
   properties = properties[0];

   function klass() {
     this.__propertys__();
     this.initialize.apply(this, arguments);
   }

   klass.superclass = parent;
   klass.subclasses = [];

   var sup__propertys__ = function () { };
   var sub__propertys__ = properties.__propertys__ || function () { };

   if (parent) {
     if (parent.prototype.__propertys__) sup__propertys__ = parent.prototype.__propertys__;

     var subclass = function () { };
     subclass.prototype = parent.prototype;
     klass.prototype = new subclass;
     parent.subclasses.push(klass);
   }


   var ancestor = klass.superclass && klass.superclass.prototype;
   for (var k in properties) {
     var value = properties[k];

     //满足条件就重写
     if (ancestor && typeof value == 'function') {
       var argslist = /^\s*function\s*\(([^\(\)]*?)\)\s*?\{/i.exec(value.toString())[1].replace(/\s/i, '').split(',');
       //只有在第一个参数为$super情况下才需要处理（是否具有重复方法需要用户自己决定）
       if (argslist[0] === '$super' && ancestor[k]) {
         value = (function (methodName, fn) {
           return function () {
             var scope = this;
             var args = [function () {
               return ancestor[methodName].apply(scope, arguments);
             } ];
             return fn.apply(this, args.concat(slice.call(arguments)));
           };
         })(k, value);
       }
     }

     klass.prototype[k] = value;
   }

   if (!klass.prototype.initialize)
     klass.prototype.initialize = function () { };

   //兼容现有框架，__propertys__方法直接重写
   klass.prototype.__propertys__ = function () {
     sup__propertys__.call(this);
     sub__propertys__.call(this);
   };

//   //兼容代码，非原型属性也需要进行继承
//   for (key in parent) {
//     if (parent.hasOwnProperty(key) && key !== 'prototype')
//       klass[key] = parent[key];
//   }

   //兼容代码，非原型属性也需要进行继承
   for (key in parent) {
     if (parent.hasOwnProperty(key) && key !== 'prototype' && key !== 'superclass')
       klass[key] = parent[key];
   }

   klass.prototype.constructor = klass;

   return klass;
 };


  /**
   * @description 对象扩展
   * @param {object} 原型对象
   * @param {object} 要继承的对象
   * @returns {boolean}
   */
  Core.extend = function() {
    var args = slice.call(arguments);
    var source = args.shift() || {};

    if (!source) return false;

    for (var i = 0, l = args.length; i < l; i++) {
      if (typeof args[i] === 'object') {
        for (var key in args[i]) {
          source[key] = args[i][key];
        }
      }
    }

    return source;
  };

  /**
   * @description 对原型链的扩充
   * @param {function} fn 构造函数
   * @param {object} propertys 需要補充在原型链上的方法和属性
   * @returns {Function}
   */
  Core.implement = function(fn, propertys) {
    if (typeof fn !== 'function') return false;

    for (var i in propertys) {
      fn.prototype[i] = propertys[i];
    }

    return fn;
  };

  return Core;
});
/**
 * @author cmli@ctrip.com
 * @class cUtilityHybrid
 */
define('cUtilityHybrid',[], function () {
  /** @namespace Util */
  var Util = {};

  /**
  * @public
  * @method isInApp
  * @returns {boolean}
  */
  Util.isInApp = function () {

    /** 首先检查UserAgent是不是含有了ctripwireless */
    var useragent = window.navigator.userAgent;
    if (useragent.indexOf('CtripWireless') > -1) {
      return true;
    }

    /** 旧版本 */
    var oldData = window.localStorage.getItem('isInApp');
    if (oldData) {
      return oldData == '1' ? true : false;
    }

    /** 新版本 */
    var data = window.localStorage.getItem('ISINAPP');
    if (data) {
      return data == '1' ? true : false;
    }
  };

  /**
  * @public
  * @method isInApp
  * @returns {boolean}
  */
  Util.isInWeichat = function () {

    /** 首先检查UserAgent是不是含有了ctripwireless */
    var useragent = window.navigator.userAgent;
    if (useragent.indexOf('MicroMessenger') > -1) {
      return true;
    }
    return false;
  };

  /**
  * @public
  * @method isPreProduction
  * @returns {string}
  */
  Util.isPreProduction = function () {
    return window.localStorage.getItem('isPreProduction');
  };

  /**
  * @public
  * @method getAppSys
  * @returns {string} ctrip:标准版,pro:Pro版,unicom:联通版,youth:青春版,ctriplite:轻量版
  */
  Util.getAppSys = function () {
    var ua = navigator.userAgent;
    var reg = /.+_(\w+)_CtripWireless_/;
    var arr = reg.exec(ua);
    if (arr && arr[1]) return arr[1].toLowerCase();
    return null;
  };

  /**
   * @public
   * @desctription 判断是否为轻量版
   * @method isLite
   * @return {boolean}
   */
  Util.isLite = function () {
    return this.getAppSys() == 'ctriplite';
  }

  return Util;
});
/**
 * @author vlcm李淳敏 <cmli@Ctrip.com> / oxz欧新志 <ouxz@Ctrip.com> / vzyq张有泉 <yq.zhang@Ctrip.com>
 * @class Hash
 * @comment 如果使用的很少直接移动到cUtility去
 */
define('cUtilityHash',['cCoreInherit'], function (cCoreInherit) {

  /**
  * @method indexOf
  * @param {string|object|int} value 查询的目标值
  * @param {array|object} target 查询队列或对象
  * @description 为Object提供indexOf方法
  */
  var indexOf = function (value, target) {
    if (!target) return -1;

    if (target.indexOf) return target.indexOf(value);

    for (var i = 0; i < target.length; i++) {
      if (target[i] === value) return i;
    }

    return -1;
  };

  var Base = {};

  var options = {};

  /**
  * @method __propertys__
  * @description 复写自顶层Class的__propertys__，初始化队列
  */
  options.__propertys__ = function () {
    /** 申明数组 */
    this.keys = [];
    this.values = [];
  };

  /**
  * @method initialize
  * @param {object} obj
  * @description 复写自顶层Class的initialize，赋值队列
  */
  options.initialize = function (obj) {

    /**
    * @author : yq.zhang (Air) / cmli
    * @description : 修正初始化逻辑，将逻辑与 替换为 逻辑或
    */
    if (typeof obj !== 'object') {
      obj = {};
    }

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        this.keys.push(i);
        this.values.push(obj[i]);
      }
    }

    var s = '';
  };

  /**
  * @method length
  * @description 获取对象长度
  * @return {int}
  */
  options.length = function () {
    return this.keys.length;
  };

  /**
  * @method getItem
  * @param {string} key 键值名
  * @description 通过键值名获取对象
  * @return {string|int|object}
  */
  options.getItem = function (key) {
    var index = indexOf(key, this.keys);

    if (index < 0) return null;
    else return this.values[index];
  };

  /**
  * @method getKey
  * @param {int} index 序列值
  * @description 通过序列值获取键值名
  */
  options.getKey = function (index) {
    return this.keys[index];
  };

  /**
  * @method index
  * @param {int} index 序列值
  * @description 根据序列值获取对象值
  */
  options.index = function (index) {
    return this.values[index];
  };

  /**
  * @method push
  * @param {string} key 键值名
  * @param {string|int|object} value 键值对应的值
  * @description 向栈顶压入键值对
  */
  options.push = function (key, value, order) {
    if (typeof key === 'object' && !value) {
      for (var i in key) {
        if (key.hasOwnProperty(i)) that.push(i, key[i], order);
      }
    } else {
      var index = indexOf(key, this.keys);

      if (index < 0 || order) {

        if (order) this.del(k);
        this.keys.push(key);
        this.values.push(value);

      } else {

        this.values[index] = value;
      }
    }

    return this;
  };

  /**
  * @method add
  * @param {string} key 键值名
  * @param {string|int|object} value 键值对应的值
  * @description 向栈顶压入键值对
  */
  options.add = function (key, value) {
    return this.push(key, value);
  };

  /**
  * @method del
  * @param {string} key 键值名
  * @description 根据key来删除hash
  */
  options.del = function (key) {
    var index = indexOf(key, this.keys);

    if (index < 0) return this;

    this.keys.splice(index, 1);
    this.values.splice(index, 1);

    return this;
  };

  /**
  * @method delByIndex
  * @param {int} index 序列值
  * @description 根据index来删除hash
  */
  options.delByIndex = function (index) {
    if (index < 0) return this;

    this.keys.splice(index, 1);
    this.values.splice(index, 1);

    return this;
  };

  /**
  * @method pop
  * @description 移除栈顶的hash，并返回此hash
  */
  options.pop = function () {
    if (!this.keys.length)
      return null;

    /** 移除键值对队列顶部的数据 */
    this.keys.pop();

    return this.values.pop();
  };

  /**
  * @method indexOf
  * @description 查找hash表，返回index
  */
  options.indexOf = function (value) {
    var index = indexOf(value, this.values);

    if (index >= 0)
      return this.keys[index];

    return -1;
  };

  /**
  * @method shift
  * @description 移除栈底的hash，返回此hash
  */
  options.shift = function () {
    if (!this.keys.length) return null;

    this.keys.shift();

    return this.values.shift();
  };

  /**
  * @method unshift
  * @param {int} key 键值
  * @param {string|object|int} value 查询的目标值
  * @param {int} order 位置
  * @description 往队列头部插入hash
  */
  options.unshift = function (key, value, order) {
    if (typeof key === 'object' && !value) {
      for (var i in key)
        if (key.hasOwnProperty(i)) this.unshift(i, key[i]);
    } else {
      var index = indexOf(key, this.keys);

      if (index < 0 || order) {
        if (order) this.del(key);
        this.keys.unshift(key);
        this.values.unshift(value);
      } else {
        this.values[index] = value;
      }
    }
    return this;
  };

  /**
  * @method slice
  * @param {int} start 开始位置
  * @param {int} end 结束位置
  * @description 返回一个hash表的一段
  */
  options.slice = function (start, end) {

    var keys = this.keys.slice(start, end || null);
    var values = this.values.slice(start, end || null);
    var obj = {};

    for (var i = 0; i < keys.length; i++) {
      obj[keys[i]] = values[i];
    }

    return obj;
  };

  /**
  * @method splice
  * @param {int} start 开始位置
  * @param {int} count 从开始位置向后的数量
  * @description 从一个hash中移除一个或多个元素，如果必要，在所移除元素的位置上插入新元素，返回所移除的元素。
  */
  options.splice = function (start, count) {
    var keys = this.keys.splice(start, count || null);
    var values = this.values.splice(start, count || null);
    var obj = {};

    for (var i = 0, l = keys.length; i < l; i++) {
      obj[keys[i]] = values[i];
    }

    return obj;
  };

  /**
  * @method filter
  * @param {function} handler
  */
  options.filter = function (handler) {
    var list = {};

    if (typeof handler !== 'function')
      return null;

    for (var i = 0; i < this.keys.length; i++) {
      if (handler.call(this.values[i], this.values[i], this.keys[i]))
        list[this.keys[i]] = this.values[i];
    }

    return list;
  };

  /**
  * @method each
  * @param {function} handler
  */
  options.each = function (handler) {
    var list = {};

    if (typeof handler !== 'function') return null;

    for (var i = 0; i < this.keys.length; i++) {
      handler.call(this.values[i], this.values[i], this.keys[i], i);
    }
  };

  /**
  * @method valueOf
  * @description
  * @return {object}
  */
  options.valueOf = function () {
    var obj = {};

    for (var i = 0; i < this.keys.length; i++) {
      obj[this.keys[i]] = this.values[i];
    }

    return obj;
  };

  /**
  * @method sortBy
  * @param {function} handler
  * @description 根据回调做排序
  */
  options.sortBy = function (handler) {
    var tempValueList = _.sortBy(this.values, handler);
    var templKeyList = [];

    for (var i = 0; i < tempValueList.length; i++) {
      var key = this.indexOf(tempValueList[i]);
      templKeyList[i] = key;
    }

    this.values = tempValueList;
    this.keys = templKeyList;
  };

  /**
  * @method toString
  * @description
  * @return {string}
  */
  options.toString = function () {
    if (typeof JSON != 'undefined' && JSON.stringify) {
      return JSON.stringify(this.valueOf());
    }

    return typeof this.values;
  };

  Base.Hash = new cCoreInherit.Class(options);

  return Base;
});
/**
 * @author cmli@ctrip.com / vzyq张有泉 <yq.zhang@Ctrip.com>
 * @class cUtilityServertime
 * @description 获取服务器时间
 */
define('cUtilityServertime',['cUtilityHybrid'], function(UtilityHybrid) {

  var UtilityServertime = {};

  /**
   * @method UtilityServertime.getServerDate
   * @param {function} callback
   * @description 获取服务端时间
   */
  UtilityServertime.getServerDate = function(callback) {
    var now = new Date();
    var applyCallback = function(date) {
      if (typeof callback === 'function') {
        return callback(date);
      }

      return date;
    };

    /** 在App层调用的回调部分 */
    var hybridCallback = function() {

      var serverdate = window.localStorage.getItem('SERVERDATE');

      /** 如果没有从LocalStorage中获得数据直接返回 */
      if (!serverdate) {
        return applyCallback(now);
      }

      /** servertime的计算逻辑：第一次进入取本地时间和服务器时间的差值，保存差值。每次再取差值加上本地时间，计算出服务端时间 */
      try {
        serverdate = JSON.parse(serverdate);
        if (serverdate && serverdate.server && serverdate.local) {
          var servertime = window.parseInt(serverdate.server);
          var localtime = window.parseInt(serverdate.local);
          var currenttime = (new Date()).getTime();
          var cServertime = new Date(servertime + currenttime - localtime);

          return applyCallback(cServertime);
        } else {
          return applyCallback(now);
        }
      } catch (e) {

        return applyCallback(now);
      }
    };

    /** 在Web层调用的回调 */
    var webCallback = function() {
      if (location.pathname.match(/^\/?html5/i)) {

        return applyCallback(now);
      } else {

        if (typeof __SERVERDATE__ === 'undefined' || !__SERVERDATE__.server) {
          console.log("无服务端时间参考，请在html入口文件添加指向'/html5/ClientData/LoadServerDate'的script标签");

          return applyCallback(now);
        }

        /** 计算server time的时间  */
        var servertime = new Date(__SERVERDATE__.server.valueOf() + (new Date().valueOf() - __SERVERDATE__.local.valueOf()));
        return applyCallback(servertime);
      }
    };

    return UtilityHybrid.isInApp() ? hybridCallback() : webCallback();
  };

  return UtilityServertime;
});
define('cUtilityDate',['cCoreInherit', 'cUtilityServertime'], function(inherit, UtilityServertime) {
  var Base = {};

  /* Date对象，对时间提供一些常用方法 */
  Base.Date = new inherit.Class({

    initialize: function(date) {
      date = date || new Date();
      this.date = new Date(date);
    },

    /**
     * @description 当前时间加n天
     * @param {Number} n
     * @returns {Base.Date}
     */
    addDay: function(n) {
      n = n || 0;
      this.date.setDate(this.date.getDate() + n);
      return this;
    },

    /**
     * @description 当前时间加n月
     * @param {Number} n
     * @returns {Base.Date}
     */
    addMonth: function(n) {
      n = n || 0;
      this.date.setMonth(this.date.getMonth() + n);
      return this;
    },

    /**
     * @description 当前时间加n个小时
     * @param {Number} n
     * @returns {Base.Date}
     */
    addHours: function(n) {
      n = n || 0;
      this.date.setHours(this.date.getHours() + n);
      return this;
    },

    addMinutes: function(n) {
      n = n || 0;
      this.date.setMinutes(this.date.getMinutes() + n);
      return this;
    },

    addSeconds: function(n) {
      n = n || 0;
      this.date.setSeconds(this.date.getSeconds() + n);
      return this;
    },

    /**
     * @description 当前时间加n年
     * @param {Number} n
     * @returns {Base.Date}
     */
    addYear: function(n) {
      n = n || 0;
      this.date.setYear(this.date.getFullYear() + n);
      return this;
    },

    /**
     * @description 设置当前时间的小时，分，秒
     */
    setHours: function() {
      this.date.setHours.apply(this.date, arguments);
      return this;
    },

    //获得原生Date对象
    valueOf: function() {
      return this.date;
    },

    //获得毫秒数
    getTime: function() {
      return this.date.valueOf();
    },

    //获得utc时间字符串
    toString: function() {
      return this.date.toString();
    },

    /**
     * @description 格式化时间,格式化参数请参考php中date函数说明
     * @param {String} format
     * @returns {String}
     * @see http://www.php.net/manual/zh/function.date.php
     */
    format: function(format) {
      if(typeof format !== 'string')
        format = '';

      for (var key in this._MAPS) {
        format = this._MAPS[key].call(this, format, this.date, key);
      }
      return format;
    },

    /**
     * @description 返回输入Date的相差的月份数
     * @param {Date} 要计算的时间
     * @return {Number} 月数
     */
    diffMonth: function(date) {
      var curY = parseInt(this.format('Y'), 10),
        curM = parseInt(this.format('m'), 10),
        cdate = new Base.Date(date),
        cdateY = parseInt(cdate.format('Y'), 10),
        cdateM = parseInt(cdate.format('m'), 10);

      return (cdateY - curY) * 12 + (cdateM - curM);
    },
    //星期数据
    _DAY1: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    _DAY2: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    //时间格式化函数集
    _MAPS: {
      //有前导零的日期值
      'd': function(str, date, key) {
        var d = date.getDate().toString();
        if (d.length < 2) d = '0' + d;
        return str.replace(new RegExp(key, 'mg'), d);
      },
      //无前导零的日期值
      'j': function(str, date, key) {
        return str.replace(new RegExp(key, 'mg'), date.getDate());
      },
      //星期中的第几天 1-7
      'N': function(str, date, key) {
        var d = date.getDay();
        if (d === 0) d = 7;
        return str.replace(new RegExp(key, 'mg'), d);
      },
      'w': function(str, date, key) {
        var d = date.getDay();
        var title = this._DAY1[d];
        return str.replace(new RegExp(key, 'mg'), title);
      },
      'W': function(str, date, key) {
        var d = date.getDay();
        var title = this._DAY2[d];
        return str.replace(new RegExp(key, 'mg'), title);
      },
      //有前导零的月份
      'm': function(str, date, key) {
        var d = (date.getMonth() + 1).toString();
        if (d.length < 2) d = '0' + d;
        return str.replace(new RegExp(key, 'mg'), d);
      },
      //无前导零的月份
      'n': function(str, date, key) {
        return str.replace(key, date.getMonth() + 1);
      },
      //四位年份
      'Y': function(str, date, key) {
        return str.replace(new RegExp(key, 'mg'), date.getFullYear());
      },
      //两位年份
      'y': function(str, date, key) {
        return str.replace(new RegExp(key, 'mg'), date.getYear());
      },
      //无前导零的小时,12小时制
      'g': function(str, date, key) {
        var d = date.getHours();
        if(d >= 12) d = d - 12;
        return str.replace(new RegExp(key, 'mg'), d);
      },
      //无前导零的小时，24小时制
      'G': function(str, date, key) {
        return str.replace(new RegExp(key, 'mg'), date.getHours());
      },
      //有前导零的小时，12小时制
      'h': function(str, date, key) {
        var d = date.getHours();
        if(d >= 12) d = d - 12;
        d += '';
        if(d.length < 2) d = '0' + d;
        return str.replace(new RegExp(key, 'mg'), d);
      },
      //有前导零的小时，24小时制
      'H': function(str, date, key) {
        var d = date.getHours().toString();
        if(d.length < 2) d = '0' + d;
        return str.replace(new RegExp(key, 'mg'), d);
      },
      //有前导零的分钟
      'i': function(str, date, key) {
        var d = date.getMinutes().toString();
        if(d.length < 2) d = '0' + d;
        return str.replace(new RegExp(key, 'mg'), d);
      },
      //有前导零的秒
      's': function(str, date, key) {
        var d = date.getSeconds().toString();
        if(d.length < 2) d = '0' + d;
        return str.replace(new RegExp(key, 'mg'), d);
      },
      //无前导零的分钟
      'I': function(str, date, key) {
        var d = date.getMinutes().toString();
        return str.replace(new RegExp(key, 'mg'), d);
      },
      //无前导零的秒
      'S': function(str, date, key) {
        var d = date.getSeconds().toString();
        return str.replace(new RegExp(key, 'mg'), d);
      },
      //转换为今天/明天/后天
      'D': function(str, date, key) {
        var now = UtilityServertime.getServerDate();
        now.setHours(0, 0, 0, 0);
        date = new Date(date.valueOf());
        date.setHours(0, 0, 0, 0);
        var day = 60 * 60 * 24 * 1000,
          tit = '',
          diff = date - now;
        if (diff >= 0) {
          if (diff < day) {
            tit = '今天';
          } else if (diff < 2 * day) {
            tit = '明天';
          } else if (diff < 3 * day) {
            tit = '后天';
          }
        }
        return str.replace(new RegExp(key, 'mg'), tit);
      }
    }
  });

  inherit.extend(Base.Date, {
    /**
     * 将字符串转换为CT.Date对象
     * @param {String} str
     * @returns {Base.Date}
     */
    parse: function(str, isNative) {
      if (typeof str === 'undefined') {
        return new Date();
      }
      if (typeof str === 'string') {
        str = str || '';
        var regtime = /^(\d{4})\-?(\d{1,2})\-?(\d{1,2})/i;
        if (str.match(regtime)) {
          str = str.replace(regtime, "$2/$3/$1");
        }
        var st = Date.parse(str);
        var t = new Date(st || new Date());
        return isNative ? t : new Base.Date(t);
      } else if (typeof str === 'number') {
        return new Date(str);
      } else {
        return new Date();
      }
    },

    /**
     * 返回HH：MM格式
     */
    getHM: function(timeStr) {
      var d = this._getDate(timeStr);
      var h = d.getHours();
      var m = d.getMinutes();
      return (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m);
    },

    getIntervalDay: function(ds1, ds2) {
      var d1 = this._getDate(ds1);
      var d2 = this._getDate(ds2);
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      return parseInt((d2 - d1) / 86400000);
    },

    m2H: function(min) {
      var h = Math.floor(min / 60);
      var m = min % 60;
      return (h > 0 ? h + '小时' : '') + (m > 0 ? m + '分钟' : '');
    },

    _getDate: function(ds) {
      var t = Base.Date.parse(ds, true);
      var d = new Date();
      d.setTime(t);
      return d;
    },

    format: function(obj, str) {
      return new Base.Date(obj).format(str);
    },
    //获取周几，d为日期C.parse(d);
    weekday: function(d) {
      var day = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      var dd = new Date(d);
      return day[dd.getDay()];
    },
    //计算两个时间的相隔月份数
    diffMonth: function(d1, d2) {
      d1 = new Base.Date(d1);
      return d1.diffMonth(d2);
    }
  });

  return Base.Date;
});
define('Validate',[], function () {

  var result = {};
  _toString = Object.prototype.toString;
  $.each("String Function Boolean RegExp Number Date Object Null Undefined".split(" "), function (i, name) {
    var fn;

    switch (name) {
      case 'Null':
        fn = function (obj) { return obj === null; };
        break;
      case 'Undefined':
        fn = function (obj) { return obj === undefined; };
        break;
      default:

        //        if (typeof obj === 'object') {
        //          obj = Object.prototype.toString.call(obj);
        //        }
        fn = function (obj) { return new RegExp(name + ']', 'i').test(_toString.call(obj)); };
        //fn = function (obj) { return new RegExp(name + ']', 'i').test(obj); };
        break;
    }
    result['is' + name] = fn;

  });

  var validators = {
    isEmail: function (text) {
      var reg = /^(?:\w+\.?)*\w+@(?:\w+\.?)*\w+$/;
      return reg.test(text);
    },

    isPassword: function (text) {
      var reg = /^[a-zA-Z0-9]{6,20}$/;
      return reg.test(text);
    },

    isMobile: function (text) {
      var reg = /^(1[3-8][0-9])\d{8}$/;
      return reg.test(text);
    },

    isChinese: function (text) {
      var reg = /^[\u4e00-\u9fff]{0,}$/;
      return reg.test(text);
    },

    isEnglish: function (text) {
      var reg = /^[A-Za-z]+$/;
      return reg.test(text);
    },

    isZip: function (text) {
      var reg = /^\d{6}$/;
      return reg.test(text);
    },

    isDate: function (text) {
      //yyyyMMdd格式正则加入润年2月
      var reg = /^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})(((0[13578]|1[02])(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)(0[1-9]|[12][0-9]|30))|(02(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))0229)$/;
      if (!reg.test(text)) {
        return false;
      }
      return true;
    },

    isNum: function (text) {
      var reg = /^\d+$/;
      return reg.test(text);
    },

    isCellPhone: function (text) {
      var re = /(^0{0,1}1[3|4|5|6|7|8][0-9]{9}$)/;
      return re.test(text);
    },

    isIDCardNo: function (text) {
      var reg = /^[A-Za-z0-9]+$/;
      return reg.test(text);
    },

    isEnglishAndSpace: function (text) {
      var reg = /^([a-zA-Z ]+|[\u4e00-\u9fa5]+)$/;
      return reg.test(text);
    },

    isTraditional: function (text) { //判断是否包含繁体字
      var sTraditional = '萬與醜專業叢東絲兩嚴喪個爿豐臨為麗舉麼義烏樂喬習鄉書買亂爭於虧雲亙亞產畝親褻嚲億僅從侖倉儀們價眾優夥會傴傘偉傳傷倀倫傖偽佇體餘傭僉俠侶僥偵側僑儈儕儂俁儔儼倆儷儉債傾傯僂僨償儻儐儲儺兒兌兗黨蘭關興茲養獸囅內岡冊寫軍農塚馮衝決況凍淨淒涼淩減湊凜幾鳳鳧憑凱擊氹鑿芻劃劉則剛創刪別剗剄劊劌剴劑剮劍剝劇勸辦務勱動勵勁勞勢勳勩勻匭匱區醫華協單賣盧鹵臥衛卻巹廠廳曆厲壓厭厙廁廂厴廈廚廄廝縣參靉靆雙發變敘疊葉號歎嘰籲後嚇呂嗎唚噸聽啟吳嘸囈嘔嚦唄員咼嗆嗚詠哢嚨嚀噝吒噅鹹呱響啞噠嘵嗶噦嘩噲嚌噥喲嘜嗊嘮啢嗩唕喚嘖嗇囀齧囉嘽嘯噴嘍嚳囁嗬噯噓嚶囑嚕劈囂謔團園囪圍圇國圖圓聖壙場壞塊堅壇壢壩塢墳墜壟壟壚壘墾堊墊埡墶壋塏堖塒塤堝墊垵塹墮壪牆壯聲殼壺壼處備複夠頭誇夾奪奩奐奮獎奧妝婦媽嫵嫗媯姍薑婁婭嬈嬌孌娛媧嫻嫿嬰嬋嬸媼嬡嬪嬙嬤孫學孿寧寶實寵審憲宮寬賓寢對尋導壽將爾塵堯尷屍盡層屭屜屆屬屢屨嶼歲豈嶇崗峴嶴嵐島嶺嶽崠巋嶨嶧峽嶢嶠崢巒嶗崍嶮嶄嶸嶔崳嶁脊巔鞏巰幣帥師幃帳簾幟帶幀幫幬幘幗冪襆幹並廣莊慶廬廡庫應廟龐廢廎廩開異棄張彌弳彎彈強歸當錄彠彥徹徑徠禦憶懺憂愾懷態慫憮慪悵愴憐總懟懌戀懇惡慟懨愷惻惱惲悅愨懸慳憫驚懼慘懲憊愜慚憚慣湣慍憤憒願懾憖懣懶懍戇戔戲戧戰戩戶紮撲扡執擴捫掃揚擾撫摶摳掄搶護報擔擬攏揀擁攔擰撥擇掛摯攣掗撾撻挾撓擋撟掙擠揮撏撈損撿換搗據撚擄摑擲撣摻摜摣攬撳攙擱摟攪攜攝攄擺搖擯攤攖撐攆擷擼攛擻攢敵斂數齋斕鬥斬斷無舊時曠暘曇晝曨顯晉曬曉曄暈暉暫曖劄術樸機殺雜權條來楊榪傑極構樅樞棗櫪梘棖槍楓梟櫃檸檉梔柵標棧櫛櫳棟櫨櫟欄樹棲樣欒棬椏橈楨檔榿橋樺檜槳樁夢檮棶檢欞槨櫝槧欏橢樓欖櫬櫚櫸檟檻檳櫧橫檣櫻櫫櫥櫓櫞簷檁歡歟歐殲歿殤殘殞殮殫殯毆毀轂畢斃氈毿氌氣氫氬氳彙漢汙湯洶遝溝沒灃漚瀝淪滄渢溈滬濔濘淚澩瀧瀘濼瀉潑澤涇潔灑窪浹淺漿澆湞溮濁測澮濟瀏滻渾滸濃潯濜塗湧濤澇淶漣潿渦溳渙滌潤澗漲澀澱淵淥漬瀆漸澠漁瀋滲溫遊灣濕潰濺漵漊潷滾滯灩灄滿瀅濾濫灤濱灘澦濫瀠瀟瀲濰潛瀦瀾瀨瀕灝滅燈靈災燦煬爐燉煒熗點煉熾爍爛烴燭煙煩燒燁燴燙燼熱煥燜燾煆溜愛爺牘犛牽犧犢強狀獷獁猶狽麅獮獰獨狹獅獪猙獄猻獫獵獼玀豬貓蝟獻獺璣璵瑒瑪瑋環現瑲璽瑉玨琺瓏璫琿璡璉瑣瓊瑤璦璿瓔瓚甕甌電畫暢疇癤療瘧癘瘍鬁瘡瘋皰屙癰痙癢瘂癆瘓癇癡癉瘮瘞瘺癟癱癮癭癩癬癲臒皚皺皸盞鹽監蓋盜盤瞘眥矓睜睞瞼瞞矚矯磯礬礦碭碼磚硨硯碸礪礱礫礎硜碩硤磽磑礄確鹼礙磧磣堿镟滾禮禕禰禎禱禍稟祿禪離禿稈種積稱穢穠穭稅穌穩穡窮竊竅窯竄窩窺竇窶豎競篤筍筆筧箋籠籩築篳篩簹箏籌簽簡籙簀篋籜籮簞簫簣簍籃籬籪籟糴類秈糶糲粵糞糧糝餱緊縶糸糾紆紅紂纖紇約級紈纊紀紉緯紜紘純紕紗綱納紝縱綸紛紙紋紡紵紖紐紓線紺絏紱練組紳細織終縐絆紼絀紹繹經紿綁絨結絝繞絰絎繪給絢絳絡絕絞統綆綃絹繡綌綏絛繼綈績緒綾緓續綺緋綽緔緄繩維綿綬繃綢綯綹綣綜綻綰綠綴緇緙緗緘緬纜緹緲緝縕繢緦綞緞緶線緱縋緩締縷編緡緣縉縛縟縝縫縗縞纏縭縊縑繽縹縵縲纓縮繆繅纈繚繕繒韁繾繰繯繳纘罌網羅罰罷羆羈羥羨翹翽翬耮耬聳恥聶聾職聹聯聵聰肅腸膚膁腎腫脹脅膽勝朧腖臚脛膠脈膾髒臍腦膿臠腳脫腡臉臘醃膕齶膩靦膃騰臏臢輿艤艦艙艫艱豔艸藝節羋薌蕪蘆蓯葦藶莧萇蒼苧蘇檾蘋莖蘢蔦塋煢繭荊薦薘莢蕘蓽蕎薈薺蕩榮葷滎犖熒蕁藎蓀蔭蕒葒葤藥蒞蓧萊蓮蒔萵薟獲蕕瑩鶯蓴蘀蘿螢營縈蕭薩蔥蕆蕢蔣蔞藍薊蘺蕷鎣驀薔蘞藺藹蘄蘊藪槁蘚虜慮虛蟲虯蟣雖蝦蠆蝕蟻螞蠶蠔蜆蠱蠣蟶蠻蟄蛺蟯螄蠐蛻蝸蠟蠅蟈蟬蠍螻蠑螿蟎蠨釁銜補襯袞襖嫋褘襪襲襏裝襠褌褳襝褲襇褸襤繈襴見觀覎規覓視覘覽覺覬覡覿覥覦覯覲覷觴觸觶讋譽謄訁計訂訃認譏訐訌討讓訕訖訓議訊記訒講諱謳詎訝訥許訛論訩訟諷設訪訣證詁訶評詛識詗詐訴診詆謅詞詘詔詖譯詒誆誄試詿詩詰詼誠誅詵話誕詬詮詭詢詣諍該詳詫諢詡譸誡誣語誚誤誥誘誨誑說誦誒請諸諏諾讀諑誹課諉諛誰諗調諂諒諄誶談誼謀諶諜謊諫諧謔謁謂諤諭諼讒諮諳諺諦謎諞諝謨讜謖謝謠謗諡謙謐謹謾謫譾謬譚譖譙讕譜譎讞譴譫讖穀豶貝貞負貟貢財責賢敗賬貨質販貪貧貶購貯貫貳賤賁貰貼貴貺貸貿費賀貽賊贄賈賄貲賃賂贓資賅贐賕賑賚賒賦賭齎贖賞賜贔賙賡賠賧賴賵贅賻賺賽賾贗讚贇贈贍贏贛赬趙趕趨趲躉躍蹌蹠躒踐躂蹺蹕躚躋踴躊蹤躓躑躡蹣躕躥躪躦軀車軋軌軒軑軔轉軛輪軟轟軲軻轤軸軹軼軤軫轢軺輕軾載輊轎輈輇輅較輒輔輛輦輩輝輥輞輬輟輜輳輻輯轀輸轡轅轄輾轆轍轔辭辯辮邊遼達遷過邁運還這進遠違連遲邇逕跡適選遜遞邐邏遺遙鄧鄺鄔郵鄒鄴鄰鬱郟鄶鄭鄆酈鄖鄲醞醱醬釅釃釀釋裏钜鑒鑾鏨釓釔針釘釗釙釕釷釺釧釤鈒釩釣鍆釹鍚釵鈃鈣鈈鈦鈍鈔鍾鈉鋇鋼鈑鈐鑰欽鈞鎢鉤鈧鈁鈥鈄鈕鈀鈺錢鉦鉗鈷缽鈳鉕鈽鈸鉞鑽鉬鉭鉀鈿鈾鐵鉑鈴鑠鉛鉚鈰鉉鉈鉍鈹鐸鉶銬銠鉺銪鋏鋣鐃銍鐺銅鋁銱銦鎧鍘銖銑鋌銩銛鏵銓鉿銚鉻銘錚銫鉸銥鏟銃鐋銨銀銣鑄鐒鋪鋙錸鋱鏈鏗銷鎖鋰鋥鋤鍋鋯鋨鏽銼鋝鋒鋅鋶鐦鐧銳銻鋃鋟鋦錒錆鍺錯錨錡錁錕錩錫錮鑼錘錐錦鍁錈錇錟錠鍵鋸錳錙鍥鍈鍇鏘鍶鍔鍤鍬鍾鍛鎪鍠鍰鎄鍍鎂鏤鎡鏌鎮鎛鎘鑷鐫鎳鎿鎦鎬鎊鎰鎔鏢鏜鏍鏰鏞鏡鏑鏃鏇鏐鐔钁鐐鏷鑥鐓鑭鐠鑹鏹鐙鑊鐳鐶鐲鐮鐿鑔鑣鑞鑲長門閂閃閆閈閉問闖閏闈閑閎間閔閌悶閘鬧閨聞闥閩閭闓閥閣閡閫鬮閱閬闍閾閹閶鬩閿閽閻閼闡闌闃闠闊闋闔闐闒闕闞闤隊陽陰陣階際陸隴陳陘陝隉隕險隨隱隸雋難雛讎靂霧霽黴靄靚靜靨韃鞽韉韝韋韌韍韓韙韞韜韻頁頂頃頇項順須頊頑顧頓頎頒頌頏預顱領頗頸頡頰頲頜潁熲頦頤頻頮頹頷頴穎顆題顒顎顓顏額顳顢顛顙顥纇顫顬顰顴風颺颭颮颯颶颸颼颻飀飄飆飆飛饗饜飣饑飥餳飩餼飪飫飭飯飲餞飾飽飼飿飴餌饒餉餄餎餃餏餅餑餖餓餘餒餕餜餛餡館餷饋餶餿饞饁饃餺餾饈饉饅饊饌饢馬馭馱馴馳驅馹駁驢駔駛駟駙駒騶駐駝駑駕驛駘驍罵駰驕驊駱駭駢驫驪騁驗騂駸駿騏騎騍騅騌驌驂騙騭騤騷騖驁騮騫騸驃騾驄驏驟驥驦驤髏髖髕鬢魘魎魚魛魢魷魨魯魴魺鮁鮃鯰鱸鮋鮓鮒鮊鮑鱟鮍鮐鮭鮚鮳鮪鮞鮦鰂鮜鱠鱭鮫鮮鮺鯗鱘鯁鱺鰱鰹鯉鰣鰷鯀鯊鯇鮶鯽鯒鯖鯪鯕鯫鯡鯤鯧鯝鯢鯰鯛鯨鯵鯴鯔鱝鰈鰏鱨鯷鰮鰃鰓鱷鰍鰒鰉鰁鱂鯿鰠鼇鰭鰨鰥鰩鰟鰜鰳鰾鱈鱉鰻鰵鱅鰼鱖鱔鱗鱒鱯鱤鱧鱣鳥鳩雞鳶鳴鳲鷗鴉鶬鴇鴆鴣鶇鸕鴨鴞鴦鴒鴟鴝鴛鴬鴕鷥鷙鴯鴰鵂鴴鵃鴿鸞鴻鵐鵓鸝鵑鵠鵝鵒鷳鵜鵡鵲鶓鵪鶤鵯鵬鵮鶉鶊鵷鷫鶘鶡鶚鶻鶿鶥鶩鷊鷂鶲鶹鶺鷁鶼鶴鷖鸚鷓鷚鷯鷦鷲鷸鷺鸇鷹鸌鸏鸛鸘鹺麥麩黃黌黶黷黲黽黿鼂鼉鞀鼴齇齊齏齒齔齕齗齟齡齙齠齜齦齬齪齲齷龍龔龕龜誌製谘隻裡係範鬆冇嚐嘗鬨麵準鐘彆閒儘臟拚';
      for (var i = 0; i < text.length; i++) {
        var tmp = text.charAt(i);
        if (sTraditional.indexOf(tmp) > -1) {
          return true;
        }
      }
      return false;
    },
    /*判断身份证有效性**
    * 修复isIdCard_bak的bug(http://cp4.mgmt.ctripcorp.com/browse/FX21LIZARD-38)
    * clone from pc tuna
    * @by ffpan 2014/04/17
    ***/
    isIdCard: function (idCard) {
      var num = idCard.toLowerCase().match(/\w/g);
      if (idCard.match(/^\d{17}[\dx]$/i)) {
        var sum = 0, times = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        for (var i = 0; i < 17; i++)
          sum += parseInt(num[i], 10) * times[i];
        if ("10x98765432".charAt(sum % 11) != num[17]) {
          return false;
        }
        return !!idCard.replace(/^\d{6}(\d{4})(\d{2})(\d{2}).+$/, "$1-$2-$3");
      }
      if (idCard.match(/^\d{15}$/)) {
        return !!idCard.replace(/^\d{6}(\d{2})(\d{2})(\d{2}).+$/, "19$1-$2-$3");
      }
      return false;
    },
    isIdCard_bak: function (idcard) {
      var Errors = new Array(true, false, false, false, false); //请输入正确的身份证号码2012-9-19
      var area = {
        11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古",
        21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏",
        33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东",
        41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西",
        46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南",
        54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏",
        65: "xinjiang", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外"
      };
      var Y, JYM;
      var S, M;
      var idcard_array = [];
      idcard_array = idcard.split("");
      if (area[parseInt(idcard.substr(0, 2))] === null) return Errors[4];
      switch (idcard.length) {
        case 18:
          if (parseInt(idcard.substr(6, 4)) % 4 === 0 || (parseInt(idcard.substr(6, 4)) % 100 === 0 && parseInt(idcard.substr(6, 4)) % 4 === 0)) {
            ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/; //闰年出生日期的合法性正则表达式
          } else {
            ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/; //平年出生日期的合法性正则表达式
          }
          if (ereg.test(idcard)) {
            S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7 + (parseInt(idcard_array[1]) + parseInt(idcard_array[11])) * 9 + (parseInt(idcard_array[2]) + parseInt(idcard_array[12])) * 10 + (parseInt(idcard_array[3]) + parseInt(idcard_array[13])) * 5 + (parseInt(idcard_array[4]) + parseInt(idcard_array[14])) * 8 + (parseInt(idcard_array[5]) + parseInt(idcard_array[15])) * 4 + (parseInt(idcard_array[6]) + parseInt(idcard_array[16])) * 2 + parseInt(idcard_array[7]) * 1 + parseInt(idcard_array[8]) * 6 + parseInt(idcard_array[9]) * 3;
            Y = S % 11;
            M = "F";
            JYM = "10X98765432";
            M = JYM.substr(Y, 1);
            if (M.toUpperCase() == idcard_array[17].toUpperCase())
              return Errors[0];
            else
              return Errors[3];
          } else
            return Errors[2];
          break;
        default:
          return Errors[1];
      }
    },

    //验证码（免登录查询）
    isRightVerifycode: function (text) {
      var reg = /^[a-z0-9]{4,30}$/;
      return reg.test(text);
    },

    isAllowSetTradingPass: function (text) {
      var case1 = true; //数字相同验证
      var case2 = true; //连续数字验证
      var case3 = true; //2段连续数字
      var case4 = true; //回文数
      for (var i = 0; i < text.length - 1; i++) {
        var num1 = parseInt(text[i]);
        var num2 = parseInt(text[i + 1]);
        case1 = case1 && (num1 == num2);
        case2 = case2 && (num2 == num1 + 1);

        var num3 = i < text.length + 1 ? parseInt(text[i + 3]) : -1;
        var num4 = parseInt(text[5 - i]);
        if (i < text.length / 2 - 1) {
          case3 = case3 && (num1 == num3 && num2 == num1 + 1);
          case4 = case4 && (num1 == num4 && num2 == num1 + 1);
        } else if (i == text.length / 2 - 1) {
          case3 = case3 && (num1 == num3);
          case4 = case4 && (num1 == num4);
        }

        if (i + 2 == text.length && text.length == 6 && (case1 || case2 || case3 || case4)) {
          return false;
        }
      }
      return true;
    },

    isQq: function (target) {
      return /^[1-9]\d{4,}$/.test(target);
    },

    isPhone: function (target) {
      return /^[0-9]{3,4}-[0-9]{7,8}$/.test(target);
    },

    isUrl: function (target) {
      return /^http(s)?:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\:+!]*([^<>])*$/.test(target);
    },

    //isPostcode: this.isZip,

    isIP: function (obj) { //是否为IP
      if (!obj || result.isNull(obj)) return false;

      var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/g //匹配IP地址的正则表达式
      if (re.test(obj)) {
        if (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256) return true;
      }

      return false;
    },

    isEmptyObject: function (obj) {
      for (var name in obj) {
        return false;
      }

      return true;
    },

    isCharsLenWithinRange: function (value, max) {
      if (!result.isString(value)) return false;

      var reg = value.match(/\W/g);
      var length = reg == null ? value.length : value.length + reg.length;
      var isValidate = length >= 0 && length <= max;

      if (!isValidate) {
        return false;
      } else {
        this.cutLen = value.length;
      }

      return true;
    },

    /**
     *  @description 联系人输入控制, 0-13个汉字，0-26个字符
     */
    isContactName: function (value) {
      if (!result.isString(value)) return false;
      return this.isCharsLenWithinRange.call(this, value, 26);
    },

    /**
     * 备注输入控制
     * 0-50个汉字，0-100个字符
     */
    isBookPS: function (value) {
      if (!result.isString(value)) return false;
      return this.isCharsLenWithinRange.call(this, value, 100);
    },

    /**
     * 备注输入控制
     * 0-50个汉字，0-100个字符
     */
    isInvTitle: function (value) {
      if (!result.isString(value)) return false;
      return this.isCharsLenWithinRange.call(this, value, 100);
    },

    /**
     *
     */
    isBoardTitle: function (value) {
      if (!result.isString(value)) return false;
      return this.isCharsLenWithinRange.call(this, value, 40);
    },

    /* 送达地输入控制
     *  0-40个汉字，80个字符
     */
    isAreaTitle: function (value) {
      if (!result.isString(value)) return false;
      return this.isCharsLenWithinRange.call(this, value, 80);
    },

    /**
     * 11位规则
     * 不判非1规则。
     */
    isMobileNumber: function (number) {
      if (!result.isString(number)) return false;
      var LEN = 11;
      return number.length == LEN && /^(\d| )+$/g.test(number);
    },

    /**
     * 少于3位或多于7位、输入含特殊字符、输入汉字等不符合航班号查询规则
     */
    isFlightNumber: function (flightNumber) {
      if (!result.isString(flightNumber)) return false;

      var minLen = 3,
        maxLen = 7;

      return flightNumber.length >= minLen && flightNumber.length <= maxLen && /^(\d|\w)+$/g.test(flightNumber);
    }

  };

  validators.isPostcode = validators.isZip;
  return validators;
});
define('cUtility',['cUtilityHybrid', 'cUtilityHash', 'cUtilityDate', 'cUtilityServertime', 'Validate'], function (UtilityHybrid, UtilityHash, UtilityDate, UtilityServertime, Validate) {
  /**
  * @private
  * @method _toString
  * @returns {string}
  */
  var _toString = function (obj) {
    return Object.prototype.toString.call(obj);
  };

  /** @namespace Util */
  var Util = {};

  $.extend(Util, UtilityHybrid);

  Util.Date = UtilityDate;

  Util.Hash = UtilityHash.Hash;

  Util.inApp = UtilityHybrid.isInApp();

  /**
  * @public
  * @method trim
  * @param {string} 需要处理的字段
  * @returns {string}
  */
  Util.trim = function (str) {
    return str.replace(/(^[\s\u3000]*)|([\s\u3000]*$)/g, "");
  };

  /**
  * @public
  * @method stripTags
  * @description 去掉字符串中的html标签
  * @param {string} str
  * @returns {string}
  */
  Util.stripTags = function (str) {
    return (str || '').replace(/<[^>]+>/g, '');
  };

  /**
  * @public
  * @method Util.mix
  * @param origin {object|array} 源
  * @param target {object|array} 增加对象
  * @descrption 交合
  */
  Util.mix = function (origin, target) {
    return _.extend(origin, target);
  };

  /**
  * @public
  * @method indexOf
  * @param {string} val 要搜索的值
  * @param {arr} arr 要搜索的数组
  * @descrption 获取序列号
  */
  Util.indexOf = function (val, arr) {
    return _.indexOf(arr, val);
  };

  /**
  * @public
  * @description 迭代函数
  * @method each
  * @param {object|array} obj 要循环的对象
  * @param {function} fn 处理函数,会给该函数传递两个参数，第一个为key，第二个为value
  * @param {object} scope 可选 ，设置处理函数this指向的对象，如不设置则为当前元素
  * @return void
  */
  Util.each = _.each;

  /**
  * @public
  * @description 筛选函数
  * @param list {array|object} 要筛选的一个列表
  * @param filter {function} 筛选函数
  * @return list {array|object} 被筛选过的结果
  */
  Util.grep = _.filter;

  Util.getServerDate = UtilityServertime.getServerDate;

  /**
  * @description 获取GUID
  * @returns {string}
  */
  Util.getGuid = function () {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    function NewGuid() {
      return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    var guid = window.localStorage.GUID || '';

    if (!guid) {
      guid = NewGuid();
      try{
        window.localStorage.setItem('GUID', guid);
      } catch (e) {

      }
     // window.localStorage.GUID = guid;
    }

    return guid;
  };


  Util.Object = {};

  /**
  * @todo 2014/1/24 zhoutao 检查一下哪里使用了这个方法
  * @description 设置对象某个路径上的值
  * @param {object} obj
  * @param {string} string
  * @param {object|array|int} value
  * @returns {object}
  */
  Util.Object.set = function (obj, path, value) {
    if (!path) return null;

    var array = path.split('.');

    obj = obj || {};

    for (var i = 0, len = array.length, last = Math.max(len - 1, 0); i < len; i++) {
      if (i < last) {
        obj = (obj[array[i]] = obj[array[i]] || {});
      } else {
        obj[array[i]] = value;
      }
    }

    return obj;
  };

  /**
  * @todo 2014/1/24 zhoutao 检查一下哪里使用了这个方法
  * @description 获得对象在某个路径上的值
  * @param {object} obj
  * @param {string} path
  * @returns {object}
  */
  Util.Object.get = function (obj, path) {
    if (!obj || !path)
      return null;

    var array = path.split('.');

    obj = obj || {};

    for (var i = 0, len = array.length, last = Math.max(len - 1, 0); i < len; i++) {
      obj = obj[array[i]];

      if (obj === null || typeof obj === 'undefined') {
        return null;
      }
    }

    return obj;
  };

  Util.SimpleQueue = function () {
    this.initialize();
  };

  Util.SimpleQueue.prototype = {
    initialize: function () {
      this.index = 0;
      this.handlers = [];
      this.isStart = false;
    },
    add: function (handler) {
      this.handlers.push(handler);

      if (!this.isStart) {
        this.isStart = true;
        this._next();
      }
    },
    _next: function (args) {
      var handler = this.handlers.shift();
      if (handler) {
        handler.call(this, this, args);
      }
    },
    next: function () {
      this._next.apply(this, arguments);
      this.stop();

    },
    stop: function () {
      this.isStart = false;
    }
  };

  /**
  * @description: 触发一个url
  * @param {string} url

  */
  Util.tryUrl = function (url) {
    var iframe = document.createElement('iframe');
    iframe.height = 1;
    iframe.width = 1;
    iframe.frameBorder = 0;
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    document.body.appendChild(iframe);

    Util.tryUrl = function (url) {
      iframe.src = url;
    };

    U.tryUrl(url);
  };

  Util.validate = Validate;

  /**
  * @param {array} arr
  */
  Util.JsonArrayToObject = function (arr) {
    if (!arr) return [];

    var Keys = arr.shift();
    var List = []
    var obj = null;

    for (var i = 0, I = arr.length; i < I; i++) {
      obj = {};
      for (var t = 0, T = arr[i].length; t < T; t++) {
        switch (_toString(arr[i][t])) {
          case '[object Array]':
            obj[Keys[t]] = U.JsonArrayToObject(arr[i][t]);
            break;
          default:
            obj[Keys[t]] = arr[i][t];
        }
      }
      List.push(obj);
    };
    return List;
  }

  /**
  * 将目标字符串转换成日期对象
  * 2010/5/10 | July,2010,3,23 | Tuesday November 9 1996 7:30 PM | 2010-01-01 12:23:39
  * @param {string} source
  * @return  {Date}
  * @example
  * Util.dateParse(source)
  */
  Util.dateParse = function (source) {
    var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
    if ('string' == typeof source) {
      if (reg.test(source) || isNaN(Date.parse(source))) {
        var d = source.split(/ |T/),
            d1 = d.length > 1 ? d[1].split(/[^\d]/) : [0, 0, 0],
            d0 = d[0].split(/[^\d]/);
        return new Date(d0[0] - 0,
            d0[1] - 1,
            d0[2] - 0,
            d1[0] - 0,
            d1[1] - 0,
            d1[2] - 0);
      } else {
        return new Date(source);
      }
    }
    return new Date();
  };



  /**
  * @description 删除数组中的指定的值
  * @method Util.deleteValue
  * @singleton
  * @param {object} val
  * @param {array} arr 被删除的值
  */
  Util.deleteValue = function (val, arr) {
    var index = U.indexOf(val, arr);
    if (index > -1) {
      return arr.splice(index, 1);
    }
    return null;
  };

  /**
   * 解析url
   * @param url
   * @returns {{href: (*|string), hrefNoHash: (*|string), hrefNoSearch: (*|string), domain: (*|string), protocol: (*|string), doubleSlash: (*|string), authority: (*|string), username: (*|string), password: (*|string), host: (*|string), hostname: (*|string), port: (*|string), pathname: (*|string), directory: (*|string), filename: (*|string), search: (*|string), hash: (*|string)}}
   */
  Util.urlParse = function(url){
    var arr=url.match(/^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/)||[];
    return {
      href:arr[0]||'',
      hrefNoHash:arr[1]||'',
      hrefNoSearch:arr[2]||'',
      domain:arr[3]||'',
      protocol:arr[4]||'',
      doubleSlash:arr[5]||'',
      authority:arr[6]||'',
      username:arr[8]||'',
      password:arr[9]||'',
      host:arr[10]||'',
      hostname:arr[11]||'',
      port:arr[12]||'',
      pathname:arr[13]||'',
      directory:arr[14]||'',
      filename:arr[15]||'',
      search:arr[16]||'',
      hash:arr[17]||''
    };
  }


  /**
   * 截取URL参数
   * @param url
   * @param param
   */
  Util.getUrlParam = function(url,name){
    var re = new RegExp("(\\\?|&)" + name + "=([^&]+)(&|$)", "i"), m = url.match(re);
    return m?m[2]:"";
  };

  /**
   * 解析URL参数
   * @param url
   * @returns {{}}
   */
  Util.getUrlParams = function(url) {
    var url = url.split('://');
    var searchReg = /([^&=?]+)=([^&]+)/g;
    var urlParams = {};
    var match, value, length;

    while (match = searchReg.exec(url[0])) {
      name = match[1];
      value = match[2];
      urlParams[name] = value;
    }

    if (url[1]) {
      var idx = 0;
      length = _.size(urlParams);
      _.each(urlParams, function (value, key) {
        if (++idx == length) {
          urlParams[key] += '://' + url[1];
        }
      });
    }

    return urlParams;
  }

  return Util;

});
/**
 * @author cmli@ctrip.com / oxz欧新志 <ouxz@Ctrip.com> / vzyq张有泉 <yq.zhang@Ctrip.com>
 * @class cBase
 * @description 提供框架基本的方法
 */
define('cBase',['libs', 'cCoreInherit', 'cUtility'], function(libs, cCoreInherit, util) {

  

  /** 兼容处理IE不能使用console的问题  */
  if (typeof console === 'undefined') {
    console = {
      log: function() {},
      error: function() {}
    };
  }

  /** 声明Base作为命名空间 */
  var Base = {};

  /** 委托自cUtility */
  Base.isInApp = util.isInApp;

  /** 委托自cCoreInherit */
  Base.Class = cCoreInherit.Class;
  Base.extend = cCoreInherit.extend;
  Base.implement = cCoreInherit.implement;

  /**
   * @method bind
   * @param {function} fn 需要转换作用域的方法
   * @param {object} obj 对象
   * @param {array} args 数组
   * @description 改变fn的作用域
   * @return {function}
   */
  var slice = [].slice;
  var bind = function(fn, obj, args) {
    args = args || [];
    return function() {
      fn.apply(obj, args.concat(slice.call(arguments)));
    };
  };

  /**
   * @method _toString
   * @param {object} obj 对象
   * @description 将对象打印成string输出
   * @return {string}
   */
  var _toString = function(obj) {
    return Object.prototype.toString.call(obj);
  };

  /**
   * @deprecated
   * @description 2014/1/20 zhoutao 明天排查，如果没有地方引用，直接干掉这个方法

      Base.Type = function(o) {
        return _toString(o);
      };

      (function(Type, types) {
        for (var i = 0; i < types.length; i++) {
          Type['is' + types[i]] = (function(type) {
            return function(obj) {
              return Base.Type(obj) === '[object ' + type + ']'
            };
          })(types[i]);
        }
      })(Base.Type, ['Boolean', 'Object', 'String', 'Number', 'Date', 'Function', 'Array', 'Error', 'RegExp', 'Arguments']);

   */

  Base.Object = new Base.Class({});

  var options = {
    keys: function(obj){
      var keys = [];

      if (typeof obj === 'object') {
        if (typeof Object.keys === 'function') {
          Object.keys(obj);
        }else{
          for (var i in obj) {
            if (obj.hasOwnProperty(i)) keys.push(i);
          }
        }
      }

      return keys;
    }
  };

  /** 向Base.Object对象加入熟悉值 */
  Base.extend(Base.Object, options);

  /**
   * @deprecated
   * @description 委托自util
   * @comment 将来需要排查一遍，全部删除，需要移动到cUtility上去
   */
  Base.Date = util.Date;

  /**
   * @deprecated
   * @description 哈希对象
   * @comment 2014/1/20 zhoutao 明天排查，如果引用的地方不多，直接移动到cUtility上去
   */
  Base.Hash = util.Hash;

  /**
   * @method getInstance
   * @description 实现单例的获得实例的方法
   * @return {object}
   */
  Base.getInstance = function() {
    return this.instance || new this();
  };

  /**
   * @dscsription ： 迁移至 business/c.business.servertime.js
   */
  Base.getServerDate = util.getServerDate;

  return Base;
});
/**
* @author zsb张淑滨 <shbzhang@Ctrip.com> / ghj龚汉金 <hjgong@Ctrip.com>
* @class cLog
* @description 提供App在手机端的后门
* @comment 需要zsb与新代码再核对一遍
*/
define('cUIAnimation',[], function () {

  return {
    //        slideleft: function (inView, outView, callback, scope) {
    //            this.body.addClass('hiddenx');
    //            inView.$el.addClass('animatestart');
    //            outView.$el.addClass('slideleftout');
    //            inView.$el.addClass('sliderightin');
    //            var self = this;
    //            return setTimeout(function () {
    //                self.body.removeClass('hiddenx');
    //                inView.$el.removeClass('animatestart');
    //                inView.$el.removeClass('sliderightin');
    //                inView.$el.show();
    //                outView.$el.removeClass('slideleftout');
    //                outView.$el.hide();
    //                callback && callback.call(scope);
    //            }, 700);
    //        },
    //        slideright: function (inView, outView, callback, scope) {
    //            this.body.addClass('hiddenx');
    //            inView.$el.addClass('animatestart');
    //            outView.$el.addClass('sliderightout');
    //            inView.$el.addClass('slideleftin');
    //            var self = this;
    //            return setTimeout(function () {
    //                self.body.removeClass('hiddenx');
    //                inView.$el.removeClass('animatestart');
    //                inView.$el.removeClass('slideleftin');
    //                inView.$el.show();
    //                outView.$el.removeClass('sliderightout');
    //                outView.$el.hide();
    //                callback && callback.call(scope);
    //            }, 700);
    //        },

    //以下为复写
    //                slideleft: function (inView, outView, callback, scope) {
    //                    this.body.addClass('hiddenx');
    //                    var self = this;
    //                    inView.$el.addClass('animatestart');
    //                    inView.$el.css({
    //                        '-webkit-transform': 'translate3d(100%, 0px, 0px)',
    //                        '-moz-transform': 'translate3d(100%, 0px, 0px)'
    //                    });

    //                    inView.$el.animate({
    //                        '-webkit-transform': 'translate3d(0px, 0px, 0px)',
    //                        '-moz-transform': 'translate3d(0px, 0px, 0px)'
    //                    }, 300, 'linear', function () {
    //                        self.body.removeClass('hiddenx');
    //                        inView.$el.removeClass('animatestart');
    //                        outView.$el.hide();
    //                        callback && callback.call(scope);
    //                    })
    //                },
    //                slideright: function (inView, outView, callback, scope) {
    //                    this.body.addClass('hiddenx');
    //                    var self = this;
    //                    outView.$el.addClass('animatestart');
    //                    outView.$el.css({
    //                        '-webkit-transform': 'translate3d(0%, 0px, 0px)',
    //                        '-moz-transform': 'translate3d(0%, 0px, 0px)'
    //                    });
    //                    outView.$el.animate({
    //                        '-webkit-transform': 'translate3d(100%, 0px, 0px)',
    //                        '-moz-transform': 'translate3d(100%, 0px, 0px)'
    //                    }, 300, 'linear', function () {
    //                        self.body.removeClass('hiddenx');
    //                        outView.$el.removeClass('animatestart');
    //                        outView.$el.hide();
    //                        callback && callback.call(scope);
    //                    });
    //                },

    //        slideleft: function (inView, outView, callback, scope) {
    //            this.body.addClass('hiddenx');
    //            inView.$el.addClass('animatestart');
    //            inView.$el.addClass('sliderightin');

    //            outView.$el.addClass('animatestart');
    //            outView.$el.addClass('slideleftout');

    //            var self = this;
    //            return setTimeout(function () {
    //                self.body.removeClass('hiddenx');
    //                inView.$el.removeClass('animatestart');
    //                inView.$el.removeClass('sliderightin');

    //                outView.$el.removeClass('animatestart');
    //                outView.$el.removeClass('slideleftout');

    //                outView.$el.hide();
    //                callback && callback.call(scope);
    //            }, 390);
    //        },

    //        slideright: function (inView, outView, callback, scope) {
    //            this.body.addClass('hiddenx');
    //            inView.$el.addClass('animatestart');
    //            inView.$el.addClass('slideleftin');

    //            outView.$el.addClass('animatestart');
    //            outView.$el.addClass('sliderightout');

    //            var self = this;
    //            return setTimeout(function () {
    //                self.body.removeClass('hiddenx');
    //                inView.$el.removeClass('animatestart');
    //                inView.$el.removeClass('slideleftin');

    //                outView.$el.removeClass('animatestart');
    //                outView.$el.removeClass('sliderightout');

    //                outView.$el.hide();
    //                callback && callback.call(scope);
    //            }, 390);
    //        },

    //    fadeIn: function (inView, outView, callback, scope) {
    //      this.mainframe.hide();
    //      //原逻辑存在两个view可能同时出现在页面中的bug，这里强制先将所有view隐藏，在显示当前view
    //      this.viewport.children('.sub-viewport').hide();
    //      inView.$el.show();
    //      this.mainframe.show();
    //      callback && callback.call(scope || this);
    //    },

    slideleft: function (inView, outView, callback, scope) {
      $('body').addClass('hiddenx');
      inView.addClass('animatestart');
      inView.addClass('sliderightin');

      inView.__show();

      var self = this;
      return setTimeout(function () {
        $('body').removeClass('hiddenx');
        inView.removeClass('animatestart');
        inView.removeClass('sliderightin');

        if (outView) outView.__hide(inView.viewname);

        callback && callback.call(scope, inView, outView);
      }, 340);
    },
    slideright: function (inView, outView, callback, scope) {
      $('body').addClass('hiddenx');

      if (outView) {
        outView.addClass('animatestart');
        outView.addClass('sliderightout');
      }

      inView.__show();

      var self = this;
      return setTimeout(function () {
        $('body').removeClass('hiddenx');
        if (outView) {
          outView.removeClass('animatestart');
          outView.removeClass('sliderightout');
          outView.__hide(inView.viewname);
        }

        callback && callback.call(scope, inView, outView);

      }, 340);
    },


    noAnimate: function (inView, outView, callback, scope) {
      //减少重绘和回流，但是会引起页面滚动条BUG
//      this.mainframe.hide();

      //in 一定会有 out则不一定
      if (outView) outView.__hide(inView.viewname);
      inView.__show();

//      this.mainframe.show();

      callback && callback.call(scope, inView, outView);

    }

  };
});
/**
 * @author:       cmli@Ctrip.com
 * @description:  组件工厂，用来动态的创建组件
 */
define('cWidgetFactory',['libs'], function(libs){

  

  var WidgetFactory = WidgetFactory || {};

  WidgetFactory.products = {};

  /**
   * @description: 检查WidgetFactory是否已经注册了该名称的组件
   * @param: {name} String 组件名称
   * @return boolean
   */
  WidgetFactory.hasWidget = function(name){
    return !!(WidgetFactory.products[name]);
  };

  /**
   * @description: 向WidgetFactory注册注册组件
   * @param: {product.name} String 组件名称
   * @param: {product.fn} Function 组件，AbstractView对象
   */
  WidgetFactory.register = function(product){
    if (product && product.name && product.fn) {
      if (WidgetFactory.products[product.name]) {
        throw "WidgetFactory: widget has been register in WidgetFactory";
      }
      WidgetFactory.products[product.name] = product.fn;
    }else{
      throw "WidgetFactory: widget is lack of necessary infomation.";
    }
  };

  /**
   * @description: 通过WidgetFactory生产组件
   * @param: {name} String 组件名称
   * @return: Function 组件，AbstractView对象
   */
  WidgetFactory.create = function(name){
    return WidgetFactory.products[name];
  };

  return WidgetFactory;
});
/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class AbsctractStorage
 * @description Storage抽象类
 */
define('cAbstractStorage',['cBase'], function (cBase) {

  

  var EJSON = window.JSON;
  var CDate = cBase.Date;

  /**
   * @class AbsctractStorage
   */
  var AbstractStorage = new cBase.Class({

    /**
     * @method __propertys__
     * @description 复写自顶层Class的__propertys__，初始化队列
     */
    __propertys__: function () {
      this.proxy = null;
    },

    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层Class的initialize，赋值队列
     */
    initialize: function ($super, options) {

    },

    /**
     * @method _buildStorageObj
     * @param value
     * @param timeout
     * @param tag
     * @param savedate
     * @param oldVal
     * @returns {{value: *, oldvalue: (*|{}), timeout: *, tag: *, savedate: *}}
     * @private
     */
    _buildStorageObj: function (value, timeout, tag, savedate, oldVal) {
      return {
        value:    value,
        oldvalue: oldVal || null,
        timeout:  timeout,
        tag:      tag,
        savedate: savedate
      }
    },

    /**
     * @method set
     * @param {String} key 数据Key值
     * @param {Object} value 数据对象
     * @param {Date} timeout 可选,数据失效时间,如不传,默认过期时间为当前日期过会30天
     * @param {String} [optional] tag 可选,数据版本标识,如传递此参数,在使用get()时,只有tag相符,才能取到数据
     * @param {Date} [optional] savedate 可选,数据保存时间
     * @param {Object} [optional] oldVal 可选,可以为store存一个过去值,供回滚时使用,已废弃
     * @return {Boolean} 成功true,失败false
     * @desctription 向Store中存放数据
     */
    set: function (key, value, timeout, tag, savedate, oldVal) {
      savedate = savedate || (new CDate()).format('Y/m/d H:i:s');
      timeout = timeout ? new CDate(timeout) : new CDate().addDay(30);
      var entity = this._buildStorageObj(value, timeout.format('Y/m/d H:i:s'), tag, savedate, oldVal);
      try {
        this.proxy.setItem(key, EJSON.stringify(entity));
        return true;
      } catch (e) {
        console && console.log(e);
      }
      return false;
    },

    /**
     * @method get
     * @param {String} key 数据Key会值
     * @param {String} [optional] tag 版本表示,如传递版本参数,则会验证保存的版本与参数是否相符,相符才返回数据,否则返回null,不传此参数
     * 则不会比较
     * @param {Boolean} [optional] oldFlag 默认为false,是否返回上一版本
     * @return {Object} 取回保存的数据
     * @description 根据key获取value值,如指定的key或attrName未定义返回null
     */
    get: function (key, tag, oldFlag) {
      var result, value = null;
      try {
        result = this.proxy.getItem(key);
        if (result) {
          result = EJSON.parse(result);
          if (CDate.parse(result.timeout, true) >= new Date()) {
            if (tag) {
              if (tag === result.tag) {
                value = oldFlag ? result.oldvalue : result.value;
              }
            } else {
              value = oldFlag ? result.oldvalue : result.value;
            }
          }
        }
      } catch (e) {
        console && console.log(e);
      }
      return value;
    },

    /**
     * @method getTag
     * @param key 数据Key
     * @returns {String} 返回此Storager的版本标识
     * @description 返回存放Storage的tag
     */
    getTag: function (key) {
      var result, value = null, tag = null;
      try {
        result = this.proxy.getItem(key);
        if (result) {
          result = EJSON.parse(result);
          tag = result && result.tag
        }
      } catch (e) {
        console && console.log(e);
      }
      return tag;
    },

    /**
     * @method getSaveDate
     * @param {String} key 数据key
     * @param {Boolean} [option] useCDate 是否返回CDate类型,默认为false
     * @returns {CDate|Number} 返回Store保存时间
     * @description 获得某个storage的保存时间
     */
    getSaveDate:   function (key, useCDate) {
      var result, value = null;
      try {
        result = this.proxy.getItem(key);
        if (result) {
          result = EJSON.parse(result);
          if (result.savedate) {
            value = CDate.parse(result.savedate);
            if (!useCDate) value = value.valueOf();
          }
        }
      } catch (e) {
        console && console.log(e);
      }
      return value;
    },

    /**
     * @method getExpireTime
     * @param {String} key storage key值
     * @return {Number} timeout 超时时间,距离1970年的毫秒数
     * @description 返回指定key的超时时间
     */
    getExpireTime: function (key) {
      var result = null, time = null;
      try {
        result = this.proxy.getItem(key);
        if (result) {
          result = EJSON.parse(result);
          time = Date.parse(result.timeout);
        }
      } catch (e) {
        console && console.log(e);
      }
      return time;
    },

    /**
     * @method remove
     * @param {String} key 数据key值
     * @description 清除指定key
     */
    remove: function (key) {
      return this.proxy.removeItem(key);
    },

    /**
     * @method getAll
     * @return {Array} result,形式如[{key:'aa',value:{}}]
     * @description 返回storage存储的所有数据
     */
    getAll: function () {
      var ln = this.proxy.length;
      var vs = [];
      for (var i = 0; i < ln; i++) {
        var key = this.proxy.key(i);
        var obj = {
          key:   key,
          value: this.get(key)
        }
        vs.push(obj);
      }
      return vs;
    },

    /**
     * @method clear
     * @discription 清空所有storage内容
     */
    clear: function () {
      this.proxy.clear();
    },

    /**
     * @method gc
     * @discription 垃圾收集,清掉失效的数据
     */
    gc: function () {
      var storage = this.proxy,
        ln = this.proxy.length;
      for (var i = 0; i < ln; i++) {
        var name = storage.key(i);
        if(name =='GUID'){
          break;
        }
        try{
          if (!this.get(name)) {
            this.remove(name);
          }
        }catch(e){

        }
      }
    }

  });


  return AbstractStorage;
});

/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class LocalStorage
 * @description LocalStorage 存储类
 */
define('cStorage',['cBase', 'cAbstractStorage'], function (cBase, cAbstractStorage) {

  /**
   * @class AbsctractStorage
   * @type {cBase.Class}
   * @description LocslStorage存储类,继承自cAbstractStorage
   */
  var Storage = new cBase.Class(cAbstractStorage, {
    /**
     * @method __propertys__
     * @description 复写自顶层Class的__propertys__，初始化队列
     */
    __propertys__: function () {

    },

    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层继承自cAbstractStorage的initialize，赋值队列
     */
    initialize: function ($super, opts) {
      this.proxy = window.localStorage;
      $super(opts);
    },

    /**
     * @method oldGet
     * @param {String} key 数据key值
     * @returns {Object} 数据值
     * @description 读取H5老的localstorage的方法,数据不在value中
     */
    oldGet: function (key) {
      var v = localStorage.getItem(key);
      var d = v ? JSON.parse(v) : null;
      if (d && d.timeout) {
        /*验证是否过期*/
        var n = new Date();
        var t = cBase.Date.parse(d.timeout).valueOf();
        if (d.timeby) {
          if (t - n >= 0) {
            return d;
          }
        } else {
          if (t - cBase.Date.parse(cBase.Date.format(n, 'Y-m-d')).valueOf() >= 0) {
            return d;
          }
        }
        localStorage.removeItem(key);
        return null;
      }
      return d;
    },

    /**
     * @method oldSet
     * @param {String} key 数据key值
     * @param {Object} value
     * @description 写老的getStorage格式
     */
    oldSet: function (key, value) {
      localStorage.setItem(key, value);
    },


    /**
     * @method getExpireTime
     * @param {String} key
     * @returns {CData} cDate 过期时间
     * @description 获得旧的H5格式失效时间
     */
    getExpireTime: function (key) {
      var v = localStorage.getItem(key);
      var d = v ? JSON.parse(v) : null;
      if (d && d.timeout) {
        return d.timeout;
      } else {
        return new cBase.Date(cBase.getServerDate()).addDay(2).format('Y-m-d');
      }
    },
    /**
     * @method oldRemove
     * @param key 数据key值
     * @description 旧的H5格式,移除Storage
     */
    oldRemove: function (key) {
      localStorage.removeItem(key);
    }

  });


  Storage.getInstance = function () {
    if (this.instance) {
      return this.instance;
    } else {
      return this.instance = new this();
    }
  };

  Storage.localStorage = Storage.getInstance();
  return Storage;
});
/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class AbsctractStore
 * @description 抽象Store
 */

define('cAbstractStore',['cBase', 'cStorage', 'cUtility'], function (cBase, Storage, cUtility) {

  CDate = cBase.Date;
  HObject = cUtility.Object;

  var Store = new cBase.Class({
    __propertys__: function () {
      this.NULL = {};
      /**
       * @member lifeTime
       * @type {String}
       * @description Store键值
       */
      this.key = this.NULL;
      /**
       * @member lifeTime
       * @type {String}
       * @description 数据存活时间, 参数传递格式为“时间+时间单位",如30M
       * 时间单位有D:day,H:hour,M:minutes,S:secend,
       * 如过不传递时间单位,默认时间单位为M
       */
      this.lifeTime = '30M';
      /**
       * @member useServerTime
       * @description 要否需要使用服务器时间
       */
      this.useServerTime = false;

      /**
       *
       * @description 默认返回数据
       */
      this.defaultData = null;
      /**是否可回滚**/
      this.rollbackEnabled = false;

      this.sProxy = this.NULL;
    },

    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层Class的initialize，赋值队列
     */
    initialize: function (options) {
      for (var opt in options) {
        this[opt] = options[opt];
      }
      this.assert();
    },

    assert: function () {
      if (this.key === this.NULL) {
        throw 'not override key property';
      }
    },

    /**
     * @method set
     * @param {Object} value 要添加的数据
     * @param {String} [optional] tag 数据标记，这里的tag，是在get()方法调用时起作用，当时间不过期时，参数中的tag和数据中tag不一致，则认为数据过期，tag一致则未过期。
     * @param {Object} [optional] oldVal 可选
     * @description 向Store中添加数据
     */
    set: function (value, tag, oldVal) {
      var time = this._getNowTime();
      time.addSeconds(this._getLifeTime());
      if (this.rollbackEnabled && !oldVal) {
        oldVal = value;
      }
      this.sProxy.set(this.key, value, time, tag, null, oldVal);
    },

    /**
     * @method setLifeTime
     * @param {String} lifeTime字符串
     * @param {Boolean} [optional] override 是否在当前时间点修改,如为否则在saveDate上修改,默认为false
     * @description 设置当前对象的过期时间
     */
    setLifeTime: function (lifeTime, override) {
      this.lifeTime = lifeTime;
      var tag = this.getTag(),
        value = this.get(),
        time;
      //覆盖
      if (override) {
        time = this._getNowTime();
        //在原时间点修改时间
      } else {
        time = this.sProxy.getSaveDate(this.key, true) || this._getNowTime();
      }
      var stime = (new CDate(time.valueOf())).format('Y/m/d H:i:s');
      time.addSeconds(this._getLifeTime());
      this.sProxy.set(this.key, value, time, tag, stime);
    },
    /**
     * @method setAttr
     * @param {String} attrName  支持通过路径的方式，如 setAttr('global.user.name','张三')
     * @param {Object} attrVal 属性值
     * @param {String|Number} [optional] tag 数据标记，这里的tag，是在get()方法调用时起作用，当时间不过期时，参数中的tag和数据中tag不一致，则认为数据过期，tag一致则未过期。
     * @description 设置属性值
     */
    setAttr: function (attrName, attrVal, tag) {
      if (_.isObject(attrName)) {
        for (var i in attrName) {
          if (attrName.hasOwnProperty(i)) this.setAttr(i, attrName[i], attrVal);
        }
        return;
      }
      tag = tag || this.getTag();
      var obj = this.get(tag) || {}, oldVal = {};
      if (obj) {
        if (this.rollbackEnabled) {
          oldVal = this.get(tag, true);
          //增加属性名做路径，操作属性
          var oval = HObject.get(obj, attrName);
          HObject.set(oldVal, attrName, oval);
        }
        HObject.set(obj, attrName, attrVal);
        return this.set(obj, tag, oldVal);
      }
      return false;
    },

    /**
     * @method get
     * @param {String|Number} tag 数据标记，当时间不过期时，参数中的tag和数据中tag不一致，则认为数据过期，tag一致则未过期。
     * @param {Boolean} [optional] oldFlag  默认为false,是否返回上一版本
     * @return {Object} obj
     * @description 获取已存取数据
     */
    get: function (tag, oldFlag) {
      var result = null, isEmpty = true;
      if (Object.prototype.toString.call(this.defaultData) === '[object Array]') {
        result = this.defaultData.slice(0);
      } else if (this.defaultData) {
        result = _.clone(this.defaultData);
      }
      var obj = this.sProxy.get(this.key, tag, oldFlag);
      var type = typeof obj;
      if (({ 'string': true, 'number': true, 'boolean': true })[type]) return obj;
      if (obj) {
        if (Object.prototype.toString.call(obj) == '[object Array]') {
          result = [];
          for (var i = 0, ln = obj.length; i < ln; i++) {
            result[i] = obj[i];
          }
        } else {
          if (obj && !result) result = {};
          cBase.extend(result, obj);
        }
      }
      for (var a in result) {
        isEmpty = false;
        break;
      }
      return !isEmpty ? result : null;
    },

    /**
     * @method getAttr
     * @param {String} attrName 支持通过路径的方式，如 getAttr('global.user.name')
     * @param {String|Number} [optional] tag 数据标记，当时间不过期时，参数中的tag和数据中tag不一致，则认为数据过期，tag一致则未过期。
     * @returns {Object} value 数据的属性值
     * @description 获取已存取对象的属性
     */
    getAttr: function (attrName, tag) {
      var obj = this.get(tag);
      var attrVal = null;
      if (obj) {
        attrVal = HObject.get(obj, attrName);
      }
      return attrVal;
    },
    /**
     * @method getTag
     * @returns {String} 返回Store的版本标识
     * @description 获取数据tag
     */
    getTag: function () {
      return this.sProxy.getTag(this.key);
    },
    /**
     * @method remove
     * @description 移除数据存储
     */
    remove: function () {
      this.sProxy.remove(this.key);
    },

    /**
     * @method removeAttr
     * @param {String} attrName
     * @description 移除存储对象的指定属性
     */
    removeAttr: function (attrName) {
      var obj = this.get() || {};
      if (obj[attrName]) {
        delete obj[attrName];
      }
      this.set(obj);
    },

    /**
     * 返回失效时间
     */
    getExpireTime: function () {
      var result = null;
      try {
        result = this.sProxy.getExpireTime(this.key);
      } catch (e) {
        console && console.log(e);
      }
      return result;
    },

    /**
     * @method setExpireTime
     * @param {Date} time
     * @description 设置失效时间
     */
    setExpireTime: function (time) {
      var value = this.get();
      var cTime = new CDate(time);
      this.sProxy.set(this.key, value, cTime);
    },

    /**
     * @method _getNowTime
     * @description 活动当前时间 useServerTime:true 返回服务器时间,false返回本地时间
     */
    _getNowTime: function () {
      return this.useServerTime ? new CDate(cBase.getServerDate()) : new CDate();
    },

    /**
     * @method _getLifeTime
     * @returns {number} 根据liftTime 计算要增加的毫秒数
     * @description } 根据liftTime 计算要增加的毫秒数
     * @private
     */
    _getLifeTime: function () {
      var timeout = 0;
      var str = this.lifeTime + "";
      var unit = str.charAt(str.length - 1);
      var num = +str.substring(0, str.length - 1);
      if (typeof unit == 'number') {
        unit = 'M';
      } else {
        unit = unit.toUpperCase();
      }

      if (unit == 'D') {
        timeout = num * 24 * 60 * 60;
      } else if (unit == 'H') {
        timeout = num * 60 * 60;
      } else if (unit == 'M') {
        timeout = num * 60;
      } else if (unit == 'S') {
        timeout = num;
      } else {
        //默认为秒
        timeout = num * 60;
      }
      return timeout;
    },
    /**
     * @method rollback
     * @param {Array} [optional] attrs 可选，属性名数组，如传递此参数只回滚指定属性，如不指定全部回滚
     * @description 回滚至上个版本
     */
    rollback: function (attrs) {
      if (this.rollbackEnabled) {
        var tag = this.getTag();
        var value = this.sProxy.get(this.key, tag);
        var oldVal = this.sProxy.get(this.key, tag, true);
        if (attrs && attrs instanceof Array) {
          for (var x in attrs) {
            var attr = attrs[x]
            var v = oldVal[attr];
            if (typeof v != 'undefined') {
              value[attr] = v;
            }
          }
        } else {
          value = oldVal;
          oldVal = {}
        }
        this.set(value, tag, oldVal);
      }
    }


  });

  Store.getInstance = function () {
    if (this.instance) {
      return this.instance;
    } else {
      return this.instance = new this();
    }
  };
  return Store;
});
/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class LocalStore
 * @description 以localstorage为数据存储的Store
 */

define('cStore',['cBase','cAbstractStore','cStorage'], function (cBase,cAbstractStore,cLocalStorage) {

  /**
   * @class LocalStore
   * @type {cBase.Class}
   * @description 使用LocalStorage存储的Store类,继承自cAbstractStore
   */
  var LocalStore = new cBase.Class(cAbstractStore,{
    __propertys__: function () {
      this.sProxy = cLocalStorage.getInstance();
    },
    initialize: function ($super, options) {
      $super(options);
    }
  });

  return LocalStore;
});
/**
 * @author zsb张淑滨 <oxz@ctrip.com|shbzhang@ctrip.com>
 * @description 存放H5使用的一些通用Store,如用户信息Store,HeadStore,分销联盟Store,渠道参数Store,渠道信息Store
 */
define('CommonStore',['cBase', 'cStore', 'cStorage', 'cUtility'], function (cBase, cLocalStore, cLocalStorage, cUtility) {
  var Common = {};
  var ls =  cLocalStorage.localStorage;
  /**
   * @class UserStore
   * @type {cBase.Class}
   * @description 同时操作USER和USERINFO, 其中USERINFO是兼容老的数据格式,可以去掉.
   */
  Common.UserStore = new cBase.Class(cLocalStore, {
    __propertys__: function () {
      this.key = 'USER';
      this.lifeTime = '1D';
    },
    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层Class的initialize，赋值队列
     */
    initialize:    function ($super, options) {
      $super(options);
    },

    /**
     * @method getUser
     * @returns {Object} 用户信息
     * @description 返回用户信息
     */
    getUser: function () {
      return this.get();
      /*var userinfo = cLocalStorage.localStorage.oldGet('USERINFO');
      userinfo = userinfo && userinfo.data || null;

      this.set(userinfo);
      return userinfo;*/
    },

    /**
     * @method setUser
     * @param {Object} UserInfo用户信息
     * @description 保存用户信息
     */
    setUser: function (data) {
      this.set(data);
      var timeout = ls.getExpireTime('USERINFO');
      var userinfo = { data: data, timeout: timeout };
      ls.oldSet('USERINFO', JSON.stringify(userinfo));
    },

    /**
     * @method removeUser
     * @description 移除用户信息
     */
    removeUser:    function () {
      //cLocalStorage.localStorage.oldRemove('USERINFO');
     // this.set(null);
      ls.oldRemove('USERINFO');
      this.remove();
    },

    /**
     * @method isNonUser
     * @returns {Object|boolean} 返回当前用户是否是未注册用户
     * @description 返回当前用户是否是未注册用户
     */
    isNonUser:     function () {
      var user = this.getUser();
      return user && !!user.IsNonUser;
    },

    /**
     * @method isLogin
     * @returns {Object|boolean} 当前用户是否登陆
     * @description 判断当前用户是否登陆
     */
    isLogin:       function () {
      var user = this.getUser();
      return user && !!user.Auth && !user.IsNonUser;
    },

    /**
     * @method getUserName
     * @returns {String} 用户名
     * @description 返回当前登陆用户的用户名
   */
    getUserName:   function () {
      var user = this.getUser();
      return user.UserName;
    },

    /**
     * @method getUserId
     * @returns {*|string}
     * @description 返回当前登陆用户的ID
     */
    getUserId:     function () {
      var user = this.getUser() || {};
      return user.UserID || cUtility.getGuid();
    },

    /**
     * @method getAuth
     * @returns {*|string}
     * @description 返回当前登陆用户的Auth值
     */
    getAuth:       function () {
      var HeadStore = Common.HeadStore.getInstance(),
        userinfo = this.getUser();
      if (userinfo && userinfo.Auth) HeadStore.setAttr('auth', userinfo.Auth);
      return HeadStore.getAttr('auth');
    },

    /**
     * @method setAuth
     * @param {String} auth 用户auth字段
     * @description 返回当前登陆用户的Auth值
     */
    setAuth:       function (auth) {
      var isLogin = this.isLogin(),
        userinfo = this.getUser() || {};
      userinfo.Auth = auth;
      userinfo.IsNonUser = isLogin ? false : true;
      this.setUser(userinfo);
    },

    /**
     * @method setNonUser
     * @param {String} auth 用户auth
     * @description 设置当前用户为非注册用户
     */
    setNonUser:    function (auth) {
      var HeadStore = Common.HeadStore.getInstance();
      HeadStore.setAttr('auth', auth);
      var data =  {};
      data.Auth = auth;
      data.IsNonUser = true;
      this.setUser(data);
    },

    /**
     * 设置过期时间，同时会操作USERINFO
     * @param $super
     * @param timeout
     */
    setExpireTime: function($super,timeout){
      $super(timeout);
      var data = this.get();
      var userinfo = { data: data, timeout: timeout };
      ls.oldSet('USERINFO', JSON.stringify(userinfo));
    }
  });

  /**
   * @class HeadStore
   * @type {cBase.Class}
   * @description Restful 服务的HeadStore
   */
  Common.HeadStore = new cBase.Class(cLocalStore, {
    userStore:     Common.UserStore.getInstance(),
    __propertys__: function () {
      this.key = 'HEADSTORE';
      this.lifeTime = '15D';
      this.defaultData = {
        "cid":     cUtility.getGuid(),
        "ctok":    "351858059049938",
        "cver":    "1.0",
        "lang":    "01",
        "sid":     "8888",
        "syscode": '09',
        "auth":    ""
      };
      var get = this.get;

      /**
       * @method get
       * @returns {*}
       * @description 重写get方法,获得userinfo中auth
       */
      this.get = function () {
        var head = get.apply(this, arguments),
          userinfo = this.userStore.getUser();
        //来源渠道
        var sales = Common.SalesObjectStore.getInstance().get();
        //fix app 环境 sid 一直为8888的bug shzhang 2014.4.22
        if(!cUtility.isInApp()){
          if (sales && sales.sid) {
            head.sid = sales.sid;
          } else {
            head.sid = '8888';
          }
        }
        if (userinfo && userinfo.Auth) {
          head.auth = userinfo.Auth;
        } else {
          head.auth = '';
        }
        this.set(head);
        return head;
      }
    },
    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层Class的initialize，赋值队列
     */
    initialize:    function ($super, options) {
      $super(options);
    },

    /**
     * @method setAuth
     * @param auth 用户auth
     * @description 设置head中的auth字段
     */
    setAuth: function (auth) {
      var userInfo = Common.UserStore.getInstance();
      userInfo.setAuth(auth);
      this.setAttr('auth', auth);
    }
  });

  //分销联盟Store
  Common.UnionStore = new cBase.Class(cLocalStore, {
    __propertys__: function () {
      this.key = 'UNION';
      this.lifeTime = '7D';
      this.store = cLocalStorage.localStorage;
    },
    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层Class的initialize，赋值队列
     */
    initialize:    function ($super, options) {
      $super(options);
    },

    /**
     * @method get
     * @returns {*|data|s.data|_attributes.scroll.data|param.data|obj.data}
     * @description 返回分销联盟数据
     */
    get: function () {
      var data = this.store.oldGet(this.key);
      return data && data.data || null;
    },

    /**
     * @method set
     * @param {Object} data 数据值
     * @param {CDate} [optional] timeout 超时时间
     * @description 设置超时时间
     */
    set:  function (data, timeout) {
      //fix 分销联盟时间超时时间保持不准确的bug shbzhang 2014/1/7
      if (!timeout) {
        timeout = new cBase.Date(cUtility.getServerDate())
        timeout.addSeconds(this._getLifeTime());
      }
      //timeout = timeout ? new cBase.Date(timeout) : new cBase.Date(cUtility.getServerDate()).addDay(7);
      var json = {
        data:    data,
        timeout: timeout.format('Y/m/d H:i:s')
      };

      this.store.oldSet(this.key, JSON.stringify(json));
    }
  });

  /**
   * @class SalesStore
   * @description 保存渠道参数Store
   */
  Common.SalesStore = new cBase.Class(cLocalStore, {
    __propertys__: function () {
      this.key = 'SALES';
      this.lifeTime = '30D';
      this.store = cLocalStorage.localStorage;
    },
    initialize:    function ($super, options) {
      $super(options);
    },

    /**
     * @method get
     * @returns {Object|*|data|s.data|_attributes.scroll.data|param.data}
     * @description 返回Store中保存的数据
     */
    get: function () {
      var data = this.store.oldGet(this.key);
      return data && data.data || null;
    },

    /**
     * @method set
     * @param {Object} data 数据对象
     * @param timeout [optional] timeout 超时时间
     * @description 设置超时时间
     */
    set: function (data, timeout) {
      //fix 分销联盟时间超时时间保持不准确的bug shbzhang 2014/1/7
      if (!timeout) {
        timeout = new cBase.Date(cUtility.getServerDate())
        timeout.addSeconds(this._getLifeTime());
      }
      // timeout = timeout ? new cBase.Date(timeout) : new cBase.Date(cUtility.getServerDate()).addDay(3);
      var json = {
        data:    data,
        timeout: timeout.format('Y/m/d H:i:s')
      };
      this.store.oldSet(this.key, JSON.stringify(json));
    }
  });

  /**
   * @class SalesObjectStore
   * @description   渠道信息Store
   */
  Common.SalesObjectStore = new cBase.Class(cLocalStore, {
    __propertys__: function () {
      this.key = 'SALES_OBJECT';
      this.lifeTime = '30D';
    },
    initialize:    function ($super, options) {
      $super(options);
    }
  });
  Common.UnionStore.getInstance = Common.SalesStore.getInstance = cBase.getInstance;
  return Common;
});
/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com> / ghj龚汉金 <hjgong@Ctrip.com>
 * @class cLog
 * @description 提供App在手机端的后门
 * @comment 需要zsb与新代码再核对一遍
 */
define('cLog',['cUtilityServertime'], function (cUtility) {

  /** 声明cLog命名空间 */
  var cLog = {
    serverTime:    cUtility.getServerDate().getTime(),    
    event:         {
      DOMREADY:  'JS.Lizard.Domready',
      ONLOAD:    'JS.Lizard.OnLoad',
      AJAXREADY: 'JS.Lizard.AjaxReady'
    }
  };

  /**
   * @method cLog.restlog
   * @param {string} name log的key名称
   * @param {string} param 具体写入log的信息
   * @description 重置Log
   */
  cLog.applog = cLog.appLog = function (name, param) {

  };

  /**
   * onDomReady,标记为页面第一次渲染后执行,在view.onCreate方法完成时调用
   */
  cLog.onDomReady = function (sTime) {
    this.sendCommonTrack(this.event.DOMREADY, sTime);
  };

  /**
   * onLoad,数据取回,模板渲染完毕后执行, 在view.turning方法前调用
   */
  cLog.onLoad = function (sTime) {
    this.sendCommonTrack(this.event.ONLOAD, sTime);
  };

  /**
   * ajax 请求时间统计
   * @param url 请求url
   * @param sTime 请求开始时间
   * @param eTime 请求结束时间
   * @constructor
   */
  cLog.ajaxReady = function (url, sTime, eTime) {
    if (!eTime) {
      eTime = this.getNow();
    }
    var ts = eTime - sTime;
    var param = this._createExtParam();
    param.url = url;
    param.distribution = this._chooseTimeZone(ts);
    this.sendTrack(this.event.AJAXREADY, param, ts);
  };

  /**
   * 通用事件
   * @param eventName
   * @param sTime
   */
  cLog.sendCommonTrack = function (eventName, sTime) {
    var t1 = sTime ? sTime : this.localTime;
    var t2 = this.getNow();
    var param = this._createExtParam();
    this.sendTrack(eventName, param, t2 - t1);
  };
  /**
   * 发送ubt的性能统计
   * @param name
   * @param extParam
   * @param time
   */
  cLog.sendTrack = function (name, extParam, time) {
    if (!window.__bfi) {
      window.__bfi = [];
    }
    //计算出服务器当前时间
    var ts = this.serverTime + (this.getNow() - this.localTime);
    console.log(name+":"+time +",ts:"+ts);
    window.__bfi.push(['_trackMatrix', name, extParam, time, ts])
  };

  /**
   * 生成ubt的参数
   * @param name
   * @param time
   * @private
   */
  cLog._createExtParam = function (name, time) {
    var tag = {
      "version": "1.1"
    }
    return tag;
  },

  /**
   * 返回当前时间的毫秒值
   */
    cLog.getNow = function () {
      return  new Date().getTime();
    },

  /**
   * 返回日期区间
   */
    cLog._chooseTimeZone = function (time) {
      var zone = "[2000,--]"
      if (time >= 2000) {
        zone = "[2000,--]";
      } else if (time >= 1000) {
        zone = "[1000,2000]";
      } else if (time >= 500) {
        zone = "[500,1000]";
      } else if (time >= 250) {
        zone = "[250,500]";
      } else if (time >= 0) {
        zone = "[0,250]";
      }
      return zone;
    }
   
  cLog.localTime = ((typeof __SERVERDATE__ != 'undefined')&&__SERVERDATE__.local) ? __SERVERDATE__.local.getTime() : cLog.getNow();
  
  return cLog;

});
/*
* C.Ajax module,
* File:c.ajax.js
* Project: Ctrip H5
* Author: shbzhang@ctrip.com
* Date: 2013年6月23日
*/
define('cAjax',['libs','cLog'], function (libs,cLog) {

  var contentTypeMap = {
    'json': 'application/json; charset=utf-8',
    'jsonp': 'application/json'
  };

  var _getContentType = function (contentType) {
    if (contentType) contentType = contentTypeMap[contentType] ? contentTypeMap[contentType] : contentType;
    return contentType;
  };

  var ajax = (function ($) {
    /**
    * AJAX GET方式访问接口
    */
    function get(url, data, callback, error) {
      var opt = _getCommonOpt(url, data, callback, error);
      opt.type = 'GET';
      return _sendReq(opt);
    };

    /**
    * AJAX POST方式访问接口
    */
    function post(url, data, callback, error) {
      var contentType = data.contentType;
      // data = JSON.stringify(data);
      data = JSON.stringify(data);
      var opt = _getCommonOpt(url, data, callback, error);
      opt.type = 'POST';
      opt.dataType = 'json';
      opt.timeout = 30000;
      opt.contentType = _getContentType(contentType) || 'application/json';
      return _sendReq(opt);
    };

    /**
    * 以GET方式跨域访问外部接口
    */
    function jsonp(url, data, callback, error) {
      var opt = _getCommonOpt(url, data, callback, error);
      opt.type = 'GET';
      opt.dataType = 'jsonp';
      opt.crossDomain = true;
      return _sendReq(opt);
    };

    /**
    * 以POST方法跨域访问外部接口
    */
    function cros(url, type, data, callback, error) {
      var contentType = data.contentType;

      if (type.toLowerCase() !== 'get')
      // data = JSON.stringify(data);
        data = JSON.stringify(data);
      var opt = _getCommonOpt(url, data, callback, error);
      opt.type = type;
      opt.dataType = 'json';
      opt.crossDomain = true;
      opt.data = data;
      opt.contentType = _getContentType(contentType) || 'application/json';
      /* if (window.XDomainRequest) {
      return _iecros(opt);
      } else {*/
      return _sendReq(opt);
      //}
    };

    /**
    * AJAX 提交表单,不能跨域
    * param {url} url
    * param {Object} form 可以是dom对象，dom id 或者jquery 对象
    * param {function} callback
    * param {function} error 可选
    */
    function form(url, form, callback, error) {
      var jdom = null, data = '';
      if (typeof form == 'string') {
        jdom = $('#' + form);
      } else {
        jdom = $(form);
      }
      if (jdom && jdom.length > 0) {
        data = jdom.serialize();
      }
      var opt = _getCommonOpt(url, data, callback, error);
      return _sendReq(opt);
    };

    function _sendReq(opt) {
      var sTime = new Date().getTime();
      var obj = {
        url: opt.url,
        type: opt.type,
        dataType: opt.dataType,
        data: opt.data,
        contentType: opt.contentType,
        timeout: opt.timeout || 50000,
        success: function (res) {
          cLog.ajaxReady(opt.url,sTime);
          opt.callback(res);
        },
        error: function (err) {
          cLog.ajaxReady(opt.url,sTime)
          opt.error && opt.error(err);
        }
      };
      //是否是跨域则加上这条
      if (opt.url.indexOf(window.location.host) === -1) obj.crossDomain = !!opt.crossDomain;
      return $.ajax(obj);
    };

    /**
    * ie 调用 crors
    */
    function _iecros(opt) {
      if (window.XDomainRequest) {
        var xdr = new XDomainRequest();
        if (xdr) {
          if (opt.error && typeof opt.error == "function") {
            xdr.onerror = function () {
              opt.error(); ;
            };
          }
          //handle timeout callback function
          if (opt.timeout && typeof opt.timeout == "function") {
            xdr.ontimeout = function () {
              opt.timeout();
            };
          }
          //handle success callback function
          if (opt.success && typeof opt.success == "function") {
            xdr.onload = function () {
              if (opt.dataType) {//handle json formart data
                if (opt.dataType.toLowerCase() == "json") {
                  opt.callback(JSON.parse(xdr.responseText));
                }
              } else {
                opt.callback(xdr.responseText);
              }
            };
          }

          //wrap param to send
          var data = "";
          if (opt.type == "POST") {
            data = opt.data;
          } else {
            data = $.param(opt.data);
          }
          xdr.open(opt.type, opt.url);
          xdr.send(data);
        }
      }
    };

    function _getCommonOpt(url, data, callback, error) {
      return {
        url: url,
        data: data,
        callback: callback,
        error: error
      }
    };

    return {
      get: get,
      post: post,
      jsonp: jsonp,
      cros: cros,
      form: form
    }
  })($);

  return ajax;
});
/**
*	AbstractModel abstract class
*	File:	c.Model.js
*	Author:	ouxingzhi@vip.qq.com
*	Date:	2013/6/23
* update: l_wang
* Date: 2013/12/25(OD快快好来，祝圣诞快乐)
*/
define('cAbstractModel',['libs', 'cBase', 'cAjax', 'cLog'], function (libs, cBase, cAjax, cLog) {
  var AbstractModel = new cBase.Class({
    __propertys__: function () {
      /* 子类需要复写的字段 */
      /**
      * {String} 必填，数据读取url
      */
      this.url = null;
      /**
      * {Object|Store} 必选，用于存贮请求参数
      */
      this.param = null;

      /**
      * {Function} 可选，数据返回时的自定义格式化函数
      */
      this.dataformat = null;

      /**
      * {Function} 可选，存放用于验证的函数集合
      */
      this.validates = [];

      // 加入debug模式
      this.debug = false;

      /**
      * {String} 可覆盖，通讯协议
      */
      this.protocol = 'http';

      //      {Boolean} 可选，只通过ajax获取数据
      //      this.ajaxOnly = false;

      /**
      * {String} 可选，提交数据格式
      */
      this.contentType = AbstractModel.CONTENT_TYPE_JSON;
      /**
      * {String} 可选， 提交数据的方法
      */
      this.method = 'POST';

      //当前的ajax对象
      this.ajax;
      //是否主动取消当前ajax
      this.isAbort = false;

      //参数设置函数
      this.onBeforeCompleteCallback = null;
    },

    initialize: function (options) {
      this.assert();
      for (var key in options) {
        this[key] = options[key];
      }
    },
    assert: function () {
      if (this.url === null) {
        throw 'not override url property';
      }
      if (this.param === null) {
        throw 'not override param property';
      }
    },

    pushValidates: function (handler) {
      if (typeof handler === 'function') {
        this.validates.push($.proxy(handler, this));
      }
    },

    /**
    *	设置提交参数
    *	@param {String} param 提交参数
    *	@return void
    */
    setParam: function (key, val) {
      if (typeof key === 'object' && !val) {
        this.param = key;
      } else {
        this.param[key] = val;
      }
    },

    /**
    *	获得提交
    *	@param void
    *	@return {Object} 返回一个Object
    */
    getParam: function () {
      return this.param;
    },

    //构建url请求方式，子类可复写，我们的model如果localstorage设置了值便直接读取，但是得是非正式环境
    buildurl: function () {
      //      var baseurl = AbstractModel.baseurl(this.protocol);
      //      return this.protocol + '://' + baseurl.domain + '/' + baseurl.path + (typeof this.url === 'function' ? this.url() : this.url);
      throw "[ERROR]abstract method:buildurl, must be override";

    },

    //    baseurl: function () {
    //      // @description baseurl必须被复写，同时返回的对象应为
    //      // { domain: '', path: ''}
    //      throw "[ERROR]abstract method:baseurl, must be override";
    //    },

    /**
    *	取model数据
    *	@param {Function} onComplete 取完的回调函
    *	传入的第一个参数为model的数第二个数据为元数据，元数据为ajax下发时的ServerCode,Message等数
    *	@param {Function} onError 发生错误时的回调
    *	@param {Boolean} ajaxOnly 可选，默认为false当为true时只使用ajax调取数据
    * @param {Boolean} scope 可选，设定回调函数this指向的对象
    * @param {Function} onAbort 可选，但取消时会调用的函数
    */
    execute: function (onComplete, onError, scope, onAbort, params) {

      // @description 定义是否需要退出ajax请求
      this.isAbort = false;

      // @description 请求数据的地址
      var url = this.buildurl();

      var self = this;

      var __onComplete = $.proxy(function (data) {
        //保存服务请求日志
       // cLog.serverLog(self.buildurl(), self.getParam(), data);

        if (this.validates && this.validates.length > 0) {

          // @description 开发者可以传入一组验证方法进行验证
          for (var i = 0, len = this.validates.length; i < len; i++) {
            if (!this.validates[i](data)) {

              // @description 如果一个验证不通过就返回
              if (typeof onError === 'function') {
                return onError.call(scope || this, data);
              } else {
                return false;
              }
            }
          }
        }

        // @description 对获取的数据做字段映射
        var datamodel = typeof this.dataformat === 'function' ? this.dataformat(data) : data;

        if (typeof this.onBeforeCompleteCallback === 'function') {
          this.onBeforeCompleteCallback(datamodel);
        }

        if (typeof onComplete === 'function') {
          onComplete.call(scope || this, datamodel, data);
        }

      }, this);

      var __onError = $.proxy(function (e) {
        //保存服务请求日志
       // cLog.serverLog(self.buildurl(), self.getParam());
        if (self.isAbort) {
          self.isAbort = false;

          if (typeof onAbort === 'function') {
            return onAbort.call(scope || this, e);
          } else {
            return false;
          }
        }

        if (typeof onError === 'function') {
          onError.call(scope || this, e);
        }

      }, this);

      // @description 从this.param中获得数据，做深copy
      var params = params || _.clone(this.getParam() || {});

      //设置contentType无效BUG，改动一，将contentType保存
      params.contentType = this.contentType;

      if (this.contentType === AbstractModel.CONTENT_TYPE_JSON) {

        // @description 跨域请求
        return this.ajax = cAjax.cros(url, this.method, params, __onComplete, __onError);
      } else if (this.contentType === AbstractModel.CONTENT_TYPE_JSONP) {

        // @description jsonp的跨域请求
        return this.ajax = cAjax.jsonp(url, params, __onComplete, __onError);
      } else {

        // @description 默认post请求
        return this.ajax = cAjax.post(url, params, __onComplete, __onError);
      }
    },
    abort: function () {
      this.isAbort = true;
      this.ajax && this.ajax.abort && this.ajax.abort();
    }
  });
  /**
  * 获得model的实例
  */
  AbstractModel.getInstance = function () {
    if (this.instance instanceof this) {
      return this.instance;
    } else {
      return this.instance = new this;
    }
  };

  AbstractModel.baseurl = function () {
    // @description baseurl必须被复写，同时返回的对象应为
    // { domain: '', path: ''}
    throw "[ERROR]abstract method:baseurl, must be override";
  };

  /** ajax提交数据的格式，目前后面可能会有两种提交格式：json数据提交,form表单方式 **/
  AbstractModel.CONTENT_TYPE_JSON = 'json';
  AbstractModel.CONTENT_TYPE_FORM = 'form';
  AbstractModel.CONTENT_TYPE_JSONP = 'jsonp';
  return AbstractModel;
});



/**
*  AbstractModel abstract class
*  File:  c.Model.js
*  Author:  ouxingzhi@vip.qq.com
*  Date:  2013/6/23
*  update: l_wang(20131225)
*/
define('cModel',['libs', 'cBase', 'cStore', 'cUtility', 'CommonStore', 'cAbstractModel', 'cStorage'], function (libs, cBase, AbstractStore, cUtility, CommonStore, baseModel, cStorage) {
  var cObject = cUtility.Object;
  var AbstractModel = new cBase.Class(baseModel, {
    __propertys__: function() {
      /**
       * {Boolean} 可覆盖，提交参数是否加入head
       */
      this.usehead = true;
      //head数据
      this.head = CommonStore.HeadStore.getInstance();
      /**
       * {Store} 可选，
       */
      this.result = null;

      // @description 替代headstore信息的headinfo
      this.headinfo = null;

      // @param {Boolean} 可选，只通过ajax获取数据，不做localstorage数据缓存
      this.ajaxOnly = false;

      //@param {Boolean} 可选，是否是用户相关数据
      this.isUserData = false;

    },
    initialize: function($super, options) {
      $super(options);

      //不这样this.protocol写不进去，已经存在了就不管了
      if (!this.baseurl) this.baseurl = AbstractModel.baseurl.call(this, this.protocol);
    },

    setHead: function(head) {
      if (!head instanceof AbstractStore) {
        throw 'Set head is not a store';
      }
      this.head = head;
    },
    getHead: function() {
      return this.head;
    },

    /**
     *  获得参数存储器
     */
    getParamStore: function() {
      return this.param;
    },
    /**
     * 设置参数存取器
     */
    setParamStore: function(param) {
      if (typeof param !== 'object') throw 'Set param is not a store';
      this.param = param;
    },
    /**
     *  获得结果存储器
     */
    getResultStore: function() {
      return this.result;
    },

    //     @deprecated
    //     没有找到使用setResultStore方法的地方
    //
    //     设置结果存取器
    //    setResultStore: function (result) {
    //      if (typeof result !== 'object') throw 'Set result is not a store';
    //      this.result = result;
    //    },

    /**
     * 清空结果数据
     */
    clearResult: function() {
      if (this.result && typeof this.result.remove === 'function') {
        this.result.remove();
      }
    },

    /**
     * 重写父类
     *  设置提交参数
     *  @param {String} param 提交参数
     *  @return void
     */
    setParam: function(key, val) {
      var param = {};
      if (typeof key === 'object' && !val) {
        param = key;
      } else {
        param[key] = val;
      }
      for (var i in param) {
        if (this.param instanceof AbstractStore) {
          this.param.setAttr(i, param[i]);
        } else {
          cObject.set(this.param, i, param[i]);
        }
      }
    },

    //重写父类
    getParam: function() {
      return this.param instanceof AbstractStore ? this.param.get() : this.param;
    },


    buildurl: function() {
      var config = cStorage.localStorage.get("H5_CFG"),
        temp_requrl;
      if (config && config.path) {
        temp_requrl = config.path;
      }

      var baseurl = this.baseurl,
        tempArr = [];

      if (temp_requrl && !location.host.match(/^m\.ctrip\.com/i)) {

        if (this.protocol === "http") {
          tempArr = temp_requrl.http && temp_requrl.http.split("/")
        } else {
          tempArr = temp_requrl.https && temp_requrl.https.split("/")
        }

      }
      var tempUrl = this.protocol + '://' + (tempArr[0] || baseurl.domain) + '/' + (tempArr[1] || baseurl.path) + (typeof this.url === 'function' ? this.url() : this.url);

      return tempUrl;
    },

    getTag: function() {
      var params = _.clone(this.getParam() || {});
      if (this.isUserData && !params.cid) {
        var user = this.head.userStore;
        params.cid = user.getUserId();
      }
      return JSON.stringify(params);
    },
    /**
     *  取model数据
     *  @param {Function} onComplete 取完的回调函
     *  传入的第一个参数为model的数第二个数据为元数据，元数据为ajax下发时的ServerCode,Message等数
     *  @param {Function} onError 发生错误时的回调
     *  @param {Boolean} ajaxOnly 可选，默认为false当为true时只使用ajax调取数据
     *   @param {Boolean} scope 可选，设定回调函数this指向的对象
     *   @param {Function} onAbort 可选，但取消时会调用的函数
     */
    excute: function(onComplete, onError, ajaxOnly, scope, onAbort) {

      var params = _.clone(this.getParam() || {});

      //验证错误码，并且设置新的auth
      this.pushValidates(function(data) {
        var curhead = this.head.get();
        //兼容soa2.0 和 restful api
        var rsphead = this._getResponseHead(data);
        if (this.contentType !== AbstractModel.CONTENT_TYPE_JSONP && this.usehead && rsphead.auth && rsphead.auth !== curhead.auth) {
          this.head.setAuth(rsphead.auth);
        }
        return rsphead.success;
//        var head = data.head;
//        if (this.contentType !== AbstractModel.CONTENT_TYPE_JSONP && this.usehead && head.auth && head.auth !== curhead.auth) {
//          this.head.setAuth(head.auth);
//        }
//        if (head && head.errcode === 0) {
//          return true;
//        } else {
//          return false;
//        }



      });

      // @description 业务相关，获得localstorage的tag
      var tag = this.getTag();
      // @description 业务相关，从localstorage中获取上次请求的数据缓存
      var cache = this.result && this.result.get(tag);

      if (!cache || this.ajaxOnly || ajaxOnly) {

        if (this.method.toLowerCase() !== 'get' && this.usehead && this.contentType !== AbstractModel.CONTENT_TYPE_JSONP) {
          //          this.setParam('head', this.head.get())
          params.head = this.head.get();

        } else if (this.method.toLowerCase() !== 'get' && !this.usehead && this.contentType !== AbstractModel.CONTENT_TYPE_JSONP) {
          if (this.headinfo) {
            //            this.setParam('head', this.headinfo);
            params.head = this.headinfo;

          }
        }

        this.onBeforeCompleteCallback = function(datamodel) {
          if (this.result instanceof AbstractStore) {
            //soa 数据量大,为精简locastorage,去掉ResponseStatus部分 shbzhang 2014.4.17
            try{
//              if(datamodel.ResponseStatus){
//                delete datamodel.ResponseStatus;
//              }
            }catch(e){

            }
            this.result.set(datamodel, tag);
          }
        }
        this.execute(onComplete, onError, scope, onAbort, params)

      } else {
        if (typeof onComplete === 'function') {
          onComplete.call(scope || this, cache);
        }
      }

    },

    /**
     * 返回response head,兼容restful和SOA2
     * @param {Object} data 返回数据
     * @return {Object} head 格式为{'auth':'xxfe','success':true}
     * @private
     */
    _getResponseHead:function(data){
      var fromSOA = !!data.ResponseStatus;
      var head = fromSOA ? data.ResponseStatus: data.head,
          auth = "", success = false;
  
      if (fromSOA && head) {
        var ext = head.Extension;
          for(var i in ext){
            var item = ext[i];
            if(item.id == 'auth'){
              auth = item.value;
              break;
            }
          }
          success = head.Ack === 'Success' || head.Ack =='0';
      }else{
        auth =  head.auth;
        success = (head && head.errcode === 0);
      }
      return {
        'auth' : auth,
        'success': success
      };
    }

  });


  AbstractModel.baseurl = function(protocol) {
    var host = location.host;
    var domain = 'm.ctrip.com';
    var path = 'restapi';
    if (cUtility.isInApp()) {
      if (cUtility.isPreProduction() == '1') { // 定义堡垒环境
        if (protocol == "https") {
          domain = 'wpg.ctrip.com';
        } else {
          domain = '10.8.14.28:8080';
        }
      } else if (cUtility.isPreProduction() == '0') { // 定义测试环境
        if (protocol == "https") {
          domain = 'secure.fws.qa.nt.ctripcorp.com';
        } else {
          domain = 'm.fat19.qa.nt.ctripcorp.com';
        }
      } else if(cUtility.isPreProduction() == '2'){ //UAT环境
        if (protocol == "https") {
          domain = 'restful.m.uat.qa.ctripcorp.com';
        } else {
          domain = 'm.uat.qa.nt.ctripcorp.com';
        }
      }else{
        if (protocol == "https") {
          domain = 'wpg.ctrip.com';
        } else {
          domain = 'm.ctrip.com';
        }
      }
    } else if (host.match(/^m\.ctrip\.com/i) || host.match(/^secure\.ctrip\.com/i)) {
      if (AbstractModel.isHttps(protocol)) {
        domain = 'wpg.ctrip.com';
      } else {
        domain = 'm.ctrip.com';
      }
    } else if(host.match(/^m\.uat\.qa/i)){
      if (AbstractModel.isHttps(protocol)) {
        domain = 'restful.m.uat.qa.ctripcorp.com';
      } else {
        domain = 'm.uat.qa.nt.ctripcorp.com';
      }
    } else if (host.match(/^(localhost|172\.16|127\.0)/i)) {
      if (AbstractModel.isHttps(protocol)) {
        domain = 'secure.fws.qa.nt.ctripcorp.com';
      } else {
        domain = 'm.fat19.qa.nt.ctripcorp.com';
      }
    } else if (host.match(/^10\.8\.2\.111/i)) {
        domain = '10.8.14.28:8080';
    } else if(host.match(/^m.fat/i)){
      if (AbstractModel.isHttps(protocol)) {
        domain = 'secure.fws.qa.nt.ctripcorp.com';
      }else{
        domain = host;
      }
     }else {
      domain = 'm.ctrip.com';
    }
    return {
      'domain': domain,
      'path': path
    }
  };
  AbstractModel.isHttps = function (protocol) {
    return  location.protocol == "https" || protocol == "https";
  };
  return AbstractModel;
});
/**
 * @author cmli@ctrip.com / oxz欧新志 <ouxz@Ctrip.com>
 * @namespace UserModel
 */
define('cUserModel',['cBase', 'cModel', 'CommonStore'],
  function(cBase, cModel, CommonStore) {

    

    var UserStore = CommonStore.UserStore.getInstance();
    var HeadStore = CommonStore.HeadStore.getInstance();

    var UserModel = {};

    /**
     * @description 非会员登录
     * @author od
     * @class NotUserLoginModel
     * @construct
     */
    UserModel.NotUserLoginModel = new cBase.Class(cModel, {

      /**
       * @private
       * @method __propertys__
       * @returns void
       */
      __propertys__: function() {
        this.url = "/html5/Account/NonUserLogin";
        this.param = {};
        this.baseurl = cModel.baseurl.call(this);
        this._abortres = {};
        this.isAbort = false;
      },

      /**
       * @private
       * @method initialize
       * @param {function} $super
       * @param {object} options
       * @description 对象初始化工作
       * @returns void
       */
      initialize: function($super, options) {
        $super(options);
      },

      /**
       * @public
       * @method excute
       * @param {function} onComplete 取完的回调函
       * @param {function} onError 发生错误时的回调
       * @param {boolean} ajaxOnly 可选，默认为false当为true时只使用ajax调取数据
       * @param {boolean} scope 可选，设定回调函数this指向的对象
       * @param {function} onAbort 可选，但取消时会调用的函数
       * @description 向服务端做非会员登陆
       * @returns void
       */
      excute: function(onComplete, onError, ajaxOnly, scope, onAbort) {
        this.isAbort = false;
        var url = 'http://' + this.baseurl.domain + this.url;

        var successCallback = function(data) {
          if (data.ServerCode == 1 && data.Data) {
            UserStore.setUser(data.Data);

            if (typeof onComplete === 'function') {
              onComplete.call(scope, data);
            }
          } else {
            if (typeof onError === 'function') {
              onError.call(scope);
            }
          }
        };

        var errorCallback = function() {
          if (this.isAbort) {
            if (typeof onAbort === 'function') {
              onAbort.call(scope);
            }

            this.isAbort = false;
            return;
          }

          if (typeof onError === 'function') {
            onError.apply(scope, arguments);
          }
        };

        this._abortres = $.ajax({
          'type': 'get',
          'url': url,
          'dataType': 'json',
          'crossDomain': true,
          'success': $.proxy(successCallback, this),
          'error': $.proxy(errorCallback, this),
          'timeout': 25000
        });
      },

      /**
       * @public
       * @method abort
       * @returns void
       */
      abort: function() {
        this.isAbort = true;

        if (this._abortres && typeof this._abortres.abort === 'function') {
          this._abortres.abort();
        }
      }
    });


    /**
     * 用户登录model
     * @type {cBase.Class}
     */
    UserModel.UserLoginModel = new cBase.Class(cModel, {

      /**
       * @private
       * @method __propertys__
       * @returns void
       */
      __propertys__: function() {
        this.param = {};
        this.url = '10090/GetUserInfoToH5.json';
      },


      /**
       * @private
       * @method initialize
       * @param {function} $super
       * @param {object} options
       * @description 对象初始化工作
       * @returns void
       */
      initialize: function($super, options) {
        $super(options);
        this.baseurl = this.seturl();
      },

      seturl:function(){
        var host = window.location.host,
          path = 'restapi/soa2/',
          domain = "m.ctrip.com";
        if (host.match(/^m\.ctrip\.com/i)){
          domain = "m.ctrip.com";
        }else if (host.match(/^m\.uat\.qa/i)){
          domain = "gateway.m.uat.qa.nt.ctripcorp.com";
        }else if (host.match(/^m.fat/i)){
          domain = "gateway.m.fws.qa.nt.ctripcorp.com";
        }
        return {
          'domain': domain,
          'path': path
        }
      }
    });

    return UserModel;
  });
/**********************************
 * @author:     cmli@Ctrip.com
 * @description:  hybrid面板模板
 */
define('cHybridFacade',['libs', 'CommonStore', 'cUtility'], function (libs, CommonStore, cUtility) {

  var Facade = Facade || {};

  Facade.METHOD_ENTRY = 'METHOD_ENTRY';
  Facade.METHOD_MEMBER_LOGIN = 'METHOD_MEMBER_LOGIN';
  Facade.METHOD_NON_MEMBER_LOGIN = 'METHOD_NON_MEMBER_LOGIN';
  Facade.METHOD_AUTO_LOGIN = 'METHOD_AUTO_LOGIN';
  Facade.METHOD_LOCATE = 'METHOD_LOCATE';
  Facade.METHOD_REFRESH_NAV_BAR = 'METHOD_REFRESH_NAV_BAR';
  Facade.METHOD_CALL_PHONE = 'METHOD_CALL_PHONE';
  Facade.METHOD_BACK_TO_HOME = 'METHOD_BACK_TO_HOME';
  Facade.METHOD_BACK_TO_BOOK_CAR = 'METHOD_BACK_TO_BOOK_CAR';
  Facade.METHOD_BACK = 'METHOD_BACK';
  Facade.METHOD_COMMIT = 'METHOD_COMMIT';
  Facade.METHOD_CITY_CHOOSE = 'METHOD_CITY_CHOOSE';
  Facade.METHOD_REGISTER = 'METHOD_REGISTER';
  Facade.METHOD_LOG_EVENT = 'METHOD_LOG_EVENT';
  Facade.METHOD_INIT = 'METHOD_INIT';
  Facade.METHOD_CALL_SERVICE_CENTER = 'METHOD_CALL_SERVICE_CENTER';
  Facade.METHOD_BACK_TO_LAST_PAGE = 'METHOD_BACK_TO_LAST_PAGE';
  Facade.METHOD_GO_TO_BOOK_CAR_FINISHED_PAGE = 'METHOD_GO_TO_BOOK_CAR_FINISHED_PAGE';
  Facade.METHOD_GO_TO_HOTEL_DETAIL = 'METHOD_GO_TO_HOTEL_DETAIL';
  Facade.METHOD_OPEN_URL = 'METHOD_OPEN_URL';
  Facade.METHOD_CHECK_UPDATE = 'METHOD_CHECK_UPDATE';
  Facade.METHOD_RECOMMEND_APP_TO_FRIEND = 'METHOD_RECOMMEND_APP_TO_FRIEND';
  Facade.METHOD_ADD_WEIXIN_FRIEND = 'METHOD_ADD_WEIXIN_FRIEND';
  Facade.METHOD_SHOW_NEWEST_INTRODUCTION = 'METHOD_SHOW_NEWEST_INTRODUCTION';
  Facade.METHOD_BECOME_ACTIVE = 'METHOD_BECOME_ACTIVE';
  Facade.METHOD_WEB_VIEW_FINISHED_LOAD = 'METHOD_WEB_VIEW_FINISHED_LOAD';
  Facade.METHOD_CROSS_DOMAIN_HREF = 'METHOD_CROSS_DOMAIN_HREF';
  Facade.METHOD_CHECK_APP_INSTALL = 'METHOD_CHECK_APP_INSTALL';
  Facade.METHOD_CROSS_JUMP = 'METHOD_CROSS_JUMP';
  Facade.METHOD_REFRESH_NATIVE = 'METHOD_REFRESH_NATIVE';
  Facade.METHOD_H5_NEED_REFRESH = 'METHOD_H5_NEED_REFRESH';
  Facade.METHOD_READ_FROM_CLIPBOARD = 'METHOD_READ_FROM_CLIPBOARD';
  Facade.METHOD_COPY_TO_CLIPBOARD = 'METHOD_COPY_TO_CLIPBOARD';
  Facade.METHOD_SHARE_TO_VENDOR = 'METHOD_SHARE_TO_VENDOR';
  Facade.METHOD_DOWNLOAD_DATA = 'METHOD_DOWNLOAD_DATA';
  Facade.METHOD_NATIVE_LOG = 'METHOD_NATIVE_LOG';
  Facade.METHOD_SEND_H5_PIPE_REQUEST = 'METHOD_SEND_H5_PIPE_REQUEST';
  Facade.METHOD_SEND_HTTP_PIPE_REQUEST = 'METHOD_SEND_HTTP_PIPE_REQUEST';
  Facade.METHOD_CHECK_PAY_APP_INSTALL_STATUS = 'METHOD_CHECK_PAY_APP_INSTALL_STATUS';
  Facade.METHOD_OPEN_PAY_APP_BY_URL = 'METHOD_OPEN_PAY_APP_BY_URL';
  Facade.METHOD_SET_NAVBAR_HIDDEN = 'METHOD_SET_NAVBAR_HIDDEN';
  Facade.METHOD_SET_TOOLBAR_HIDDEN = 'METHOD_SET_TOOLBAR_HIDDEN';
  Facade.METHOD_CHECK_FILE_EXIST = 'METHOD_CHECK_FILE_EXIST';
  Facade.METHOD_DELETE_FILE = 'METHOD_DELETE_FILE';
  Facade.METHOD_GET_CURRENT_SANDBOX_NAME = 'METHOD_GET_CURRENT_SANDBOX_NAME';
  Facade.METHOD_GET_FILE_SIZE = 'METHOD_GET_FILE_SIZE';
  Facade.METHOD_MAKE_DIR = 'METHOD_MAKE_DIR';
  Facade.METHOD_READ_TEXT_FROM_FILE = 'METHOD_READ_TEXT_FROM_FILE';
  Facade.METHOD_WRITE_TEXT_TO_FILE = 'METHOD_WRITE_TEXT_TO_FILE';
  Facade.METHOD_ABORT_HTTP_PIPE_REQUEST = 'METHOD_ABORT_HTTP_PIPE_REQUEST';
  Facade.METHOD_OPEN_ADV_PAGE = 'METHOD_OPEN_ADV_PAGE';
  Facade.METHOD_WEB_VEW_DID_APPEAR = 'METHOD_WEB_VEW_DID_APPEAR';
  Facade.METHOD_SHOW_MAP = 'METHOD_SHOW_MAP';
  Facade.METHOD_ENCRYPT_BASE64 = 'METHOD_ENCRYPT_BASE64';
  Facade.METHOD_ENCRYPT_CTRIP = 'METHOD_ENCRYPT_CTRIP';
  Facade.METHOD_APP_CHOOSE_INVOICE_TITLE = 'METHOD_APP_CHOOSE_INVOICE_TITLE';
  Facade.METHOD_APP_GET_DEVICE_INFO = 'METHOD_APP_GET_DEVICE_INFO';
  Facade.METHOD_APP_SHOW_VOICE_SEARCH = 'METHOD_APP_SHOW_VOICE_SEARCH';
  Facade.METHOD_APP_CHOOSE_PHOTO = 'METHOD_APP_CHOOSE_PHOTO';
  Facade.METHOD_APP_FINISHED_REGISTER = 'METHOD_APP_FINISHED_REGISTER';
  Facade.METHOD_APP_CALL_SYSTEM_SHARE = 'METHOD_APP_CALL_SYSTEM_SHARE';
  Facade.METHOD_FAVORITE = 'METHOD_FAVORITE';
  Facade.METHOD_FAVORITED = 'METHOD_FAVORITED';
  Facade.METHOD_SHARE = 'METHOD_SHARE';
  Facade.METHOD_APP_CHECK_NETWORK_STATUS = 'METHOD_APP_CHECK_NETWORK_STATUS';
  Facade.METHOD_APP_NETWORK_DID_CHANGED = 'METHOD_APP_NETWORK_DID_CHANGED';
  Facade.METHOD_APP_CHECK_ANDROID_PACKAGE_INFO = 'METHOD_APP_CHECK_ANDROID_PACKAGE_INFO';
  Facade.METHOD_APP_LOG_GOOGLE_REMARKTING = 'METHOD_APP_LOG_GOOGLE_REMARKTING';
  Facade.METHOD_APP_READ_VERIFICATION_CODE_FROM_SMS = 'METHOD_APP_READ_VERIFICATION_CODE_FROM_SMS';
  Facade.METHOD_APP_SHOW_MAP_WITH_POI_LIST = 'METHOD_APP_SHOW_MAP_WITH_POI_LIST';
  Facade.METHOD_APP_FINISHED_LOGIN = 'METHOD_APP_FINISHED_LOGIN';
  Facade.METHOD_PHONE = 'METHOD_PHONE';

  var METHOD_ENTRY = 'h5_init_finished';
  var METHOD_MEMBER_LOGIN = 'member_login';
  var METHOD_NON_MEMBER_LOGIN = 'non_member_login';
  var METHOD_AUTO_LOGIN = 'member_auto_login';
  var METHOD_LOCATE = 'locate';
  var METHOD_REFRESH_NAV_BAR = 'refresh_nav_bar';
  var METHOD_BACK = 'back';
  var METHOD_COMMIT = 'commit';
  var METHOD_CITY_CHOOSE = 'cityChoose';
  var METHOD_REGISTER = 'member_register';
  var METHOD_INIT = 'init_member_H5_info';
  var METHOD_BECOME_ACTIVE = 'become_active';
  var METHOD_WEB_VIEW_FINISHED_LOAD = 'web_view_finished_load';
  var METHOD_CHECK_APP_INSTALL = 'check_app_install_status';
  var METHOD_H5_NEED_REFRESH = 'app_h5_need_refresh';
  var METHOD_READ_FROM_CLIPBOARD = 'read_copied_string_from_clipboard';
  var METHOD_DOWNLOAD_DATA = 'download_data';
  var METHOD_SEND_H5_PIPE_REQUEST = 'send_h5_pipe_request';
  var METHOD_SEND_HTTP_PIPE_REQUEST = 'send_http_pipe_request';
  var METHOD_CHECK_PAY_APP_INSTALL_STATUS = 'check_pay_app_install_status';
  var METHOD_CHECK_FILE_EXIST = 'check_file_exist';
  var METHOD_DELETE_FILE = 'delete_file';
  var METHOD_GET_CURRENT_SANDBOX_NAME = 'get_current_sandbox_name';
  var METHOD_GET_FILE_SIZE = 'get_file_size';
  var METHOD_MAKE_DIR = "make_dir"; // @notation 没有定义，需要2014.3.13重新确认
  var METHOD_READ_TEXT_FROM_FILE = 'read_text_from_file';
  var METHOD_WRITE_TEXT_TO_FILE = 'write_text_to_file';
  var METHOD_WEB_VEW_DID_APPEAR = 'web_view_did_appear';
  var METHOD_ENCRYPT_BASE64 = 'base64_encode';
  var METHOD_ENCRYPT_CTRIP = 'ctrip_encrypt';
  var METHOD_APP_CHOOSE_INVOICE_TITLE = 'choose_invoice_title';
  var METHOD_APP_GET_DEVICE_INFO = 'get_device_info';
  var METHOD_APP_CHOOSE_PHOTO = 'choose_photo';
  var METHOD_FAVORITE = 'favorite';
  var METHOD_FAVORITED = 'favorited';
  var METHOD_SHARE = 'share';
  var METHOD_APP_CHECK_NETWORK_STATUS = 'check_network_status';
  var METHOD_APP_NETWORK_DID_CHANGED = 'network_did_changed';
  var METHOD_APP_CHECK_ANDROID_PACKAGE_INFO = 'check_android_package_info';
  var METHOD_APP_LOG_GOOGLE_REMARKTING = 'log_google_remarkting';
  var METHOD_APP_READ_VERIFICATION_CODE_FROM_SMS = 'read_verification_code_from_sms';
  var METHOD_APP_SHOW_MAP_WITH_POI_LIST = 'show_map_with_POI_list';
  var METHOD_APP_FINISHED_LOGIN = 'finished_login';
  var METHOD_PHONE = 'phone';
  var isYouth = (cUtility.getAppSys() == 'youth');
  
  var appLock = false, defaultRegisterHandler = {}, defaultCallback = {}, defaultHandler = {};

  var loginMethods = [METHOD_NON_MEMBER_LOGIN, METHOD_MEMBER_LOGIN, METHOD_AUTO_LOGIN, METHOD_REGISTER, METHOD_INIT];
  for (var p in Facade) {
    if (p.indexOf('METHOD_') == 0) {
      try {
        defaultRegisterHandler[p] = function (options) {
          var methoName = eval(options.tagname);
          defaultCallback[methoName] = function (params) {
            if (params && typeof params === 'string') {
              params = JSON.parse(params);
            }

            if (_.indexOf(loginMethods, methoName) >= 0) {
              // fix auto_login 无callback 的bug shbzhang 2014/6/20
              if (params && params.data) {
                var userStore = CommonStore.UserStore.getInstance();
                var userInfo = userStore.getUser();
                userStore.setUser(params.data);

                var headStore = CommonStore.HeadStore.getInstance();
                var headInfo = headStore.get();
                headInfo.auth = params.data.Auth;
                headStore.set(headInfo);
              }

            }

            if (methoName == METHOD_INIT) {
              if (params && params.device) {
                var deviceInfo = {
                  device: params.device
                };
                window.localStorage.setItem('DEVICEINFO', JSON.stringify(deviceInfo));
              }

              // 设置AppInfo
              if (params && params.appId) {
                var appInfo = {
                  version:       params.version,
                  appId:         params.appId,
                  serverVersion: params.serverVersion,
                  platform:      params.platform
                };
                window.localStorage.setItem('APPINFO', JSON.stringify(appInfo));
              }

              if (params && params.timestamp) {
                window.localStorage.setItem('SERVERDATE', params.timestamp);
              }

              if (params && params.sourceId) {
                window.localStorage.setItem('SOURCEID', params.sourceId);
              }

              if (params && params.isPreProduction) {
                window.localStorage.setItem('isPreProduction', params.isPreProduction);
              }

            }

            if (methoName == METHOD_LOCATE) {
              try {
                options.success(params);
              } catch (e) {
                options.error(true, '定位失败');
              }
            }
            else if (options && typeof options.callback === 'function') {
              options.callback(params);
            }
          };

          defaultHandler[methoName] = function (options) {
            if (typeof defaultCallback[methoName] === 'function') {
              defaultCallback[methoName](options);
            }
          };
        }
      }
      catch (e) {
      }
    }
  }

  // 定义需要绑定在window上的方法
  var defaultFn = {
    callback: function (param) {
      if (appLock) return;

      var options = param;
      if (typeof (param) === "string") {
        try {
          options = JSON.parse(window.decodeURIComponent(param));
        } catch (e) {
          setTimeout(function () {
            console.error('参数错误');
          }, 0);
        }
      }

      // document.activeElement.blur();

      if (typeof defaultHandler[options.tagname] === 'function') {
        defaultHandler[options.tagname](options.param);
        return true;
      }
    }
  };

  var _registerFn = function (facade) {
    for (var key in defaultFn) {
      facade[key] = facade[key] || defaultFn[key];
    }
  };

  Facade.init = function () {
    var app = window.app = {};
    _registerFn(app);
  };

  Facade.register = function (options) {
    if (typeof defaultRegisterHandler[options.tagname] === 'function') {
      defaultRegisterHandler[options.tagname](options);
    }
  };

  Facade.unregister = function (name) {
    Facade.register({ tagname: name, callback: function () {
    } });
  };

  Facade.request = function (options) {

    var methods = {

      // 5.2支持初始化
      METHOD_INIT:  function (options) {
        Facade.register({ tagname: Facade.METHOD_INIT, callback: options.callback });
        CtripUtil.app_init_member_H5_info();
      },

      // 5.1支持初始化
      // @deprecated
      METHOD_ENTRY: function (options) {
        return;
        // Facade.register({tagname: Facade.METHOD_ENTRY, callback: options.callback});
        // CtripUtil.app_entry();
      },

      METHOD_MEMBER_LOGIN: function (options) {
        Facade.register({ tagname: Facade.METHOD_MEMBER_LOGIN, callback: options.callback });
        CtripUser.app_member_login(options.isShowNonMemberLogin);
      },

      METHOD_NON_MEMBER_LOGIN: function (options) {
        Facade.register({ tagname: Facade.METHOD_NON_MEMBER_LOGIN, callback: options.callback });
        CtripUser.app_non_member_login();
      },

      METHOD_AUTO_LOGIN: function (options) {
        Facade.register({ tagname: Facade.METHOD_AUTO_LOGIN, callback: options.callback });
        CtripUser.app_member_auto_login();
      },

      METHOD_REGISTER: function (options) {
        Facade.register({ tagname: Facade.ETHOD_REGISTER, callback: options.callback });
        CtripUser.app_member_register();
      },

      METHOD_LOCATE: function (options) {
        Facade.register({ tagname: Facade.METHOD_LOCATE, success: options.success, error: options.error });
        var async = true;
        if (options.isAsync) {
          async = options.isAsync;
        }
        CtripMap.app_locate(async);
      },

      METHOD_REFRESH_NAV_BAR: function (options) {
        // @deprecated
        // Facade.register({tagname: Facade.METHOD_REFRESH_NAV_BAR, callback: options.callback});
        // CtripUtil.app_refresh_nav_bar(options.config);

        CtripBar.app_refresh_nav_bar(options.config);
      },

      METHOD_CALL_PHONE: function (options) {
        CtripUtil.app_call_phone(options.tel);
      },

      METHOD_BACK_TO_HOME:     function (options) {
        CtripUtil.app_back_to_home();
      },

      // @deprecated
      METHOD_BACK_TO_BOOK_CAR: function (options) {
        app_back_to_book_car();
      },

      METHOD_LOG_EVENT: function (options) {
        CtripUtil.app_log_event(options.event_name);
      },

      METHOD_CALL_SERVICE_CENTER: function () {
        //CtripUtil.app_call_service_center();
        CtripUtil.app_call_phone();
      },

      METHOD_BACK_TO_LAST_PAGE: function (options) {
        var param = options.param || '';
        CtripUtil.app_back_to_last_page(param);
      },

      METHOD_GO_TO_BOOK_CAR_FINISHED_PAGE: function (options) {
        CtripUtil.app_go_to_book_car_finished_page(options.url);
      },

      METHOD_GO_TO_HOTEL_DETAIL: function (options) {
        CtripUtil.app_go_to_hotel_detail(options.hotelId, options.hotelName, options.cityId, options.isOverSea);
      },

      METHOD_OPEN_URL: function (options) {
        var title = options.title || '', pageName = options.pageName || '';
        CtripUtil.app_open_url(options.openUrl, options.targetMode, title, pageName);
      },

      METHOD_CHECK_UPDATE: function (options) {
        CtripUtil.app_check_update();
      },

      METHOD_RECOMMEND_APP_TO_FRIEND: function () {
        CtripUtil.app_recommend_app_to_friends();
      },

      METHOD_ADD_WEIXIN_FRIEND: function () {
        CtripUtil.app_add_weixin_friend();
      },

      METHOD_CROSS_DOMAIN_HREF: function (options) {
        CtripUtil.app_cross_domain_href(options.moduleType, options.anchor, options.param);
      },

      METHOD_SHOW_NEWEST_INTRODUCTION: function (options) {
        CtripUtil.app_show_newest_introduction();
      },

      METHOD_CHECK_APP_INSTALL: function (options) {
        Facade.register({ tagname: Facade.METHOD_CHECK_APP_INSTALL, callback: options.callback });
        CtripUtil.app_check_app_install_status(options.url, options.package);
      },

      METHOD_CROSS_JUMP: function (options) {
        CtripUtil.app_cross_package_href(options.path, options.param);
      },

      METHOD_REFRESH_NATIVE: function (options) {
        CtripUtil.app_refresh_native_page(options.package, options.json);
      },

      METHOD_READ_FROM_CLIPBOARD: function (options) {
        // callback(key{string})
        Facade.register({ tagname: Facade.METHOD_READ_FROM_CLIPBOARD, callback: options.callback });
        CtripUtil.app_read_copied_string_from_clipboard();
      },

      METHOD_COPY_TO_CLIPBOARD: function (options) {
        CtripUtil.app_copy_string_to_clipboard(options.content);
      },

      // @imageUrl    将要复制的文字
      // @text        需要分享的文字
      METHOD_SHARE_TO_VENDOR:   function (options) {
        //CtripUtil.app_share_to_third_party_platform(options.imgUrl, options.imgCode, options.text);
        var title = options.title || '', linkUrl = options.linkUrl || '', isIOSSystemShare = options.isIOSSystemShare || false;
        CtripUtil.app_call_system_share(options.imgUrl, options.text, title, linkUrl, isIOSSystemShare);
      },

      METHOD_DOWNLOAD_DATA: function (options) {
        Facade.register({ tagname: Facade.METHOD_DOWNLOAD_DATA, callback: options.callback });
        CtripUtil.app_download_data(options.url, options.suffix);
      },

      METHOD_NATIVE_LOG: function (options) {
        var sign = window.localStorage.getItem('isPreProduction');
        if (sign && sign !== '') {
          CtripTool.app_log('@[Wireless H5] ' + options.log, options.result);
        }
      },

      METHOD_SEND_H5_PIPE_REQUEST: function (options) {
        Facade.register({ tagname: Facade.METHOD_SEND_H5_PIPE_REQUEST, callback: options.callback });
        var pipeType = options.pipeType || '';
        CtripPipe.app_send_H5_pipe_request(options.serviceCode, options.header, options.data, options.sequenceId, pipeType);
      },

      METHOD_SEND_HTTP_PIPE_REQUEST: function (options) {
        Facade.register({ tagname: Facade.METHOD_SEND_HTTP_PIPE_REQUEST, callback: options.callback });
        CtripPipe.app_send_HTTP_pipe_request(options.target, options.methods, options.header, options.queryData, options.retryInfo, options.sequenceId);
      },

      METHOD_ABORT_HTTP_PIPE_REQUEST: function (options) {
        CtripPipe.app_abort_HTTP_pipe_request(options.sequenceId);
      },

      METHOD_CHECK_PAY_APP_INSTALL_STATUS: function (options) {
        Facade.register({ tagname: Facade.METHOD_CHECK_PAY_APP_INSTALL_STATUS, callback: options.callback });
        CtripPay.app_check_pay_app_install_status();
      },

      METHOD_OPEN_PAY_APP_BY_URL: function (options) {
        CtripPay.app_open_pay_app_by_url(options.payAppName, options.payURL, options.successRelativeURL, options.detailRelativeURL);
      },

      METHOD_SET_NAVBAR_HIDDEN: function (options) {
        CtripBar.app_set_navbar_hidden(options.isNeedHidden);
      },

      METHOD_SET_TOOLBAR_HIDDEN: function (options) {
        CtripBar.app_set_toolbar_hidden(options.isNeedHidden);
      },

      /**
       * @description 检查文件是否存在
       * @param options.tagname {string} 回调的Tagname
       * @param options.callback {function} 回调函数对象
       * @param options.fileName {string} 需要读取文件的文件名
       * @param options.relativeFilePath {string} 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
       */
      METHOD_CHECK_FILE_EXIST: function (options) {
        Facade.register({ tagname: Facade.METHOD_CHECK_FILE_EXIST, callback: options.callback });
        CtripFile.app_check_file_exist(options.fileName, options.relativeFilePath);
      },

      /**
       * @description 删除文件
       * @param options.tagname {string} 回调的Tagname
       * @param options.callback {function} 回调函数对象
       * @param options.fileName {string} 需要读取文件的文件名
       * @param options.relativeFilePath {string} 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
       */
      METHOD_DELETE_FILE: function (options) {
        Facade.register({ tagname: Facade.METHOD_DELETE_FILE, callback: options.callback });
        CtripFile.app_delete_file(options.fileName, options.relativeFilePath);
      },

      /**
       * @description 获取当前web页面的sandbox目录，在webapp/wb_cache/xxxx/目录下xxxx即为当前sandbox的名字
       * @param options.tagname {string} 回调的Tagname
       * @param options.callback {function} 回调函数对象
       */
      METHOD_GET_CURRENT_SANDBOX_NAME: function (options) {
        Facade.register({ tagname: Facade.METHOD_GET_CURRENT_SANDBOX_NAME, callback: options.callback });
        CtripFile.app_get_current_sandbox_name();
      },

      /**
       * @description 获取文件大小
       * @param options.tagname {string} 回调的Tagname
       * @param options.callback {function} 回调函数对象
       * @param options.fileName {string} 需要读取文件的文件名
       * @param options.relativeFilePath {string} 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
       */
      METHOD_GET_FILE_SIZE: function (options) {
        Facade.register({ tagname: Facade.METHOD_GET_FILE_SIZE, callback: callback });
        CtripFile.app_get_file_size(options.fileName, options.relativeFilePath);
      },


      /**
       * @description 创建文件夹。可以指定文件名，或者相对路径
       * @param options.tagname {string} 回调的Tagname
       * @param options.callback {function} 回调函数对象
       * @param options.dirname {string} 需要创建的文件夹路径
       * @param options.relativeFilePath {string} 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
       */
      METHOD_MAKE_DIR: function (options) {
        Facade.register({ tagname: Facade.METHOD_MAKE_DIR, callback: callback });
        CtripFile.app_make_dir(options.dirname, options.relativeFilePath);
      },

      /**
       * @description 读取文本文件内容，UTF-8编码。可以指定文件名，或者相对路径
       * @param options.tagname {string} 回调的Tagname
       * @param options.callback {function} 回调函数对象
       * @param options.fileName {string} 需要读取文件的文件名
       * @param options.relativeFilePath {string} 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
       */
      METHOD_READ_TEXT_FROM_FILE: function (options) {
        Facade.register({ tagname: Facade.METHOD_READ_TEXT_FROM_FILE, callback: callback });
        CtripFile.app_read_text_from_file(options.fileName, options.relativeFilePath);
      },

      /**
       * @description 写内容到文件
       * @param options.text {string} 写到文件的内容
       * @param options.filename {string} 需要写入文件的文件名
       * @param options.relativeFilePath {string } 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
       * @param options.isAppend {boolean} 是否是将当前文件append到已有文件
       */
      METHOD_WRITE_TEXT_TO_FILE: function (options) {
        Facade.register({ tagname: Facade.METHOD_WRITE_TEXT_TO_FILE, callback: callback });
        CtripFile.app_write_text_to_file(options.text, options.fileName, options.relativeFilePath, options.isAppend);
      },

      /**
       * @param options.url {string} "http://pages.ctrip.com/adv.html?title=标题xxx"
       */
      METHOD_OPEN_ADV_PAGE: function (options) {
        CtripUtil.app_open_adv_page(options.url);
      },

      /**
       * @description 写内容到文件
       * @param {double} options.latitude, 纬度2567.
       * @param {double} options.longitude, 经度2568.
       * @param {String} options.title, 在地图上显示的点的主标题2569.
       * @param {String} options.subtitle, 在地图上显示点的附标题
       */
      METHOD_SHOW_MAP: function (options) {
        CtripMap.app_show_map(options.latitude, options.longitude, options.title, options.subtitle);
      },

      /**
       * Base65 加密
       * @param options
       * @constructor
       */
      METHOD_ENCRYPT_BASE64: function (options) {
        Facade.register({ tagname: Facade.METHOD_ENCRYPT_BASE64, callback: options.callback });
        CtripEncrypt.app_base64_encode(options.info);
      },

      /**
       *  携程自有加解密方式
       * @param {String} options.inString 需要做加解密的字符串
       * @param {Number} option.enType,  加解密类型，加密为1， 解密为2，其它不处理
       * @param {Function} option.callback 回调
       * @constructor
       */
      METHOD_ENCRYPT_CTRIP: function (options) {
        Facade.register({ tagname: Facade.METHOD_ENCRYPT_CTRIP, callback: options.callback });
        CtripEncrypt.app_ctrip_encrypt(options.inString, options.encType);
      },

      /**
       *  携程自有加解密方式
       * @param {String} title String
       *当前已经选择好的发票title
       * @param {Function} option.callback 回调
       * @constructor
       */
      METHOD_APP_CHOOSE_INVOICE_TITLE: function (options) {
        Facade.register({ tagname: Facade.METHOD_APP_CHOOSE_INVOICE_TITLE, callback: options.callback });
        CtripBusiness.app_choose_invoice_title(options.title);
      },

      /**
       *获取设备相关信息
       */
      METHOD_APP_GET_DEVICE_INFO: function (options) {
        Facade.register({tagname: Facade.METHOD_APP_GET_DEVICE_INFO, callback: options.callback});
        CtripBusiness.app_get_device_info();
      },

      /**
       *  进入语音搜索,5.7版本，语音搜索之后的结果，不需要BU处理，只需调用即可，后续版本，可能只做语音解析，解析结果传递给H5，BU自行处理
       * @param {Integer} bussinessType  Integer
       * 业务类型(0. 无（默认）1. 机票 2. 酒店3 . 火车票 4. 团队游 5. 目的地 6. 攻略 7.景点门票 8.周末/短途游)
       * @constructor
       */
      METHOD_APP_SHOW_VOICE_SEARCH: function (options) {
        CtripBusiness.app_show_voice_search(options.bussinessType);
      },

      /**
       *选取图片/拍摄照片，base64返回图片
       *@param {Integer} maxFileSize  Integer 最大的图片文件大小，默认200KB
       *@param {Integer} maxPhotoCount  Integer 最多支持选择的图片个数,默认为1张，此时不显示多选
       *@constructor
       */
      METHOD_APP_CHOOSE_PHOTO: function (options) {
        Facade.register({tagname: Facade.METHOD_APP_CHOOSE_PHOTO, callback: options.callback});
        var maxFileSize = options.maxFileSize || 200, maxPhotoCount = options.maxPhotoCount || 1, meta = options.meta || {canEditSinglePhoto: false};
        CtripUtil.app_choose_photo(maxFileSize, maxPhotoCount, meta);
      },

      /**
       * H5完成注册，将注册信息告知Native
       * @param {JSON} userInfoJson JSON
       * @constructor
       */
      METHOD_APP_FINISHED_REGISTER: function (options) {
        CtripUser.app_finished_register(options.userInfo);
      },

      METHOD_APP_CALL_SYSTEM_SHARE: function (options) {
        CtripUtil.app_call_system_share(options.imageRelativePath, options.text, options.title, options.linkUrl, options.isIOSSystemShare);
      },
      
      METHOD_APP_CHECK_NETWORK_STATUS: function (options) {
        Facade.register({tagname: Facade.METHOD_APP_CHECK_NETWORK_STATUS, callback: options.callback});
        CtripUtil.app_check_network_status();
      },
      
      METHOD_APP_NETWORK_DID_CHANGED: function (options) {
        Facade.register({tagname: Facade.METHOD_APP_NETWORK_DID_CHANGED, callback: options.callback});
        CtripUtil.app_network_did_changed();
      },
      
      METHOD_APP_CHECK_ANDROID_PACKAGE_INFO: function (options) {
        Facade.register({tagname: Facade.METHOD_APP_CHECK_ANDROID_PACKAGE_INFO, callback: options.callback});
        CtripBusiness.app_check_android_package_info();
      },
       
      METHOD_APP_LOG_GOOGLE_REMARKTING: function (url) {
        CtripBusiness.app_log_google_remarkting(url||window.location.href);
      },
      
      METHOD_APP_READ_VERIFICATION_CODE_FROM_SMS: function (options) {
        Facade.register({tagname: Facade.METHOD_APP_READ_VERIFICATION_CODE_FROM_SMS, callback: options.callback});
        CtripBusiness.app_read_verification_code_from_sms();
      },

      METHOD_APP_SHOW_MAP_WITH_POI_LIST: function (options) {
        CtripMap.app_show_map(options.poiList)
      },
      
      METHOD_APP_FINISHED_LOGIN: function (options) {
        Facade.register({tagname: Facade.METHOD_APP_FINISHED_LOGIN, callback: options.callback});
        CtripUser.app_finished_login(options.userInfo)
      }       
    };

    methods[options.name](options);
  };

  Facade.getOpenUrl = function (options) {

    //var head = 'ctrip://wireless/'+ options.module+'?';
    var schema = isYouth ? 'ctripyouth' : 'ctrip';
    var url = schema + '://wireless/' + options.module + '?';

    // 对参数进行拼接，拼接成url
    _.each(options.param, function (value, key, list) {
      url += (key + '=' + value + '&');
    });

    // 去掉最后一个&
    if (url[url.length - 1] === '&') {
      url = url.slice(0, url.length - 1);
    }

    //window.location.href = head;
    return url;
  };

  return Facade;

});

/*
 * $Id: base64.js,v 2.12 2013/05/06 07:54:20 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *    http://opensource.org/licenses/mit-license
 *
 *  References:
 *    https://github.com/leewind/js-base64
 *    http://en.wikipedia.org/wiki/Base64
 */

define('cUtilityCrypt',[], function(){
  

  var Crypt = {};

//  if (typeof window.btoa === 'function' && typeof window.atob === 'function') {
//    Crypt.Base64 = {
//      encode: window.btoa,
//      decode: window.atob
//    };

//    return Crypt;
//  }

  // existing version for noConflict()
  var _Base64 = Crypt.Base64;
  var version = "2.1.4";
  // if node.js, we use Buffer
  var buffer;
  if (typeof module !== 'undefined' && module.exports) {
    buffer = require('buffer').Buffer;
  }
  // constants
  var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var b64tab = function(bin) {
    var t = {};
    for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
    return t;
  }(b64chars);
  var fromCharCode = String.fromCharCode;
  // encoder stuff
  var cb_utob = function(c) {
    if (c.length < 2) {
      var cc = c.charCodeAt(0);
      return cc < 0x80 ? c : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6)) + fromCharCode(0x80 | (cc & 0x3f))) : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | (cc & 0x3f)));
    } else {
      var cc = 0x10000 + (c.charCodeAt(0) - 0xD800) * 0x400 + (c.charCodeAt(1) - 0xDC00);
      return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) + fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | (cc & 0x3f)));
    }
  };
  var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
  var utob = function(u) {
    return u.replace(re_utob, cb_utob);
  };
  var cb_encode = function(ccc) {
    var padlen = [0, 2, 1][ccc.length % 3],
      ord = ccc.charCodeAt(0) << 16 | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
      chars = [
        b64chars.charAt(ord >>> 18),
        b64chars.charAt((ord >>> 12) & 63),
        padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
        padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
      ];
    return chars.join('');
  };
  var btoa = Crypt.btoa ? function(b) {
      return Crypt.btoa(b);
    } : function(b) {
      return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
  var _encode = buffer ? function(u) {
      return (new buffer(u)).toString('base64')
    } : function(u) {
      return btoa(utob(u))
    };
  var encode = function(u, urisafe) {
    return !urisafe ? _encode(u) : _encode(u).replace(/[+\/]/g, function(m0) {
      return m0 == '+' ? '-' : '_';
    }).replace(/=/g, '');
  };
  var encodeURI = function(u) {
    return encode(u, true)
  };
  // decoder stuff
  var re_btou = new RegExp([
    '[\xC0-\xDF][\x80-\xBF]',
    '[\xE0-\xEF][\x80-\xBF]{2}',
    '[\xF0-\xF7][\x80-\xBF]{3}'
  ].join('|'), 'g');
  var cb_btou = function(cccc) {
    switch (cccc.length) {
      case 4:
        var cp = ((0x07 & cccc.charCodeAt(0)) << 18) | ((0x3f & cccc.charCodeAt(1)) << 12) | ((0x3f & cccc.charCodeAt(2)) << 6) | (0x3f & cccc.charCodeAt(3)),
          offset = cp - 0x10000;
        return (fromCharCode((offset >>> 10) + 0xD800) + fromCharCode((offset & 0x3FF) + 0xDC00));
      case 3:
        return fromCharCode(
          ((0x0f & cccc.charCodeAt(0)) << 12) | ((0x3f & cccc.charCodeAt(1)) << 6) | (0x3f & cccc.charCodeAt(2))
        );
      default:
        return fromCharCode(
          ((0x1f & cccc.charCodeAt(0)) << 6) | (0x3f & cccc.charCodeAt(1))
        );
    }
  };
  var btou = function(b) {
    return b.replace(re_btou, cb_btou);
  };
  var cb_decode = function(cccc) {
    var len = cccc.length,
      padlen = len % 4,
      n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) | (len > 3 ? b64tab[cccc.charAt(3)] : 0),
      chars = [
        fromCharCode(n >>> 16),
        fromCharCode((n >>> 8) & 0xff),
        fromCharCode(n & 0xff)
      ];
    chars.length -= [0, 0, 2, 1][padlen];
    return chars.join('');
  };
  var atob = Crypt.atob ? function(a) {
      return Crypt.atob(a);
    } : function(a) {
      return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
  var _decode = buffer ? function(a) {
      return (new buffer(a, 'base64')).toString()
    } : function(a) {
      return btou(atob(a))
    };
  var decode = function(a) {
    return _decode(
      a.replace(/[-_]/g, function(m0) {
        return m0 == '-' ? '+' : '/'
      })
      .replace(/[^A-Za-z0-9\+\/]/g, '')
    );
  };
  var noConflict = function() {
    var Base64 = Crypt.Base64;
    Crypt.Base64 = _Base64;
    return Base64;
  };
  // export Base64
  Crypt.Base64 = {
    VERSION: version,
    atob: atob,
    btoa: btoa,
    fromBase64: decode,
    toBase64: encode,
    utob: utob,
    encode: encode,
    encodeURI: encodeURI,
    btou: btou,
    decode: decode,
    noConflict: noConflict
  };
  // if ES5 is available, make Base64.extendString() available
  if (typeof Object.defineProperty === 'function') {
    var noEnum = function(v) {
      return {
        value: v,
        enumerable: false,
        writable: true,
        configurable: true
      };
    };
    Crypt.Base64.extendString = function() {
      Object.defineProperty(
        String.prototype, 'fromBase64', noEnum(function() {
          return decode(this)
        }));
      Object.defineProperty(
        String.prototype, 'toBase64', noEnum(function(urisafe) {
          return encode(this, urisafe)
        }));
      Object.defineProperty(
        String.prototype, 'toBase64URI', noEnum(function() {
          return encode(this, true)
        }));
    };
  }

  return Crypt;

});
/**********************************
 * @author:       cmli@Ctrip.com
 * @description:  组件Member
 * @see: http://git.dev.sh.ctripcorp.com/cmli/ctrip-h5-document/blob/master/widget/t.widget.member.md
 *
 */
define('cWidgetMember',['cUtility', 'cUserModel', 'cWidgetFactory', 'cHybridFacade', 'cUtility', 'cUtilityCrypt', 'CommonStore'], function (Util, UserModel, WidgetFactory, Facade, cUtility, cUtilityCrypt, CommonStore) {
  

  var WIDGET_NAME = 'Member';
  var host = window.location.host;
  var domain = "accounts.ctrip.com";
  if (host.match(/^m\.ctrip\.com/i)) {
    domain = "accounts.ctrip.com";
  } else if (host.match(/^m\.uat\.qa/i)) {
    domain = "accounts.uat.qa.nt.ctripcorp.com";
  } else if (host.match(/^m.fat/i)) {
    domain = "accounts.fat49.qa.nt.ctripcorp.com";
  }
  var LINKS = {
    MEMBER_LOGIN: 'https://' + domain + '/H5Login/#login',
    REGISTER:     'https://' + domain + '/H5Register/'
  };

  /**
   * 获得url
   * @param link
   * @param options
   * @private
   */
  var _getLink = function (link, options) {
    var url = link, lt = location;
    var param = (options && options.param && typeof options.param === 'string') ? options.param : "";
    if (param) {
      param = cUtility.getUrlParams(options.param);
      var from = (param && param.from) ? decodeURIComponent(param.from) : "";
      if (cUtility.validate.isUrl(from)) {
        url = url + "?"+options.param;
      } else {
        //如果from参数不是一个完整的url, 拼上host和协议
        param.from = lt.protocol+"//"+lt.host+from;
        var paramStr = $.param(param);
        url = url + "?" + encodeURIComponent(paramStr);
      }
    }
    window.location.href = url;
  };

  var Member = {

    memberLogin: function (options) {
      _getLink(LINKS.MEMBER_LOGIN, options);
    },

    nonMemberLogin: function (options) {
      //_getLink(LINKS.NON_MEMBER_LOGIN, options);
      var model = UserModel.NotUserLoginModel.getInstance();

      options = _.extend({
        callback: function () {
        }
      }, options || {});

      model.excute(options.callback, options.callback);
    },

    register: function (options) {
      _getLink(LINKS.REGISTER, options);
    },

    /**
     * 自动登录
     * @param url
     */
    autoLogin:          function (opt) {
      var url = opt.url || window.location.href;
      var result = cUtility.urlParse(url),
        userStore = CommonStore.UserStore.getInstance(),
        headStore = CommonStore.HeadStore.getInstance(),
        userInfo, self = this;
      //如果URL中存在用户auth,去取登录信息
      if (result.username) {
        try {
          var data = cUtilityCrypt.Base64.decode(decodeURIComponent(result.username));
          userInfo = JSON.parse(data);
        } catch (e) {
          opt.callback && opt.callback();
          return;
        }
        //如果用户旧auth与新传来的auth不同,则取新用户信息
        if (userStore.getAuth() !== userInfo.auth) {
          userStore.removeUser();
          headStore.setAuth(userInfo.auth)
          var userModel = UserModel.UserLoginModel.getInstance();
          userModel.param = {
            'Auth': userInfo.auth
          };
          var sucCb = function (data) {
            data.Auth = userInfo.auth;
            data.LoginName = "";
            delete data.ResponseStatus;
            delete data.Result;
            userStore.setUser(data);
            userStore.setExpireTime(userInfo.time);
            //继续app初始化过程
            opt.callback && opt.callback();
          };
          var errCb = function (data) {
            self.memberLogin();
          }
          userModel.excute(sucCb, errCb);
        } else {
          opt.callback && opt.callback();
        }
      } else {
        opt.callback && opt.callback();
      }
    },
    /**
     * 获取登录auth完成
     * @returns {boolean}
     */
    app_finished_login: function () {
      return false
    }
  };

  var HybridMember = {
    memberLogin: function (options) {
      Facade.request({ name: Facade.METHOD_MEMBER_LOGIN, callback: options.callback, isShowNonMemberLogin: options.isShowNonMemberLogin});
    },

    nonMemberLogin: function (options) {
      Facade.request({ name: Facade.METHOD_NON_MEMBER_LOGIN, callback: options.callback });
    },

    register: function (options) {
      Facade.request({ name: Facade.METHOD_REGISTER, callback: options.callback });
    },

    autoLogin:          function (options) {
      Facade.request({ name: Facade.METHOD_AUTO_LOGIN, callback: options.callback });
    },
    app_finished_login: function (options) {
      Facade.request({ name: Facade.METHOD_APP_FINISHED_LOGIN, userInfo: options.userInfo, callback: options.callback});
    }
  };

  WidgetFactory.register({
    name: WIDGET_NAME,
    fn:   Util.isInApp() ? HybridMember : Member
  });
});

define('AbstractAPP',['libs', 'cBase', 'cUIAnimation','cWidgetFactory','cWidgetMember','cLog','cUtility'], function (libs, cBase, animation,WidgetFactory,Member, cLog,cUtility) {

  Member = WidgetFactory.create('Member');

  var Appliction = new cBase.Class({
    __propertys__: function () {
      this.webroot = '/#hotelsearch';

      //view搜索目录
      this.viewRootPath = 'app/views/';
      //默认view
      this.defaultView = 'index';
      //请求对象
      this.request;
      //当前视图路径
      this.viewpath;
      //主框架
      this.mainframe;
      //视图框架
      this.viewport;
      //状态框架
      this.statedom;
      //视图集
      this.views = new cBase.Hash();
      //当前视图
      this.curView;
      //最后访问视图视图
      this.lastView;

      //提供给视图访问Appliction的接口
      this.inteface = {
        loadView: _.bind(this.loadView, this),
        forward:  _.bind(this.forward, this),
        back:     _.bind(this.back, this)
      };
      //结构是否创建好
      this.isCreate = false;
      //历史记录
      this.history = [];
      //hash的监听状态
      this.stopListening = false;

      //资源
      this.timeoutres;
      //上一次hash
      this.lastHash = '';
      //上一次完整hash
      this.lashFullHash = '';
      //hash是否改变
      this.isChangeHash = false;

      this.animations = animation;
      //是否使用动画，这个属性只能控制单次是否开启动画
      this.isAnimat = true;

      this.animatSwitch = false;

      //这个是开启动画的总开关，这个名字不太合适
      cBase.isInApp() && (this.animatSwitch = true);


      //向前动画名
      this.animForwardName = 'slideleft';
      this.animBackwardName = 'slideright';
      this.animNoName = 'noAnimate';

      //动画名
      this.animatName = this.animNoName;

      this.path = [];
      this.query = {};
      this.viewMapping = {};
    },

    initialize: function (options) {
      this.setOption(options);
      //this.createViewPort();
     // this.buildEvent();

      //如果在web环境下,检查是否自动登录
      if(cUtility.inApp){
        this.buildEvent();
      }else{
        Member.autoLogin({
          callback: $.proxy(this.buildEvent, this)
        });
      }
    },
    setOption:  function (options) {
      options = options || {};
      for (var i in options) {
        this[i] = options[i];
      }
    },

    buildEvent: function () {
      var self = this;
      requirejs.onError = function (e) {
        if (e && e.requireModules) {
          for (var i = 0; i < e.requireModules.length; i++) {
            console.log('抱歉，当前的网络状况不给力，请刷新重试!');
            break;
          }
        }
      };

      $(window).bind('hashchange', _.bind(this.onHashChange, this));

      //首次必须执行该方法加载相关view
      this.onHashChange();
      //首次将加载时,放入history
      this.pushHistory();
    },

    onHashChange: function () {
      //      var href = window.location.href;
      //      this.history.push(href);

      //首次为false，不在监听时候才能触发_onHashChange 切换view
      if (!this.stopListening) {
        var url = decodeURIComponent(location.href).replace(/^[^#]+(#(.+))?/g, '$2').toLowerCase();
        this._onHashChange(url);

      }
    },

    _onHashChange:  function (url, isForward) {
      url = url.replace(/^#+/i, '');

      //临时解决酒店baidu 和 weixin 问题,后续考虑完整方案 shbzhang 2014/6/24
      if (url == 'bd=baidu_map') {
        url = "";
      } else if (url == 'rd') {
        return;
      }
      var req = this.parseHash(url);

      this.localObserver(req, isForward);
    },
    //处理URLhash
    parseHash:      function (hash) {
      var fullhash = hash,
        hash = hash.replace(/([^\|]*)(?:\|.*)?$/img, '$1'),
        h = /^([^?&|]*)(.*)?$/i.exec(hash),
        vp = h[1] ? h[1].split('!') : [],
        viewpath = (vp.shift() || '').replace(/(^\/+|\/+$)/i, ''),
        path = vp.length ? vp.join('!').replace(/(^\/+|\/+$)/i, '').split('/') : this.path;

      this.isChangeHash = !!(!this.lastHash && fullhash === this.lashFullHash) || !!(this.lastHash && this.lastHash !== hash);

      //日历等情况
      if (location.hash.indexOf('cui-') != -1) {
        this.isChangeHash = false;
      }

      this.lastHash = hash;
      this.lashFullHash = fullhash;
      return {
        viewpath: viewpath,
        path:     path,
        query:    cUtility.getUrlParams(fullhash),
        root:     location.pathname + location.search,
        fullhash: fullhash
      };
    },
    //hashchange观察点函数，处理url，动画参数
    localObserver:  function (req, isForward) {
      this.animatName = isForward ? this.animForwardName : this.animBackwardName;

      this.request = req;
      this.viewpath = this.request.viewpath || this.defaultView;
      this.request.viewpath = this.viewpath;
      this.switchView(this.viewpath);
    },


    //根据根据id以及页面的类
    //定义view的turing方法，这里不是直接放出去，而是通过app接口放出，并会触发各个阶段的方法
    //注意，这里是传递id，有可能乱跳，
    switchView:     function (path) {

      //设置UBT为wait状态 shbzhang 2014/7/21
      if (window.__bfi) {
        window.__bfi.push(['_unload', 1]);
      }

      var id = path;
      var curView = this.views.getItem(id);

      //切换前的当前view，马上会隐藏
      var lastView = this.curView;

      //如果当前view存在则触发其onHide事件，做资源清理
      //但是如果当前view就是 马上要访问的view的话，这里就不会触发他的onHide事件
      //所以lastview可能并不存在
      if (lastView && lastView != curView) {
        this.lastView = lastView;
      }

      //如果当前view存在，则执行请onload事件
      if (curView) {

        //如果当前要跳转的view就是当前view的话便不予处理
        if (curView == this.curView && this.isChangeHash == false) {
          return;
        }

        //因为初始化只会执行一次，所以每次需要重写request
        curView.request = this.request;
        //这里有一个问题，view与view之间并不需要知道上一个view是什么，下一个是什么，这个接口应该在app中
        this.curView = curView;

        var lastViewName = (lastView || curView).viewname;

        curView.lostLoadTime =  cLog.getNow();
        this.curView.__load(lastViewName);

      } else {
        var sTime = cLog.getNow();
        if (this.history.length < 2) {
          sTime = cLog.localTime;
        }
        //重来没有加载过view的话需要异步加载文件
        //此处快速切换可能导致view文件未加载结束，而已经开始执行其它view的逻辑而没有加入dom结构
        this.loadView(path, function (View) {
          if ($('[page-url="' + id + '"]').length > 0) {
            return;
          }
          curView = new View(this.request, this.inteface, id);
          curView.lostLoadTime = sTime;
          curView.isLoaded = false;
          cLog.onDomReady(curView.lostLoadTime);
          //保存至队列
          this.views.push(id, curView);

          //这个是唯一需要改变的
          curView.turning = _.bind(function () {
            this.createViewPort();
            //记录onLoad事件
            if (!curView.isLoaded) {
              cLog.onLoad(curView.lostLoadTime);
              curView.isLoaded = true;
            }
           
            curView.viewport = this.viewport;
            //            curView.$el.focus();

            //动画会触发inView的show outView 的hide
            this.startAnimation(function (inView, outView) {
              //防止view显示错误，后面点去掉
              $('.sub-viewport').hide();
              //防止白屏
              inView.$el.show();

            });

          }, this);

          this.curView = curView;

          //首次进入时候，若是defaultView的话，不应该记录
          var lastViewName = typeof lastView != 'undefined' ? lastView.viewname : null;

          this.curView.__load(lastViewName);

        });
      }
    },

    //动画相关参数，这里要做修改，给一个noAnimat
    startAnimation: function (callback) {
      var inView = this.curView;
      var outView = this.lastView;

      //l_wang在此记录outview的位置，较为靠谱，解决记录位置不靠谱问题
      if (outView) {
        outView.scrollPos = {
          x: window.scrollX,
          y: window.scrollY
        };
      }

      //当非app中则不使用动画
      if (!this.animatSwitch) this.isAnimat = false;

      if (!this.isAnimat) this.animatName = this.animNoName;

      this.timeoutres = this.animations[this.animatName] && this.animations[this.animatName].call(this, inView, outView, callback, this);

      //此参数为一次性，调用一次后自动打开动画
      this.isAnimat = true;
    },

    //加载view
    loadView:       function (path, callback) {
      var self = this;
      requirejs([this.buildUrl(path)], function (View) {
        callback && callback.call(self, View);
      });
    },

    buildUrl:       function (path) {
      var mappingPath = this.viewMapping[path];
      return mappingPath ? mappingPath : this.viewRootPath + path;
    },

    //创建dom结构
    createViewPort: function () {
      if (this.isCreate) return;
      var html = [
        '<div class="main-frame">',
        '<div class="main-viewport"></div>',
        '<div class="main-state"></div>',
        '</div>'
      ].join('');
      this.mainframe = $(html);
      this.viewport = this.mainframe.find('.main-viewport');
      this.statedom = this.mainframe.find('.main-state');
      var container = $('#main');
      container.empty();
      container.append(this.mainframe);
      this.isCreate = true;
    },

    lastUrl: function () {
      if (this.history.length < 2) {
        return document.referrer;
      } else {
        return this.history[this.history.length - 2];
      }
    },

    startObserver: function () {
      this.stopListening = false;
    },

    endObserver: function () {
      this.stopListening = true;
    },

    forward: function (url, replace, isNotAnimat) {
      url = url.toLowerCase();
      if (isNotAnimat) this.isAnimat = false;
      this.endObserver();

      if (replace) {
        window.location.replace(('#' + url).replace(/^#+/, '#'));
      } else {
        window.location.href = ('#' + url).replace(/^#+/, '#');
      }

      //前进时填记录
      this.pushHistory();

      this._onHashChange(url, true);

      setTimeout(_.bind(this.startObserver, this), 1);
    },

    back: function (url, isNotAnimat) {

      if (isNotAnimat) this.isAnimat = false;

      var referrer = this.lastUrl();
      //back时,弹出history中的最后一条记录 shbzhang 2014/5/20
      if (referrer) {
        this.history.pop();
      }


      if (url && (!referrer || referrer.indexOf(url) !== 0)) {
        //hash不支持中文，大bug
        //window.location.hash = url;
        window.location.href = ('#' + url).replace(/^#+/, '#');
      } else {
        url = this.request.query['refer'];
        if (url) {
          window.location.href = url;
        } else {
          history.back();
        }
      }
    },

    pushHistory: function () {
      var href = window.location.href;
      this.history.push(href);
    }

  });
  return Appliction;
});

/**********************************
* @author:       cmli@Ctrip.com
* @description:  组件Guider
* @see: http://git.dev.sh.ctripcorp.com/cmli/ctrip-h5-document/blob/master/widget/t.widget.guider.md
*
*/
define('cWidgetGuider',['cUtilityHybrid', 'cWidgetFactory', 'cHybridFacade'], function (Util, WidgetFactory, Facade) {
  

  var WIDGET_NAME = 'Guider';

  var HybridGuider = {
    jump: function (options) {
      var model = {
        refresh: function () {
          Facade.request({ name: Facade.METHOD_OPEN_URL, targetMode: 0, title: options.title, pageName: options.pageName});
        },
        app: function () {
          if (options && options.module) {
            var openUrl = Facade.getOpenUrl(options);
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: openUrl, targetMode: 1, title: options.title, pageName: options.pageName});
          } else if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 1, title: options.title, pageName: options.pageName});
          }
        },
        h5: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 2, title: options.title, pageName: options.pageName});
          }
        },
        browser: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 3, title: options.title, pageName: options.pageName});
          }
        },
        open: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 4, title: options.title, pageName: options.pageName});
          }
        },
        open_relative: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 5, title: options.title, pageName: options.pageName});
          }
        }
      };

      if (typeof model[options.targetModel] === 'function') {
        model[options.targetModel]();
      }
    },

    apply: function (options) {
      if (_.isObject(options) && _.isFunction(options.hybridCallback)) {
        options.hybridCallback();
      }
    },

    call: function (options) {
      return false;
    },

    init: function (options) {
      if (options && window.parseFloat(options.version) < 5.2) {
        Facade.request({ name: Facade.METHOD_ENTRY, callback: options.callback });
      } else {
        Facade.request({ name: Facade.METHOD_INIT, callback: options.callback });
      }
    },

    log: function (options) {
      Facade.request({ name: Facade.METHOD_LOG_EVENT, event_name: options.name });
    },

    print: function (options) {
      Facade.request({ name: Facade.METHOD_NATIVE_LOG, log: options.log, result: options.result });
    },

    callService: function () {
      Facade.request({ name: Facade.METHOD_CALL_SERVICE_CENTER });
    },

    backToLastPage: function (options) {
      var param = options ? options.param : '';
      Facade.request({ name: Facade.METHOD_BACK_TO_LAST_PAGE, param: param });
    },

    checkUpdate: function () {
      Facade.request({ name: Facade.METHOD_CHECK_UPDATE });
    },

    recommend: function () {
      Facade.request({ name: Facade.METHOD_RECOMMEND_APP_TO_FRIEND });
    },

    addWeixinFriend: function () {
      Facade.request({ name: Facade.METHOD_ADD_WEIXIN_FRIEND });
    },

    showNewestIntroduction: function () {
      Facade.request({ name: Facade.METHOD_SHOW_NEWEST_INTRODUCTION });
    },

    register: function (options) {
      if (options && options.tagname && options.callback) {
        Facade.register({ tagname: options.tagname, callback: options.callback });
      }
    },

    create: function () {
      Facade.init();
    },

    home: function () {
      Facade.request({ name: Facade.METHOD_BACK_TO_HOME });
    },

    jumpHotel: function (options) {
      Facade.request({ name: Facade.METHOD_GO_TO_HOTEL_DETAIL, hotelId: options.hotelId, hotelName: options.name, cityId: options.cityId, isOverSea: options.isOverSea });
    },

    injectUbt: function () {
      return false;
    },

    checkAppInstall: function (options) {
      Facade.request({ name: Facade.METHOD_CHECK_APP_INSTALL, url: options.url, package: options.package, callback: options.callback });
    },

    callPhone: function (options) {
      Facade.request({ name: Facade.METHOD_CALL_PHONE, tel: options.tel });
    },

    cross: function (options) {
      Facade.request({ name: Facade.METHOD_CROSS_JUMP, param: options.param, path: options.path });
    },

    refreshNative: function (options) {
      Facade.request({ name: Facade.METHOD_REFRESH_NATIVE, package: options.package, json: options.json });
    },

    copyToClipboard: function (options) {
      Facade.request({ name: Facade.METHOD_COPY_TO_CLIPBOARD, content: options.content });
    },

    readFromClipboard: function (options) {
      Facade.request({ name: Facade.METHOD_READ_FROM_CLIPBOARD, callback: options.callback });
    },

    shareToVendor: function (options) {
      Facade.request({ name: Facade.METHOD_SHARE_TO_VENDOR, imgUrl: options.imgUrl, text: options.text, title: options.title, linkUrl: options.linkUrl, isIOSSystemShare: options.isIOSSystemShare});
    },

    downloadData: function (options) {
      Facade.request({ name: Facade.METHOD_DOWNLOAD_DATA, url: options.url, callback: options.callback, suffix: options.suffix });
    },

    encode: function (options) {
      if (options && options.mode === 'base64') {
        Facade.request({ name: Facade.METHOD_ENCRYPT_BASE64, callback: options.callback, info: options.info });
      }
    },
    
    choose_invoice_title: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_CHOOSE_INVOICE_TITLE, callback: options.callback, title: options.title });
    },
    
    get_device_info: function(options)
    {
      Facade.request({name: Facade.METHOD_APP_GET_DEVICE_INFO, callback: options.callback});
    },
    
    show_voice_search: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_SHOW_VOICE_SEARCH, bussinessType: options.bussinessType});
    },
    
    choose_photo: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_CHOOSE_PHOTO, maxFileSize: options.maxFileSize, maxPhotoCount: options.maxPhotoCount, meta: options.meta, callback: options.callback});
    },
    
    finished_register: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_FINISHED_REGISTER, userInfo: options.userInfo});
    },
    
    app_call_system_share: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_FINISHED_REGISTER, imageRelativePath: options.imageRelativePath, 
          text: options.text, title: options.title, linkUrl: options.linkUrl, isIOSSystemShare: options.isIOSSystemShare});
    },
    app_network_did_changed: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_NETWORK_DID_CHANGED, callback: options.callback});
    },
    app_check_network_status: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_CHECK_NETWORK_STATUS, callback: options.callback});
    },
    
    app_check_android_package_info: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_CHECK_ANDROID_PACKAGE_INFO, callback: options.callback});
    },
    
    app_log_google_remarkting: function(url)
    {
      Facade.request({ name: Facade.METHOD_APP_LOG_GOOGLE_REMARKTING,url:url});
    },
    
    app_read_verification_code_from_sms: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_READ_VERIFICATION_CODE_FROM_SMS, callback: options.callback});
    }
  };

  HybridGuider.file = {

    isFileExist: function (options) {
      Facade.request({ name: Facade.METHOD_CHECK_FILE_EXIST, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    deleteFile: function (options) {
      Facade.request({ name: Facade.METHOD_DELETE_FILE, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    getCurrentSandboxName: function (options) {
      Facade.request({ name: Facade.METHOD_GET_CURRENT_SANDBOX_NAME, callback: options.callback });
    },

    getFileSize: function (options) {
      Facade.request({ name: Facade.METHOD_GET_FILE_SIZE, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    makeDir: function (options) {
      Facade.request({ name: Facade.METHOD_MAKE_DIR, callback: options.callback, dirname: options.dirname, relativeFilePath: options.relativeFilePath });
    },

    readTextFromFile: function (options) {
      Facade.request({ name: Facade.METHOD_READ_TEXT_FROM_FILE, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    writeTextToFile: function (options) {
      Facade.request({ name: Facade.METHOD_WRITE_TEXT_TO_FILE, callback: options.callback, text: options.text, isAppend: options.isAppend, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    }
  };

  HybridGuider.pipe = {

    /**
    * @param options.serviceCode 需要发送服务的服务号
    * @param options.header 服务的header
    * @param options.data 服务所需要的数据部分，各个服务都不同
    * @param options.callback 服务请求的回调
    */
    socketRequest: function (options) {
      Facade.request({ name: Facade.METHOD_SEND_H5_PIPE_REQUEST, callback: options.callback, serviceCode: options.serviceCode, header: options.header, data: options.data, sequenceId: Date.now(), pipeType: options.pipeType});
    },

    /**
    * @param options.url  HTTP请求发送的URL地址
    * @param options.method HTTP请求方式GET/POST/DELETE/PUT
    * @param options.header HTTP请求的头部
    * @param options.param HTTP请求参数
    * @param options.retry { timeout: "", retry:"", retryInterval:"" }
    * @param options.callback HTTP请求回调
    * @return sequenceId
    */
    httpRequest: function (options) {
      var timestamp = Date.now();
      Facade.request({ name: Facade.METHOD_SEND_HTTP_PIPE_REQUEST, callback: options.callback, target: options.url, method: options.method, header: options.header, queryData: options.param, retryInfo: options.retry, sequenceId: timestamp });
      return timestamp;
    },

    /**
    * @param options.id 需要取消的服务id
    */
    abortRequest: function (options) {
      Facade.request({ name: Facade.METHOD_ABORT_HTTP_PIPE_REQUEST, sequenceId: options.id });
    }

  };

  HybridGuider.pay = {

    /**
    * @see  http://jimzhao2012.github.io/api/classes/CtripPay.html#method_app_check_pay_app_install_status
    * @param options.callback 检查支付之后的回调 function(param){}
    * @example callback返回数据实例
    *    {
    *       platform:"iOS", //Android
    *       weixinPay:true,
    *       aliWalet:true,
    *       aliQuickPay:true,
    *    }
    */
    checkStatus: function (options) {
      Facade.request({ name: Facade.METHOD_CHECK_PAY_APP_INSTALL_STATUS, callback: options.callback });
    },

    /**
    * @see http://jimzhao2012.github.io/api/classes/CtripPay.html#method_app_check_pay_app_install_status
    * @param payAppName 支付App的URL，暂固定为以下4个， aliWalet/aliQuickPay/wapAliPay/weixinPay(微信支付暂未支持)
    * @param payURL 服务器返回的支付URL
    * @param successRelativeURL 支付成功跳转的URL
    * @param detailRelativeURL 支付失败或者支付
    */
    payOut: function (options) {
      Facade.request({ name: Facade.METHOD_OPEN_PAY_APP_BY_URL, payAppName: options.payAppName, payURL: options.payURL, successRelativeURL: options.successRelativeURL, detailRelativeURL: options.detailRelativeURL });
    }
  };

  HybridGuider.encrypt = {
    /**
     * 携程自有加密
     * @param {String} options.inStr 输入字符串
     * @param {Function} options.callback 回调函数,
     *  回调参数格式为
      {
            inString:"abcdxxxx",
            outString:"ABScdXkYZunwXVF5kQpffnY+oL/MFmJGkn8ra8Ab5cI=",
            encType:1
        },
     */
    ctrip_encrypt: function (options) {
      Facade.request({ name: Facade.METHOD_ENCRYPT_CTRIP, callback: options.callback, inString:options.inStr, encType:1 });
    },
    /**
     * 携程自有解密
     * @param {String} options.inStr 输入字符串
     * @param {Function} options.callback 回调函数
     */
    ctrip_decrypt: function (options) {
      Facade.request({ name: Facade.METHOD_ENCRYPT_CTRIP, callback: options.callback, inString:options.inStr, encType:2 });
    }
  };

  var Guider = cloneEmptyFunc(HybridGuider);
  function cloneEmptyFunc(obj)
  {
    var emptyFuncObj = {};
    _.each(obj, function(val, key) {
      if (_.isFunction(val))
      {
        emptyFuncObj[key] = function() {
          return false;
        };  
      }
      else if (_.isObject(val))
      {
        emptyFuncObj[key] = cloneEmptyFunc(obj[key])  
      }
    });
    return emptyFuncObj;
  }
  Guider = _.extend(Guider, {
    jump: function (options) {
      if (options && options.url && typeof options.url === 'string') {
        window.location.href = options.url;
      }
    },

    apply: function (options) {
      if (options && options.callback && typeof options.callback === 'function') {
        options.callback();
      }
    },

    call: function (options) {
      var $caller = document.getElementById('h5-hybrid-caller');

      if (!options || !options.url || !typeof options.url === 'string') {
        return false;
      } else if ($caller && $caller.src == options.url) {
        $caller.contentDocument.location.reload();
      } else if ($caller && $caller.src != options.url) {
        $caller.src = options.url;
      } else {
        $caller = document.createElement('iframe');
        $caller.id = 'h5-hybrid-caller';
        $caller.src = options.url;
        $caller.style.display = 'none';
        document.body.appendChild($caller);
      }
    },    

    log: function (options) {
      if (window.console) {
        window.console.log(options.name);
      }
    },

    print: function (options) {
      return console.log(options.log, options.result);
    },

    callService: function () {
      window.location.href = 'tel:4000086666';
    },

    backToLastPage: function () {
      window.location.href = document.referrer;
    },

    home: function () {
      window.location.href = '/';
    } 
  })

  Guider.encrypt = {
    ctrip_encrypt : function(){return false},
    ctrip_decrypt : function(){return false}
  };
  WidgetFactory.register({
    name: WIDGET_NAME,
    fn: Util.isInApp() ? HybridGuider : Guider
  });
});

define('App',['libs', 'cBase', 'AbstractAPP', 'cStorage', 'cWidgetFactory', 'cWidgetGuider'], function (libs, cBase, AbstractAPP, cStorage, WidgetFactory) {

  //l_wang flip手势工具
  (function () {

    //偏移步长
    var step = 20;

    var touch = {};
    var down = 'touchstart';
    var move = 'touchmove';
    var up = 'touchend';
    if (!('ontouchstart' in window)) {
      down = 'mousedown';
      move = 'mousemove';
      up = 'mouseup';
    }

    //简单借鉴ccd思维做简要处理
    function swipeDirection(x1, x2, y1, y2, sensibility) {

      //x移动的步长
      var _x = Math.abs(x1 - x2);
      //y移动步长
      var _y = Math.abs(y1 - y2);
      var dir = _x >= _y ? (x1 - x2 > 0 ? 'left' : 'right') : (y1 - y2 > 0 ? 'up' : 'down');

      //设置灵敏度限制
      if (sensibility) {
        if (dir == 'left' || dir == 'right') {
          if ((_y / _x) > sensibility) dir = '';
        } else if (dir == 'up' || dir == 'down') {
          if ((_x / _y) > sensibility) dir = '';
        }
      }
      return dir;
    }

    //sensibility设置灵敏度，值为0-1
    function flip(el, dir, fn, noDefault, sensibility) {
      if (!el) return;

      el.on(down, function (e) {
        var pos = (e.touches && e.touches[0]) || e;
        touch.x1 = pos.pageX;
        touch.y1 = pos.pageY;

      }).on(move, function (e) {
        var pos = (e.touches && e.touches[0]) || e;
        touch.x2 = pos.pageX;
        touch.y2 = pos.pageY;

        //如果view过长滑不动是有问题的
        if (!noDefault) { e.preventDefault(); }
      }).on(up, function (e) {


        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > step) ||
        (touch.y2 && Math.abs(touch.y1 - touch.y2) > step)) {
          var _dir = swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2, sensibility);
          if (dir === _dir) {
            typeof fn == 'function' && fn();
          }
        } else {
          //tap的情况
          if (dir === 'tap') {
            typeof fn == 'function' && fn();
          }
        }
      });
    }

    function flipDestroy(el) {
      if (!el) return;
      el.off(down).off(move).off(up);
    }

    $.flip = flip;
    $.flipDestroy = flipDestroy;

  })();

  //解决三星 小米手机stringfy失效问题
  (function () {
    if (navigator.userAgent.indexOf('Android') > 0) {
      var stringifyFunc = JSON.stringify
      JSON.stringify = function () {
        if (arguments.length == 1) {
          return stringifyFunc.call(this, arguments[0], function (k, v) {
            if (!isNaN(v)) return v + '';
            else return v;
          })
        }
        else {
          stringifyFunc.apply(this, arguments);
        }
      }
    }
  })();

  var Appliction = new cBase.Class(AbstractAPP, {
    __propertys__: function () {

    },

    cleanCache: function () {

      var DEPRECATED_FLIGHT_MAP = [
      // ----------------------------------
      // CLEAR DEPRECATED INFO
        "FLIGHT_SEARCH",
        "FLIGHT_SEARCH_SUBJOIN",
        "FLTINTL_SEARCH",
        "FLIGHT_LIST",
        "FLIGHT_INTER_CITY_LIST",
        "FLIGHT_CITY_LIST",
        "zqInCityInfo",
        "zqInCityDateStore",
        "LastInCitySelectDateTime",
        "LastzqInAirportSelectDateTime",
        "zqInAirportInfo",
        "zqInAirportDateStore",
        "zqInAirportDateAndAddressStore",
        "zqInCityDateAndAddressStore",
        "zqInCitySelectStore",
        "zqInAirportSelectStore",
        "FLIGHT_DETAILS",
        "FLIGHT_DETAILS_PARAM",
        "FLIGHT_ORDERINFO",
        "USER_FLIGHT_ORDERLIST",
        "USER_FLIGHT_ORDERDETAIL",
        "USER_FLIGHT_ORDERPARAM",
        "FLIGHT_RETURNPAGE",
        "FLIGHT_SELECTED_INFO",
        "FLIGHT_PICK_TICKET_SELECT",
        "FLIGHT_AIRLINE",
        "FLIGHT_AIRCTRAFT",
        "FLIGHT_ENUM_TAKETIME",
        "FLIGHT_ENUM_CABINS",
        "FLIGHT_LIST_FILTER",
        "FLIGHT_PICK_TICKET",
        "FLIGHT_PICK_TICKET_PARAM",
        "FLIGHT_AD_TIMEOUT",
      // ----------------------------------
      // CLEAR LIST INFO AND USER INFO
        "P_FLIGHT_TicketList",
        "U_FLIGHT_ORDERLIST",
        "U_FLIGHT_ORDERDETAIL"
      ];

      var map = {
        "flight": DEPRECATED_FLIGHT_MAP
      }

      var array = map[this.channel];

      if (Array.isArray(array)) {
        for (var value in array) {
          window.localStorage.removeItem(value);
        }
      };
    },

    initialize: function ($super, options) {

      $super(options);

      //适配app 张爸爸
      var Guider = WidgetFactory.create('Guider');
      Guider.create();

      $.bindFastClick && $.bindFastClick();

      //l_wang提升响应速度，android低版本直接忽略
      if (navigator.userAgent.indexOf('Android 2') > 0) {
        $.unbindFastClick && $.unbindFastClick();
      }

      //清除过期数据 shbzhang
      try {
        //cStorage.getInstance().gc();
      } catch (e) {
      }
      this.cleanCache();

    }

  });
  return Appliction;
});

//每次进入页面前,清一下堡垒标志位 shbzhang 2014/5/19
(function(){
  var ls = window.localStorage;
  if(ls){
    ls.removeItem('isPreProduction');
  }
})();

// BigInt, a suite of routines for performing multiple-precision arithmetic in
// JavaScript.
//
// Copyright 1998-2005 David Shapiro.
//
// You may use, re-use, abuse,
// copy, and modify this code to your liking, but please keep this header.
// Thanks!
//
// Dave Shapiro
// dave@ohdave.com

// IMPORTANT THING: Be sure to set maxDigits according to your precision
// needs. Use the setMaxDigits() function to do this. See comments below.
//
// Tweaked by Ian Bunning
// Alterations:
// Fix bug in function biFromHex(s) to allow
// parsing of strings of length != 0 (mod 4)

// Changes made by Dave Shapiro as of 12/30/2004:
//
// The BigInt() constructor doesn't take a string anymore. If you want to
// create a BigInt from a string, use biFromDecimal() for base-10
// representations, biFromHex() for base-16 representations, or
// biFromString() for base-2-to-36 representations.
//
// biFromArray() has been removed. Use biCopy() instead, passing a BigInt
// instead of an array.
//
// The BigInt() constructor now only constructs a zeroed-out array.
// Alternatively, if you pass <true>, it won't construct any array. See the
// biCopy() method for an example of this.
//
// Be sure to set maxDigits depending on your precision needs. The default
// zeroed-out array ZERO_ARRAY is constructed inside the setMaxDigits()
// function. So use this function to set the variable. DON'T JUST SET THE
// VALUE. USE THE FUNCTION.
//
// ZERO_ARRAY exists to hopefully speed up construction of BigInts(). By
// precalculating the zero array, we can just use slice(0) to make copies of
// it. Presumably this calls faster native code, as opposed to setting the
// elements one at a time. I have not done any timing tests to verify this
// claim.

// Max number = 10^16 - 2 = 9999999999999998;
//               2^53     = 9007199254740992;
// add 
define('rsa',[], function () {
    var biRadixBase = 2;
    var biRadixBits = 16;
    var bitsPerDigit = biRadixBits;
    var biRadix = 1 << 16; // = 2^16 = 65536
    var biHalfRadix = biRadix >>> 1;
    var biRadixSquared = biRadix * biRadix;
    var maxDigitVal = biRadix - 1;
    var maxInteger = 9999999999999998;

    // maxDigits:
    // Change this to accommodate your largest number size. Use setMaxDigits()
    // to change it!
    //
    // In general, if you're working with numbers of size N bits, you'll need 2*N
    // bits of storage. Each digit holds 16 bits. So, a 1024-bit key will need
    //
    // 1024 * 2 / 16 = 128 digits of storage.
    //

    var maxDigits;
    var ZERO_ARRAY;
    var bigZero, bigOne;

    function setMaxDigits(value) {
        maxDigits = value;
        ZERO_ARRAY = new Array(maxDigits);
        for (var iza = 0; iza < ZERO_ARRAY.length; iza++) ZERO_ARRAY[iza] = 0;
        bigZero = new BigInt();
        bigOne = new BigInt();
        bigOne.digits[0] = 1;
    }

    setMaxDigits(20);

    // The maximum number of digits in base 10 you can convert to an
    // integer without JavaScript throwing up on you.
    var dpl10 = 15;
    // lr10 = 10 ^ dpl10
    var lr10 = biFromNumber(1000000000000000);

    function BigInt(flag) {
        if (typeof flag == "boolean" && flag == true) {
            this.digits = null;
        }
        else {
            this.digits = ZERO_ARRAY.slice(0);
        }
        this.isNeg = false;
    }

    function biFromDecimal(s) {
        var isNeg = s.charAt(0) == '-';
        var i = isNeg ? 1 : 0;
        var result;
        // Skip leading zeros.
        while (i < s.length && s.charAt(i) == '0') ++i;
        if (i == s.length) {
            result = new BigInt();
        }
        else {
            var digitCount = s.length - i;
            var fgl = digitCount % dpl10;
            if (fgl == 0) fgl = dpl10;
            result = biFromNumber(Number(s.substr(i, fgl)));
            i += fgl;
            while (i < s.length) {
                result = biAdd(biMultiply(result, lr10),
			               biFromNumber(Number(s.substr(i, dpl10))));
                i += dpl10;
            }
            result.isNeg = isNeg;
        }
        return result;
    }

    function biCopy(bi) {
        var result = new BigInt(true);
        result.digits = bi.digits.slice(0);
        result.isNeg = bi.isNeg;
        return result;
    }

    function biFromNumber(i) {
        var result = new BigInt();
        result.isNeg = i < 0;
        i = Math.abs(i);
        var j = 0;
        while (i > 0) {
            result.digits[j++] = i & maxDigitVal;
            i = Math.floor(i / biRadix);
        }
        return result;
    }

    function reverseStr(s) {
        var result = "";
        for (var i = s.length - 1; i > -1; --i) {
            result += s.charAt(i);
        }
        return result;
    }

    var hexatrigesimalToChar = new Array(
 '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
 'u', 'v', 'w', 'x', 'y', 'z'
);

    function biToString(x, radix)
    // 2 <= radix <= 36
    {
        var b = new BigInt();
        b.digits[0] = radix;
        var qr = biDivideModulo(x, b);
        var result = hexatrigesimalToChar[qr[1].digits[0]];
        while (biCompare(qr[0], bigZero) == 1) {
            qr = biDivideModulo(qr[0], b);
            digit = qr[1].digits[0];
            result += hexatrigesimalToChar[qr[1].digits[0]];
        }
        return (x.isNeg ? "-" : "") + reverseStr(result);
    }

    function biToDecimal(x) {
        var b = new BigInt();
        b.digits[0] = 10;
        var qr = biDivideModulo(x, b);
        var result = String(qr[1].digits[0]);
        while (biCompare(qr[0], bigZero) == 1) {
            qr = biDivideModulo(qr[0], b);
            result += String(qr[1].digits[0]);
        }
        return (x.isNeg ? "-" : "") + reverseStr(result);
    }

    var hexToChar = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                          'a', 'b', 'c', 'd', 'e', 'f');

    function digitToHex(n) {
        var mask = 0xf;
        var result = "";
        for (i = 0; i < 4; ++i) {
            result += hexToChar[n & mask];
            n >>>= 4;
        }
        return reverseStr(result);
    }

    function biToHex(x) {
        var result = "";
        var n = biHighIndex(x);
        for (var i = biHighIndex(x); i > -1; --i) {
            result += digitToHex(x.digits[i]);
        }
        return result;
    }

    function charToHex(c) {
        var ZERO = 48;
        var NINE = ZERO + 9;
        var littleA = 97;
        var littleZ = littleA + 25;
        var bigA = 65;
        var bigZ = 65 + 25;
        var result;

        if (c >= ZERO && c <= NINE) {
            result = c - ZERO;
        } else if (c >= bigA && c <= bigZ) {
            result = 10 + c - bigA;
        } else if (c >= littleA && c <= littleZ) {
            result = 10 + c - littleA;
        } else {
            result = 0;
        }
        return result;
    }

    function hexToDigit(s) {
        var result = 0;
        var sl = Math.min(s.length, 4);
        for (var i = 0; i < sl; ++i) {
            result <<= 4;
            result |= charToHex(s.charCodeAt(i))
        }
        return result;
    }

    function biFromHex(s) {
        var result = new BigInt();
        var sl = s.length;
        for (var i = sl, j = 0; i > 0; i -= 4, ++j) {
            result.digits[j] = hexToDigit(s.substr(Math.max(i - 4, 0), Math.min(i, 4)));
        }
        return result;
    }

    function biFromString(s, radix) {
        var isNeg = s.charAt(0) == '-';
        var istop = isNeg ? 1 : 0;
        var result = new BigInt();
        var place = new BigInt();
        place.digits[0] = 1; // radix^0
        for (var i = s.length - 1; i >= istop; i--) {
            var c = s.charCodeAt(i);
            var digit = charToHex(c);
            var biDigit = biMultiplyDigit(place, digit);
            result = biAdd(result, biDigit);
            place = biMultiplyDigit(place, radix);
        }
        result.isNeg = isNeg;
        return result;
    }

    function biDump(b) {
        return (b.isNeg ? "-" : "") + b.digits.join(" ");
    }

    function biAdd(x, y) {
        var result;

        if (x.isNeg != y.isNeg) {
            y.isNeg = !y.isNeg;
            result = biSubtract(x, y);
            y.isNeg = !y.isNeg;
        }
        else {
            result = new BigInt();
            var c = 0;
            var n;
            for (var i = 0; i < x.digits.length; ++i) {
                n = x.digits[i] + y.digits[i] + c;
                result.digits[i] = n % biRadix;
                c = Number(n >= biRadix);
            }
            result.isNeg = x.isNeg;
        }
        return result;
    }

    function biSubtract(x, y) {
        var result;
        if (x.isNeg != y.isNeg) {
            y.isNeg = !y.isNeg;
            result = biAdd(x, y);
            y.isNeg = !y.isNeg;
        } else {
            result = new BigInt();
            var n, c;
            c = 0;
            for (var i = 0; i < x.digits.length; ++i) {
                n = x.digits[i] - y.digits[i] + c;
                result.digits[i] = n % biRadix;
                // Stupid non-conforming modulus operation.
                if (result.digits[i] < 0) result.digits[i] += biRadix;
                c = 0 - Number(n < 0);
            }
            // Fix up the negative sign, if any.
            if (c == -1) {
                c = 0;
                for (var i = 0; i < x.digits.length; ++i) {
                    n = 0 - result.digits[i] + c;
                    result.digits[i] = n % biRadix;
                    // Stupid non-conforming modulus operation.
                    if (result.digits[i] < 0) result.digits[i] += biRadix;
                    c = 0 - Number(n < 0);
                }
                // Result is opposite sign of arguments.
                result.isNeg = !x.isNeg;
            } else {
                // Result is same sign.
                result.isNeg = x.isNeg;
            }
        }
        return result;
    }

    function biHighIndex(x) {
        var result = x.digits.length - 1;
        while (result > 0 && x.digits[result] == 0) --result;
        return result;
    }

    function biNumBits(x) {
        var n = biHighIndex(x);
        var d = x.digits[n];
        var m = (n + 1) * bitsPerDigit;
        var result;
        for (result = m; result > m - bitsPerDigit; --result) {
            if ((d & 0x8000) != 0) break;
            d <<= 1;
        }
        return result;
    }

    function biMultiply(x, y) {
        var result = new BigInt();
        var c;
        var n = biHighIndex(x);
        var t = biHighIndex(y);
        var u, uv, k;

        for (var i = 0; i <= t; ++i) {
            c = 0;
            k = i;
            for (j = 0; j <= n; ++j, ++k) {
                uv = result.digits[k] + x.digits[j] * y.digits[i] + c;
                result.digits[k] = uv & maxDigitVal;
                c = uv >>> biRadixBits;
                //c = Math.floor(uv / biRadix);
            }
            result.digits[i + n + 1] = c;
        }
        // Someone give me a logical xor, please.
        result.isNeg = x.isNeg != y.isNeg;
        return result;
    }

    function biMultiplyDigit(x, y) {
        var n, c, uv;

        result = new BigInt();
        n = biHighIndex(x);
        c = 0;
        for (var j = 0; j <= n; ++j) {
            uv = result.digits[j] + x.digits[j] * y + c;
            result.digits[j] = uv & maxDigitVal;
            c = uv >>> biRadixBits;
            //c = Math.floor(uv / biRadix);
        }
        result.digits[1 + n] = c;
        return result;
    }

    function arrayCopy(src, srcStart, dest, destStart, n) {
        var m = Math.min(srcStart + n, src.length);
        for (var i = srcStart, j = destStart; i < m; ++i, ++j) {
            dest[j] = src[i];
        }
    }

    var highBitMasks = new Array(0x0000, 0x8000, 0xC000, 0xE000, 0xF000, 0xF800,
                             0xFC00, 0xFE00, 0xFF00, 0xFF80, 0xFFC0, 0xFFE0,
                             0xFFF0, 0xFFF8, 0xFFFC, 0xFFFE, 0xFFFF);

    function biShiftLeft(x, n) {
        var digitCount = Math.floor(n / bitsPerDigit);
        var result = new BigInt();
        arrayCopy(x.digits, 0, result.digits, digitCount,
	          result.digits.length - digitCount);
        var bits = n % bitsPerDigit;
        var rightBits = bitsPerDigit - bits;
        for (var i = result.digits.length - 1, i1 = i - 1; i > 0; --i, --i1) {
            result.digits[i] = ((result.digits[i] << bits) & maxDigitVal) |
		                   ((result.digits[i1] & highBitMasks[bits]) >>>
		                    (rightBits));
        }
        result.digits[0] = ((result.digits[i] << bits) & maxDigitVal);
        result.isNeg = x.isNeg;
        return result;
    }

    var lowBitMasks = new Array(0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F,
                            0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF,
                            0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF);

    function biShiftRight(x, n) {
        var digitCount = Math.floor(n / bitsPerDigit);
        var result = new BigInt();
        arrayCopy(x.digits, digitCount, result.digits, 0,
	          x.digits.length - digitCount);
        var bits = n % bitsPerDigit;
        var leftBits = bitsPerDigit - bits;
        for (var i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
            result.digits[i] = (result.digits[i] >>> bits) |
		                   ((result.digits[i1] & lowBitMasks[bits]) << leftBits);
        }
        result.digits[result.digits.length - 1] >>>= bits;
        result.isNeg = x.isNeg;
        return result;
    }

    function biMultiplyByRadixPower(x, n) {
        var result = new BigInt();
        arrayCopy(x.digits, 0, result.digits, n, result.digits.length - n);
        return result;
    }

    function biDivideByRadixPower(x, n) {
        var result = new BigInt();
        arrayCopy(x.digits, n, result.digits, 0, result.digits.length - n);
        return result;
    }

    function biModuloByRadixPower(x, n) {
        var result = new BigInt();
        arrayCopy(x.digits, 0, result.digits, 0, n);
        return result;
    }

    function biCompare(x, y) {
        if (x.isNeg != y.isNeg) {
            return 1 - 2 * Number(x.isNeg);
        }
        for (var i = x.digits.length - 1; i >= 0; --i) {
            if (x.digits[i] != y.digits[i]) {
                if (x.isNeg) {
                    return 1 - 2 * Number(x.digits[i] > y.digits[i]);
                } else {
                    return 1 - 2 * Number(x.digits[i] < y.digits[i]);
                }
            }
        }
        return 0;
    }

    function biDivideModulo(x, y) {
        var nb = biNumBits(x);
        var tb = biNumBits(y);
        var origYIsNeg = y.isNeg;
        var q, r;
        if (nb < tb) {
            // |x| < |y|
            if (x.isNeg) {
                q = biCopy(bigOne);
                q.isNeg = !y.isNeg;
                x.isNeg = false;
                y.isNeg = false;
                r = biSubtract(y, x);
                // Restore signs, 'cause they're references.
                x.isNeg = true;
                y.isNeg = origYIsNeg;
            } else {
                q = new BigInt();
                r = biCopy(x);
            }
            return new Array(q, r);
        }

        q = new BigInt();
        r = x;

        // Normalize Y.
        var t = Math.ceil(tb / bitsPerDigit) - 1;
        var lambda = 0;
        while (y.digits[t] < biHalfRadix) {
            y = biShiftLeft(y, 1);
            ++lambda;
            ++tb;
            t = Math.ceil(tb / bitsPerDigit) - 1;
        }
        // Shift r over to keep the quotient constant. We'll shift the
        // remainder back at the end.
        r = biShiftLeft(r, lambda);
        nb += lambda; // Update the bit count for x.
        var n = Math.ceil(nb / bitsPerDigit) - 1;

        var b = biMultiplyByRadixPower(y, n - t);
        while (biCompare(r, b) != -1) {
            ++q.digits[n - t];
            r = biSubtract(r, b);
        }
        for (var i = n; i > t; --i) {
            var ri = (i >= r.digits.length) ? 0 : r.digits[i];
            var ri1 = (i - 1 >= r.digits.length) ? 0 : r.digits[i - 1];
            var ri2 = (i - 2 >= r.digits.length) ? 0 : r.digits[i - 2];
            var yt = (t >= y.digits.length) ? 0 : y.digits[t];
            var yt1 = (t - 1 >= y.digits.length) ? 0 : y.digits[t - 1];
            if (ri == yt) {
                q.digits[i - t - 1] = maxDigitVal;
            } else {
                q.digits[i - t - 1] = Math.floor((ri * biRadix + ri1) / yt);
            }

            var c1 = q.digits[i - t - 1] * ((yt * biRadix) + yt1);
            var c2 = (ri * biRadixSquared) + ((ri1 * biRadix) + ri2);
            while (c1 > c2) {
                --q.digits[i - t - 1];
                c1 = q.digits[i - t - 1] * ((yt * biRadix) | yt1);
                c2 = (ri * biRadix * biRadix) + ((ri1 * biRadix) + ri2);
            }

            b = biMultiplyByRadixPower(y, i - t - 1);
            r = biSubtract(r, biMultiplyDigit(b, q.digits[i - t - 1]));
            if (r.isNeg) {
                r = biAdd(r, b);
                --q.digits[i - t - 1];
            }
        }
        r = biShiftRight(r, lambda);
        // Fiddle with the signs and stuff to make sure that 0 <= r < y.
        q.isNeg = x.isNeg != origYIsNeg;
        if (x.isNeg) {
            if (origYIsNeg) {
                q = biAdd(q, bigOne);
            } else {
                q = biSubtract(q, bigOne);
            }
            y = biShiftRight(y, lambda);
            r = biSubtract(y, r);
        }
        // Check for the unbelievably stupid degenerate case of r == -0.
        if (r.digits[0] == 0 && biHighIndex(r) == 0) r.isNeg = false;

        return new Array(q, r);
    }

    function biDivide(x, y) {
        return biDivideModulo(x, y)[0];
    }

    function biModulo(x, y) {
        return biDivideModulo(x, y)[1];
    }

    function biMultiplyMod(x, y, m) {
        return biModulo(biMultiply(x, y), m);
    }

    function biPow(x, y) {
        var result = bigOne;
        var a = x;
        while (true) {
            if ((y & 1) != 0) result = biMultiply(result, a);
            y >>= 1;
            if (y == 0) break;
            a = biMultiply(a, a);
        }
        return result;
    }

    function biPowMod(x, y, m) {
        var result = bigOne;
        var a = x;
        var k = y;
        while (true) {
            if ((k.digits[0] & 1) != 0) result = biMultiplyMod(result, a, m);
            k = biShiftRight(k, 1);
            if (k.digits[0] == 0 && biHighIndex(k) == 0) break;
            a = biMultiplyMod(a, a, m);
        }
        return result;
    }

    // BarrettMu, a class for performing Barrett modular reduction computations in
    // JavaScript.
    //
    // Requires BigInt.js.
    //
    // Copyright 2004-2005 David Shapiro.
    //
    // You may use, re-use, abuse, copy, and modify this code to your liking, but
    // please keep this header.
    //
    // Thanks!
    // 
    // Dave Shapiro
    // dave@ohdave.com 

    function BarrettMu(m) {
        this.modulus = biCopy(m);
        this.k = biHighIndex(this.modulus) + 1;
        var b2k = new BigInt();
        b2k.digits[2 * this.k] = 1; // b2k = b^(2k)
        this.mu = biDivide(b2k, this.modulus);
        this.bkplus1 = new BigInt();
        this.bkplus1.digits[this.k + 1] = 1; // bkplus1 = b^(k+1)
        this.modulo = BarrettMu_modulo;
        this.multiplyMod = BarrettMu_multiplyMod;
        this.powMod = BarrettMu_powMod;
    }

    function BarrettMu_modulo(x) {
        var q1 = biDivideByRadixPower(x, this.k - 1);
        var q2 = biMultiply(q1, this.mu);
        var q3 = biDivideByRadixPower(q2, this.k + 1);
        var r1 = biModuloByRadixPower(x, this.k + 1);
        var r2term = biMultiply(q3, this.modulus);
        var r2 = biModuloByRadixPower(r2term, this.k + 1);
        var r = biSubtract(r1, r2);
        if (r.isNeg) {
            r = biAdd(r, this.bkplus1);
        }
        var rgtem = biCompare(r, this.modulus) >= 0;
        while (rgtem) {
            r = biSubtract(r, this.modulus);
            rgtem = biCompare(r, this.modulus) >= 0;
        }
        return r;
    }

    function BarrettMu_multiplyMod(x, y) {
        /*
        x = this.modulo(x);
        y = this.modulo(y);
        */
        var xy = biMultiply(x, y);
        return this.modulo(xy);
    }

    function BarrettMu_powMod(x, y) {
        var result = new BigInt();
        result.digits[0] = 1;
        var a = x;
        var k = y;
        while (true) {
            if ((k.digits[0] & 1) != 0) result = this.multiplyMod(result, a);
            k = biShiftRight(k, 1);
            if (k.digits[0] == 0 && biHighIndex(k) == 0) break;
            a = this.multiplyMod(a, a);
        }
        return result;
    }

    // RSA, a suite of routines for performing RSA public-key computations in
    // JavaScript.
    //
    // Requires BigInt.js and Barrett.js.
    //
    // Copyright 1998-2005 David Shapiro.
    //
    // You may use, re-use, abuse, copy, and modify this code to your liking, but
    // please keep this header.
    //
    // Thanks!
    // 
    // Dave Shapiro
    // dave@ohdave.com 

    function RSAKeyPair(encryptionExponent, decryptionExponent, modulus) {
        this.e = biFromHex(encryptionExponent);
        this.d = biFromHex(decryptionExponent);
        this.m = biFromHex(modulus);

        // We can do two bytes per digit, so
        // chunkSize = 2 * (number of digits in modulus - 1).
        // Since biHighIndex returns the high index, not the number of digits, 1 has
        // already been subtracted.
        //this.chunkSize = 2 * biHighIndex(this.m);

        ////////////////////////////////// TYF
        this.digitSize = 2 * biHighIndex(this.m) + 2;
        this.chunkSize = this.digitSize - 11; // maximum, anything lower is fine
        ////////////////////////////////// TYF

        this.radix = 16;
        this.barrett = new BarrettMu(this.m);
    }

    function twoDigit(n) {
        return (n < 10 ? "0" : "") + String(n);
    }

    function encryptedString(key, s)
    // Altered by Rob Saunders (rob@robsaunders.net). New routine pads the
    // string after it has been converted to an array. This fixes an
    // incompatibility with Flash MX's ActionScript.
    // Altered by Tang Yu Feng for interoperability with Microsoft's
    // RSACryptoServiceProvider implementation.
    {
        ////////////////////////////////// TYF
        if (key.chunkSize > key.digitSize - 11) {
            return "Error";
        }
        ////////////////////////////////// TYF


        var a = new Array();
        var sl = s.length;

        var i = 0;
        while (i < sl) {
            a[i] = s.charCodeAt(i);
            i++;
        }

        //while (a.length % key.chunkSize != 0) {
        //	a[i++] = 0;
        //}

        var al = a.length;
        var result = "";
        var j, k, block;
        for (i = 0; i < al; i += key.chunkSize) {
            block = new BigInt();
            j = 0;

            //for (k = i; k < i + key.chunkSize; ++j) {
            //	block.digits[j] = a[k++];
            //	block.digits[j] += a[k++] << 8;
            //}

            ////////////////////////////////// TYF
            // Add PKCS#1 v1.5 padding
            // 0x00 || 0x02 || PseudoRandomNonZeroBytes || 0x00 || Message
            // Variable a before padding must be of at most digitSize-11
            // That is for 3 marker bytes plus at least 8 random non-zero bytes
            var x;
            var msgLength = (i + key.chunkSize) > al ? al % key.chunkSize : key.chunkSize;

            // Variable b with 0x00 || 0x02 at the highest index.
            var b = new Array();
            for (x = 0; x < msgLength; x++) {
                b[x] = a[i + msgLength - 1 - x];
            }
            b[msgLength] = 0; // marker
            var paddedSize = Math.max(8, key.digitSize - 3 - msgLength);

            for (x = 0; x < paddedSize; x++) {
                b[msgLength + 1 + x] = Math.floor(Math.random() * 254) + 1; // [1,255]
            }
            // It can be asserted that msgLength+paddedSize == key.digitSize-3
            b[key.digitSize - 2] = 2; // marker
            b[key.digitSize - 1] = 0; // marker

            for (k = 0; k < key.digitSize; ++j) {
                block.digits[j] = b[k++];
                block.digits[j] += b[k++] << 8;
            }
            ////////////////////////////////// TYF

            var crypt = key.barrett.powMod(block, key.e);
            var text = key.radix == 16 ? biToHex(crypt) : biToString(crypt, key.radix);
            result += text + " ";
        }
        return result.substring(0, result.length - 1); // Remove last space.
    }

    function decryptedString(key, s) {
        var blocks = s.split(" ");
        var result = "";
        var i, j, block;
        for (i = 0; i < blocks.length; ++i) {
            var bi;
            if (key.radix == 16) {
                bi = biFromHex(blocks[i]);
            }
            else {
                bi = biFromString(blocks[i], key.radix);
            }
            block = key.barrett.powMod(bi, key.d);
            for (j = 0; j <= biHighIndex(block); ++j) {
                result += String.fromCharCode(block.digits[j] & 255,
			                              block.digits[j] >> 8);
            }
        }
        // Remove trailing null, if any.
        if (result.charCodeAt(result.length - 1) == 0) {
            result = result.substring(0, result.length - 1);
        }
        return result;
    }


    function base64encode(str) {
        var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var base64DecodeChars = new Array(
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
			52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
			-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
			15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
			-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
			41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
        var out, i, len;
        var c1, c2, c3;

        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }
    //rsa 1024
    setMaxDigits(131);
    var rsaKey = new RSAKeyPair("10001", "", "B7273B08845EB1D93C9A6EB9C45BE087AF9E692C8B7DD6D38DECFA732E9A6CDCB52106BDDB9E13100AEF3638358D5B5EB9011C33B7AC3F697078C0572585B94119196F627025C6E7FA9AA5C82B149E2BB30FEA7D777AA453324A301FD46413E11A7DB4A9D5B2D4BD6330AE2C477D48250F057ABEF2BD76DC7574897254736A71");

    function rsaEncrypted(str) {
        var result = encryptedString(rsaKey, base64encode(str));
        return result;
    }



    return {
        rsaEncrypted: rsaEncrypted
    };

});
/**
* @author cmli@Ctrip.com
* @class cBase
* @description 提供ui构建的基本方法
*/
define('cUIBase',[], function(){

  var base = {};

  /** 框架内所有生成的元素的id，class都会加上此前缀 */
  base.config = {
    prefix: 'cui-'
  };

  /**
  * @method setConfig
  * @param         name {String} 参数名
  * @param         value {Any Object} 值
  */
  base.setConfig = function (name, value) {
    base.config[name] = value;
  };

  /**
  * @method getElementPos
  * @param         el {Element} 元素对象
  * @description 返回元素el在页面中的位置信息
  */
  base.getElementPos = function (el) {
    var top = 0, left = 0;
    do {
      top += el.offsetTop;
      left += el.offsetLeft;
    } while (el = el.offsetParent);

    return {
      top: top,
      left: left
    };
  };

  /**
  * @method getCreateId
  * @description 返回唯一的字符串
  */
  base.getCreateId = (function () {
    var diviso = new Date().getTime();
    return function () {
      return base.config.prefix + (++diviso);
    };
  })();

  /**
  * @method getBiggerzIndex
  * @description 获得更大的zIndex值，每次调用该函数，都会产生一个更大值的z-index

  */
  base.getBiggerzIndex = (function () {
    var diviso = 3000;
    return function () {
      return ++diviso;
    };
  })();

  /**
  * @method getCurStyleOfEl
  * @param         el {Element} 元素对象
  * @param     样式名
  * @description 获得某个元素的最终（实时）的样式值
  */
  base.getCurStyleOfEl = function (el, styleName) {
    if (document.defaultView && document.defaultView.getComputedStyle) {
      return document.defaultView.getComputedStyle(el).getPropertyValue(styleName);
    } else if (el.currentStyle) {
      var sec = styleName.split('-'),
      cen = [],
      arr;
      for (var i = 0; i < sec.length; i++) {
        if (i == 0) {
          cen.push(sec[i]);
        } else {
          arr = sec[i].split('');
          arr[0] = arr[0].toUpperCase();
          cen.push(arr.join(''));
        }
      }
      cen = cen.join('');
      return el.currentStyle[cen];
    }
  };

  /**
  * @method bindthis
  * @param         fn 回调函数
  * @param     obj 作用域
  * @description 修改函数作用域
  */
  base.bindthis = function (fn, obj) {
    return function () {
      fn.apply(obj, arguments);
    };
  };

  /**
  * @method strToNum
  * @param     str 字符串
  * @description 安全的将字符串转换为数字
  */
  base.strToNum = function (str) {
    var num = parseInt(str.replace(/[a-z]/i, ''));
    return isNaN(num) ? 0 : num;
  };

  /**
  * @method getElementRealSize
  * @param         el {Element} 元素对象
  * @description 获得元素占位的高宽
  */
  base.getElementRealSize = function (el) {
      var $el = $(el);
      return {
          width: $el.width(),
          height: $el.height()
      };
  };

  /**
  * @method getPageSize
  * @description 返回包含高宽的对象
  */
  base.getPageSize = function () {
    var width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    return {
      width: width,
      height: height
    };
  };

  /**
  * @method getPageScrollPos
  * @description 获得窗口滚动条的位置
  */
  base.getPageScrollPos = function () {
      var left = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
    top = Math.max(document.documentElement.scrollTop, document.body.scrollTop),
    height = Math.min(document.documentElement.clientHeight, document.body.clientHeight),
          width = Math.min(document.documentElement.clientWidth, document.body.clientWidth),
          pageWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
          pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      return {
          top: top,
          left: left,
          height: height,
          width: width,
          pageWidth: pageWidth,
          pageHeight: pageHeight
      };
  };

  base.getMousePos = function (event) {
      var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop),
          left = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
      return {
          top: top + event.clientY,
          left: left + event.clientX
      };
  };

  /**
  * @method getMousePosOfElement
  * @param               {Object Event} 时间对象
  * @param               {Object Element} 元素对象
  * @description 获得event在元素上的位置
  */
  base.getMousePosOfElement = function (event, el) {
    var mpos = base.getMousePos(event), pos = base.getElementPos(el), w = el.clientWidth, h = el.clientHeight;
    var x = mpos.left - pos.left, y = mpos.top - pos.top;
    x = x < 0 ? 0 : (x > w ? w : x);
    y = y < 0 ? 0 : (y > h ? h : y);
    return { x: x, y: y };
  };

  /**
  * @method createElement
  * @param               tag {String} 标签名称
  * @param               attr {Object} 可选 属性
  * @param               styles {Object} 可选 样式
  * @param               html {String} 可选 内容
  * @description 便捷创建元素方法
  */
  base.createElement = function (tag, options) {
    var el = document.createElement(tag), i, t
    if (options) for (i in options) {
      switch (i) {
        case 'attr':
          if (typeof options[i] === 'object') for (t in options[i]) {
            if (options[i][t] != null) el.setAttribute(t, options[i][t]);
          }
          break;
        case 'styles':
          if (typeof options[i] === 'object') for (t in options[i]) {
            if (options[i][t] != null) el.style[t] = options[i][t];
          }
          break;
        case 'id':
          el.id = options[i];
          break;
        case 'class':
          el.className = options[i];
          break;
        case 'html':
          el.innerHTML = options[i];
          break;
      }
    }
    return el;
  };

  return base;

});
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUIAbstractView
* @description 多数UI View的基类，提供基础方法，以及自建事件机制
*/
define('cUIAbstractView',['libs', 'cBase', 'cUIBase'], function (libs, cBase, uiBase) {

  

  /** 工具方法 */
  var _slice = Array.prototype.slice,
        _push = Array.prototype.push,
        _toString = Object.prototype.toString;

  /** 记录几大状态值 */
  var STATE_NOTCREATE = 'notCreate';
  var STATE_ONCREATE = 'onCreate';
  var STATE_ONSHOW = 'onShow';
  var STATE_ONHIDE = 'onHide';

  var options = {};

  /** 相关属性 */
  options.__propertys__ = function () {

    /** 允许设置的事件 */
    this.allowEvents = {
      onCreate: true,
      onShow: true,
      onHide: true
    };

    /** 允许设置的属性 */
    this.allowsPush = {
      classNames: true
    };

    /** 允许设置的基本配置 */
    this.allowsConfig = {
      rootBox: true
    };

    /** 存储的事件容器 */
    this.events = {
      onCreate: [],
      onShow: [],
      onHide: []
    };

    /** 当前状态 */
    this.status = STATE_NOTCREATE;

    /** 设置值时候执行的回调 */
    this.setOptionHander = [];

    /** 设置值时候执行的回调 */
    this.rootBox;

    /** 根节点唯一ID */
    this.id = uiBase.getCreateId();

    /** 默认class */
    this.classNames = [uiBase.config.prefix + 'view'];

    /** 根节点 */
    this.root;

    /** 是否已经创建dom标识 */
    this.isCreate = false;

    this.eventArr = {};

  };

  options.bindEvents = function () {
    var events = this.eventArr;

    if (!(events || (events = _.result(this, 'events')))) return this;
    this.unBindEvents();

    // 解析event参数的正则
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
    var key, method, match, eventName, selector;

    // 做简单的字符串数据解析
    for (key in events) {
      method = events[key];
      if (!_.isFunction(method)) method = this[events[key]];
      if (!method) continue;

      match = key.match(delegateEventSplitter);
      eventName = match[1], selector = match[2];
      method = _.bind(method, this);
      eventName += '.delegateUIEvents' + this.id;

      if (selector === '') {
        this.root.on(eventName, method);
      } else {
        this.root.on(eventName, selector, method);
      }
    }

    return this;
  };

  options.unBindEvents = function () {
    this.root.off('.delegateUIEvents' + this.id);
    return this;
  };

  /**
  * @method initialize
  * @param opts {object}        构造函数（实例化）传入的参数
  * @description 构造函数入口
  */
  options.initialize = function (opts) {
    this.setOption(function (k, v) {
      switch (true) {
        case this.allowEvents[k]:
          this.addEvent(k, v);
          break;
        case this.allowsPush[k]:
          _toString.call(v) === '[object Array]' ? _push.apply(this[k], v) : this[k].push(v);
          break;
        case this.allowsConfig[k]:
          this[k] = v;
          break;
      }
    });
    this.readOption(opts);
  };

  /**
  * @method readOption
  * @param opts {object}        构造函数（实例化）传入的参数
  * @description 读取构造函数（实例化）传入的参数，并遍历参数对象，并将键值对作为参数传递给setOptionHander集合中的函数执行
  */
  options.readOption = function (opts) {
    opts = opts || {};
    var scope = this;
    $.each(opts, function (k, v) {
      $.each(scope.setOptionHander, function (fk, fun) {
        if (typeof fun === 'function')
          fun.call(scope, k, v);
      });
    });
  };

  /**
  * @method setOption
  * @param fun {function}        回调函数
  * @description 传入回调函数给setOptionHander数组集合
  */
  options.setOption = function (fun) {
    this.setOptionHander.push(fun);
  };

  /**
  * @method createRoot
  * @description 构建根节点
  */
  options.createRoot = function () {
    var root = document.createElement('div');
    root.className = this.classNames.join(' ');
    root.id = this.id;
    return $(root);
  };

  /**
  * @method addClass
  * @param cls {String/array}        classname
  * @description 增加class
  */
  options.addClass = function (cls) {
    this.classNames.push(cls);
    if (!this.root) return;
    if (typeof cls == 'array') {
      for (var k in cls) {
        this.root.addClass(cls[k]);
      }
    } else if (typeof cls == 'string') {
      this.root.addClass(cls);
    }
  };

  /**
  * @method removeClass
  * @param cls {String/array}        classname
  * @description 移除class
  */
  options.removeClass = function (cls) {
    if (typeof cls == 'array') {
      for (var k in cls) {
        this.root.removeClass(cls[k]);
      }
    } else if (typeof cls == 'string') {
      this.root.removeClass(cls);
    }
  };

  /**
  * @method createHtml
  * @description 子类必须重写的方法，不重写会抛出一个错误
  */
  options.createHtml = function () {
    throw new Error('未定义createHtml方法');
  };

  /**
  * @method setRootHtml
  * @param html {String/dom}
  * @description 设置根节点html内容
  */
  options.setRootHtml = function (html) {
    this.root && (this.root.empty(), this.root.append(html));
  };

  /**
  * @method getRoot
  * @description 获取根节点
  */
  options.getRoot = function () {
    return this.root;
  };

  /**
  * @method addEventType
  * @param type {String}    事件点名称
  * @description 增加新的可监控事件点
  */
  options.addEventType = function (type) {
    this.allowEvents[type] = true;
    this.events[type] = [];
  };

  /**
  * @method addEvent
  * @param type {String}     事件名称
  * @param fun {function}    回调函数
  * @description 为各个事件点添加需要回调的函数
  */
  options.addEvent = function (type, fun) {
    if (!this.allowEvents[type])
      return false;
    this.events[type] && this.events[type].push(fun);
  };

  /**
  * @method removeEvent
  * @param type {String}     事件名称
  * @param fun {function}    回调函数
  * @description 移除各个事件点添加需要回调的函数
  */
  options.removeEvent = function (type, fun) {
    if (this.events[type]) {
      if (fun) {
        this.events[type] = _.without(this.events[type], fun);
      } else {
        this.events[type] = [];
      }
    }
  };

  /**
  * @method remove
  * @description 移除节点
  */
  options.remove = function () {
    this.hide();
    this.root.remove();
  };

  /**
  * @method trigger
  * @param type {String}     事件名称
  * @description 触发事件
  */
  options.trigger = function (type) {
    var args = _slice.call(arguments, 1);
    var events = this.events;
    var results = [];
    var i, l;

    if (this.events[type]) {
      for (i = 0, l = events[type].length; i < l; i++) {
        results[results.length] = events[type][i].apply(this, args);
      }
    }
    return results;
  };

  /**
  * @method trigger
  * @param type {String}     事件名称
  * @param args {object}     传入的参数
  * @description 触发事件
  */
  options.create = function () {
    if (!this.isCreate && this.status !== STATE_ONCREATE) {
      this.rootBox = this.rootBox || $('body');
      this.root = this.createRoot();
      this.root.hide();
      this.rootBox.append(this.root);
      this.root.append(this.createHtml());
      //this.root.html();
      this.trigger('onCreate');
      this.status = STATE_ONCREATE;
      this.isCreate = true;
    }
  };

  /**
  * @method template
  * @param html {String}     模板html
  * @description 调用模板函数解析字符串（现在使用underscore方法）
  */
  options.template = function (html) {
    return _.template(html);
  };

  /**
  * @method showAction
  * @param callback {function}     回调函数
  * @description 显示时执行的方法
  */
  options.showAction = function (callback) {
    this.bindEvents();
    this.root.show();
    typeof callback == 'function' && callback();
  };

  /**
  * @method hideAction
  * @param callback {function}     回调函数
  * @description 隐藏时执行函数
  */
  options.hideAction = function (callback) {
    this.unBindEvents();
    this.root.hide();
    typeof callback == 'function' && callback();
  };

  /**
  * @method setzIndexTop
  * @param offset {int}
  * @description 设置z-index的值为最大
  */
  options.setzIndexTop = function (offset) {
    offset = typeof offset !== 'number' ? 0 : offset;
    this.root.css('z-index', uiBase.getBiggerzIndex() + offset);
  };

  /**
  * @method isNotCreate
  * @description 判断是否未创建根节点
  */
  options.isNotCreate = function () {
    return this.status === STATE_NOTCREATE;
  };

  /**
  * @method isShow
  * @description 判断是否显示
  */
  options.isShow = function () {
    return this.status === STATE_ONSHOW;
  };

  /**
  * @method isHide
  * @description 判断是否隐藏
  */
  options.isHide = function () {
    return this.status === STATE_ONHIDE;
  };

  /**
  * @method show
  * @param callback {function}
  * @description 显示时候的回调
  */
  options.show = function (callback) {
    if (this.status === STATE_ONSHOW)
      return;
    this.create();
    this.showAction($.proxy(function () {
      this.trigger('onShow');
      this.status = STATE_ONSHOW;
      callback && callback.call(this);
    }, this));
  };

  /**
  * @method hide
  * @param callback {function}
  * @description 隐藏时候的回调
  */
  options.hide = function (callback) {
    if (!this.root || this.status === STATE_ONHIDE) return;
    this.hideAction($.proxy(function () {
      this.trigger('onHide');
      this.status = STATE_ONHIDE;
      callback && callback.call(this);
    }, this));
  };

  /**
  * @method reposition
  * @description 重置root位置让其居中显示（多用于弹出层类）
  */
  options.reposition = function () {
    this.root.css({
      'margin-left': -($(this.root).width() / 2) + 'px',
      'margin-top': -($(this.root).height() / 2) + 'px'
    });
  };

  return cBase.Class(options);

});
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUIMask
* @description 蒙版
*/
define('cUIMask',['libs', 'cBase', 'cUIAbstractView'], function (libs, cBase, AbstractView) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  /** 相关属性 */
  options.__propertys__ = function () {
  };

  /** 构造函数入口 */
  options.initialize = function ($super, opts) {
    this.bindEvent();
    this.addClass(_config.prefix + 'mask');
    $super(opts);
  };

  /**
  * @method bindEvent
  * @description 为各个事件点注册事件
  */
  options.bindEvent = function () {
    this.addEvent('onCreate', function () {
      this.setRootStyle();
      this.onResize = $.proxy(function () {
        this.resize();
      }, this);

      this.onResize();
    });

    this.addEvent('onShow', function () {
      this.setzIndexTop(-1);
      $(window).bind('resize', this.onResize);

      this.root.bind('touchmove', function (e) {
        e.preventDefault();
      });

      this.onResize();
    });

    this.addEvent('onHide', function () {
      $(window).unbind('resize', this.onResize);
      this.root.unbind('touchmove');
    });

  };

  /**
  * @method setRootStyle
  * @description 设置根节点样式
  */
  options.setRootStyle = function () {
    this.root.css({
      position: 'absolute',
      left: '0px',
      top: '0px'
    });
  };

  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return '<div></div>';
  };

  /**
  * @method resize
  * @description 尺寸改变时候要重新计算位置
  */
  options.resize = function () {
    var w = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    var h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    this.root.css({
      width: '100%',
      height: h + 'px'
    });
  };

  return new cBase.Class(AbstractView, options);

});
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUILayer
* @description 弹出层类的父类
*/
define('cUILayer',['libs', 'cBase', 'cUIAbstractView', 'cUIMask'], function (libs, cBase, AbstractView, Mask) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  //  var _mask = new Mask({
  //    classNames: [_config.prefix + 'opacitymask']
  //  });

  /** 相关属性 */
  options.__propertys__ = function () {
    this.tpl = this.template([
                '<div class="' + _config.prefix + 'layer-padding">',
                '<div class="' + _config.prefix + 'layer-content"><%=content%></div>',
                '</div>'
            ].join(''));
    this.content = '';
    this.contentDom;
    this.mask = new Mask({
      classNames: [_config.prefix + 'opacitymask']
    });
    this.addClass(_config.prefix + 'layer');
    this.viewdata = {};
    this.windowResizeHander;
    this.setIntervalResource;
    this.setIntervalTotal = 0;
  };

  /** 构造函数入口 */
  options.initialize = function ($super, opts) {
    var allowConfig = {
      content: true
    };
    this.setOption(function (k, v) {
      switch (true) {
        case allowConfig[k]:
          this[k] = v;
          break;
        case 'class' === k:
          this.addClass(v);
          break;
      }
    });

    this.bindEvent();
    $super(opts);
    this.loadViewData();
  };

  /**
  * @method loadViewData
  * @description 加载viewdata
  */
  options.loadViewData = function () {
    this.viewdata.content = this.content;
  };

  /**
  * @method setViewData
  * @param data {Object}    数据参数
  * @description 设置viewdata
  */
  options.setViewData = function (data) {
    this.viewdata = cUtility.mix(this.viewdata, data);
    this.setRootHtml(this.createHtml());
  };

  /**
  * @method bindEvent
  * @description 绑定事件
  */
  options.bindEvent = function () {

    this.addEvent('onCreate', function () {
      this.windowResizeHander = $.proxy(this.reposition, this);
      this.contentDom = this.root.find('.' + _config.prefix + 'layer-content');
    });

    this.addEvent('onShow', function () {
      this.mask.show();
      $(window).bind('resize', this.windowResizeHander);

      //解决三星浏览器渲染问题
//      this.root.css('visibility', 'hidden');
      this.reposition();
      //显示以后，连续计算位置
      this.setIntervalResource = setInterval($.proxy(function () {
        if (this.setIntervalTotal < 10) {
          this.windowResizeHander();
        } else {
          this.setIntervalTotal = 0;
          this.root.css('visibility', 'visible');
          clearInterval(this.setIntervalResource);
        }
        this.setIntervalTotal++;
      }, this), 1);
      this.setzIndexTop();
    });

    this.addEvent('onHide', function () {
      $(window).unbind('resize', this.windowResizeHander);
      clearInterval(this.setIntervalResource);
      this.root.css('visibility', 'visible');
      this.mask.hide();

    });
  };

  /**
  * @method createHtml
  * @description 移除各个事件点添加需要回调的函数
  */
  options.createHtml = function () {
    return this.tpl(this.viewdata);
  };

  /**
  * @method createHtml
  * @param fn {function}    回调函数
  * @description 点击蒙版关闭控件时候要触发的事件
  */
  options.maskToHide = function (fn) {

    this.mask.root.on('click', $.proxy(function () {
      this.hide();
      typeof fn == 'function' && fn();
      this.mask.root.off('click');
    }, this));

    this.mask.addEvent('onHide', function () {
      this.root.off('click');
      this.root.remove();
    });

  };

  return new cBase.Class(AbstractView, options);
});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIAlter
* @description 提供alter类弹出框
*/
define('cUIAlert',['libs', 'cBase', 'cUILayer'], function (libs, cBase, Layer) {

  var _toString = Object.prototype.toString;
  var STYLE_CONFIRM = 'confirm';
  var STYLE_CANCEL = 'cancel';



  var _attributes = {};
  _attributes.onCreate = function () {
    this.loadButtons();
  };

  var options = {};



  var _config = {
    prefix: 'cui-'
  };

  options.__propertys__ = function () {
    this.tpl = this.template([
            '<div class="cui-pop-box">',
            '<%if(showTitle) {%>',
            '<div class="cui-hd">',
              '<div class="cui-text-center"><%=title%></div>',
            '</div>',
            '<% } %>',
              '<div class="cui-bd">',
                '<div class="cui-error-tips"><%=message%></div>',
                '<div class="cui-roller-btns">',
                '</div>',
              '</div>',
            '</div>'
        ].join(''));
    this.title = '';
    this.message = '';
    this.buttons = [{
      text: '确定',
      type: 'confirm',
      click: function () {
        this.hide();
      }
    }];
    this.viewdata = {
      title: '',
      message: '',
      showTitle: false
    };
  };

  options.initialize = function ($super, opts) {
    var allowOptions = {
      title: true,
      message: true,
      buttons: true,
      showTitle: true
    };
    this.setOption(function (k, v) {
      switch (true) {
        case allowOptions[k]:
          this[k] = v;
          break;
      }
    });
    this.addClass(_config.prefix + 'alert');
    $super($.extend(_attributes, opts));
    this.buildViewData();
  };

  options.buildViewData = function () {
    this.viewdata.title = this.title;
    this.viewdata.message = this.message;
    this.viewdata.showTitle = this.showTitle;
  };
  options.setViewData = function (data) {
    data.title && (this.title = data.title);
    data.message && (this.message = data.message);
    data.showTitle && (this.showTitle = this.showTitle);

    data.buttons && (this.buttons = data.buttons);
    this.buildViewData();

    //如果root没有创建这里需要
    if (!this.root) {
      this.root = this.createRoot();
    }

    this.setRootHtml(this.createHtml());
    this.loadButtons();
  };
  options.loadButtons = function () {
    if (!this.root) this.create();
    var btnBox = this.root.find('.cui-roller-btns');
    var btus = this.createButtons();
    btnBox.empty();
    $.each(btus, function (k, v) {
      btnBox.append(v);
    });
  };
  options.createButtons = function () {
    var btns = [], isarr = _toString.call(this.buttons) === '[object Array]', i = 0;
    var scope = this;
    $.each(this.buttons, function (k, v) {
      var text = '', cls = [], click = function () { };
      if (isarr) {
        text = v.text;
        v.cls && cls.push(v.cls);
        v.type = v.type ? v.type : (text == '取消' ? STYLE_CANCEL : STYLE_CONFIRM);
        switch (v.type) {
          case STYLE_CANCEL:
            cls.push('cui-btns-cancel');
            break;
          case STYLE_CONFIRM:
            cls.push('cui-btns-sure');
            break;
        };
        v.click && (click = v.click);
      } else {
        text = k;
        typeof v === 'function' && (click = v);
      }
      btns[i] = $('<div class="cui-flexbd ' + cls.join(' ') + '">' + text + '</div>');
      btns[i].addClass(cls.join(' '));
      btns[i].bind('click', $.proxy(click, scope));
      i++;
    });
    return btns;
  };
  options.createHtml = function () {
    return this.tpl(this.viewdata);
  };

  var Alert = new cBase.Class(Layer, options);
  Alert.STYLE_CONFIRM = STYLE_CONFIRM;
  Alert.STYLE_CANCEL = STYLE_CANCEL;
  return Alert;

});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIWarning
* @description 警告框
*/
define('cUIWarning',['libs', 'cBase', 'cUILayer', 'cUIMask'], function (libs, cBase, Layer, Mask) {

	var options = {};

	var _config = {
		prefix: 'cui-'
	};

	var _mask = new Mask({
		classNames: [_config.prefix + 'warning-mask']
	});

	var _calback = function () { };

	var _attributes = {};
	_attributes['class'] = _config.prefix + 'warning';

	_attributes.onCreate = function () {
		this.contentDom.html(
			'<div class="' + _config.prefix +
			'warning"><div class="blank"></div><p class="blanktxt">' +
			this.warningtitle +
			'</p></div>'
		);

		this.warningDom = this.contentDom.find('.blanktxt');


		this.root.bind('click', $.proxy(function () {
			this.callback && this.callback();
		}, this));

		_mask.create();

		_mask.root.bind('click', $.proxy(function () {
			this.callback && this.callback();
		}, this));
	};

	_attributes.onShow = function () {
		//this.mask.show();
		_mask.show();
	};

	_attributes.onHide = function () {
		//this.mask.hide();
		_mask.hide();
	};

	_attributes.setTitle = function (title, callback) {
		if (title) {
			this.create();
			this.warningDom.html(title);
			this.warningtitle = title;
		}

		if (callback) {
			this.callback = callback;
		} else {
			this.callback = function () { };
		}
	};

	_attributes.getTitle = function () {
		return this.warningtitle;
	};

	options.__propertys__ = function () {
		this.warningDom;
		this.warningtitle = '';
		this.callback = function () { };
		//this.mask;
	};

	options.initialize = function ($super, opts) {
		this.setOption(function (k, v) {
			switch (k) {
				case 'title':
					this.warningtitle = v;
					break;
			}
		});
		$super($.extend(_attributes, opts));
	};

	return new cBase.Class(Layer, options);

});
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUIHashObserve
* @description 观察hash变化
*/
define('cUIHashObserve',['libs', 'cBase'], function (libs, cBase) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  /** 相关属性 */
  options.__propertys__ = function () {
    this.hash;
    this.callback;
    this._hashchange = $.proxy(function () {
      this.hashchange();
    }, this);
    this.isend = true;
    this.scope;
  };

  /**
  * @method initialize
  * @param opts {object}        构造函数（实例化）传入的参数
  * @description 构造函数入口
  */
  options.initialize = function (opts) {
    this.setOption(opts);
  };

  /**
  * @method setOption
  * @param options {Object}        参数对象
  * @description 设置基本属性
  */
  options.setOption = function (options) {
    var allowOptions = { hash: true, callback: true, scope: true };
    for (var i in options) {
      switch (true) {
        case allowOptions[i]:
          this[i] = options[i];
          break;
      }
    }
  };

  /**
  * @method start
  * @description 开启监控
  */
  options.start = function () {
    this.isend = false;
    window.location.hash += '|' + this.hash;
    $(window).bind('hashchange', this._hashchange);
  };

  /**
  * @method end
  * @description 结束监控
  */
  options.end = function () {
    $(window).unbind('hashchange', this._hashchange);
    if (!this.isend) {
      this.isend = true;
      window.history.go(-1);
    }
  };

  /**
  * @method hashchange
  * @description hash变化时候执行的方法
  */
  options.hashchange = function () {
    var hash = window.location.hash;
    if (!hash.match(new RegExp('\\b' + this.hash + '\\b', 'ig'))) {
      this.isend = true;
      this.callback.call(this.scope || this);
      this.end();
    }
  };

  return new cBase.Class(options);

});
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUIPageView
* @description 用于非弹出层类继承
*/
define('cUIPageview',['libs', 'cBase', 'cUIAbstractView', 'cUIMask', 'cUIHashObserve'], function (libs, cBase, AbstractView, Mask, HashObserve) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

//  var _mask = new Mask({
//    classNames: [_config.prefix + 'warning-mask']
//  });

  /** 相关属性 */
  options.__propertys__ = function () {
    this.mask = new Mask({
      classNames: [_config.prefix + 'warning-mask']
    }); ;
    this.hashObserve = new HashObserve({
      hash: this.id,
      scope: this,
      callback: function () {
        this.hide();
      }
    });

  };

  /** 构造函数入口 */
  options.initialize = function ($super, opts) {
    this.addClass(_config.prefix + 'pageview');

    this.addEvent('onCreate', function () {
      this.mask.create();
      this.mask.root.css({
        background: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAPX19QAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==) repeat'
      });
      this.root.css({
        position: 'absolute',
        left: '0px',
        top: '0px'
      });
    });

    this.addEvent('onShow', function () {
      this.mask.show();
//      this.mask.root.css({
//        'z-index': '500'
//      });

      this.hashObserve.start();

      this.root.bind('touchmove', function (e) {
        e.preventDefault();
      });

    });

    this.addEvent('onHide', function () {
      this.mask.hide();
      setTimeout($.proxy(function () {
        this.hashObserve.end();
      }, this), 10);
    });

    // $super($.extend(_attributes, opts));
    $super(opts);
  };

  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return '';
  };

  return new cBase.Class(AbstractView, options);

});
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUIHeadWarning
* @description 带header的alert层
*/
define('cUIHeadWarning',['libs', 'cBase', 'cUIPageview'], function (libs, cBase, PageView) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  var _attributes = {};

  _attributes['class'] = _config.prefix + 'warning';

  _attributes.onCreate = function () {

    //l_wang 此处需要使用模板
    this.root.html([
        '<div class="head-warning">',
          '<div class="head-warning-padding">',
            '<div class="head-warning-header">',
              '<div class="head-warning-header-backbtu"><span class="returnico"></span></div>',
              '<div class="head-warning-header-title"></div>',
            '</div>',
              '<div class="head-warning-content">',
              '<div class="head-warning-content-icon"><div class="cui-load-error"><div class="cui-i cui-wifi cui-exclam"></div></div></div>',
              '<div class="head-warning-content-title"></div>',
            '</div>',
          '</div>',
        '</div>'
    ].join(''));

    this.addClass('head-warning-top');
    this.warningtitleDom = this.root.find('.head-warning-header-title');
    this.warningcontentDom = this.root.find('.head-warning-content-title');
    this.warningleftbtuDom = this.root.find('.head-warning-header-backbtu');

    this.warningleftbtuDom.bind('click', $.proxy(function () {
      this.callback && this.callback();
    }, this));
  };

  _attributes.onShow = function () {
    this.setzIndexTop();
    window.scrollTo(0, 0);
  };

  options.__propertys__ = function () {
    this.warningtitleDom;
    this.warningcontentDom;
    this.warningtitle = '';
    this.warningcontent = '';
    this.callback = function () {
    };
  };

  options.initialize = function ($super, opts) {
    $super($.extend(_attributes, opts));
  };

  /**
  * @method setTitle
  * @param title {String}       标题
  * @param content {String}     内容
  * @param callback {function}  回调函数
  * @description 设置标题，并且重写回调
  */
  options.setTitle = function (title, content, callback) {
    if (title) {
      this.create();
      this.warningtitleDom.html(title);
      this.warningcontentDom.html(content);
    }
    if (callback) {
      this.callback = callback;
    }
  };

  return new cBase.Class(PageView, options);

});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIWarning404
* @description 404提示框
*/
define('cUIWarning404',['libs', 'cBase', 'cUIPageview', 'cWidgetFactory', 'cWidgetGuider'], function (libs, cBase, PageView, WidgetFactory) {

  var Guider = WidgetFactory.create('Guider');


  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  var _calback = function () { };

  var _attributes = {};
  _attributes['class'] = _config.prefix + 'warning';

  _attributes.onCreate = function () {
    this.options();
  }

  _attributes.onShow = function () {
    this.mask.root.css({
      'z-index': '1000'
    });
    this.root.css({
      'z-index': '1001'
    });

    window.scrollTo(0, 0);
  };

  _attributes.onHide = function () {
    //this.root.find(".cui-btns-retry").css({display: ''});
    //重置为默认参数
    this.options({});
  };

  options.__propertys__ = function () {
    this.retryDom;
    this.tel = '4000086666';
    this.callback = function () { };

    this.hashObserve = {
      start: function () { },
      end: function () { }
    };
  };

  options.initialize = function ($super, opts) {
    $super(_attributes, opts);
  };
  options.retryClick = function (callback) {
    if (callback) {
      this.callback = callback;
    }
  }

  //add by wliao <wliao@Ctrip.com>
  var defaults = {
    loadFailCls: 'cui-wifi cui-fail-icon',
    loadFail: '加载失败，请稍后再试试吧',
    telText: '或者拨打携程客服电话',
    tryAgain: '重试',
    contact: '联系客服',
    showContact: true
  };

  var template = [
        '<div class="head-warning">',
            '<div class="head-warning-padding">',
                '<div class="head-warning-content">',
                    '<div class="cui-load-fail cui-text-center">',
                      '<div class="cui-load-error">',
                            '<div class="cui-i <%= loadFailCls %>">',
                            '</div>',
                      '</div>',
                      '<p class="cui-gray"><%= loadFail %></p>',
                      '<button type="button" class="cui-btns-retry"><%= tryAgain %></button>',
                      '<% if (showContact) { %>',
                      '<div class="cui-404-tel">',
                      '<div class="cui-glines"></div>',
                      '<p class="cui-grayc"><%= telText %></p>',
                      '<span id="telBtn" class="cui-btns-tel"><span class="cui-i cui-warning-kf"></span><%= contact %></span>',
                      '</div>',
                      '<% } %>',
                  '</div>',
                '</div>',
            '</div>',
        '</div>'
      ].join('');

  options.options = function (options) {
    options = _.extend({}, defaults, options || {});

    this.root.html(_.template(template, options));

    this.addClass('head-warning-top');
    this.retryDom = this.root.find('.cui-btns-retry');

    this.retryDom.on('click', $.proxy(function () {
      this.callback && this.callback();
    }, this));

    var self = this;
    if (options.showContact) {
      this.root.find('#telBtn').click(function () {
        Guider.apply({
          hybridCallback: function () {
            Guider.callService();
          },
          callback: function () {
            window.location.href = 'tel:' + self.tel;
          }
        });
      });
    }
  }

  return new cBase.Class(PageView, options);

});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIToast
* @description 提示框
*/
define('cUIToast',['libs', 'cBase', 'cUILayer'], function (libs, cBase, Layer) {

  var options = {};

  var _config = {
    prefix: 'cui-',
    sleep: 2
  };

  var _handler = null;

  var _showHandler = null;
  var _hideHandler = null;

  var _resetClickEvent = function (callback) {
    this.hide();

    if (callback && typeof callback === 'function') {
      callback.call(this);
    }

    $('.cui-opacitymask').unbind('click');
    $('.cui-toast').unbind('click');
  };

  var _setClickToHideEvent = function (clickToHide, callback) {
    var scope = this;
    var _clickCallback = function () {

        // 为什么要先unbind再rebind？
        //答:为了避免click事件队列的产生.确认每次注册的事件是干净的
      $('.cui-opacitymask').unbind('click').bind('click', function () {
        _resetClickEvent.call(scope, callback);
      });

      $('.cui-toast').unbind('click').bind('click', function () {
        _resetClickEvent.call(scope, callback);
      });
    }

    if (clickToHide) {
      setTimeout(_clickCallback, 400);
    }
  };

  var _show = function (title, sleep, callback, clickToHide) {
    var scope = this;
    this.setContent(title);

    if (typeof _showHandler === 'function') {
      _showHandler.call(this);
    };

    var _callback = function () {
      _resetClickEvent.call(scope, callback);
    }
    var _timeout = (sleep || _config.sleep) * 1000;
    _handler = setTimeout(_callback, _timeout);

    _setClickToHideEvent.call(this, clickToHide, callback);

    this.focusPosition = setInterval($.proxy(function () {
      var el = document.activeElement;
      if ($.needFocus(el)) {
        if (!this.focusPosition) this.focusPosition = true;
        var _top = parseInt($(el).offset().top) + 30;
        this.root.css({ 'top': _top + 'px', position: 'absolute' });
      }
    }, this), 20);

  };

  var _hide = function () {
    clearTimeout(_handler);
    if (this.focusPosition) {
        clearInterval(this.focusPosition);
        this.root.css({ 'top': '50%', position: 'fixed' });
    }
    if (typeof _hideHandler === 'function') {
      _hideHandler.call(this);
    };
  };

  options.__propertys__ = function () {

    _showHandler = this.show;
    _hideHandler = this.hide;

    this.show = _show;
    this.hide = _hide;
  };

  options.initialize = function ($super, options) {
    this.addClass([_config.prefix + 'toast']);
    $super(options);
  };

  options.setContent = function (content) {
    this.create();
    this.contentDom.html(content);
  };

  var Toast = new cBase.Class(Layer, options);
  return Toast;
});
define('cSales',['cBase', 'cStorage', 'libs', 'CommonStore', 'cModel'], function (cBase, cStorage, libs, CommonStore, AbstractModel) {
  var __SALES__ = null;
  var salesOStore = CommonStore.SalesObjectStore.getInstance();

  var getServerUrl = function (protocol) {
    // @description 直接调用AbstractModel的方法，如果是https的站点，需要传入protocol='https'
    return AbstractModel.baseurl(protocol);
  };

  var getSalesObject = function (sales, callback, error) {
    var salesObject = salesOStore.get(sales);
    if (salesObject) {
      __SALES__ = salesObject;
      if (!salesObject.appurl || salesObject.appurl.length <= 0) {
        $('#dl_app').hide();
      } else {
        $('#dl_app').show();
      }
      callback && callback(salesObject);
    } else {
      var serverPath = getServerUrl();
      var url = '/html5/ClientData/GetSalesInfo/' + sales;
      //            var url = 'http://' + (serverPath && serverPath.domain) + '/html5/ClientData/GetSalesInfo/' + sales;
      $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        success: $.proxy(function (data) {
          var _data = {};
          if (data.ServerCode == 1) {

            if (data.Data) {
              for (var i in data.Data) _data[i.toLowerCase()] = data.Data[i];
              data.Data = _data;
              salesOStore.set(data.Data, sales);
              var day = 30;
              if (data.Data && (data.Data.sales === 'ydwxcs' || data.Data.sales === '1622')) {
                day = 5;
              }
              if (!data.Data.appurl || data.Data.appurl.length <= 0) {
                $('#dl_app').hide();
              } else {
                $('#dl_app').show();
              }
              cStorage.localStorage.oldSet('SALESOBJ', JSON.stringify({
                data: data.Data,
                timeout: (new cBase.Date(cBase.getServerDate())).addDay(day).format('Y/m/d H:i:s')
              }));
            }
            __SALES__ = data.Data;
            callback && callback(data.Data);
          } else {
            error && error(data);
          }
        }, this),
        error: $.proxy(function (e) {
          error && error(e);
        }, this)
      });
    }
  };

  var getSales = function () {
      return __SALES__ || salesOStore.get();
    },
    setSales = function (sales) {
      CommonStore.SalesStore.getInstance().set({ 'sales': sales });
    },
    setSourceId = function (sourceid) {
      CommonStore.SalesStore.getInstance().set({ 'sourceid': sourceid });
    },
    setUnion = function (Union) {
      CommonStore.UnionStore.getInstance().set(Union);
    };
  var RegTel = /400\d{3}\d{4}/i,
    RegTelTitle = /400\s+\d{3}\s+\d{4}/i,
    RegTelTitle2 = /400-\d{3}-\d{4}/i;
  var ua = navigator.userAgent;
  var isApple = !!ua.match(/(ipad|iphone)/i),
    isAndroid = !!ua.match(/android/i),
    isWinPhone = !!ua.match(/MSIE/i);
  var replaceStrTel = window.replaceStrTel = function (str) {
    var salesObj = getSales();
    if (typeof str === 'string' && salesObj && salesObj.tel) {
      str = str.replace(RegTel, salesObj.tel);
      str = str.replace(RegTelTitle, salesObj.teltitle);
      if (salesObj.teltitle) str = str.replace(RegTelTitle2, salesObj.teltitle.split(' ').join('-'));
    }
    return str;
  };
  var getPlatFormCode = function () {

    var platform = null;
    if (isApple) {
      platform = "ios-app";
    } else if (isAndroid) {
      platform = "andreod-app";
    } else if (isWinPhone) {
      platform = "win-app";
    }
    return platform;
  };
  //替换app下载地址
  var replaceStrApp = function (str) {
    var salesObj = getSales();
    if (salesObj) {
      if (salesObj.isseo) {
        $('.module').show();
      }
      if (salesObj.appurl) {
        return salesObj.appurl;
      } else {
        var str = salesObj.sid ? salesObj.sid : salesObj.sales;
        return "/market/download.aspx?from=" + str;
      }
    }
    return null;
  };

  //替换页面中的400电话
  function replaceContent(el) {
    //修改链接中的电话
    var MARKLINKCLASS = '.__hreftel__',
    //修改内容中的电话
      MARKCONTCLASS = '.__conttel__',
    //修改应用的下载链接
      MAREAPPADDRESS = '.__appaddress__';
    $(el[0]).find(MARKLINKCLASS).each(function () {
      this.href = replaceStrTel(this.href);
    });
    $(el[0]).find(MARKCONTCLASS).each(function () {
      var $this = $(this);
      $this.html(replaceStrTel($this.html()));
    });
    //$(el[0]).find(MAREAPPADDRESS).each(function () {
    $(MAREAPPADDRESS).each(function () {
      var href = replaceStrApp();
      if (!href) {
        switch (true) {
          case isApple:
            href = $(this).attr('data-ios-app');
            break;
          case isAndroid:
            href = $(this).attr('data-android-app');
            break;
          case isWinPhone:
            href = $(this).attr('data-win-app');
            break;
        }
      }
      if (href) {
        $(this).attr('href', href);
      }

    });
  };

  function updateSales(inView) {
    var $el = inView.$el;
    // add get request UrlParameters function
    var getUrlParam = function (name) {
      var urls = document.location.href || '',
        re = new RegExp("(\\\?|&)" + name + "=([^&]+)(&|$)", "i"),
        m = urls.match(re);
      if (m) {
        return m[2];
      }
      return '';
    };
    if (!inView.getQuery) inView.getQuery = Lizard.P;
    !inView.getUrlParam ? inView.getUrlParam = getUrlParam : undefined;
    //1.优先获取url中的渠道参数
    var newSourceid = inView.getUrlParam('sourceid'),
      newSales = inView.getUrlParam('sales');
    //2.如果url中没有渠道参数，则判断referrer
    if ((!newSales || newSales.length <= 0) && (!newSourceid || newSourceid.length <= 0)) {
      var local = location.host, refUrl = document.referrer,
        seosales = '';
      if (local) {
        refUrl = refUrl.replace('http://', '').replace('https://', '').split('/')[0].toLowerCase();
        if (refUrl.indexOf('baidu') > -1) {
          seosales = 'SEO_BAIDU';
        }
        if (refUrl.indexOf('google') > -1) {
          seosales = 'SEO_GOOGLE';
        }
        if (refUrl.indexOf('soso.com') > -1) {
          seosales = 'SEO_SOSO';
        }
        if (refUrl.indexOf('sogou') > -1) {
          seosales = 'SEO_SOGOU';
        }
        if (refUrl.indexOf('so.com') > -1) {
          seosales = 'SEO_SO';
        }
        if (refUrl.indexOf('so.360') > -1) {
          seosales = 'SEO_360SO';
        }
        if (refUrl.indexOf('bing.com') > -1) {
          seosales = 'SEO_BING';
        }
        if (refUrl.indexOf('yahoo') > -1) {
          seosales = 'SEO_YAHOO';
        }
        if (refUrl.indexOf('youdao') > -1 || refUrl.indexOf('sm.cn') > -1) {
          seosales = 'SEO_YOUDAO';
        }
        if (refUrl.indexOf('jike.com') > -1 || refUrl.indexOf('babylon.com') > -1 || refUrl.indexOf('ask.com') > -1 || refUrl.indexOf('avg.com') > -1 || refUrl.indexOf('easou.com') > -1 || refUrl.indexOf('panguso.com') > -1 || refUrl.indexOf('yandex.com') > -1) {
          seosales = 'SEO_360SO';
        }

      }
    }

    //不需要再从LocalStorage取出渠道信息进行查询,故注释以下信息
    /*
     var appSourceid = window.localStorage.getItem('SOURCEID');
     var _sales = CommonStore.SalesStore.getInstance().get();
     var sales = inView.getUrlParam('sales') || seosales || (_sales && _sales.sales), sourceid = inView.getUrlParam('sourceid') || appSourceid || (_sales && _sales.sourceid);
     */
    if ((newSourceid && +newSourceid > 0) || (newSales && newSales.length > 0)) {
      //移除APP_DOWNLOAD
      cStorage.localStorage.oldRemove("APP_DOWNLOAD");
    }
    //3.如果渠道参数存在，则获取服务端的渠道配置
    if (newSourceid || newSales) {
      if (newSales) {
        setSales(newSales);
      }
      if (newSourceid) {
        setSourceId(newSourceid);
      }
      getSalesObject(newSales || newSourceid, $.proxy(function (data) {
        //如果没有配置下载渠道包，则隐藏下载广告浮层2014-1-4 caof
        if (!data.appurl || data.appurl.length <= 0) {
          if (inView && inView.footer && inView.footer.rootBox) {
            var ad = inView.footer.rootBox.find('#dl_app');
            if (ad && ad.length > 0) { ad.hide() };
          }
        }
        // end caof
        inView.warning404.tel = data && data.tel ? data.tel : '4000086666';
        replaceContent($el);
      }, inView));
    } else {
      if (newSales) setSales(newSales);
      //若已经存储有渠道信息，则替换渠道的电话，下载地址信息
      setTimeout(function () {
        replaceContent($el);
      }, 100);
    }
  }

  return {
    //替换当前页面中内容
    replaceContent: replaceContent,
    //接受一个参数，让其替换为
    replaceStrTel: replaceStrTel,
    //设置sales渠道
    setSales: setSales,
    getSales: getSales,
    getSalesObject: getSalesObject,
    setUnion: setUnion,
    //设置sourceid渠道
    setSourceId: setSourceId,
    updateSales: updateSales
  };
});
/**
* 广告组件
* @type {adOptions|*|{}}
*/

/**
* 判断手机是否安装app
* l_wang
*/
(function () {
  var AppUtility = {
    t: 600,
    hasApp: false,
    key: 'HAS_CTRIP_APP',
    appProtocol: 'ctrip://wireless',
    //传入参数，第一个是有app时候处理方案，第二个是没有app时候处理方案，有点情况函数返回ture才打开app，但是初次无论如何都会打开
    openApp: function (hasAppFunc, noAppFunc, appUrl) {
      //看是否已经获取了数据，已经获取过数据便有其它方案
      var appData = AppUtility.getAppData();
      var t1 = Date.now();
      if (appData && appData != '') {
        if (appData.hasApp) {
          if (typeof hasAppFunc == 'function') {
            if (hasAppFunc()) {
              if (appUrl && appUrl.length > 0) {
                window.location = appUrl;
              }
            }
          } else {
            if (appUrl && appUrl.length > 0) {
              window.location = appUrl;
            }
          }
        } else {
          (typeof noAppFunc == 'function') && noAppFunc();
        }
        return '';
      }
      if (!appUrl || appUrl.length <= 0) {
        (typeof noAppFunc == 'function') && noAppFunc();
      }
      var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
      var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0, isChrome = isAndroid && u.indexOf("chrome", 0) != -1 && u.indexOf("nexus", 0) == -1;
      var ifr = $('<iframe style="display: none;"></iframe>');
      ifr.attr('src', appUrl);
      $('body').append(ifr);
      //这里需要判断是不是android下的chrome，如果是的话就使用以下逻辑
      //如果不是便使用原来的逻辑
      if (isChrome) {
        if (appUrl && appUrl.length > 0) {
          window.location = appUrl;
        }
        setTimeout(function () {
          (typeof noAppFunc == 'function') && noAppFunc();
        }, 1);
      }

      setTimeout(function () {
        AppUtility.testApp(t1);
      }, AppUtility.t);
      AppUtility.setTestResult(hasAppFunc, noAppFunc);
    },
    testApp: function (t1) {
      var t2 = Date.now();
      if (t2 - t1 < AppUtility.t + 200) {
        AppUtility.hasApp = false;
      } else {
        AppUtility.hasApp = true;
      }
    },
    //设置探测结果
    setTestResult: function (hasAppFunc, noAppFunc) {
      setTimeout(function () {
        if (AppUtility.hasApp) {
          (typeof hasAppFunc == 'function') && hasAppFunc();
        } else {
          (typeof noAppFunc == 'function') && noAppFunc()
        }
        //一小时过期
        var expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 1);
        var entity = {
          value: { hasApp: AppUtility.hasApp },
          timeout: expireDate.toUTCString()
        };
        window.localStorage.setItem(AppUtility.key, JSON.stringify(entity));
        window.hasApp = AppUtility.hasApp;

      }, AppUtility.t + 1000);
    },
    //获取app信息
    getAppData: function () {
      //暂时不缓存数据
      return '';
      var result = window.localStorage.getItem(AppUtility.key);
      var needReset = false; //是否需要重新设置数据，1 过期则需要, 2 没数据需要
      if (result) {
        result = JSON.parse(result);
        if (Date.parse(result.timeout) >= new Date()) {
          return result.value;
        }
      }
      return '';
    }
  };
  window.AppUtility = AppUtility;
})();
var adOptions = adOptions || {};
adOptions.__propertys__ = function () {
};
/********************************
* @description: AdView初始化，主要是配置rootBox、绑定按钮事件
*/
adOptions.initialize = function ($super, config) {
  this.data = config || {};
  this.storeKey = 'APP_DOWNLOAD';
  $super(config);
};
adOptions.update = function (config) {
  if (this.isInFooter) {
    this.remove();
    this.isCreate = false;
  }
  this.rootBox = config.rootBox;
  if (!this.root) {
    this.root = this.rootBox;
  }
  this.isInFooter = !!this.rootBox.hasClass('js_in_Footer');

  if (this.addEvent) {
    this.removeEvent('onShow');
    this.addEvent('onShow', this.onShow);
  }
};
/********************************
* @description: 通过模板和开发者传入的数据生成HeaderView
*/
adOptions.createHtml = function () {
  var ss1 = adOptions.getUrlParam('sourceid'),
  ss2 = adOptions.getUrlParam('sales'),
  allianceid = adOptions.getUrlParam('allianceid'),
  sid = adOptions.getUrlParam('sid');

  var clazz = this.isInFooter ? '' : 'fix_bottom';
  var url = '/market/download.aspx?from=H5';
  var s = adOptions._get("SALES_OBJECT"), unionInfo = adOptions._get("UNION"), unionCookie = adOptions._getCookie('UNION');
  var sCss = '';

  if (allianceid && allianceid.length > 0 && sid && sid.length > 0) {
    sCss = 'display:none;';
  }
  if (unionInfo || unionCookie) {
    sCss = 'display:none;';
  }
  if (s && s.sid && +s.sid > 0) {
    if (!s.appurl || s.appurl.length <= 0) {
      sCss = 'display:none;';
    }
    url = s.appurl ? s.appurl : '/market/download.aspx?from=' + s.sid;
  }
  /*判断是否强制下载渠道*/
  /*if (ss1 && ss1.length > 0) {
  var isForceDown = 0;
  var lstSourceid = ['1657', '497', '1107', '1108', '3516', '3512', '3511', '3503', '3513', '1595', '1596', '3524', '3517', '3518', '1591', '1825', '1826', '1827', '1828', '1829', '1830', '1831', '1832', '1833'];
  for (var i = 0, len = lstSourceid.length; i < len; i++) {
  var d = lstSourceid[i];
  if (d == ss1) { isForceDown = 1; break; }
  }
  if (isForceDown) { sCss = 'display:none;'; }
  }*/
  /**判断是否已经强制下载过，若已经强制下载则不显示广告**/
  /*if (adOptions.isAutoDown(s.sid)) {
  sCss = 'display:none;';
  }*/

  if (this.checkDeviceSupport() == false) {
    sCss = 'display:none;';
  }
  if (sCss.length > 0) {
    if ($('footer')) $('footer').removeClass('pb85');
    if ($('div[data-role="footer"]')) $('div[data-role="footer"]').removeClass('pb85');
    if ($('#panel-box')) {
      $('#panel-box').removeClass('pb85');
    }
    if ($('.f_list')) {
      $('.f_list').removeClass('pb85');
    }
    adOptions.saveExpire(1);
    return '';
  }
  var appUrl = this.setAppUrl();
  return ['<div data-appurl="' + appUrl + '" id="dl_app" style="' + sCss + '" class="', clazz,
  '"> <div id="icon_text" class="txt_middle"><img src="http://res.m.ctrip.com/html5/content/images/icon_text_s6_1.png"/></div>',
  ' <a href="' + url + '" id="app_link" class="txt_middle __appaddress__"><img src="http://res.m.ctrip.com/html5/content/images/icon_open_s6.png"/></a>',
  '<div id="close_icon"></div>',
  '</div>'].join('');
};
adOptions.getUrlParam = function (name) {
  //var aParams = document.location.search.substr(1).split('&');
  var urls = document.location.href || '', re = new RegExp("(\\\?|&)" + name + "=([^&]+)(&|$)", "i"), m = urls.match(re);
  if (m) return m[2];
  return '';
};
//设置app协议url
adOptions.setAppUrl = function () {
  //获取渠道信息
  //应当在SALES取,SALES_OBJECT可能存在数据未取回的情况 shbzhang 2014/5/21
  var sourceInfo = adOptions._get("SALES");
  // var sourceInfo = adOptions._get("SALES_OBJECT");
  var appUrl = AppUtility.appProtocol;
  var bizName = null, searchInfo = null, c1 = null, c2 = null, c3 = null, c4 = null, c5 = null, c6 = null, c7 = null, c8 = null, c9 = null, c10 = null, c11 = null;
  var pageId = $('#page_id').val();
  console.log(pageId);
  var _reg = new RegExp("-", "g"), _reg2 = new RegExp("/", "g"); //创建正则RegExp对象
  if (pageId && +pageId > 0) {
    //begin 酒店（国内常规/周边）
    if (+pageId == 212092 || +pageId == 212093 || +pageId == 212094 || +pageId == 210090) {
      //国内常规酒店搜索/列表/详情页
      bizName = +pageId == 212092 ? 'hotel_inquire' : (+pageId == 212093 || +pageId == 210090) ? "hotel_inland_list" : +pageId == 212094 ? "InlandHotel" : "";
      searchInfo = window.localStorage ? window.localStorage.getItem("HOTELSEARCHINFO") : null;
      if (searchInfo) {
        searchInfo = JSON.parse(searchInfo);
        if (+pageId == 212092) {
          //国内常规酒店搜索
          if (searchInfo.data) {
            c1 = searchInfo.data.CheckInDate.replace(_reg, ''); //入住时间（必需，格式YYYYMMDD）
            c2 = searchInfo.data.CheckOutDate.replace(_reg, ''); //离店时间（必需，格式YYYYMMDD）
            c3 = searchInfo.data.CheckInCityID; //酒店城市ID(必需)
            c4 = searchInfo.data.DistrictId ? +searchInfo.data.DistrictId <= 0 ? "" : searchInfo.data.DistrictId : ""; //景区ID (可选)
            c5 = searchInfo.data.BrandId; //品牌ID (可选)
            c6 = searchInfo.data.BrandName; //品牌名称 (可选)
            c7 = 0; //品牌类型(可选，0：全部品牌，1：经济型连锁品牌，默认0)
          }
          bizName += '?c1=' + (c1 || '') + "&c2=" + (c2 || '') + "&c3=" + (c3 || '') + "&c4=" + (c4 || '') + "&c5=" + (c5 || '') + "&c6=" + (c6 || '') + "&c7=" + (c7 || '');
        }
        if (+pageId == 212093 || +pageId == 210090) {
          //国内常规酒店列表
          if (searchInfo.data) {
            c1 = searchInfo.data.CheckInDate.replace(_reg, ''); //入住时间（必需，格式YYYYMMDD）
            c2 = searchInfo.data.CheckOutDate.replace(_reg, ''); //离店时间（必需，格式YYYYMMDD）
            c3 = searchInfo.data.CheckInCityID; //酒店城市ID(必需)
            c4 = searchInfo.data.DistrictId ? +searchInfo.data.DistrictId <= 0 ? "" : searchInfo.data.DistrictId : ""; //景区ID (可选)
            c5 = 0; //酒店类型(0：国内，1：海外) (预留，目前没有海外)
            c6 = searchInfo.data.BrandId ? +searchInfo.data.BrandId <= 0 ? "" : searchInfo.data.BrandId : ""; //品牌ID (可选)
            c7 = searchInfo.data.BrandName || '';  //品牌名称 (可选)
            c8 = 0; //品牌类型(可选，0：全部品牌，1：经济型连锁品牌，默认0)
            c9 = 1; //查询类型(必须，1：按城市查询，2：按经纬度查询) 无论查询类型都需要有cityID；districtId可选 按经纬度查询必须有经纬度信息
            c10 = ''; //纬度，按经纬度查询时必须传值
            c11 = ''; //经度，按经纬度查询时必须传值
            if (+pageId == 210090) {
              c9 = 2;
              c10 = searchInfo.data.Latitude;
              c11 = searchInfo.data.Longitude;
            }
          }
          bizName += '?c1=' + (c1 || '') + "&c2=" + (c2 || '') + "&c3=" + (c3 || '') + "&c4=" + (c4 || '') + "&c5=" + (c5 || '') + "&c6=" + (c6 || '') + "&c7=" + (c7 || '') + "&c8=" + (c8 || '') + "&c9=" + (c9 || '') + "&c10=" + (c10 || '') + "&c11=" + (c11 || '');
        }
        if (+pageId == 212094) {
          //国内常规酒店详情页
          if (searchInfo.data) {
            c1 = searchInfo.data.CheckInDate.replace(_reg, ''); //入住时间（必需，格式YYYYMMDD）
            c2 = searchInfo.data.CheckOutDate.replace(_reg, ''); //离店时间（必需，格式YYYYMMDD）
            c3 = searchInfo.data.CheckInCityID; //酒店城市ID(必需)

          }
          var detailInfo = window.localStorage ? window.localStorage.getItem("HOTELDETAIL") : null;
          if (detailInfo) {
            detailInfo = JSON.parse(detailInfo);
            if (detailInfo && detailInfo.data) {
              c4 = detailInfo.data.HotelID; //酒店ID(必需)
            }
          }
          bizName += '?checkInDate=' + (c1 || '') + "&checkOutDate=" + (c2 || '') + "&cityId=" + (c3 || '') + "&hotelId=" + (c4 || '');
        }
      }
    }
    //end 酒店

    //begin 团购
    if (+pageId == 212001 || +pageId == 214008) {
      //团购列表/详情页
      bizName = +pageId == 212001 ? 'hotel_groupon_list' : +pageId == 214008 ? "hotel_groupon_detail" : "";
      if (+pageId == 212001) {
        //团购列表
        searchInfo = window.localStorage ? window.localStorage.getItem("TUAN_SEARCH") : null;
        searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
        c1 = searchInfo && searchInfo.value ? searchInfo.value.ctyId : "2";
        bizName += '?c1=' + (c1 || '2');
      }
      if (+pageId == 214008) {
        //团购详情
        searchInfo = window.localStorage ? window.localStorage.getItem("TUAN_DETAILS") : null;
        searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
        c1 = searchInfo && searchInfo.value ? searchInfo.value.id : null; //产品ID（必需）
        bizName += '?c1=' + (c1 || '');
      }
    }
    // end 团购
    //begin 机票（国内/国际）
    if (+pageId == 212003 || +pageId == 212004 || +pageId == 212009 || +pageId == 214019 || +pageId == 214209 ||
  +pageId == 212042) {
      //机票搜索/列表页
      searchInfo = window.localStorage ? window.localStorage.getItem("S_FLIGHT_AirTicket") : null;
      searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
      if (searchInfo && searchInfo.value && searchInfo.value._items && searchInfo.value._items.length > 0) {
        c1 = searchInfo.value.tripType; //单程/往返(1/2)（必需）
        c2 = searchInfo.value._items[0].dCtyId; //出发城市id （必需）
        c3 = searchInfo.value._items[0].aCtyId; //到达城市id（必需）
        c4 = searchInfo.value._items[0].date.replace(_reg2, ''); //出发时间（yyyymmdd）（必需）
        if (c1 && +c1 > 1 && searchInfo.value._items.length > 1) {
          c5 = searchInfo.value._items[1].date.replace(_reg2, ''); //出发时间（yyyymmdd）（必需）
        }

        var subInfo = window.localStorage ? window.localStorage.getItem("S_FLIGHT_SUBJOIN") : null;
        if (+pageId == 214019 || +pageId == 214209) {
          subInfo = window.localStorage ? window.localStorage.getItem("S_FLIGHT_INTLAirTicket") : null;
        }
        subInfo = subInfo ? JSON.parse(subInfo) : null;
        c6 = ""; //筛选舱位（可选）1：经济舱  5：公务/头等舱
        c7 = ""; //排序类型（预留）1:起飞时间升序 2:起飞时间降序 3:价格升序 4：价格降序

        c8 = ''; //筛选出发/到达（预留）格式：departFilterAirportCode|arriveFilterAirportCode 通过竖线区分筛选的是出发还是到达机场
        c9 = ''; //筛选起飞时间（预留）格式：0600|1200
        c10 = ''; //筛选机型（预留）1大型机 2 中型机 3 小型机
        c11 = ''; //筛选航司（预留）航空公司二字码
        if (subInfo && subInfo.value) {
          if (+pageId == 214019 || +pageId == 214209) {
            c6 = 1;
            /*国际机票
            c6=国际乘客类型，成人/儿童（1/2）（预留，默认成人）
            c7 仓位（可选）1：经济舱  2：超级经济舱3：公务舱4：头等舱
            c8 排序类型（预留）1:起飞时间升序 2:起飞时间降序 3:价格升序 4：价格降序 5:耗时升序6:耗时降序
            c9 筛选航司（可选）航空公司二字码
            */
            //1：经济舱  2：超级经济舱3：公务舱4：头等舱
            if (+subInfo.value['class'] == 0) {
              c7 = "1";
            }
            if (+subInfo.value['class'] == 1) {
              c7 = "2";
            }
            if (+subInfo.value['class'] == 2) {
              c7 = "3";
            }
            if (+subInfo.value['class'] == 3) {
              c7 = "4";
            }
            //排序类型（预留）1:起飞时间升序 2:起飞时间降序 3:价格升序 4：价格降序 5:耗时升序6:耗时降序
            if (+subInfo.value.sortRule == 2) {
              //1:起飞时间升序 2:起飞时间降序
              if (+subInfo.value.sortType == 2) {
                c8 = "1";
              }
              if (+subInfo.value.sortType == 1) {
                c8 = "2";
              }
            }
            if (+subInfo.value.sortRule == 1) {
              //3:价格升序 4：价格降序 5:耗时升序6:耗时降序
              if (+subInfo.value.sortType == 2) {
                c8 = "3";
              }
              if (+subInfo.value.sortType == 1) {
                c8 = "4";
              }
            }
            if (+pageId == 214209) {
              c7 = c8 = c9 = '';
            }
          }
          else {
            if (subInfo.value['departfilter-type'] == "1") {
              if (subInfo.value['departfilter-value'] == "3") {
                c6 = "5";
              }
              if (subInfo.value['departfilter-value'] == "0") {
                c6 = "1";
              }
            }
            if (subInfo.value['depart-sorttype'] == "price") {
              if (subInfo.value['depart-orderby'] == "asc")
                c7 = "3";
              if (subInfo.value['depart-orderby'] == "desc")
                c7 = "4";
            }
            if (subInfo.value['depart-sorttype'] == "time") {
              if (subInfo.value['depart-orderby'] == "asc")
                c7 = "1";
              if (subInfo.value['depart-orderby'] == "desc")
                c7 = "2";
            }
            if (subInfo.value['departfilter-type'] == "0") {
              //筛选起飞时间（预留）格式：0600|1200
              c9 = subInfo.value['departfilter-value'] || '';
              c9 = c9.replace('-', '|');
              c9 = c9.replace(':', '');
              c9 = c9.replace(':', '');
            }
            if (subInfo.value['departfilter-type'] == "2") {
              c11 = subInfo.value['departfilter-value'] || '';
            }
            if (+pageId == 212009) {
              c6 = c7 = c8 = c9 = c11 = '';
            }
          }
        }
      }
      //机票与旅行日程追加控制 mwli c1=20140130&c2=MU5137&c3=SHA&c4=PEK
      searchInfo = !searchInfo && window.localStorage ? window.localStorage.getItem("AIRSTATE_DETAIL_PARAM") : null;
      searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
      if (searchInfo && searchInfo.data) {
        c1 = searchInfo.data.fdate || "";
        c2 = searchInfo.data.fNo || "";
        c3 = searchInfo.data.dPort || "";
        c4 = searchInfo.data.aPort || "";
      }
      if (+pageId == 212003) {
        //机票搜索
        bizName = 'flight_inquire';
      }
      if (+pageId == 212009 || +pageId == 212004) {
        //国内机票列表页
        bizName = c1 && +c1 > 1 ? 'flight_inland_tolist' : "flight_inland_singlelist";
      }
      if (+pageId == 214019 || +pageId == 214209) {
        //国际机票列表页
        bizName = c1 && +c1 > 1 ? 'flight_int_tolist' : "flight_int_singlelist";
      }
      if (+pageId == 212042) {
        bizName = "flight_board_detail";
      }
      bizName += '?c1=' + (c1 || '') + "&c2=" + (c2 || '') + "&c3=" + (c3 || '') + "&c4=" + (c4 || '') + "&c5=" + (c5 || '') + "&c6=" + (c6 || '') + "&c7=" + (c7 || '') + "&c8=" + (c8 || '') + "&c9=" + (c9 || '') + "&c10=" + (c10 || '') + "&c11=" + (c11 || '');
    }
    //end 机票

    //begin 火车票查询/列表页
    if (+pageId == 212071 || +pageId == 212072) {
      bizName = +pageId == 212071 ? "train_inquire" : 'train_list';
      //产品查询页：出发地，目的地，出发日期。产品列表页：出发地，目的地，出发日期。
      searchInfo = window.localStorage ? window.localStorage.getItem("TRAINSSEARCHINFO") : null;
      searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
      if (searchInfo && searchInfo.data) {
        //c1出发车站ID（可选）
        //c2到达站ID（可选）
        //c3出发日期（yyyyMMdd可选）
        c1 = searchInfo.data.DepartCityId || '';
        c2 = searchInfo.data.ArriveCityId || '';
        c3 = searchInfo.data.DepartDate || '';
        c3 = c3.replace(_reg, '');
      }
      bizName += '?c1=' + (c1 || '') + "&c2=" + (c2 || '') + "&c3=" + (c3 || '');
    }
    //end 火车票
    //begin 旅游（旅游频道首页/周边短途游/团队游/邮轮游）产品查询页，产品列表页，产品详情页
    if (+pageId == 214040 || +pageId == 214045
  || +pageId == 214046 || +pageId == 214041 || +pageId == 214345
  || +pageId == 214346 || +pageId == 214042 || +pageId == 214353 || +pageId == 214354) {
      c1 = c2 = c3 = c4 = c5 = c6 = '';
      searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_LIST_PARAM") : null;
      searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
      //vacation_home	旅游首页
      if (+pageId == 214040) {
        bizName = 'vacation_home';
      }
      //周边短途游产品列表页
      if (+pageId == 214045) {
        bizName = 'vacation_weekend_list';
        /*
        cityId	出发城市ID（必需）c1
        districtId	景区ID (可选) c2
        travelDaysId	游玩天数ID（可选）c3
        levelId	产品等级ID（可选）c4
        isSelfProudct	只看携程自营（可选：1是、0否）c5
        isDiscount	只看优惠产品（可选：1是、0否）c6
        */
        if (searchInfo && searchInfo.value) {
          c1 = searchInfo.value.dCtyId;
          if (searchInfo.value.qparams || searchInfo.value.qparams.length > 0) {
            for (var s in searchInfo.value.qparams) {
              var qparams = searchInfo.value.qparams[s];
              if (qparams && qparams.type) {
                // districtId	景区ID (可选)
                if (+qparams.type == 3) {
                  c2 = qparams.val;
                }
                //travelDaysId	游玩天数ID（可选）
                if (+qparams.type == 2) {
                  c3 = qparams.val;
                }
                // isSelfProudct	只看携程自营（可选：1是、0否）
                if (+qparams.type == 6) {
                  c5 = qparams.val;
                }
                //isDiscount	只看优惠产品（可选：1是、0否）
                if (+qparams.type == 7) {
                  c6 = qparams.val;
                }
              }
            }
          }
        }
        bizName += '?cityId=' + (c1 || '') + "&districtId=" + (c2 || '') + "&travelDaysId=" + (c3 || '') + "&levelId=" + (c4 || '') + "&isSelfProudct=" + (c5 || '') + "&isDiscount=" + (c6 || '');
      }
      //周边短途游产品详情页
      if (+pageId == 214046) {
        bizName = 'vacation_nearby_detail';
        /*departCityId	出发城市ID（必需）c1 productId	产品ID (必需) c2 */
        c1 = c2 = '';
        searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_DETAIL_PARAM") : null;
        searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
        if (searchInfo && searchInfo.value) {
          c1 = searchInfo.value.dCtyId || '';
          c2 = searchInfo.value.pid || '';
        }
        bizName += '?departCityId=' + (c1 || '') + "&productId=" + (c2 || '');
      }
      //团队游产品查询页214041
      if (+pageId == 214041) {
        bizName = 'vacation_group_inquire';
        c1 = c2 = c3 = c4 = '';
        searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_GROUP_SEARCH_PARAM") : null;
        searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
        if (searchInfo && searchInfo.value) {
          /*
          departCityId	出发城市ID（可选）c1
          arriveName	到达城市名、关键字 （可选）c2
          travelDaysId	游玩天数ID（可选）c3
          levelId	产品等级ID（可选）c4
          */
          c1 = searchInfo.value.dCtyId;
          c2 = searchInfo.value.destKwd;
        }
        bizName += '?departCityId=' + (c1 || '') + "&arriveName=" + (c2 || '') + "&travelDaysId=" + (c3 || '') + "&levelId=" + (c4 || '');
      }
      //团队游产品列表页214345
      if (+pageId == 214345) {
        bizName = 'vacation_group_list';
        c1 = c2 = c3 = c4 = c5 = c6 = c7 = '';
        searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_LIST_PARAM") : null;
        searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
        if (searchInfo && searchInfo.value) {
          /*
          departCityId	出发城市ID（必需）c1
          arriveName	到达城市名、关键字 (必需) c2
          districtId	景区ID (可选) c3
          travelDaysId	游玩天数ID（可选）c4
          levelId	产品等级ID（可选）c5
          isSelfProduct	只看携程自营（可选：1是、0否）c6
          isDiscount	只看优惠产品（可选：1是、0否）c7
          */
          //begin 参数设置
          c1 = searchInfo.value.dCtyId;
          c2 = searchInfo.value.destKwd;
          if (searchInfo.value.qparams || searchInfo.value.qparams.length > 0) {
            for (var s in searchInfo.value.qparams) {
              var qparams = searchInfo.value.qparams[s];
              if (qparams && qparams.type) {
                // districtId	景区ID (可选)
                if (+qparams.type == 3) {
                  c3 = qparams.val;
                }
                //travelDaysId	游玩天数ID（可选）
                if (+qparams.type == 2) {
                  c4 = qparams.val;
                }
                // isSelfProudct	只看携程自营（可选：1是、0否）
                if (+qparams.type == 6) {
                  c6 = qparams.val;
                }
                //isDiscount	只看优惠产品（可选：1是、0否）
                if (+qparams.type == 7) {
                  c7 = qparams.val;
                }
              }
            }
          }
          //end 参数设置
        }
        //end
        bizName += '?departCityId=' + (c1 || '') + "&arriveName=" + (c2 || '') + "&districtId=" + (c3 || '') + "&travelDaysId=" + (c4 || '') + "&levelId=" + (c5 || '') + "&isSelfProduct=" + (c6 || '') + "&isDiscount=" + (c7 || '');
      }
      //团队游产品详情页
      if (+pageId == 214346) {
        bizName = 'vacation_group_detail';
        /*
        departCityId	出发城市ID（必需）c1
        productId	产品ID (必需) c2
        */
        c1 = c2 = '';
        searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_DETAIL_PARAM") : null;
        searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
        if (searchInfo && searchInfo.value) {
          c1 = searchInfo.value.dCtyId || '';
          c2 = searchInfo.value.pid || '';
        }
        bizName += '?departCityId=' + (c1 || '') + "&productId=" + (c2 || '');
      }
      //邮轮游产品查询页
      if (+pageId == 214042) {
        bizName = 'vacation_cruises_inquire';
        searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_CRUISE_SEARCH_PARAM") : null;
        searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
        c1 = c2 = '';
        if (searchInfo && searchInfo.value) {
          /*
          departCityId	出发城市ID（可选）c1
          routeId	航线ID (可选) c2
          */
          c1 = searchInfo.value.dCtyId || '';
          if (searchInfo.value.qparams || searchInfo.value.qparams.length > 0) {
            for (var s in searchInfo.value.qparams) {
              var qparams = searchInfo.value.qparams[s];
              if (+qparams.type == 14) {
                c2 = qparams.val;
              }
            }
          }
        }
        bizName += '?departCityId=' + (c1 || '') + "&routeId=" + (c2 || '');
      }
      //邮轮游产品列表页
      if (+pageId == 214353) {
        bizName = 'vacation_cruises_list';
        searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_LIST_PARAM") : null;
        searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
        c1 = c2 = c3 = c4 = c5 = c6 = c7 = '';
        if (searchInfo && searchInfo.value) {
          /*
          departCityId	出发城市ID（必需）c1
          routeId	航线ID (必需) c2
          companyId	油轮公司ID (可选) c3
          productFormId	产品形态ID（可选） c4
          portDepartId	出发港口ID（可选）c5
          isSelfProduct	只看携程自营（可选：1是、0否）c6
          isDiscount	只看优惠产品（可选：1是、0否）c7
          */
          c1 = searchInfo.value.dCtyId;
          if (searchInfo.value.qparams || searchInfo.value.qparams.length > 0) {
            for (var s in searchInfo.value.qparams) {
              var qparams = searchInfo.value.qparams[s];
              if (qparams) {
                if (+qparams.type == 14) {
                  //	航线ID (必需)
                  c2 = qparams.val;
                }
                // 油轮公司ID (可选)
                if (+qparams.type == 10) {
                  c3 = qparams.val;
                }
                //产品形态ID（可选）
                if (+qparams.type == 11) {
                  c4 = qparams.val;
                }
                // portDepartId出发港口ID（可选）
                if (+qparams.type == 12) {
                  c5 = qparams.val;
                }
                // isSelfProudct	只看携程自营（可选：1是、0否）
                if (+qparams.type == 6) {
                  c6 = qparams.val;
                }
                //isDiscount	只看优惠产品（可选：1是、0否）
                if (+qparams.type == 7) {
                  c7 = qparams.val;
                }
              }
              //end
            }
          }
          //end
        }
        bizName += '?departCityId=' + (c1 || '') + "&routeId=" + (c2 || '') + "&companyId=" + (c3 || '') + "&productFormId=" + (c4 || '') + "&portDepartId=" + (c5 || '') + "&isSelfProduct=" + (c6 || '') + "&isDiscount=" + (c7 || '');
      }
      //邮轮游产品详情页
      if (+pageId == 214354) {
        bizName = 'vacation_cruises_detail';
        searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_DETAIL_PARAM") : null;
        searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
        c1 = c2 = '';
        if (searchInfo && searchInfo.value) {
          c1 = searchInfo.value.dCtyId || '';
          c2 = searchInfo.value.pid || '';
        }
        bizName += '?departCityId=' + (c1 || '') + "&productId=" + (c2 || '');
      }
    }
    //end 旅游
  }
  //end bizName
  appUrl += bizName ? "/" + bizName : '';
  //h5 app 跳转hybird 传参数  slh
  var view = this.getCurrentView();
  if (view && view.getAppUrl) {
    appUrl = AppUtility.appProtocol + view.getAppUrl();
  }
  if (appUrl.indexOf('?') <= -1) {
    appUrl += '?v=2';
  }
  //取Sales数据 shbzhang 2014/5/21
  if (sourceInfo && sourceInfo.sourceid && +sourceInfo.sourceid > 0) {
    appUrl += '&extendSourceID=' + sourceInfo.sourceid;
  } else {
    appUrl += '&extendSourceID=8888';
  }
  console.log("open Url :" + appUrl);
  return appUrl;
};
/********************************
* @description: onShow时候的回调，绑定Adview上的事件
*/
adOptions.onShow = function () {
  this.root.off('click');
  this.root.find('#close_icon').on('click', $.proxy(function () {
    this.saveExpire(1);
    this.hide();
    if ($('footer')) {
      $('footer').removeClass('pb85');
    }
    if ($('#panel-box')) {
      $('#panel-box').removeClass('pb85');
    }
    if ($('div[data-role="footer"]')) {
      $('div[data-role="footer"]').removeClass('pb85');
    }
    if ($('.f_list')) {
      $('.f_list').removeClass('pb85');
    }
  }, this));

  var scope = this;
  //修改点击逻辑l_wang
  this.root.find('#app_link').off('click').on('click', function (e) {
    e.preventDefault();
    // 修改this指向错误  slh
    var url = $(this).attr('href'),
  appUrl = scope.setAppUrl(),
  pageId = $('#page_id').val(),
  u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
    console.log(url);
    var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0;
    if (isMac) {
      window.location = appUrl;
      setTimeout(function () {
        window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
      }, 30);
    } else {
      AppUtility.openApp(function () {
        scope.saveExpire();
        //scope.hide();非用户主动关闭，不隐藏广告浮层
        return true;
      }, function () {
        window.location = url;
      }, appUrl);
    }
    return false;
  });

  if (this.checkDeviceSupport() == false) {
    //this.hide();
    //fix pc 浏览器访问,导致团购酒店入口消失的问题 shbzhang 2014/1/6
    if (this.root.attr('id') == 'dl_app') {
      this.root.hide();
    }
    if ($('footer')) $('footer').removeClass('pb85');
    if ($('div[data-role="footer"]')) $('div[data-role="footer"]').removeClass('pb85');
    if ($('#panel-box')) {
      $('#panel-box').removeClass('pb85');
    }
    if ($('.f_list')) {
      $('.f_list').removeClass('pb85');
    }
  }
};

//l_wang测试是否android ios，不是就得关闭
adOptions.checkDeviceSupport = function () {
  var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
  var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0;
  var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0;
  if (isMac == 0 && isAndroid == 0) {
    return false;
  }
  return true;
};
/**
* 保存失效时间 update 2014-1-13  增加isClose，用于标记是否是用户主动点击关闭（isClose=1标识用户主动关闭广告浮层）
*/
adOptions.saveExpire = function (isClose) {
  var data = { isExpire: 1 }, timeout = new Date();
  if (isClose) {
    data.isClose = isClose;
  }
  timeout.setDate(timeout.getDate() + 1);
  if (!this.storeKey) {
    this.storeKey = "APP_DOWNLOAD";
  }
  this._set(this.storeKey, data, timeout.toUTCString());
};
/***********设置是否已经自动下载过客户端************/
adOptions.saveAutoDown = function (sourceid) {
  var data = { isAutoDown: 1, sid: sourceid }, timeout = new Date();
  timeout.setDate(timeout.getDate() + 1);
  this._set("APP_AUTODOWNLOAD", data, timeout.toUTCString());
};

adOptions.appDownload = function () {
  var self = this;
  //获取渠道信息
  var s = adOptions._get("SALES_OBJECT");
  var appUrl = AppUtility.appProtocol;
  if (s && s.sid && +s.sid > 0) {
    appUrl += '?extendSourceID=' + s.sid;
  } else {
    appUrl += '?extendSourceID=8888';
  }
  var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
  var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0;
  if (isMac) {
    window.location = appUrl;
    setTimeout(function () {
      window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
    }, 30);
  } else {
    /*************end 2014-1-13 caofu************/
    //传入处理函数，第一个是有app时候处理方案，第二个是没有app时候处理方案
    //安装app情况下，第一个参数为true才会打开app，但是初次无论如何都会打开
    AppUtility.openApp(function () {
      return true;
    }, function () {
      var url = "http://m.ctrip.com/market/download.aspx?from=H5";
      if (s) {
        if (s.appurl && s.appurl.length > 0)
          url = s.appurl;
        else if (s.sid && +s.sid > 0) {
          url = "http://m.ctrip.com/market/download.aspx?from=" + s.sid;
        }
      }
      window.location.href = url;
    }, appUrl);
  }
};

//check auto download，强制下载l_wang修改过了
adOptions.checkForceDownload = function (sourceid) {
  /*
  //调整自动下载需求：必须传入
  var self = this;
  if (!sourceid || sourceid.length <= 0 || +sourceid <= 0) return;
  //获取渠道信息
  var s = adOptions._get("SALES_OBJECT");
  //判断用户网络环境，若不是wifi环境，则不自动下载
  if (navigator.connection) {
  if (navigator.connection.type != navigator.connection.WIFI) {
  adOptions.saveExpire(1);
  adOptions.saveAutoDown(sourceid);
  return;
  }
  }
  //判断是否已经强制下载，若已强制下载则不再执行自动下载
  if (adOptions.isAutoDown(sourceid)) {
  adOptions.saveExpire(1);
  adOptions.saveAutoDown(sourceid);
  return;
  }
  var appUrl = adOptions.setAppUrl();//生产app协议url
  var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
  var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0;
  if (isMac) {
  adOptions.saveExpire(1);
  adOptions.saveAutoDown(sourceid);
  window.location = appUrl;
  setTimeout(function () { window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8"; }, 30);
  } else {
  //传入处理函数，第一个是有app时候处理方案，第二个是没有app时候处理方案
  //安装app情况下，第一个参数为true才会打开app，但是初次无论如何都会打开
  AppUtility.openApp(function () {
  adOptions.saveExpire(1);
  adOptions.saveAutoDown(sourceid);
  //self.hide(); //强制下载后主动关闭，隐藏广告浮层
  if (self.root.attr('id') == 'dl_app') {
  self.root.hide();
  }
  return true;
  }, function () {
  var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0;
  //Android强制下载
  if (isAndroid) {
  var url = "http://m.ctrip.com/market/download.aspx?from=" + sourceid + '&App=3';
  if (s && s.sid && +s.sid > 0 && +s.sid == +sourceid && s.appurl && s.appurl.length > 0) {
  url = s.appurl;
  }
  adOptions.saveExpire(1);
  adOptions.saveAutoDown(sourceid);
  //self.hide(); //强制下载后主动关闭，隐藏广告浮层
  if (self.root.attr('id') == 'dl_app') {
  self.root.hide();
  }
  window.location.href = url;
  }
  }, appUrl);
  }*/
};
/// <summary>
/// 通过开关参数控制是否需要强制唤醒app （2014-3-17 caof）
/// </summary>
adOptions.checkAutoDownload = function () {
  //调整自动下载需求：必须传入
  var self = this,
  sourceid = this.getUrlParam('sourceid'),
  isopenapp = this.getUrlParam('openapp'),
  isodownapp = this.getUrlParam('downapp');
  if (!sourceid || sourceid.length <= 0 || +sourceid <= 0) return;
  var isdown_iosapp = 0,
  isdown_androidapp = 0,
  isopen_androidapp = 0,
  isopen_iosapp = 0;
  var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
  //判断设备类型
  var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0; //ios设备
  var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0; //android 设备
  if (isodownapp) {
    if (isMac) {
      if (+isodownapp == 2 || +isodownapp == 3) {
        //判断是否下载ios客户端
        isdown_iosapp = 1;
      }
    }
    if (isAndroid) {
      if (+isodownapp == 1 || +isodownapp == 3) {
        //判断是否下载android客户端
        isdown_androidapp = 1;
      }
    }
  }
  var appUrl = null;
  if (isopenapp) {
    if (isMac) {
      //判断是否需要自动唤醒ios app
      if (+isopenapp == 2 || +isopenapp == 3) {
        isopen_iosapp = 1;
      } else {
        isopen_iosapp = 0;
        appUrl = null;
      }
    }
    if (isAndroid) {
      //判断是否需要自动唤醒android app
      if (+isopenapp == 1 || +isopenapp == 3) {
        isopen_androidapp = 1;
      } else {
        isopen_androidapp = 0;
        appUrl = null;
      }
    }
  }
  if (isopen_androidapp || isopen_iosapp) {
    appUrl = this.setAppUrl(); //生产app协议url
  }
  var s = adOptions._get("SALES_OBJECT"); //获取渠道信息
  if (isMac) {
    console.log("Maccccccccccccccccc");
    if (appUrl && appUrl.length > 0) {
      //mwli
      $(".iOpenApp").remove();
      var iframe = $('<iframe name="iOpen" class="iOpenApp" frameborder="0" style="display:none;"></iframe>');
      iframe.attr("src", appUrl);
      $("body").append(iframe);
      //            window.location = appUrl;
    }
    /************判断是否已经强制下载，若已强制下载则不再执行自动下载************/
    if (adOptions.isAutoDown(sourceid) || !isdown_iosapp || +isdown_iosapp != 1) {
      adOptions.saveExpire(0);
      adOptions.saveAutoDown(sourceid);
    } else {
      adOptions.saveExpire(0);
      adOptions.saveAutoDown(sourceid);
      setTimeout(function () {
        window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
        // a.location.replace(this.bannerUrl)
      }, 30);
    }
  } else {
    /*************end 2014-1-13 caofu************/
    //传入处理函数，第一个是有app时候处理方案，第二个是没有app时候处理方案
    //安装app情况下，第一个参数为true才会打开app，但是初次无论如何都会打开
    AppUtility.openApp(function () {
      adOptions.saveExpire(0);
      adOptions.saveAutoDown(sourceid);
      //强制下载后主动关闭，隐藏广告浮层
      /*if (self.root.attr('id') == 'dl_app') {
      self.root.hide();
      }*/
      return true;
    }, function () {
      /************判断是否已经强制下载，若已强制下载则不再执行自动下载************/
      if (adOptions.isAutoDown(sourceid)) {
        adOptions.saveExpire(0);
        adOptions.saveAutoDown(sourceid);
        return true;
      }
      /**************判断用户网络环境，若不是wifi环境，则不自动下载****************/
      if (navigator.connection) {
        if (navigator.connection.type != navigator.connection.WIFI) {
          adOptions.saveExpire(0);
          adOptions.saveAutoDown(sourceid);
          return true;
        }
      }

      var url = "http://m.ctrip.com/market/download.aspx?from=" + sourceid;
      //设置下载Android客户端 url
      if (isAndroid) {
        if (!isdown_androidapp || +isdown_androidapp != 1) {
          return true;
        }
        url += '&App=3';
      }
      //设置下载ios 客户端url
      if (isMac) {
        url += '&App=1';
      }
      if (s && s.sid && +s.sid > 0 && +s.sid == +sourceid && s.appurl && s.appurl.length > 0) {
        url = s.appurl;
      }
      adOptions.saveExpire(0);
      adOptions.saveAutoDown(sourceid);
      //强制下载后主动关闭，隐藏广告浮层 浮层的显示跟开关参数无关，注释
      /*if (self.root.attr('id') == 'dl_app') {
      self.root.hide();
      }*/
      window.location.href = url;
    }, appUrl);
  }
};
/********************************
* @description: 重写create方法
*/
adOptions.create = function () {
  $('body').find('iframe').remove();
  if (!this.isCreate && !this.isExpire() && this.status !== this.STATE_ONCREATE) {
    //如果返回的是空字符，则不生成浮层 2014-1-4 caof
    var s = this.createHtml();
    if (s && s.length > 0) {
      this.root = $(s);
      this.rootBox.append(this.root);
      this.trigger('onCreate');
    } else {
      if ($('footer')) $('footer').removeClass('pb85');
      if ($('div[data-role="footer"]')) $('div[data-role="footer"]').removeClass('pb85');
      if ($('#panel-box')) {
        $('#panel-box').removeClass('pb85');
      }
      if ($('.f_list')) {
        $('.f_list').removeClass('pb85');
      }
    }
    this.isCreate = true;
  } else {
    if ($('footer')) {
      $('footer').removeClass('pb85');
    }
    if ($('#panel-box')) {
      $('#panel-box').removeClass('pb85');
    }
    if ($('.f_list')) {
      $('.f_list').removeClass('pb85');
    }
    if ($('div[data-role="footer"]')) {
      $('div[data-role="footer"]').removeClass('pb85');
    }
  }
  var html = adOptions.createHtml();

  //fix 2.0下，下载包错误的bug shbzhang 2014/6/26
  var self = this;
  setTimeout(function () {
    adOptions.checkAutoDownload.call(self)
  }, 2000);
};

//验证是否过期
/************update 2014-1-13 增加判断isClose，若isClose==1表示用户已经关闭浮层，24小时内不再显示****************/
adOptions.isExpire = function () {
  var data = this._get(this.storeKey);
  if (data && data.isClose) {
    return true;
  }
  return false;
  //return !!data;
};
adOptions.isAutoDown = function (sourceid) {
  var data = this._get("APP_AUTODOWNLOAD");
  if (data && data.isAutoDown) {
    return true;
  }
  return false;
  //return !!data;
};
adOptions._getCookie = function (name) {
  var result = null;
  if (name) {
    var RegCookie = new RegExp('\\b' + name + '=([^;]*)\\b'), match = RegCookie.exec(document.cookie);
    result = match && unescape(match[1])
  } else {
    var cookies = document.cookie.split(';'), i, c;
    result = {};
    for (i = 0, len = cookies.length; i < len; i++) {
      c = cookies[i].split('=');
      result[c[0]] = unescape(c[2])
    }
  }
  return result;
};

adOptions.setCurrentView = function (view) {
  this.curView = view;
};

adOptions.getCurrentView = function () {
  return this.curView;
};
adOptions._get = function (key) {
  var result = window.localStorage.getItem(key);
  if (result) {
    result = JSON.parse(result);
    if (Date.parse(result.timeout) >= new Date()) {
      return result.value || result.data;
    }
  }
  return "";
};
adOptions._set = function (key, value, timeout) {
  var entity = {
    value: value,
    timeout: timeout
  };
  window.localStorage.setItem(key, JSON.stringify(entity));
};
if (window.location.pathname.indexOf('webapp') > -1 || window.localStorage.getItem('isInApp')) {
  define('cAdView',['cBase', 'cUIAbstractView', 'libs', 'cStore'], function (cBase, AbstractView, libs, cStore) {
    var AdView = new cBase.Class(AbstractView, adOptions);
    AdView.getInstance = function () {
      if (this.instance) {
        return this.instance;
      } else {
        return this.instance = new this();
      }
    };
    return AdView;
  });
} else {
  adOptions.show = function () {
    this.status = '';
    this.create();
    this.onShow();
  };
  adOptions.hide = function () {
    this.root.hide();
  };
  adOptions.trigger = function () {

  };
  adOptions.remove = function () {
    $('#dl_app').remove();
  };

  var config = {
    rootBox: $('#footer')
  };
  setTimeout(function () {
    adOptions.initialize(function () {
    }, config);
    var AdView = adOptions;
    AdView.update(config);
    AdView.show();
  }, 800);
}
//自动调起当前页面对应的APP页面，失败则自动下载APP
adOptions.autoOpenDownApp = function (sourceid, openapp, downapp) {
  //调整自动下载需求：必须传入
  var isopenapp = openapp || 3,
  isodownapp = downapp || 3;

  var isdown_iosapp = 0,
  isdown_androidapp = 0,
  isopen_androidapp = 0,
  isopen_iosapp = 0;
  var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
  //判断设备类型
  var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0; //ios设备
  var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0; //android 设备
  if (isMac) {
    isdown_iosapp = 1;
  }
  if (isAndroid) {
    isdown_androidapp = 1;
  }
  var appUrl = null;
  if (isMac) {
    isopen_iosapp = 1;
  }
  if (isAndroid) {
    isopen_androidapp = 1;
  }
  try {
    appUrl = this.setAppUrl(); //生产app协议url
  } catch (e) {

  }
  var s = adOptions._get("SALES_OBJECT"); //获取渠道信息
  if (isMac) {
    if (appUrl && appUrl.length > 0) {
      window.location = appUrl;
    }
    setTimeout(function () {
      window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
      // a.location.replace(this.bannerUrl)
    }, 30);
  } else {
    /*************end 2014-1-13 caofu************/
    //传入处理函数，第一个是有app时候处理方案，第二个是没有app时候处理方案
    //安装app情况下，第一个参数为true才会打开app，但是初次无论如何都会打开
    AppUtility.openApp(function () {
      return true;
    }, function () {
      var url = "http://m.ctrip.com/market/download.aspx?from=" + sourceid;
      //设置下载Android客户端 url
      if (isAndroid) {
        url += '&App=3';
      }
      //设置下载ios 客户端url
      if (isMac) {
        url += '&App=1';
      }
      if (s && s.sid && +s.sid > 0 && +s.sid == +sourceid && s.appurl && s.appurl.length > 0) {
        url = s.appurl;
      }

      window.location.href = url;
    }, appUrl);
  }
};

//营销浮层唤醒APP
adOptions.popupPromo = function () {
  var getStore = function (key, subkey) {
    subkey = subkey || "data";
    var detailInfo = window.localStorage ? window.localStorage.getItem(key) : null;
    if (detailInfo) {
      detailInfo = JSON.parse(detailInfo);
      if (detailInfo && detailInfo[subkey]) {
        return detailInfo[subkey];
      }
    }
    return {};
  };

  var popup = false, sourceid, allianceid, sid;
  if (adOptions._getCookie('Union')) {
    var obj = {};
    adOptions._getCookie('Union').replace(/([^&=]+)=([^&]*)/g, function ($, key, val) {
      obj[key] = val;
    });
    allianceid = obj["AllianceID"];
  }
  sourceid = adOptions.getUrlParam("sourceid") || getStore("SALES")["sourceid"] || getStore("SALES_OBJECT", "value")["sid"];
  sid = adOptions.getUrlParam("sid") || getStore("UNION").SID;
  if (!sourceid) return;
  allianceid = adOptions.getUrlParam("allianceid") || getStore("UNION")["AllianceID"] || allianceid,
  keywords = ["baidu.com", "google.com", "soso.com", "so.com", "bing.com", "yahoo", "youdao.com", "sogou.com", "so.360.cn", "jike.com", "babylon.com", "ask.com", "avg.com", "easou.com", "panguso.com", "yandex.com", "sm.cn"],
  sourceids = ["1825", "1826", "1827", "1828", "1829", "1831", "1832", "1833", "1830"];
  //Sid: 178071,Sid: 446852
  //sourceid:1833 Allianceid:18887 Sid: 447459

  sIds = [130028, 130029, 409197, 353693, 130026, 135366, 297877,
  130033, 130034, 131044, 110603, 353694, 130678, 135371, 353696, 130701,
  135374, 110611, 353698, 130709, 135376, 110614, 426566, 426568, 353701,
  130727, 135379, 139029, 110620, 353703, 130761, 135383, 353704, 130788,
  135388, 110630, 353699, 353700, 189318, 135390, 130860, 130875, 303055,
  156043, 130862, 130863, 130876, 130859, 240799, 159295, 442174, 176275,
  240801, 231208, 278782, 326416, 353680, 295517, 130999, 130907, 112563,
  176220, 110647, 3752, 125344, 144532, 120414, 171210, 86710, 110276, 447459];
  allianceids = ["4897", "4899", "4900", "4901", "4902", "4903", "4904", "5376", "5377", "3052", "13964", "13963", "18887"];

  /*matchPopup = function(){
  var matchKeyword = false, matchAllianceid = false;
  for(var i = 0, len = keywords.length; i < len; i++){
  if(document.referrer.match(keywords[i])){
  matchKeyword = true;
  break;
  }
  }
  for(var i = 0, len = allianceids.length; i < len; i++){
  if(allianceid == allianceids[i]){
  matchAllianceid = true;
  break;
  }
  }
  return matchKeyword && matchAllianceid;
  };*/
  /**
  * mwli
  */
  matchPopup = function () {
    var matchKeyword = false, matchSid = false;
    for (var i = 0, len = keywords.length; i < len; i++) {
      if (document.referrer.match(keywords[i])) {
        matchKeyword = true;
        break;
      }
    }
    for (var i = 0, len = sIds.length; i < len; i++) {
      if (+sid === sIds[i]) {
        matchSid = true;
        break;
      }
    }
    return matchKeyword && matchSid;
  };
  //console.log(document.referrer ? "refer url :" + document.referrer : "referrer undefined");
  //sepopup参数为1或者命中策略时会弹层，但是如果前一个页面已出现弹层，则不再出
  if ((adOptions.getUrlParam("sepopup") == 1 || matchPopup()) && document.referrer.indexOf("sepopup=1") < 0) {
    if (document.getElementById("se-popup") === null) {
      var saleobj = getStore("SALES_OBJECT", "value");
      var telnum = saleobj.tel || "4000086666";

      var str = [
  '<div class="se-popup" id="se-popup">',
  '<div class="se-main" style="width:240px;height:329px;margin-top:-165px;margin-left:-120px;position:fixed;top:50%;left:50%;z-index:10000;">',
  '<img src="http://res.m.ctrip.com/market/images/popup.png" width="100%" />',
  '<a class="se-close" href="javascript:void(0)" style="position:absolute;width:19px;height:19px;top:9px;right:9px;"></a>',
  '<a class="se-openapp __appaddress__" href="/market/download.aspx?from=MPopup" style="position:absolute;width:154px;height:43px;bottom:97px;right:43px;"></a>',
  '<a class="se-phone __hreftel__" href="tel:' + telnum + '" style="position:absolute;width:154px;height:30px;bottom:60px;right:43px;"></a>',
  '<a class="se-continue" href="javascript:void(0)" style="position:absolute;width:154px;height:30px;bottom:21px;right:43px;"></a>',
  '</div>',
  '<div class="se-mask" style="position:fixed;left:0px;top:0px;width:100%;height:100%;z-index:9999;background:rgba(0,0,0,.2);"></div>',
  '</div>'
      ].join("");
      $(str).appendTo($(document.body));
      $(".se-close").on("click", function () {
        $(".se-popup").css("display", "none");
      });
      $(".se-continue").on("click", function () {
        $(".se-popup").css("display", "none");
      });
      $(".se-openapp").on("click", function () {
        adOptions.autoOpenDownApp(sourceid, 3, 3);
        return false;
      });
    }
  }
};
//时序
setTimeout(function () {
  adOptions.popupPromo();
}, 2000);

/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUILoading
* @description loading层
*/
define('cUILoading',['libs', 'cBase', 'cUILayer'], function (libs, cBase, Layer) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  /** 用于abstractView执行的对象 */
  var _attributes = {};

  _attributes['class'] = _config.prefix + 'loading';

  _attributes.onCreate = function () { };

  _attributes.onShow = function () {
    this.contentDom.html('<div class="cui-breaking-load"><div class="cui-i cui-w-loading"></div><div class="cui-i cui-m-logo"></div></div>');
    this.reposition();
  };

  /** 相关属性 */
  options.__propertys__ = function () {
    this.contentDom;
    this.loadHtml = '';
  };

  /** 构造函数入口 */
  options.initialize = function ($super) {

    $super(_attributes);
  };

  /**
  * @method setHtml
  * @param html {String}    内容体
  * @description 设置loading的内容
  */
  options.setHtml = function (html) {
    this.loadHtml = html;
  };

  return new cBase.Class(Layer, options);

});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIGroupList
* @description 分组列表，多用于城市相关
*/
define('cUIBubbleLayer',['cBase', 'cUIAbstractView'], function (cBase, AbstractView) {

  var options = {};

  options.__propertys__ = function () {

    //是否使用模板
    this.itemTemplate = false;

    //触发弹层的元素
    this.triggerEl = null;

    this.click = function () { };

  };

  options.initialize = function ($super, opts) {
    for (var k in opts) {
      this[k] = opts[k];
    }
    $super(opts);
    this.bindEvent();
    this.show();
    this.hide();

  };

  options.showMenu = function (opts) {
    for (var k in opts) {
      this[k] = opts[k];
    }

    //如果重置了data数据这块就需要处理
    if (opts.data) this.init();
    if (opts.dir) {
      this.el.removeClass('f-layer-before');
      this.el.removeClass('f-layer-after');

      if (opts.dir == 'up') {
        this.el.addClass('f-layer-before');
      } else {
        this.el.addClass('f-layer-after');
      }
    }

    //插件位置宽度调整
    this.adjustEl();

    this.show();

  };

  options.bindEvent = function () {
    this.addEvent('onHide', function () {
      this.root.off('click');
      if (this.clsLayer) document.removeEventListener('click', this.clsLayer, true);
    });

    this.addEvent('onShow', function () {

      this.init();
      //插件位置宽度调整
      this.adjustEl();

      this.setzIndexTop();

      this.root.on('click', $.proxy(function (e) {
        var el = $(e.target);

        //判断是否需要触发点击事件
        var needClick = false;

        while (true) {
          if (el.attr('id') == this.id) break;
          if (el.attr('data-flag') == 'c') {
            needClick = true;
            break;
          }
          el = el.parent();
        }

        //不需要点击便退出
        if (!needClick) return;

        if (typeof this.click == 'function') {
          this.click.call(this, this.data[el.attr('data-index')]);
        }

        //          this.hide();
      }, this));

      //点击非元素以外的位置则关闭插件
      this.clsLayer = $.proxy(function (e) {
        var el = $(e.target);

        //判断是否需要触发点击事件
        var needClick = false;

        while (true) {
          if (el.attr('id') == this.id) {
            needClick = true;
            break;
          }
          if (!el[0]) break;
          el = el.parent();
        }

        if (needClick == false) {
          this.hide();
//          e.stopImmediatePropagation && e.stopImmediatePropagation();
        }

      }, this);

      document.addEventListener('click', this.clsLayer, true);

    });
  };

  //调整元素位置
  options.adjustEl = function () {
    //如果传入了引发插件显示的元素，便根据他调整样式
    if (!this.triggerEl) return;
    var offset = this.triggerEl.offset();
    //首先清除元素的几个属性
    this.el.css({
      width: '',
      transform: ''
    });

    var step = 6;

    if (this.dir == 'up') {
      this.el.css({
        width: offset.width - step,
        '-webkit-transform': 'translate(' + (offset.left + 2) + 'px, ' + (offset.top + offset.height + 8) + 'px) translateZ(0px)'
      });
    } else {
      this.el.css({
        width: offset.width - step,
        '-webkit-transform': 'translate(' + (offset.left + 2) + 'px, ' + (offset.top - this.el.offset().height - 8) + 'px) translateZ(0px)'
      });
    }
  };

  options.init = function () {
    if (!this.data) return;

    this.tmpt = _.template([
        '<ul class="cui-f-layer ' + (this.dir ? (this.dir == 'up' ? 'f-layer-before' : 'f-layer-after') : '') + '" style="position: absolute; top: 0; left: 0; ">',
          '<% for(var i = 0, len = data.length; i < len; i++) { %>',
            '<% var itemData = data[i]; %>',
            '<li data-index="<%=i%>" data-flag="c"  >' + (this.itemTemplate ? this.itemTemplate : '<%=itemData.name %>') + '</li>',
          '<% } %>',
        '</ul>'
      ].join(''));

    var html = this.tmpt({ data: this.data });
    this.root.html(html);

    this.el = this.root.find('.cui-f-layer');

  };

  options.createHtml = function () {
    return '';
  };

  return new cBase.Class(AbstractView, options);

});
/* File Created: 六月 23, 2013 */
window.onunload = function () {
};
define('cUIView',['libs', 'cUIAlert', 'cUIWarning', 'cUIHeadWarning', 'cUIWarning404', 'cUIToast', 'cSales', 'cStorage', 'cBase', 'CommonStore', 'cUtility', 'cAdView', 'cUILoading', 'cUIBubbleLayer', 'cWidgetFactory', 'cWidgetGuider'],
  function (libs, Alert, Warning, HeadWarning, Warning404, Toast, cSales, cStorage, cBase, CommonStore, cUtility, cAdView, Loading, cUIBubbleLayer, WidgetFactory) {

  //适配app 张爸爸
  var Guider = WidgetFactory.create('Guider');

  var localStorage = cStorage.localStorage;
  //用于切换页面时，让当前input失去焦点
  document.body && (document.body.tabIndex = 10000);


  var _alert = new Alert({
    title:   '提示信息',
    message: '',
    buttons: [
      {
        text:  '知道了',
        click: function () {
          this.hide();
        }
      }
    ]
  });

  var _confirm = new Alert({
    title:   '提示信息',
    message: '您的订单还未完成，是否确定要离开当前页面？',
    buttons: [
      { text:  '取消', click: function () {
        this.hide();
      }, type: Alert.STYLE_CANCEL },
      {
        text:  '确定',
        click: function () {
          this.hide();
        },
        type:  Alert.STYLE_CONFIRM
      }
    ]
  });


  var _warning = new Warning({
    title: ''
  });

  var _headwarning = new HeadWarning({
    title: ''
  });

  var _warning404 = new Warning404();

  var _loading = new Loading();

  var _toast = new Toast();


  //气泡弹层
  var _bubbleLayer = new cUIBubbleLayer();

  //l_wang新增验证方法解决fixed导致问题
  var elSelector = ['.fix_bottom', '.fix_b', 'header', '.order_btnbox'];

  //需要处理的wrapper
  var elWrapper = '.cont_blue , .cont_blue1';

  //保存fixed定时器
  var FIXED_RESOURCE = null;

  //修正fixed引起的问题
  function reviseFixed() {
    return false;
    var el = $(elSelector.join(','));
    if (document.activeElement.nodeName == 'INPUT' && (document.activeElement.type == 'tel' || document.activeElement.type == 'text')) {
      el.css('position', 'static');

      //需要处理的wrapper，左盟主48px问题
      $(elWrapper).css('margin-top', '0px');

    } else {
      el.css('position', 'fixed');
      $(elWrapper).css('margin-top', '48px');

      if (FIXED_RESOURCE) {
        clearInterval(FIXED_RESOURCE);
        FIXED_RESOURCE = null;
      }
    }
  }

  return Backbone.View.extend({

    ENUM_STATE_NOCREATE: 0,
    ENUM_STATE_CREATE:   1,
    ENUM_STATE_LOAD:     2,
    ENUM_STATE_SHOW:     3,
    ENUM_STATE_HIDE:     4,
    //子类可以设置此pageid，用于autotest
    pageid:              0,
    hpageid:             0,
    //视图的scroll位置
    scrollPos:           {
      x: 0,
      y: 0
    },
    header:              null,
    footer:              null,
    cSales:              cSales,
    // ui controller
    warning:             null,
    alert:               null,
    // ------------

    onCreate:           function () {
    },
    viewInitialize:     function () {
    },
    initialize:         function (request, appliction, viewname) {
      this.$el.addClass('sub-viewport');
      this.id = _.uniqueId('viewport');
      this.$el.attr('id', 'id_' + this.id);
      this.viewname = viewname;
      //添加自定义pageid
      if (this.pageid) this.$el.attr('page-id', this.pageid);

      this.viewdata = {};
      this.appliction = appliction;
      this.request = request;
      this.$el.attr('page-url', this.request.viewpath);
      this.state = this.ENUM_STATE_CREATE;

      //初始化alert
      this.alert = _alert;

      //初始化warning
      this.warning = _warning;

      //初始化headwarning
      this.headwarning = _headwarning;

      //初始化headwarning
      //this.NoHeadWarning = new cUI.NoHeadWarning({
      //  content: ''
      //});

      //初始化404提示
      this.warning404 = _warning404;

      //初始化loading框，将app.js里面的loading移过来
      this.loading = _loading;

      //初始化toast
      this.toast = _toast;

      //初始化气泡浮层
      this.bubbleLayer = _bubbleLayer;

      this.confirm = _confirm;

      //加入页面自定义的css
      if (_.isArray(this.css)) {
        this.appendCss(this.css);
      }

      //广告
      if (cAdView) {
        this.footer = cAdView.getInstance();
      }

      try {
        this.onCreate();
      } catch (e) {
        //alert(this.request.viewpath+'/onCreate/Error:'+JSON.stringify(e));
      }
    },
    _initializeHeader:  function () {
      var self = this;
      if (this.header.backUrl) {
        this.$el.on('click', '#js_return', function () {
          self.back(self.header.backUrl);
        });
      }
      if (this.header.home) {
        this.$el.delegate('#js_home', 'click', function () {
          self.home();
        });
      }
      if (this.header.phone) {
        this.$el.find('#js_phone').attr('href', 'tel:' + this.header.phone);
      }
      if (this.header.title) {
        this.$el.find('header h1').text(this.header.title);
      }
      if (this.header.subtitle) {
        this.$el.find('header p').text(this.header.subtitle);
      }
      if (this.header.rightAction) {
        this.$el.delegate('header div', 'click', this.header.rightAction);
      }
    },
    _initializeFooter:  function () {
      
      if (cUtility.isInApp()) {
        return;
      }

      if (this.footer) {
        this.footer.hide();
        //设置footer的view
        this.footer.setCurrentView(this);

        //临时解决广告不消失问题
        if (this.hasAd && !this.footer.isExpire()) {
          var ctn = this.adContainer ? this.$el.find('#' + this.adContainer) : $('#footer');
          var oldRootBox = this.footer.rootBox;
          if (oldRootBox && oldRootBox.attr('id') != ctn.attr('id')) {
            this.footer.remove();
            this.footer.isCreate = false;
          }
          this.footer.update({
            rootBox: ctn
          });
          this.footer.show();
        }
      }
      
    },

    //触发load事件
    __onLoad:           function (lastViewName) {

      //l_wang 检测android localstorage 读写问题
      if (location.href.indexOf('ugly_andriod2') > 0) {
        window.location = 'http://m.ctrip.com/html5/';
        return;
      }
      this.TEST_ANDRIOD_STORAGE = 1;
      localStorage.set('TEST_ANDRIOD_STORAGE', 1);


      //切换页面时，确保当前input失去焦点
      document.activeElement && document.activeElement.blur();
      this.getServerDate();
      //处理渠道信息
      this.disposeChannel();
      this.header = this._getDefaultHeader();
      this.state = this.ENUM_STATE_LOAD;
      // try {
      this.onLoad && this.onLoad(lastViewName);
      //  } catch (e) {
      //alert(this.request.viewpath+'/onLoad/Error:'+JSON.stringify(e));
      //  }
    },
    //触发Show事件
    __onShow:           function () {

      //切换页面时，确保当前input失去焦点
      document.activeElement && document.activeElement.blur();
      document.activeElement.blur;

      this.state = this.ENUM_STATE_SHOW;
      //fix scroll bug shbzhang 2013.10.10
      window.scrollTo(0, 0);
      try {
        this.onShow && this.onShow();
      } catch (e) {
        //alert(this.request.viewpath + '/onShow/Error:' + JSON.stringify(e));
      }
      //ubt统计
      //if (!location.host.match(/localhost|172\.16|127\.0|210\.13/ig)) {
      this._sendUbt();
      //}
      this._initializeHeader();
      this._initializeFooter();

      //this.__updateSales(this.$el);
      cSales.updateSales(this);

      if (this.onBottomPull) {
        this._onWidnowScroll = $.proxy(this.onWidnowScroll, this);
        this.addScrollListener();
      }
      //ga统计
      this._sendGa();

      //Kenshoo统计
      this._sendKenshoo();
      this._sendMarin();

      this._googleReMark();
      this.resetViewMinHeight();

      //l_wang 新增代码用以解决
      //事件只能绑定一次
      //&& ('ontouchstart' in window)
      if (!this.FixedInput) {
        this.$('input').on('focus', function (e) {
          if (e.target.type == 'tel' || e.target.type == 'text') {
            if (!FIXED_RESOURCE) {
              reviseFixed();
              FIXED_RESOURCE = setInterval(function () {
                reviseFixed();
              }, 500);
            }
          }
        });
        this.FixedInput = true;
      }


      //l_wang检测android问题
      if (!(localStorage.get('TEST_ANDRIOD_STORAGE') && localStorage.get('TEST_ANDRIOD_STORAGE') == this.TEST_ANDRIOD_STORAGE)) {
        //读写失效了我还何必存...
        //window.navigator.userAgent
        if (location.href.indexOf('ugly_andriod1') > 0) {
          window.location.search = 'ugly_andriod2=' + Math.random();
          return;
        } else {
          window.location.search = 'ugly_andriod1=' + Math.random();
          return;
        }
        localStorage.remove('TEST_ANDRIOD_STORAGE');
      }
    },
    //兼容min-height，重置view高度
    resetViewMinHeight: function () {
      //暂时兼容性处理
      //            var main = $('#main');
      //            var main_frame = main.find('.main-frame');
      //            var main_viewport = main_frame.find('.main-viewport');
      //            var sub_viewport = main_viewport.find('.sub-viewport');
      //            var h = $(window).height();
      //            $('body').css('min-height', h);
      //            main.css('min-height', h);
      //            main_frame.css('min-height', h);
      //            main_viewport.css('min-height', h);
      //            sub_viewport.css('min-height', h);

    },
    //触发hide事件
    __onHide:           function (id) {
      this.state = this.ENUM_STATE_HIDE;
      this.onHide && this.onHide(id);
      this.hideHeadWarning();
      //this.hideNoHeadWarning(;)
      this.hideWarning();
      this.hideLoading();
      this.hideWarning404();
      this.hideToast();
      this.hideConfirm();
      this.hideMessage();

      if (this.onBottomPull) {
        this.removeScrollListener();
      }
      //      this.scrollPos = {
      //        x: window.scrollX,
      //        y: window.scrollY
      //      }
    },

    showLoading: function () {
      this.loading.show();
      this.loading.firer = this;
    },
    hideLoading: function () {
      if (!this.loading.firer || this.loading.firer == this)
        this.loading.hide();
    },

    forward:          function (url, replace) {
      this.appliction.forward.apply(null, arguments);
    },
    back:             function (url) {
      // 在ios环境中使用application.back()会出现问题！
      // 作为一个调查点保留
      // if (cUtility.isInApp()) {
      // this.appliction.forward(url);
      // } else {
      this.appliction.back.apply(null, arguments);
      // }
    },
    jump:             function (url, replace) {
      if (replace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }  
    },
    home:             function () {
      this.appliction.forward('');
    },
    setTitle:         function (title) {
      this.appliction.setTitle("携程旅行网-" + title);
    },
    //还原到原来的滚动条位置
    restoreScrollPos: function () {
      window.scrollTo(this.scrollPos.x, this.scrollPos.y);

//      setTimeout($.proxy(function () {
//        window.scrollTo(this.scrollPos.x, this.scrollPos.y);
//      }, this), 20)
    },
    /**
     * 获得url中查询字符串，类似于get的请求参数
     * @param name {String} 要查询参数的key
     * @return {String}
     * @demo
     * #ticketlist/?name=value
     * var v = this.getQuery('name');
     * console.log(v);//value;
     *
     */
    getQuery:         function (name) {
      return this.request.query[name] || null;
    },
    /**
     * 获得url中路径中的某一部分
     * @param index {Number} 在路径中某个段的值
     * @param {String} 要查询的路径的value
     * @demo
     * #ticketlist/!value/hoe
     * var v = this.getPath(0);
     * console.log(v);//value;
     */
    getPath:          function (index) {
      return this.request.path[index] || null;
    },
    getRoot:          function () {
      return this.request.root || null;
    },
    showMessage:      function (message, title) {
      this.alert.setViewData({
        message: message,
        title:   title
      });
      this.alert.show();
    },

    hideMessage: function () {
      this.alert.hide();
    },

    showConfirm: function (message, title, okFn, cancelFn, okTxt, cancelTxt) {
      //如果传入的是对象的话，直接用作初始化
      if (typeof message == 'object' && message.message) {
        this.confirm.setViewData(message);
      } else {
        this.confirm.setViewData({
          message: message,
          title:   title,
          buttons: [
            { text:  (cancelTxt || '取消'), click: function () {
              if (typeof cancelFn == 'function') {
                cancelFn();
              }
              this.hide();
            }, type: Alert.STYLE_CANCEL
            },
            {
              text:  (okTxt || '确定'),
              click: function () {
                if (typeof okFn == 'function') {
                  okFn();
                }
                this.hide();
              },
              type:  Alert.STYLE_CONFIRM
            }
          ]
        });
      }
      this.confirm.show();
    },

    hideConfirm: function () {
      this.confirm.hide();
    },

    showWarning:     function (title, callback) {
      if (title) this.warning.setTitle(title, callback);
      this.warning.show();
    },
    hideWarning:     function () {
      this.warning.hide();
    },
    showHeadWarning: function (title, content, callback) {
      if (title) this.headwarning.setTitle(title, content, callback);
      this.headwarning.show();
    },

    hideHeadWarning: function () {
      this.headwarning.hide();
    },

    showBubbleLayer: function (opts) {
      this.bubbleLayer.showMenu(opts);
    },

    hideBubbleLayer: function () {
      this.bubbleLayer.hide();
    },

    showWarning404: function (callback, options) {
      if (callback) this.warning404.retryClick(callback);
      this.warning404.show();
      if (options) this.warning404.options(options);
      this.warning404.firer = this;
    },

    hideWarning404: function () {
      if (!this.warning404.firer || this.warning404.firer === this)
        this.warning404.hide();
    },

    showNoHeadWarning: function (content, top) {
      if (content) this.NoHeadWarning.setContent(content, top);
      this.NoHeadWarning.show();
    },
    //hideNoHeadWarning: function () {
    //  this.NoHeadWarning.hide();
    //},
    showToast:         function (title, timeout, callback, clickToHide) {
      if (this.toast.isShow()) {
        return;
      }
      clickToHide = (typeof clickToHide != 'undefined') ? clickToHide : true;
      this.toast.show(title, timeout, callback, clickToHide);
      this.toast.firer = this;
    },
    hideToast:         function () {
      if (!this.toast.firer || this.toast.firer == this)
        this.toast.hide();
    },
    updateHeader:      function (options) {
      for (var key in options) {
        this.header[key] = options[key];
      }
      this._initializeHeader();
    },
    _getDefaultHeader: function () {
      return {
        backUrl:     null,
        home:        false,
        phone:       null,
        title:       null,
        subtitle:    null,
        rightAction: null
      };
    },

    getServerDate: function (callback) {
      return cUtility.getServerDate(callback);
    },
    now:           function () {
      return cUtility.getServerDate();
    },

    _sendUbt: function () {
      if (window.$_bf && window.$_bf.loaded == true) {

        var query = this.request.query;
        var pId = $('#page_id'), oId = $('#bf_ubt_orderid');
        var url = this._getViewUrl(), pageId, orderid = "";

        if (cUtility.isInApp()) {
          if (this.hpageid == 0) {
            return;
          }
          pageId = this.hpageid;
        } else {
          if (this.pageid == 0) {
            return;
          }
          pageId = this.pageid;
        }

        if (query && query.orderid) {
          orderid = query.orderid;
        }

        if (oId.length == 1) {
          oId.val(orderid)
        }

        window.$_bf['asynRefresh']({
          page_id: pageId,
          orderid: orderid,
          url:     url
        });
      } else {
        if (!cUtility.isInApp()) {
          setTimeout($.proxy(this._sendUbt, this), 300);
        }
      }
    },


    /**
     * 统计GA
     */
    _sendGa: function () {
      //ga统计
      if (typeof _gaq !== 'undefined') {
        _gaq.push(['_trackPageview', location.href]);
      } else {
        setTimeout($.proxy(this._sendGa, this), 300);
      }
    },

    /**
     * Kenshoo统计代码
     */
    _sendKenshoo: function () {
      var query = this.request.query;
      if (query && query.orderid) {
        var kurl = "https://2113.xg4ken.com/media/redir.php?track=1&token=8515ce29-9946-4d41-9edc-2907d0a92490&promoCode=&valueCurrency=CNY&GCID=&kw=&product="
        kurl += "&val=" + query.val||query.price + "&orderId=" + query.orderid + "&type=" + query.type;
        var imgHtml = "<img style='position: absolute;' width='1' height='1' src='" + kurl + "'/>"
        $('body').append(imgHtml);
      }
    },

    /**
     * 发送Marinsm 统计
     */
    _sendMarin:   function () {
      var query = this.request.query;
      if (query && query.orderid) {
        var murl = "https://tracker.marinsm.com/tp?act=2&cid=6484iki26001&script=no"
        murl += "&price=" + query.val||query.price + "&orderid=" + query.orderid + "&convtype=" + query.type;
        var imgHtml = "<img style='position: absolute;' width='1' height='1' src='" + murl + "'/>"
        $('body').append(imgHtml);
      }
    },

    /**
     * google 再分销
     */
    _googleReMark: function () {
      var url = this._getViewUrl();
      Guider.app_log_google_remarkting(url);
    },

    /**
     * 获得页面Url,hyrbid会增加一个虚拟域名
     */
    _getViewUrl: function(){
      var url = location.href;
      if (cUtility.inApp) {
        var idx = url.indexOf('webapp');
        url = 'http://hybridm.ctrip.com/' + url.substr(idx);
      }
      return url;
    },

    //处理渠道 后期会移交给公共维护
    disposeChannel: function () {
      var AllianceID = this.getQuery('allianceid'), SID = this.getQuery('sid'), OUID = this.getQuery('ouid');
      var matchKeyword = false;
      var keywords = ["baidu.com", "google.com", "soso.com", "so.com", "bing.com", "yahoo", "youdao.com", "sogou.com", "so.360.cn", "jike.com", "babylon.com", "ask.com", "avg.com", "easou.com", "panguso.com", "yandex.com", "sm.cn"];
      //如果来自分销联盟,隐藏底部广告,此功能会交给公共 shbzhang 2014/6/20
      if ( !AllianceID || !SID)  {
        for (var i = 0, len = keywords.length; i < len; i++) {
          if (document.referrer.match(keywords[i])) {
            matchKeyword = true;
            break;
          }
        }
      } else {
        matchKeyword = true;
      }

      if (matchKeyword) {
        if (this.footer && this.footer.rootBox) {
          var ad = this.footer.rootBox.find('#dl_app');
          if (ad.length > 0) {
            ad.hide()
          }
        }
      } 
    },

    //获得guid
    getGuid:        function () {
      return cUtility.getGuid();
    },
    setTitle:       function (title) {
      document.title = title;
    },
    appendCss:      function (styles) {
      if (!styles) return;
      for (var i = 0, len = styles.length; i < len; i++) {
        if (!this.css[styles[i]]) {
          this.head.append($('<link rel="stylesheet" type="text/css" href="' + styles[i] + '" />'));
          this.css[styles[i]] = true;
        }
      }
    },

    addClass: function (name) {
      this.$el.addClass(name);
    },

    removeClass: function (name) {
      this.$el.removeClass(name);

    },

    //新增view load 方法，此方法会触发其onload事件
    __load:      function (lastViewName) {


      this.__onLoad(lastViewName);
    },

    //新增view 的show方法 
    __show:      function () {

      //在快速前进或是返回时，viewport会莫名其妙丢失view
      //这里强制判断，不存在则强行插入。
      if (!this.viewport) {
        return;
      }
      if (!this.viewport.find('#id_' + this.id).length) {
        this.viewport.append(this.$el);
      }

      this.$el.show();
      this.__onShow();
    },

    //新增view 的hide方法 
    __hide:      function (viewname) {


      this.$el.hide();
      this.__onHide(viewname);
    }


  });
});

define('cView',['cBase', 'cUIView', 'CommonStore', 'cSales', 'cUtility','cStorage'], function (cBase, cUIView, CommonStore, cSales, Util, cStorage) {

  //使用c.ui.view的定义,以后再重构吧 shbzhang
 // var options = {
//    //@description 获得guid
//    getGuid: function () {
//      return Util.getGuid();
//    },
//
//    sendGa: function () {
//      //ga统计
//      if (typeof _gaq !== 'undefined') {
//        var url = this._getAurl();
//        _gaq.push(['_trackPageview', url]);
//      } else {
//        setTimeout($.proxy(this.sendGa, this), 300);
//      }
//    },
//
//    sendKenshoo:    function () {
//      var query = this.request.query;
//      if (query && query.orderid) {
//        var kurl = "https://2113.xg4ken.com/media/redir.php?track=1&token=8515ce29-9946-4d41-9edc-2907d0a92490&promoCode=&valueCurrency=CNY&GCID=&kw=&product="
//        kurl += "&val=" + query.val + "&orderId=" + query.orderid + "&type=" + query.type;
//        var imgHtml = "<img width='1' height='1' src='" + kurl + "'/>"
//        $('body').append(imgHtml);
//      }
//    },
//
//    //发送Marinsm 统计
//    sendMarin:      function () {
//      var query = this.request.query;
//      if (query && query.orderid) {
//        var murl = "https://tracker.marinsm.com/tp?act=2&cid=6484iki26001&script=no"
//        murl += "&price=" + query.val + "&orderid=" + query.orderid + "&convtype=" + query.type;
//        var imgHtml = "<img width='1' height='1' src='" + murl + "'/>"
//        $('body').append(imgHtml);
//      }
//    },
//    //处理渠道
//    disposeChannel: function () {
//      var AllianceID = this.getQuery('allianceid'), SID = this.getQuery('sid'), OUID = this.getQuery('ouid');
//      var UNION;
//      if (AllianceID && SID) {
//        UNION = {
//          AllianceID: AllianceID,
//          SID:        SID,
//          OUID:       OUID
//        };
//        CommonStore.UnionStore.getInstance().set(UNION);
//      } else {
//        var local = location.host, refUrl = document.referrer;
//        if (local && refUrl.indexOf(local) === -1) {
//          refUrl = refUrl.replace('http://', '').replace('https://', '').split('/')[0].toLowerCase();
//          if (refUrl.indexOf('baidu') > -1) {
//            AllianceID = AllianceID || '4897';
//            SID = SID || '353693';
//            OUID = OUID || '';
//          }
//          if (refUrl.indexOf('google') > -1) {
//            AllianceID = AllianceID || '4899';
//            SID = SID || '353694';
//            OUID = OUID || '';
//          }
//          if (refUrl.indexOf('soso.com') > -1) {
//            AllianceID = AllianceID || '4900';
//            SID = SID || '353696';
//            OUID = OUID || '';
//          }
//          if (refUrl.indexOf('sogou') > -1) {
//            AllianceID = AllianceID || '4901';
//            SID = SID || '353698';
//            OUID = OUID || '';
//          }
//          if (refUrl.indexOf('m.so.com') > -1) {
//            AllianceID = AllianceID || '5376';
//            SID = SID || '353699';
//            OUID = OUID || '';
//          }
//          if (refUrl.indexOf('so.360') > -1) {
//            AllianceID = AllianceID || '5376';
//            SID = SID || '353700';
//            OUID = OUID || '';
//          }
//          if (refUrl.indexOf('bing.com') > -1) {
//            AllianceID = AllianceID || '4902';
//            SID = SID || '353701';
//            OUID = OUID || '';
//          }
//          if (refUrl.indexOf('yahoo') > -1) {
//            AllianceID = AllianceID || '4903';
//            SID = SID || '353703';
//            OUID = OUID || '';
//          }
//          if (refUrl.indexOf('youdao') > -1) {
//            AllianceID = AllianceID || '4904';
//            SID = SID || '353704';
//            OUID = OUID || '';
//          }
//          if (refUrl.indexOf('jike.com') > -1 || refUrl.indexOf('babylon.com') > -1 || refUrl.indexOf('ask.com') > -1 || refUrl.indexOf('avg.com') > -1 || refUrl.indexOf('easou.com') > -1 || refUrl.indexOf('panguso.com') > -1 || refUrl.indexOf('yandex.com') > -1) {
//            AllianceID = AllianceID || '5376';
//            SID = SID || '353700';
//            OUID = OUID || '';
//          }
//          if (AllianceID && SID) {
//            UNION = {
//              AllianceID: AllianceID,
//              SID:        SID,
//              OUID:       OUID
//            };
//            CommonStore.UnionStore.getInstance().set(UNION);
//          }
//        }
//      }
//    },
//    updateSales:    function ($el) {
//      var local = location.host, refUrl = document.referrer, seosales = '';
//      if (local && refUrl.indexOf(local) === -1) {
//        refUrl = refUrl.replace('http://', '').replace('https://', '').split('/')[0].toLowerCase();
//        if (refUrl.indexOf('baidu') > -1) {
//          seosales = 'SEO_BAIDU';
//        }
//        if (refUrl.indexOf('google') > -1) {
//          seosales = 'SEO_GOOGLE';
//        }
//        if (refUrl.indexOf('soso.com') > -1) {
//          seosales = 'SEO_SOSO';
//        }
//        if (refUrl.indexOf('sogou') > -1) {
//          seosales = 'SEO_SOGOU';
//        }
//        if (refUrl.indexOf('m.so.com') > -1) {
//          seosales = 'SEO_SO';
//        }
//        if (refUrl.indexOf('so.360') > -1) {
//          seosales = 'SEO_360SO';
//        }
//        if (refUrl.indexOf('bing.com') > -1) {
//          seosales = 'SEO_BING';
//        }
//        if (refUrl.indexOf('yahoo') > -1) {
//          seosales = 'SEO_YAHOO';
//        }
//        if (refUrl.indexOf('youdao') > -1) {
//          seosales = 'SEO_YOUDAO';
//        }
//        if (refUrl.indexOf('jike.com') > -1 || refUrl.indexOf('babylon.com') > -1 || refUrl.indexOf('ask.com') > -1 || refUrl.indexOf('avg.com') > -1 || refUrl.indexOf('easou.com') > -1 || refUrl.indexOf('panguso.com') > -1 || refUrl.indexOf('yandex.com') > -1) {
//          seosales = 'SEO_360SO';
//        }
//      }
//      var appSourceid = window.localStorage.getItem('SOURCEID');
//      var newSourceid = this.getQuery('sourceid'), newSales = this.getQuery('sales');
//      var _sales = CommonStore.SalesStore.getInstance().get();
//      var sales = this.getQuery('sales') || seosales || (_sales && _sales.sales), sourceid = this.getQuery('sourceid') || appSourceid || (_sales && _sales.sourceid);
//      if ((newSourceid && +newSourceid > 0) || (newSales && newSales.length > 0)) {
//        //移除APP_DOWNLOAD
//        cStorage.localStorage.oldRemove("APP_DOWNLOAD");
//      }
//      if (sales || sourceid) {
//        if (sales) {
//          cSales.setSales(sales);
//        }
//        if (sourceid) {
//          cSales.setSourceId(sourceid);
//        }
//
//        cSales.getSalesObject(sales || sourceid, $.proxy(function (data) {
//          this.warning404.tel = data.tel ? data.tel : '4000086666';
//          cSales.replaceContent($el);
//        }, this));
//      } else {
//        if (local && refUrl.indexOf(local) === -1) {
//          refUrl = refUrl.replace('http://', '').replace('https://', '').split('/')[0].toLowerCase();
//          if (refUrl.indexOf('baidu') > -1) {
//            sales = 'SEO_BAIDU';
//          }
//          if (refUrl.indexOf('google') > -1) {
//            sales = 'SEO_GOOGLE';
//          }
//          if (refUrl.indexOf('soso.com') > -1) {
//            sales = 'SEO_SOSO';
//          }
//          if (refUrl.indexOf('sogou') > -1) {
//            sales = 'SEO_SOGOU';
//          }
//          if (refUrl.indexOf('m.so.com') > -1) {
//            sales = 'SEO_SO';
//          }
//          if (refUrl.indexOf('so.360') > -1) {
//            sales = 'SEO_360SO';
//          }
//          if (refUrl.indexOf('bing.com') > -1) {
//            sales = 'SEO_BING';
//          }
//          if (refUrl.indexOf('yahoo') > -1) {
//            sales = 'SEO_YAHOO';
//          }
//          if (refUrl.indexOf('youdao') > -1) {
//            sales = 'SEO_YOUDAO';
//          }
//          if (refUrl.indexOf('jike.com') > -1 || refUrl.indexOf('babylon.com') > -1 || refUrl.indexOf('ask.com') > -1 || refUrl.indexOf('avg.com') > -1 || refUrl.indexOf('easou.com') > -1 || refUrl.indexOf('panguso.com') > -1 || refUrl.indexOf('yandex.com') > -1) {
//            seosales = 'SEO_360SO';
//          }
//          if (sales) cSales.setSales(sales);
//          setTimeout(function () {
//            cSales.replaceContent($el);
//          }, 1);
//        }
//      }
//    },
//
//    _sendUbt: function () {
//      if (window.$_bf && window.$_bf.loaded == true) {
//        var query = this.request.query;
//        var pId = $('#page_id');
//        var oId = $('#bf_ubt_orderid');
//        var url, pageId;
//
//        if (Util.isInApp()) {
//          url = 'http://hybridm.ctrip.com/' + location.pathname + location.hash;
//          pageId = this.hpageid;
//        } else {
//          url = location.href;
//          pageId = this.pageid;
//        }
//
//        if (pId.length == 1) {
//          pId.val(pageId);
//        }
//
//        //set order id
//        if (oId.length == 1) {
//          if (query && query.orderid) {
//            oId.val(query.orderid);
//          } else {
//            oId.val('');
//          }
//        }
//
//        window.$_bf['asynRefresh']({
//          page_id: parseInt(pageId),
//          url:     url
//        });
//
//
//        /*var url = location.href, query = this.request.query, pId = $('#page_id'), oId = $('#bf_ubt_orderid');
//        var pageId = +(this.pageid);
//
//
//        if (Util.isInApp()) {
//          pageId += 1000;
//          url = 'http://hybridm.ctrip.com/' + location.pathname + location.hash;
//        }
//        if (pId.length == 1) {
//          pId.val(pageId);
//        }
//        //set order id
//        if (oId.length == 1) {
//          if (query && query.orderid) {
//            oId.val(query.orderid);
//          } else {
//            oId.val('');
//          }
//        }
//        window.$_bf['asynRefresh']({
//          page_id: pageId,
//          url:     url
//        });*/
//      } else {
//        setTimeout($.proxy(this._sendUbt, this), 300);
//      }
//    },
//
//    onShowFinish:      function () {
//      this._sendUbt();
//
//      this.updateSales(this.$el);
//      if (this.onBottomPull) {
//        this._onWidnowScroll = $.proxy(this.onWidnowScroll, this);
//        this.addScrollListener();
//      }
//      //ga统计
//      this.sendGa();
//
//      //Kenshoo统计
//      this.sendKenshoo();
//      //marinsm统计
//      this.sendMarin();
//
//    },
//    _getDefaultHeader: function () {
//      return {
//        backUrl:     null,
//        home:        false,
//        phone:       null,
//        title:       null,
//        subtitle:    null,
//        rightAction: null
//      };
//    },
//
//    _getAurl: function () {
//      var url = this.request.root, param;
//      if (this.request.viewpath) {
//        url += "#" + this.request.viewpath;
//      }
//      if (this.request.path.length > 0) {
//        param = $.param(this.request.query);
//        url += "!" + this.request.path.join("/") + (param.length ? '?' + param : '');
//      }
//      return url;
//    }
 // };

  return cUIView.extend({});
});

/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cHistory
* @description 记录城市历史记录
*/
define('cHistory',['cUIBase', 'libs'], function (Tools, libs) {

  /* 历史记录 */
  var History = function (options) {
    /** 元素 */
    this.element;

    /** 默认class */
    this.clazz = [Tools.config.prefix + 'history'];

    /** 唯一的maskname */
    this.maskName = "maskName";

    /** 自定义样式 */
    this.style = {};

    /** 背景大小偏移 */
    this.size = false;

    /** 显示数目大小 */
    this.listSize = 6;

    /** 点击回调 */
    this.itemClickFun = null;

    /** 获取焦点回调 */
    this.focusFun = null;

    /** 失去焦点回调 */
    this.blursFun = null;

    /** 输入回调 */
    this.inputFun = null;

    /** 唯一id */
    this._id = Tools.getCreateId();

    /** 最外层的层 */
    this._boxDom;

    /** 边线层 */
    this._borderDom;

    /** 内容层 */
    this._contDom;

    /** 清除按键 */
    this._clearButton;

    /** 清除按键标题 */
    this.clearButtonTitle = '清除搜索历史';

    /** 无历史记录时的标题 */
    this.notHistoryButtonTitle = '无搜索历史';

    /** 默认历史数据存取Store */
    this.historyStore = null;

    /** 数据源 */
    this.dataSource = [];

    /** 自动设置尺寸的资源句柄 */
    this._autoLocResoure;

    /** body元素 */
    this._bodyDom;

    /** 根节点 */
    this.rootBox;

    /** 设置显示下拉框 */
    this._oneShow = false;

    var self = this;

    /** 事件定义获取焦点 */
    this.event_focus = function () {
      self.Open();
      if (typeof self.focusFun == 'function') {
        self.focusFun();
      }
    };

    /** 事件定义失去焦点 */
    this.event_blur = function () {
      /*setTimeout(function () {
      if (!self._oneShow) {
      self.Close();
      }
      self._oneShow = false;
      }, 200);*/
      if (typeof self.blurFun == 'function') {
        self.blurFun();
      }
    };

    /** 事件定义文字变化 */
    this.event_input = function () {
      //self.Close();
      if (self.element.val() == "") {
        self._init();
        self.Open();
      }
      self.inputFun(self.element.val());
    };

    this._setOption(options);

    this._init();
  };

  History.prototype = {
    _setOption: function (options) {
      for (var i in options) {
        switch (i) {
          case 'element':
          case 'maskName':
          case 'clearButtonTitle':
          case 'style':
          case 'dataSource':
          case 'historyStore':
          case 'itmeClickFun':
          case 'focusFun':
          case 'blurFun':
          case 'inputFun':
          case 'size':
          case 'listSize':
          case 'rootBox':
            this[i] = options[i];
            break;
          case 'clazz':
            isArray(options[i]) && (this.clazz = this.clazz.concat(options[i]));
            isString(options[i]) && this.clazz.push(options[i]);
            break;
        }
      }
    },
    _init: function () {
      if (this._contDom) {
        this._contDom.find('li.item').unbind('click');
        this._contDom.remove();
      }
      this._boxDom && this._boxDom.remove();
      this._CreateDom();
      this._BuildEvent();
    },
    _CreateDom: function () {
      var C = Tools.createElement;
      this._bodyDom = this.rootBox || $('body');
      this.element = $(this.element);
      this._boxDom = $(C('div', { 'id': this._id, 'class': this.clazz.join(' ') }));
      this._boxDom.css({
        'position': 'absolute',
        'display': 'none'
      });
      this._borderDom = $(C('div', { 'class': Tools.config.prefix + 'history-border' }));
      var list = [];
      //如果没有输入值，去历史记录
      if (this.element.val() == "") {
        list = this._getHistory();
      } else {
        list = this._getSubList(this.dataSource, this.listSize);
      }

      this._contDom = $(C('ul', { 'class': Tools.config.prefix + 'history-list' }));
      for (var i in list) {
        this._contDom.append('<li class="item" data_id="' + list[i].id + '">' + list[i].name + '</li>');
      }
      //如果是在历史记录中取,显示清除提示
      if (this.element.val() == "") {
        this._clearButton = $(C('li', { 'class': [Tools.config.prefix + 'clear-history clearbutton'] }));
        if (list.length > 0) {
          this._clearButton.html(this.clearButtonTitle);
        } else {
          this._clearButton.html(this.notHistoryButtonTitle);
        }
        this._contDom.append(this._clearButton);
      }
      this._borderDom.append(this._contDom);
      this._boxDom.append(this._borderDom);
      this._bodyDom.append(this._boxDom);
    },
    _Location: function () {
      this._boxDom.css({ height: 'auto', width: 'auto' });
      var size = Tools.getPageSize();
      var pos = Tools.getElementPos(this.element[0]),
                left = this.style.left ? this.style.left : (this.size && this.size.left ? this.size.left + pos.left : pos.left) + 'px',
                top = this.style.top ? this.style.top : (this.size && this.size.top ? this.size.top + (pos.top + this.element.height()) : (pos.top + this.element.height())) + 'px',
                width = this.style.width ? this.style.width : this.element.width() + 'px',
                height = this.size && this.size.height ? ((size.height + this.size.height) + 'px') : 'auto';
      this._boxDom.css({
        'left': left,
        'top': top,
        'width': width,
        'height': height
      });
    },
    _AutoLocation: function () {
      this._Location();
      var self = this;
      this._autoLocResoure = function () {
        self._Location();
      };
      $(window).unbind('resize', this._autoLocResoure);
      $(window).bind('resize', this._autoLocResoure);
    },
    _UnAutoLocation: function () {
      $(window).unbind('resize', this._autoLocResoure);
    },
    _BuildEvent: function () {
      var self = this;
      this._contDom.find('li.item').unbind('click').bind('click', function () {
        var d = $(this);
        self.element.val(d.text());
        self.Close();
        if (typeof self.itmeClickFun == 'function') {
          var obj = {
            id: d.attr("data_id"),
            name: d.text()
          }
          self.itmeClickFun(obj);
        }
      });
      this.element.unbind('focus', this.event_focus);
      this.element.unbind('blur', this.event_blur);
      this.element.unbind('input', this.event_input);
      this.element.bind({
        'focus': this.event_focus,
        'blur': this.event_blur,
        'input': this.event_input
      });
      if (this.element.val() == "") {
        if (this._getHistory().length > 0) {
          this._clearButton.bind('click', function () {
            self.historyStore.remove();
            self.Close();
            self._init();
          });
        }
      }
    },
    setOpen: function () {
      this._oneShow = true;
    },
    Open: function () {
      this._boxDom.css('z-index', Tools.getBiggerzIndex());
      this._boxDom.show();
      this._AutoLocation();
    },
    Close: function () {
      this._boxDom.hide();
      this._UnAutoLocation();
    },

    setDataSource: function (data) {
      this.dataSource = data;
      this.Close();
      this._init();
      this.Open()
    },

    addHistory: function (data) {
      var hList = this.historyStore.get() || [];
      if (!data.id) {
        data.id = 0;
      }
      //检查关键字已经查询在历史中
      var saveIdx = -1;
      for (var i = 0, ln = hList.length; i < ln; i++) {
        if (hList[i].name == data.name) {
          saveIdx = i;
          break;
        }
      }
      //如在历史中找到
      if (saveIdx > -1) {
        hList.splice(saveIdx, 1);
      }
      hList.unshift(data);
      this.historyStore.set(hList);
      //保存之后,重新生成dom结构
      this._init();
    },

    reset: function () {
      this._init();
    },
    //取历史记录
    _getHistory: function () {
      var hList = this.historyStore.get() || [];
      return this._getSubList(hList, this.listSize);
    },

    _getSubList: function (hList, size) {
      var ln = hList.length;
      if (ln <= size) {
        return hList;
      } else {
        return hList.slice(0, size);
      }
    }
  };
  return History;
}); 
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cDataSource
* @description 用于处理服务器端下发数据
*/
define('cDataSource',['libs', 'cBase'], function (libs, cBase) {

  var DataSource = new cBase.Class({

    /** 相关属性 */
    __propertys__: function () {
      this.data;
      this.filters = [];
      this.group = {};
      this.isUpdate = true;
    },

    /**
    * @method initialize
    * @param options {object}        构造函数（实例化）传入的参数
    * @description 构造函数入口
    */
    initialize: function (options) {
      this.setOption(options);
    },

    /**
    * @method setOption
    * @param options {Object}        参数对象
    * @description 设置基本属性
    */
    setOption: function (options) {
      options = options || {};
      for (var i in options) {
        switch (i) {
          case 'data':
            this.setData(data);
            break;
        }
      }
    },

    /**
    * @method setData
    * @param data {Object}        
    * @description 设置data
    */
    setData: function (data) {
      this.data = data;
      this.isUpdate = true;
    },

    /**
    * @method filter
    * @param filterfun {function}  
    * @param sortfun {function}  
    * @description 筛选data
    */
    filter: function (filterfun, sortfun) {
      if (typeof filterfun !== 'function') throw 'Screening function did not fill in';

      //l_wang 修改点，将filter变为underscore的
      var fn = function (v, i) {
        return filterfun(i, v);
      }
      
      this.filters = _.filter(this.data, fn);
      this.filters = this.filters || [];
      return typeof sortfun === 'function' ? this.filters.sort(sortfun) : this.filters;
    },

    /**
    * @method groupBy
    * @param field {function}  
    * @param filterfun {function}  
    * @description data分组
    */
    groupBy: function (field, filterfun) {

      this.group = _.filter(this.data, filterfun);
      this.group = _.groupBy(this.group, field);

      return this.group;
    }

    
  });
  return DataSource;
});
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUICitylist
* @description 城市列表相关UI插件
*/
define('cUICitylist',['libs', 'cBase', 'cUIBase'], function (libs, cBase, uiBase) {

  var CityList = new cBase.Class({
    
    /** 相关属性 */
    __propertys__: function () {
      /** 根元素 */
      this.element = null;

      /** 展开城市时候的class */
      this.groupOpenClass = 'cityListClick';

      /** 选择城市的css样式 */
      this.selectedCityClass = 'citylistcrt';

      /** 默认城市 */
      this.autoLocCity = null;

      /** 选择的城市 */
      this.selectedCity = null;

      /** 默认国内数家 */
      this.defaultData = 'inland';

      /** 点击时候的方法 */
      this.itemClickFun = null;

      /** 数据对象 */
      this.data = null;

      /** 是否自动定位 */
      this.autoLoc = !!navigator.geolocation;

      /** 默认展开数据 */
      this.listType = this.defaultData;

    },

    /**
    * @method initialize
    * @param options {object}        构造函数（实例化）传入的参数
    * @description 构造函数入口
    */
    initialize: function (options) {
      this.setOption(options);
      this.assert();
      this._init();
    },

    /**
    * @method _init
    * @description 初始化方法
    */
    _init: function () {
      this.renderCityGroup();
      if (this.data) {
        this.renderData = this.data[this.defaultData] || [];
        this.bindClickEvent();
      }
    },

    /**
    * @method setOption
    * @param ops {Object}        设置的参数
    */
    setOption: function (ops) {
      for (var i in ops) {
        switch (i) {
          case 'groupOpenClass':
          case 'selectedCityClass':
          case 'selectedCity':
          case 'itemClickFun':
          case 'defaultData':
          case 'autoLoc':
          case 'autoLocCity':
          case 'data':
            this[i] = ops[i];
            break;
          case 'element':
            this[i] = $(ops[i]);
            break;
        }
      }
    },

    /**
    * @method assert
    * @description  将需要验证的属性加入，如果出错就不会继续执行
    */
    assert: function () {
      if (!this.element && this.element.length == 0) {
        throw 'not override element property';
      }
    },

    /**
    * @method renderCityGroup
    * @description   渲染城市分组
    */
    renderCityGroup: function () {
      var values = [];
      //如果设置了默认城市,置当前城市为选中状态
      if (this.autoLocCity && this.autoLocCity.listType == this.listType && this.autoLocCity.name) {
        values.push('<li id="' + uiBase.config.prefix + 'curCity" data-ruler="item"');
        if (!this.selectedCity || this.autoLocCity.name == this.selectedCity.name) {
          values.push(' class="' + this.selectedCityClass + '" ');
        } else {
          values.push(' class="noCrt"');
        }
        values.push(' data-value="' + this.autoLocCity.name + '"');
        values.push('>当前城市</li>');
      }

      values.push('<li id="hotCity" data-ruler="group" data-group="hotCity" class="' + this.groupOpenClass + '" >热门城市</li>');
      var groups = 'ABCDEFGHJKLMNOPQRSTWXYZ'.split('');
      //生成字母分类
      for (var i in groups) {
        values.push('<li data-ruler="group" data-group="' + groups[i] + '" id="' + groups[i] + '">' + groups[i] + '</li>');
      }
      this.element.html(values.join(''));
    },
 
    /**
    * @method groupClickHandler
    * @param group      用于分组的dom
    * @param alwaysOpen     是否打开状态
    * @description   渲染City
    */
    groupClickHandler: function (group, alwaysOpen) {
      var group = $(group);
      var dataGroup = group.attr("data-group") || group.attr("id");
      //如果分组下，没有城市列表 生成html
      if (group.children().length == 0) {
        var cities = [];
        try {
          cities = this.renderData[dataGroup];
        } catch (e) {
          console.log("city list 无" + dataGroup + "分组数据");
          return;
        }
        var values = [];
        values.push("<ul>")
        for (var i = 0, ln = cities.length; i < ln; i++) {
          var city = cities[i]
          values.push('<li class data-ruler="item" data-id="' + city.id + '"');
          values.push('>' + city.name + '</li>');
        }
        values.push("</ul>");
        group.append(values.join(''));
      }

      var clazz = group.attr("class");
      if (alwaysOpen) {
        group.addClass(this.groupOpenClass);
      } else {
        //如果已是打开状态,则关闭
        if (clazz && $.inArray(this.groupOpenClass, clazz)) {
          group.removeClass(this.groupOpenClass);
        } else {
          this.element.find('.' + this.groupOpenClass).removeClass(this.groupOpenClass);
          group.addClass(this.groupOpenClass);
        }
      }

      var pos = uiBase.getElementPos(group[0]);
      if (pos && group.attr("id") != 'hotCity') {
        //减去item的高
        $(window).scrollTop(pos.top - 60);
      }

      this.setSelectedCity(this.selectedCity);
    },

    /**
    * @method bindClickEvent
    * @description   绑定事件
    */
    bindClickEvent: function () {
      var self = this;
      this.element.delegate('li', 'click', function (e) {
        var ruler = $(this).attr('data-ruler');
        if (ruler == 'group') {
          self.groupClickHandler(this);
        } else if (ruler == 'item') {
          if (self.itemClickFun && typeof self.itemClickFun == 'function') {
            var obj = {
              id: $(this).attr("data-id"),
              name: $(this).attr("data-value") || $(this).html(),
              listType: self.listType
            }
            self.itemClickFun(obj);
          }
        }
      });
    },

    /**
    * @method bindClickEvent
    * @param attrName      
    * @description   切换国内/国际城市
    */
    switchData: function (attrName) {
      var data = this.data[attrName];
      if (data) {
        this.listType = attrName;
        this.element.undelegate('li', 'click');
        this.element.html("");
        this.renderCityGroup();
        this.renderData = data;
        this.groupClickHandler(this.element.find('#hotCity'), true);
        this.setSelectedCity(this.selectedCity);
        this.bindClickEvent();
      }
    },

    /**
    * @method bindClickEvent
    * @param city       城市
    * @description   设置默认城市
    */
    setSelectedCity: function (city) {
      var self = this;
      if (city && this.listType == city.listType && city.name) {
        var curCity = this.element.find('#' + uiBase.config.prefix + 'curCity');
        if (curCity.length > 0) {
          curCity.removeClass(this.selectedCityClass);
          curCity.addClass('noCrt');
        } else if (self.autoLocCity && self.autoLocCity.listType == this.listType && self.autoLocCity.name) {
          //如果开启了自动定位,则增加当前城市项
          var values = [];
          values.push('<li id="' + uiBase.config.prefix + 'curCity"');
          values.push('data-value="' + city.name + '" data-ruler="item">当前城市</li>');
          this.element.prepend(values.join());
        }
        this.element.find('li').each(function (i) {
          var item = $(this);
          if (item.html() == city.name || item.attr('data-value') == city.name) {
            item.removeClass('noCrt');
            item.addClass(self.selectedCityClass);
          } else {
            item.removeClass(self.selectedCityClass);
          }
        });
        this.selectedCity = city;
      }
    },

    /**
    * @method setData
    * @param data       设置数据对象
    * @description   设置数据源
    */
    setData: function (data) {
      this.element.html("");
      this.data = data;
      this._init();
    },

    /**
    * @method openHotCity
    * @param alwaysOpen       
    * @description   打开热点城市
    */
    openHotCity: function (alwaysOpen) {
      var ht = this.element.find('#hotCity');
      if (ht.length > 0) {
        this.groupClickHandler(ht, !!alwaysOpen);
      }
    }
  });
  return CityList;
});

/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUIInputClear
* @description 带删除按钮的文本框
*/
define('cUIInputClear',['libs'], function (libs) {

  var InputClear = (function () {

    /** 判断浏览器是否支持placeholder */
    var isPlaceHolder = 'placeholder' in document.createElement('input');

    /**
    * @method InputClear
    * @param input {dom}                 需要添加功能的文本框
    * @param clearClass {String}         自定义class
    * @param clearCallback {function}    清空后的回调函数
    * @param offset {object}             设置点击按钮的位置
    * @description input框带文字清除按钮
    */
    var InputClear = function (input, clearClass, clearCallback, offset, isNew) {
      clearClass || (clearClass = '');
      offset = offset || {}
      var $input = typeof input == 'string' ? $(input) : input;
      $input.each(function () {
        var clearButton = $('<a class="clear-input ' + clearClass + '" href="javascript:;"><span></span></a>'),
                $input = $(this);
        if (isNew) {
          clearButton = $('<span class="cui-focus-close ' + clearClass + '">×</span>')
        }
        if (offset.left) {
          clearButton.css({
            left: offset.left + 'px',
            right: 'auto'
          });
        }
        if (offset.top) {
          clearButton.css({
            top: offset.top + 'px',
            bottom: 'auto'
          });
        }
        if (offset.right) {
          clearButton.css({
            right: offset.right + 'px',
            left: 'auto'
          });
        }
        if (offset.bottom) {
          clearButton.css({
            bottom: offset.bottom + 'px',
            top: 'auto'
          });
        }
        $input.parent().addClass('clear-input-box');
        if (!isPlaceHolder) {
          var placeholder = $input.attr('placeholder'),
                    placeholderNode = $('<span class="placeholder-title' + (clearClass ? ' placeholder-' + clearClass : '') + '">' + placeholder + '</span>');
        }
        clearButton.hide();
        $input.bind({
          'focus': function () {
            var val = $.trim($input.val());
            if (val != '') {
              clearButton.show();
            }
          },
          'input': function () {
            window.setTimeout(function () {
              var val = $input.val();
              if (val == '') {
                clearButton.hide();
              } else {
                clearButton.show();
              }
              if (!isPlaceHolder) {
                if (val == '') {
                  placeholderNode.show();
                } else {
                  placeholderNode.hide();
                }
              }
            }, 10)

          },
          'blur': function () {
            var val = $.trim($input.val());
            if (!isPlaceHolder) {
              if (val == '') {
                placeholderNode.show();
              } else {
                placeholderNode.hide();
              }
            }
            setTimeout(function () {
              clearButton.hide();
            },
                        200);
          }
        });
        clearButton.bind('click',
                function () {
                  $input.val('');
                  $input.keyup();
                  clearButton.hide();
                  $input.focus();
                  $input.trigger('input');
                  typeof clearCallback == 'function' && clearCallback.call(this);
                });
        $input.after(clearButton);
        if (!isPlaceHolder) {
          $input.after(placeholderNode);
          placeholderNode.bind('click',
                    function () {
                      $input.focus();
                    });
        }

        $input.blur();
      });
    };
    return InputClear;
  })();

  return InputClear;

});
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUILoadingLayer
* @description 带关闭按钮的loading层
*/
define('cUILoadingLayer',['libs', 'cBase', 'cUILayer'], function (libs, cBase, Layer) {
  var _config = {
    prefix: 'cui-'
  };

  /** 用于abstractView执行的对象 */
  var _attributes = {};

  _attributes['class'] = _config.prefix + 'loading';
  _attributes.onShow = function () {
    this.contentDom.html([
                     '<div class="cui-grayload-text">',
                         '<div class="cui-i cui-w-loading"></div>',
                         '<div class="cui-i cui-m-logo"></div>',
                         '<div class="cui-grayload-close"></div>',
                         '<div class="cui-grayload-bfont">' + this.text + '</div>',
                    '</div>'
                    ].join(''));
    this.root.find('.cui-grayload-close').off('click').on('click', $.proxy(function () {
      this.callback && this.callback();
      this.hide();
    }, this));
    this.reposition();
  };

  var options = {};

  /** 相关属性 */
  options.__propertys__ = function () {
    this.contentDom;
    this.callback = function () { };
    this.text = '发送中...';
  };

  /** 构造函数入口 */
  options.initialize = function ($super, callback, text) {
    this.callback = callback || function () { };
    this.text = text || '发送中...';
    $super(_attributes);
  };

  return new cBase.Class(Layer, options);

});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIScrollList
* @description 提供一个可拖动的div层，以后可以自己扩展滚动条等效果，暂时不支持其它事件，做最简单实现
*/
define('cUIScrollList',['cBase'], function (cBase) {

  /**
  * @method initTap
  * @description 解决点透问题
  */
  window.initTap = function () {
    //l_wang至今点透仍无法可破......
    var forTap = $('#forTap');
    if (!forTap[0]) {
      forTap = $('<div id="forTap" style="color: White; display: none; border-radius: 60px; position: absolute; z-index: 99999; width: 60px; height: 60px"></div>');
      $('body').append(forTap);
    }
    return forTap;
  };

  /**
  * @method initTap
  * @param x {int}    x坐标
  * @param y {int}    y坐标
  * @description 透明弹出层解决点透问题
  */
  window.showMaskTap = function (x, y) {
    var forTap = initTap();
    forTap[0] && forTap.css({
      top: y + 'px',
      left: x + 'px'
    })
    forTap.show();
    setTimeout(function () {
      forTap.hide();
    }, 350);
  };

  /**
  * @class ScrollList
  * @param opts {Object}    数据对象
  * @description 类
  */
  var ScrollList = function (opts) {
    opts = opts || {};
    //检测设备事件支持，确定使用鼠标事件或者touch事件
    this._checkEventCompatibility();
    this._setBaseParam(opts);
    //初始化最初dom结构
    this._initBaseDom(opts);
    //设置显示几个项目
    this._setDisItemNum(opts);
    //设置默认选择值
    this._setSelectedIndex(opts);

    this.init();
  };

  ScrollList.prototype = {
    constructor: ScrollList,

    /**
    * @class _checkEventCompatibility
    * @description 检测设备事件兼容
    */
    _checkEventCompatibility: function () {
      //兼容性方案处理，以及后期资源清理
      var isTouch = 'ontouchstart' in document.documentElement;

      //      isTouch = true; //设置为true时电脑浏览器只能使用touch事件

      this.start = isTouch ? 'touchstart' : 'mousedown';
      this.move = isTouch ? 'touchmove' : 'mousemove';
      this.end = isTouch ? 'touchend' : 'mouseup';
      this.startFn;
      this.moveFn;
      this.endFn;
    },

    /**
    * @class _setBaseParam
    * @param opts {Object}    数据对象
    * @description 基本参数设置
    */
    _setBaseParam: function (opts) {
      /*
      定位实际需要用到的信息
      暂时不考虑水平移动吧
      */
      this.setHeight = 0; //被设置的高度
      this.itemHeight = 0; //单个item高度
      this.dragHeight = 0; //拖动元素高度
      this.dragTop = 0; //拖动元素top
      this.timeGap = 0; //时间间隔
      this.touchTime = 0; //开始时间
      this.moveAble = false; //是否正在移动
      this.moveState = 'up'; //移动状态，up right down left
      this.oTop = 0; //拖动前的top值
      this.curTop = 0; //当前容器top
      this.mouseY = 0; //鼠标第一次点下时相对父容器的位置
      this.cooling = false; //是否处于冷却时间
      this.animateParam = opts.animateParam || [50, 40, 30, 25, 20, 15, 10, 8, 6, 4, 2]; //动画参数
      this.animateParam = opts.animateParam || [10, 8, 6, 5, 4, 3, 2, 1, 0, 0, 0]; //动画参数
      //数据源
      this.data = opts.data || [];
      this.dataK = {}; //以id作为检索键值      
      //this.size = this.data.length; //当前容量
      this.size = this.getValidSize(this.data);
      //绑定用户事件
      this._changed = opts.changed || null;
    },
    
    getValidSize: function(data)
    {     
	  return _.filter(data, function(_data){
	    if (typeof _data.key == 'undefined') _data.key = _data.id;
        if (typeof _data.val == 'undefined') _data.val = _data.name;
		return _data.val || _data.key;
	  }).length;
    },

    /**
    * @class _initBaseDom
    * @param opts {Object}    数据对象
    * @description 初始化最初dom结构
    */
    _initBaseDom: function (opts) {
      //容器元素
      this.wrapper = opts.wrapper || $(document);
      this.type = opts.type || 'list'; //list, radio
      this.id = opts.id || 'id_' + new Date().getTime();
      this.className = opts.className || 'cui-roller-bd';

      //设置滚动的class
      this._setScrollClass(opts);
      this._initDom();
      this.wrapper.append(this.body);

    },

    /**
    * @class _setScrollClass
    * @param opts {Object}    数据对象
    * @description _initBaseDom子集
    */
    _setScrollClass: function (opts) {
      var scrollClass;
      //单选的情况需要确定显示选择项
      if (this.type == 'list') {
        scrollClass = 'cui-select-view';
      } else if (this.type == 'radio') {
        scrollClass = 'ul-list';
      }
      //没有被设置就是要默认值
      scrollClass = opts.scrollClass || scrollClass;
      this.scrollClass = scrollClass;
    },

    /**
    * @class _initDom
    * @description 初始化dom结构
    */
    _initDom: function () {
      this.body = $([
                    '<div class="' + this.className + '" style="overflow: hidden; position: relative; " id="' + this.id + '" >',
                    '</div>'
                    ].join(''));
      //真正拖动的元素（现在是ul）
      this.dragEl = $([
                    '<ul class="' + this.scrollClass + '" style="position: absolute; width: 100%;">',
                    '</ul>'
                    ].join(''));
    },

    /**
    * @class _setDisItemNum
    * @param opts {Object}    数据对象
    * @description 设置控件会显示几项
    */
    _setDisItemNum: function (opts) {
      //不设置的话，默认显示5项，手机显示不了太多，设置了就不控制长度了
      this.disItemNum = this.data.length;
      this.disItemNum = this.disItemNum > 5 ? 5 : this.disItemNum;

      //在单选项的情况，默认显示3项即可
      if (this.type == 'radio') this.disItemNum = 5;

      //获取用户设置的值，但是必须是奇数
      this.disItemNum = opts.disItemNum || this.disItemNum;
      if (this.type == 'radio') this.disItemNum = this.disItemNum % 2 == 0 ? this.disItemNum + 1 : this.disItemNum;
      if (this.data.length < this.disItemNum) {
        if (this.type == 'radio') {
          for (var i = 0, len = this.disItemNum - this.data.length; i < len; i++) {
            this.data.push({ key: '', val: '', disabled: false });
          }
          this.size = this.disItemNum;

        } else {
          this.disItemNum = this.data.length;
        }
      }

    },


    /**
    * @class _setSelectedIndex
    * @param opts {Object}    数据对象
    * @description 设置初始时候的选项索引
    */
    _setSelectedIndex: function (opts) {
      this.selectedIndex = parseInt(this.disItemNum / 2); //暂时不考虑多选的情况
      //list情况可以不用初始值
      if (this.type == 'list') {
        this.selectedIndex = -1;
      }
      //如果用户设置了索引值，便使用
      this.selectedIndex = opts.index != undefined ? opts.index : this.selectedIndex;

      //如果数组长度有问题的话
      this.selectedIndex = this.selectedIndex > this.data.length ? 0 : this.selectedIndex;
      //检测选项是否可选
      this._checkSelected();
    },

    /**
    * @class _checkSelected
    * @param dir {String}    方向
    * @description 检测设置的选项是否可选，不行的话需要重置选项，这里需要处理用户向上或者向下的情况
    */
    _checkSelected: function (dir) {
      //检测时需要根据参数先向上搜索或者先向下搜索
      dir = dir || 'down'; //默认向下搜索
      var isFind = false, index = this.selectedIndex;
      //首先检测当前项目是否不可选
      if (this.data[index] && (typeof this.data[index].disabled == 'undefined' || this.data[index].disabled == false)) {
        //向下的情况
        if (dir == 'down') {
          this.selectedIndex = this._checkSelectedDown(index);
          if (typeof this.selectedIndex != 'number') this.selectedIndex = this._checkSelectedUp(index);
        } else {
          this.selectedIndex = this._checkSelectedUp(index);
          if (typeof this.selectedIndex != 'number') this.selectedIndex = this._checkSelectedDown(index);
        }
      }
      if (typeof this.selectedIndex != 'number') this.selectedIndex = index;

      var s = '';
    },

    /**
    * @class _checkSelectedUp
    * @param index {int}    索引
    * @description 向上搜索
    */
    _checkSelectedUp: function (index) {
      var isFind = false;
      for (var i = index; i != -1; i--) {
        if (this.data[i] && typeof this.data[i].disabled == 'undefined' || this.data[i].disabled == true) {
          index = i;
          isFind = true;
          break;
        }
      }
      return isFind ? index : null;
    },

    /**
    * @class _checkSelectedDown
    * @param index {int}    索引
    * @description 向下搜索
    */
    _checkSelectedDown: function (index) {
      var isFind = false;
      for (var i = index, len = this.data.length; i < len; i++) {
        if (this.data[i] && typeof this.data[i].disabled == 'undefined' || this.data[i].disabled == true) {
          index = i;
          isFind = true;
          break;
        }
      }
      return isFind ? index : null
    },

    /**
    * @class init
    * @description 初始化函数
    */
    init: function () {
      this._addItem();
      this._initEventParam();
      this._addEvent();
      this._initScrollBar();
      this.setIndex(this.selectedIndex, true);

    },

    /**
    * @class _addItem
    * @description 增加数据
    */
    _addItem: function () {
      var _tmp, _data, i, k, val;
      for (var i in this.data) {
        _data = this.data[i];
        _data.index = i;
        if (typeof _data.key == 'undefined') _data.key = _data.id;
        if (typeof _data.val == 'undefined') _data.val = _data.name;
        val = _data.val || _data.key;
        this.dataK[_data.key] = _data;
        _tmp = $('<li>' + val + '</li>');
        _tmp.attr('data-index', i);
        if (typeof _data.disabled != 'undefined' && _data.disabled == false) {
          _tmp.css('color', 'gray');
        }
        this.dragEl.append(_tmp);
      }
      this.body.append(this.dragEl);
    },

    /**
    * @class _initEventParam
    * @description 初始化事件需要用到的参数信息
    */
    _initEventParam: function () {
      //如果没有数据的话就在这里断了吧
      if (this.data.constructor != Array || this.data.length == 0) return false;
      var offset = this.dragEl.offset();
      var li = this.dragEl.find('li').eq(0);
      var itemOffset = li.offset();
      //暂时不考虑边框与外边距问题
      this.itemHeight = itemOffset.height;
      this.setHeight = this.itemHeight * this.disItemNum;
      this.body.css('height', this.setHeight);
      this.dragTop = offset.top;
      this.dragHeight = this.itemHeight * this.size;

      //      var wrapperHeight = parseInt(this.wrapper.css('height'));

      //      var wrapperNum = wrapperHeight / this.itemHeight;

      //      var _top = parseInt((wrapperNum - this.disItemNum) / 2) * this.itemHeight;

      //      if (wrapperNum != this.disItemNum) { this.body.css('margin-top', _top + 'px'); }

      var s = '';
    },

    /**
    * @class _addEvent
    * @description 添加事件
    */
    _addEvent: function () {
      var scope = this;
      this.startFn = function (e) {
        scope._touchStart.call(scope, e);
      };
      this.moveFn = function (e) {
        scope._touchMove.call(scope, e);
      };
      this.endFn = function (e) {

        scope._touchEnd.call(scope, e);


      };
      this.dragEl[0].addEventListener(this.start, this.startFn, false);
      //            this.dragEl[0].addEventListener(this.move, this.moveFn, false);
      //            this.dragEl[0].addEventListener(this.end, this.endFn, false);
      this.dragEl[0].addEventListener(this.move, this.moveFn, false);
      this.dragEl[0].addEventListener(this.end, this.endFn, false);
    },

    /**
    * @class removeEvent
    * @description 移除事件
    */
    removeEvent: function () {
      this.dragEl[0].removeEventListener(this.start, this.startFn);
      this.dragEl[0].removeEventListener(this.move, this.moveFn);
      this.dragEl[0].removeEventListener(this.end, this.endFn);
    },

    /**
    * @class _initScrollBar
    * @description 初始化滚动条
    */
    _initScrollBar: function () {
      if (this.type != 'list') return;
      //滚动条缩放比例
      this.scrollProportion = this.setHeight / this.dragHeight;
      this.isNeedScrollBar = true;
      //该种情况无需滚动条
      if (this.scrollProportion >= 1) {
        this.isNeedScrollBar = false; ;
        return false;
      }
      //滚动条
      this.scrollBar = $('<div style="background-color: rgba(0, 0, 0, 0.498039);border: 1px solid rgba(255, 255, 255, 0.901961); width: 5px; border-radius: 3px;  position: absolute; right: 1px;  opacity: 0.2;  "></div>');
      this.body.append(this.scrollBar);
      this.scrollHeight = parseInt(this.scrollProportion * this.setHeight);
      this.scrollBar.css('height', this.scrollHeight);
    },

    /**
    * @class _setScrollTop
    * @param top {int}    数据参数
    * @param duration {int}    动画时间
    * @description 初始化滚动条
    */
    _setScrollTop: function (top, duration) {
      //滚动条高度
      if (this.isNeedScrollBar) {
        top = this._getResetData(top).top;
        top = top < 0 ? (top + 10) : top;

        var scrollTop = top * (-1);
        if (typeof duration == 'number') {
          var _top = parseInt(scrollTop * this.scrollProportion) + 'px';
          this.scrollBar.animate({
            top: _top,
            right: '1px'
          }, duration, 'linear');

        } else {
          this.scrollBar.css('top', parseInt(scrollTop * this.scrollProportion) + 'px');
        }
        this.scrollBar.css('opacity', '0.8');
      }
    },

    /**
    * @class _hideScroll
    * @description 隐藏滚动条
    */
    _hideScroll: function () {
      if (this.isNeedScrollBar) {
        this.scrollBar.animate({ 'opacity': '0.2' });
      }
    },

    /**
    * @class _touchStart
    * @description 添加手指触屏处理程序
    */
    _touchStart: function (e) {
      e.preventDefault();
      var scope = this;
      //冷却时间不能开始
      if (this.cooling) {
        setTimeout(function () {
          scope.cooling = false;
        }, 50);
        e.preventDefault();
        return false;
      }
      //需要判断是否是拉取元素，此处需要递归验证，这里暂时不管
      //！！！！！！！！此处不严谨
      var el = $(e.target).parent(), pos;

      this.isMoved = false;

      if (el.hasClass(this.scrollClass)) {
        this.touchTime = e.timeStamp;
        //获取鼠标信息
        pos = this.getMousePos((e.changedTouches && e.changedTouches[0]) || e);
        //注意，此处是相对位置，注意该处还与动画有关，所以高度必须动态计算
        var top = parseFloat(this.dragEl.css('top')) || 0;
        this.mouseY = pos.top - top;
        this.moveAble = true;
      }
    },

    /**
    * @class _touchMove
    * @description 添加手指触屏移动处理程序
    */
    _touchMove: function (e) {

      e.preventDefault();
      if (!this.moveAble) { return false; }
      var pos = this.getMousePos((e.changedTouches && e.changedTouches[0]) || e);

      //先获取相对容器的位置，在将两个鼠标位置相减
      this.curTop = pos.top - this.mouseY;
      var cheakListBound = this._cheakListBound(this.curTop);
      if (cheakListBound != false) {
        this.curTop = cheakListBound.top;
      }
      this.isMoved = true;
      this.dragEl.css('top', this.curTop + 'px');
      this._setScrollTop(this.curTop);

      e.preventDefault();
    },

    /**
    * @class _cheakListBound
    * @description 检查边界问题
    */
    _cheakListBound: function (top) {
      //此处经产品要求加入头尾不能动的需求判断，暂时只考虑list

      //注意此处radio已经判断
      var minTop = parseInt(this.dragHeight) - parseInt(this.setHeight); //能达到的最小负top值


      var isBound = false; //是否到达边界
      if (this.type == 'radio') {
        var radioNum = parseInt(this.disItemNum / 2);
        if (top > this.itemHeight * radioNum) {
          top = this.itemHeight * radioNum;
          isBound = true;
        } else {
          if (top < (minTop * (-1)) - this.itemHeight * radioNum) {
            top = minTop * (-1) - this.itemHeight * radioNum;
            isBound = true;
          }
        }
      } else {
        if (top > this.itemHeight) {
          top = this.itemHeight;
          isBound = true;
        } else {
          if (top < (minTop * (-1)) - this.itemHeight) {
            top = minTop * (-1) - this.itemHeight;
            isBound = true;
          }
        }

      }

      if (isBound) {
        this.isBound = true; //当前以达到边界
        return {
          speed: 1,
          top: top
        };
      }
      this.isBound = false;
      return false;
    },

    /**
    * @class _getAnimateData
    * @description 获取动画参数
    */
    _getAnimateData: function (e) {
      this.timeGap = e.timeStamp - this.touchTime;
      var flag = this.oTop <= this.curTop ? 1 : -1; //判断是向上还是向下滚动
      var flag2 = this.curTop > 0 ? 1 : -1; //这个会影响后面的计算结果
      this.moveState = flag > 0 ? 'up' : 'down';
      var ih = parseFloat(this.itemHeight);
      var ih1 = ih / 2;

      var top = Math.abs(this.curTop);
      var mod = top % ih;
      top = (parseInt(top / ih) * ih + (mod > ih1 ? ih : 0)) * flag2;
      var step = parseInt(this.timeGap / 10 - 10);
      step = step > 0 ? step : 0;
      var speed = this.animateParam[step] || 0;
      var increment = speed * ih * flag;
      top += increment;

      return {
        top: top,
        speed: speed
      };
    },

    /**
    * @class _touchEnd
    * @description 添加手指触屏离开处理程序
    */
    _touchEnd: function (e) {
      var scope = this;
      if (this.isBound === true && this.isMoved === true) {
        scope.reset.call(scope, this.curTop);
        this.moveAble = false;
        return false;
      }
      if (!this.moveAble) return false;
      this.cooling = true; //开启冷却时间

      //时间间隔
      var animateData = this._getAnimateData(e);
      var top = animateData.top;
      var speed = animateData.speed;

      var cheakListBound = this._cheakListBound(top);
      if (cheakListBound != false) {
        top = cheakListBound.top;
        speed = cheakListBound.speed;
      }

      //！！！此处动画可能导致数据不同步，后期改造需要加入冷却时间
      if (this.oTop != this.curTop && this.curTop != top) {
        this.dragEl.animate({
          top: top + 'px'
        }, 100 + (speed * 20), 'linear', function () {
          scope.reset.call(scope, top);
        });
        scope._setScrollTop(top, 100 + (speed * 20));

      } else {
        //修改点击无效区域的bug
        return;

        var el = $(e.target);
        if (this.type == 'list') {
          var item = this.dragEl.find('li');
          item.removeClass('current');
          el.addClass('current');
        }
        //这个由于使用了边距等东西，使用位置定位有点不靠谱了
        this.selectedIndex = el.attr('data-index');
        //单选多选列表触发的事件，反正都会触发

        if (this.type == 'list') {
          this.onTouchEnd();
          //尼玛其实点透至今仍然不可破......上蒙版吧......
          if (scope.start == 'touchstart') {
            var _e = e.changedTouches && e.changedTouches[0];
            showMaskTap(_e.pageX - 30, _e.pageY - 30);
          }
        }
        //                e.stopPropagation();
        //                e.preventDefault();
        this.cooling = false; //关闭冷却时间
      }
      this._hideScroll();
      this.moveAble = false;
      //            e.preventDefault();
    },

    /**
    * @class _getResetData
    * @param top {int}    top值
    * @description 复位相关
    */
    _getResetData: function (top) {
      var num = parseInt(this.type == 'list' ? 0 : this.disItemNum / 2);
      var _top = top, t = false;

      var sHeight = this.type == 'list' ? 0 : parseFloat(this.itemHeight) * num;
      var eHeight = this.type == 'list' ? this.setHeight : parseFloat(this.itemHeight) * (num + 1);
      var h = this.dragHeight;

      if (top >= 0) {
        if (top > sHeight) {
          _top = sHeight;
          t = true;
        } else {
          //出现该情况说明项目太少，达不到一半
          if (h <= sHeight) {
            _top = parseInt(this.dragEl.css('top'))/this.itemHeight * this.itemHeight;
            t = true;
          }
        }
      }
      if (top < 0 && (top + this.dragHeight <= eHeight)) {
        t = true;
        _top = (this.dragHeight - eHeight) * (-1);
      }
      if (top == _top) {
        t = false;
      }

      return {
        top: _top,
        needReset: t
      };
    },

    /**
    * @class reset
    * @description 超出限制后位置还原
    */
    reset: function (top) {
      var scope = this;
      var t = this._getResetData(top).needReset;
      var _top = this._getResetData(top).top;

      if (t) {
        scope.dragEl.animate({
          top: _top + 'px'
        }, 50, 'linear', function () {
          scope._reset(_top);
        });
      } else {
        scope._reset(top);
      }
      this._hideScroll();

    },

    /**
    * @class _reset
    * @description 还原点函数
    */
    _reset: function (top) {
      this.oTop = top;
      this.curTop = top;
      this.type == 'radio' && this.onTouchEnd();
      this.cooling = false; //关闭冷却时间
    },

    /**
    * @class onTouchEnd
    * @description 拖动结束时候触发的回调
    */
    onTouchEnd: function (scope) {
      scope = scope || this;

      var secItem, i, len, index, isFind;
      var changed = this._changed;
      var num = parseInt(this.type == 'list' ? 0 : this.disItemNum / 2);
      len = this.data.length;
      if (this.type == 'radio') {
        i = parseInt((this.curTop - this.itemHeight * num) / parseFloat(this.itemHeight));
        this.selectedIndex = Math.abs(i);
        secItem = this.data[this.selectedIndex];
      } else {
        secItem = this.data[this.selectedIndex];
      }

      //默认不去找
      isFind = false; //检测是否找到可选项
      //检测是否当前项不可选，若是不可选，需要还原到最近一个可选项
      if (secItem && typeof secItem.disabled != 'undefined') {
        if (secItem.disabled == false) {
          index = this.selectedIndex;
          if (this.type == 'radio')
            this._checkSelected(this.moveState);
          if (index != this.selectedIndex) isFind = true;
        }
      }
      //会有还原的逻辑
      if (isFind) {
        this.setIndex(this.selectedIndex);
      } else {
        var changed = this._changed;
        if (changed && typeof changed == 'function' && secItem && secItem.disabled != false) {
          changed.call(scope, secItem);
        }
        this.dragEl.find('li').removeClass('current');
        if (this.type == 'radio') this.dragEl.find('li').eq(this.selectedIndex).addClass('current');
      }
    },

    /**
    * @class reload
    * @description 数据重新加载
    */
    reload: function (data) {
      this.data = data;
      this.dragEl.html('');
      if (data.constructor == Array && data.length > 0) {
        this.selectedIndex = parseInt(this.disItemNum / 2); //暂时不考虑多选的情况
        this.selectedIndex = this.selectedIndex > this.data.length ? this.data.length - 1 : this.selectedIndex;
        this._checkSelected('down');
        this._addItem();
        this._initEventParam();
        this.cooling = false;
        this.setIndex(this.selectedIndex, true);

        //添加样式效果
        this.dragEl.find('li').removeClass('current');
        if (this.type == 'radio') this.dragEl.find('li').eq(this.selectedIndex).addClass('current');
      }
      this.size = this.getValidSize(data);
      this.dragHeight = this.itemHeight * this.size;
    },

    /**
    * @class setKey
    * @param k {String}    设置当前键值
    * @description 设置当前键值
    */
    setKey: function (k) {
      if (k == undefined || k == null) return false;
      var i = this.dataK[k] && this.dataK[k].index;
      this.setIndex(i);
    },

    /**
    * @class setIndex
    * @param i {int}    设置当前索引
    * @description 设置当前索引
    */
    setIndex: function (i, init) {
      if (i == undefined || i < 0) return false;
      var scope = this;
      //                    this.cooling = true; //关闭冷却时间
      var num = parseInt(scope.disItemNum / 2);

      if (scope.type == 'list') {
        if (this.data.length == scope.disItemNum) {
          num = i;
        } else {
          num = i == 0 ? 0 : 1;
          //产品要求，最低处不能有空格
          if (this.size - i < this.disItemNum)
            num = (-1) * parseInt(this.size) + parseInt(this.disItemNum) + parseInt(i);
        }
      }

      var i = parseInt(i), top;
      if (i < 0) return false;
      if (i >= this.data.length) i = this.data.length - 1;
      this.selectedIndex = i;
      top = this.itemHeight * (num - i);

      //防止设置失败
      scope.oTop = top;
      scope.curTop = top;
      scope.cooling = false; //关闭冷却时间
      //            scope.dragEl.css('top', top + 'px');

      scope.dragEl.animate({ 'top': top + 'px' }, 50, 'linear');

      //修复滚动条初始化BUG
      this._setScrollTop(top, 50);

      if (scope.type == 'list') {
        var item = scope.dragEl.find('li');
        item.removeClass('current');
        item.eq(i).addClass('current');
      }
      //初始化dom选项时不触发事件
      if (!init) {
        //单选时候的change事件
        scope.onTouchEnd();
      }
    },

    /**
    * @class getSelected
    * @description 获取当前选择项
    */
    getSelected: function () {
      return this.data[this.selectedIndex];
    },

    /**
    * @class getByKey
    * @description 根据键值获取项
    */
    getByKey: function (k) {
      var i = this.dataK[k] && this.dataK[k].index;
      if (i != null && i != undefined)
        return this.data[i];
      return null;
    },

    /**
    * @class getMousePos
    * @description 获取鼠标信息
    */
    getMousePos: function (event) {
      var top, left;
      top = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
      left = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
      return {
        top: top + event.clientY,
        left: left + event.clientX
      };
    }
  };
  return ScrollList;
});

/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIScrollRadio
* @description 滚轮单选插件
*/
define('cUIScrollRadio',['libs', 'cBase', 'cUILayer', 'cUIScrollList'], function (libs, cBase, Layer, ScrollList) {

  var options = {};

  var _config = { prefix: 'cui-' };

  var _attributes = {};
  _attributes['class'] = _config.prefix + 'warning';

  _attributes.onCreate = function () {

    //refactor -- use tempalte to replace
    this.root.html([
      '<div class="cui-pop-box" >',
        '<div class="cui-hd">',
          '<div class="cui-text-center">',
          '' + this.title + '</div>',
        '</div>',
        '<div class="cui-bd ">',
          '<div class="cui-roller scrollWrapper">',
          '</div>',
          '<p class="cui-roller-tips">',
            '' + this.tips + '</p>',
          '<div class="cui-roller-btns">',
            '<div class="cui-btns-cancel cui-flexbd">' + this.cancel + '</div> <div class="cui-btns-sure cui-flexbd" >',
            '' + this.ok + '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join(''));

    this.title = this.root.find('.cui-text-center');
    this.tips = this.root.find('.cui-roller-tips');
    this.btCancel = this.root.find('.cui-btns-cancel');
    this.btOk = this.root.find('.cui-btns-sure');
    this.line = $('<div class="cui-mask-gray"></div><div class="cui-lines">&nbsp;</div>');
    this.wrapper = this.root.find('.scrollWrapper');
  };

  _attributes.onShow = function () {
    var scope = this;
    this.maskToHide(function () {
      scope.hide();
    });

    //没有data的话便不进行渲染了
    if (!this.data || this.data.length == 0) return false;

    for (var i = 0, len = this.data.length; i < len; i++) {
      var param = {
        wrapper: this.wrapper,
        data: this.data[i],
        type: 'radio',
        disItemNum: this.disItemNum,

        changed: (function (i) {
          return function (item) {
            var changed = scope.changed[i];
            if (typeof changed == 'function') {
              changed.call(scope, item); //改变则触发事件
            }
          }
        })(i)
      }
      if (i == 0 && len == 3) {
        param.className = 'cui-roller-bd  cui-flex2'
      }
      var s = new ScrollList(param);
      this.scroll.push(s);
    }

    for (var i = 0, len = this.data.length; i < len; i++) {
      this.scroll[i].setIndex(this.index[i]);
      this.scroll[i].setKey(this.key[i]);
    }

    this.wrapper.append(this.line);
    this.btOk.on('click', function () {
      var item = [];
      for (var i = 0, len = scope.scroll.length; i < len; i++) {
        item.push(scope.scroll[i].getSelected());
      }
      scope.okClick.call(scope, item); //改变则触发事件
      scope.hide();

    });

    this.btCancel.on('click', function () {
      var item = [];
      for (var i = 0, len = scope.scroll.length; i < len; i++) {
        item.push(scope.scroll[i].getSelected());
      }
      scope.cancelClick.call(scope, item); //改变则触发事件
      scope.hide();
    });
    this.setzIndexTop();

    //l_wang 测试
    //    $(window).bind('scroll', function () {
    //      window.scrollTo(0, 1);
    //    });
    this.root.bind('touchmove', function (e) {
      e.preventDefault();
    });

    this.onHashChange = function () {
      this.hide();
    }
    $(window).on('hashchange', $.proxy(this.onHashChange, this));
  };

  _attributes.onHide = function () {
    for (var i = 0, len = this.scroll.length; i < len; i++) {
      this.scroll[i].removeEvent();
    }
    this.btOk.off('click');
    this.btCancel.off('click');

    //l_wang 测试
    //    $(window).unbind('scroll');
    this.root.unbind('touchmove');
    this.root.remove();
    $(window).off('hashchange', $.proxy(this.onHashChange, this));

  };

  options.__propertys__ = function () {
    var scope = this;
    this.changed = [];
    this.scroll = [];
    this.data = [];
    this.index = [];
    this.key = [];
    this.disItemNum = 5;

    this.tips = '';
    this.btCancel;
    this.btOk;
    this.cancel = '取消';
    this.ok = '确定';
    this.cancelClick = function () { scope.hide() };
    this.okClick = function () { scope.hide() };
  };

  options.initialize = function ($super, opts) {
    this.setOption(function (k, v) {
      this[k] = v;
    });
    $super($.extend(_attributes, opts));
  };

  options.setTips = function (str) {
    this.tips.html(str);
  };

  var ScrollRadio = new cBase.Class(Layer, options);
  return ScrollRadio;

});
/**
 * @fileoverview [iscroll]{@link https://github.com/cubiq/iscroll}改写成异步模块 
 */
define('cUIScroll',['cBase'], function (cBase) {

  var utils = (function () {
    var me = {};
    var _elementStyle = document.createElement('div').style;

    //获得需要兼容CSS3前缀
    var _vendor = (function () {
      var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
      var transform;
      var i = 0;
      var l = vendors.length;

      for (; i < l; i++) {
        transform = vendors[i] + 'ransform';
        if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
      }
      return false;
    })();

    //获取样式（CSS3兼容）
    function _prefixStyle(style) {
      if (_vendor === false) return false;
      if (_vendor === '') return style;
      return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }

    me.getTime = Date.now || function getTime() { return new Date().getTime(); };

    me.addEvent = function (el, type, fn, capture) {
      if (el[0] && el != window.top) el = el[0];
      el.addEventListener(type, fn, !!capture);
    };

    me.removeEvent = function (el, type, fn, capture) {
      if (el[0] && el != window.top) el = el[0];
      el.removeEventListener(type, fn, !!capture);
    };

    /*
    current：当前鼠标位置
    start：touchStart时候记录的Y（可能是X）的开始位置，但是在touchmove时候可能被重写
    time： touchstart到手指离开时候经历的时间，同样可能被touchmove重写
    lowerMargin：y可移动的最大距离，这个一般为计算得出 this.wrapperHeight - this.scrollerHeight
    wrapperSize：如果有边界距离的话就是可拖动，不然碰到0的时候便停止
    */
    me.momentum = function (current, start, time, lowerMargin, wrapperSize) {
      var distance = current - start,
    speed = Math.abs(distance) / time,
    destination,
    duration,
    deceleration = 0.0006;

      destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
      duration = speed / deceleration;

      if (destination < lowerMargin) {
        destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
        distance = Math.abs(destination - current);
        duration = distance / speed;
      } else if (destination > 0) {
        destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
        distance = Math.abs(current) + destination;
        duration = distance / speed;
      }

      return {
        destination: Math.round(destination),
        duration: duration
      };

    };

    $.extend(me, {
      hasTouch: 'ontouchstart' in window
    });

    // This should find all Android browsers lower than build 535.19 (both stock browser and webview)
    me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));


    //我们暂时只判断touch 和 mouse即可
    $.extend(me.style = {}, {
      transform: _prefixStyle('transform'),
      transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
      transitionDuration: _prefixStyle('transitionDuration'),
      transitionDelay: _prefixStyle('transitionDelay'),
      transformOrigin: _prefixStyle('transformOrigin')
    });

    $.extend(me.eventType = {}, {
      touchstart: 1,
      touchmove: 1,
      touchend: 1,

      mousedown: 2,
      mousemove: 2,
      mouseup: 2
    });

    $.extend(me.ease = {}, {
      quadratic: {
        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fn: function (k) {
          return k * (2 - k);
        }
      },
      circular: {
        style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
        fn: function (k) {
          return Math.sqrt(1 - (--k * k));
        }
      },
      back: {
        style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fn: function (k) {
          var b = 4;
          return (k = k - 1) * k * ((b + 1) * k + b) + 1;
        }
      },
      bounce: {
        style: '',
        fn: function (k) {
          if ((k /= 1) < (1 / 2.75)) {
            return 7.5625 * k * k;
          } else if (k < (2 / 2.75)) {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
          } else if (k < (2.5 / 2.75)) {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
          } else {
            return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
          }
        }
      },
      elastic: {
        style: '',
        fn: function (k) {
          var f = 0.22,
    e = 0.4;

          if (k === 0) { return 0; }
          if (k == 1) { return 1; }

          return (e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1);
        }
      }
    });
    return me;
  })();

  function IScroll(opts) {
    this.$wrapper = typeof opts.wrapper == 'string' ? $(opts.wrapper) : opts.wrapper;
    if (opts.scroller) {
      this.scroller = typeof opts.scroller == 'string' ? $(opts.scroller) : opts.scroller;
    } else {
      this.scroller = this.$wrapper.children().eq(0);
    }

    this.wrapper = this.$wrapper[0];
    this.scroller = this.scroller[0];

    var instance = this.wrapper.iscrollInstance;
    //防止多次实例化bug
    if (instance) {
      return instance;
    }

    //这个属性会被动态改变的，如果这里
    this.scrollerStyle = this.scroller.style;

    this.options = {
      //是否具有滚动条
      scrollbars: true,
      //初始坐标
      startX: 0,
      startY: 0,
      //超出边界还原时间点
      bounceTime: 600,
      //超出边界返回的动画
      bounceEasing: utils.ease.circular,
      //解决input框不能获取焦点的bug
      preventDefaultException: /^(input|textarea|button|select)$/i,
      //超出边界时候是否还能拖动
      bounce: true,
      //竖直滚动
      scrollY: true,
      //横向滚动
      scrollX: false,
      bindToWrapper: true,

      //当window触发resize事件60ms后还原
      resizePolling: 60
    };

    this._events = {};

    for (var i in opts) {
      this.options[i] = opts[i];

      if (i == 'scrollStart' || i == 'scrollEnd') {
        this.on(i, _.bind(opts[i], this));
      }
    }

    this.translateZ = ' translateZ(0)';
    this.x = 0;
    this.y = 0;
    this._init();

    //更新滚动条位置
    this.refresh();

    //更新本身位置
    this.scrollTo(this.options.startX, this.options.startY);

    this.enable();

    this.wrapper.iscrollInstance = this;
  };

  IScroll.prototype = {
    _init: function () {
      this._initEvents();
      if (this.options.scrollbars) {
        this._initIndicator();
      }
    },
    refresh: function () {
      var rf = this.wrapper.offsetHeight;   // Force reflow
      var options = this.options;
      // 如果元素隐藏
      if (rf == 0) return;

      this.wrapperWidth = this.wrapper.clientWidth;
      this.scrollerWidth = this.scroller.offsetWidth;
      this.maxScrollX = this.wrapperWidth - this.scrollerWidth;

      this.wrapperHeight = this.wrapper.clientHeight;
      this.scrollerHeight = this.scroller.offsetHeight;
      this.maxScrollY = this.wrapperHeight - this.scrollerHeight;

      //判断滚动条是否显示
      if (this.indicator) {
        if (options.scrollY && this.maxScrollY >= 0) {
          this.indicator.wrapperStyle.display = 'none';
        }

        if (options.scrollX && this.maxScrollX >= 0) {
          this.indicator.wrapperStyle.display = 'none';
        }
      }

      if (options.scrollX || this.maxScrollY > 0) {
        this.maxScrollY = 0;
      }

      if (options.scrllY || this.maxScrollX > 0) {
        this.maxScrollX = 0;
      }

      this.endTime = 0;

      this._execEvent('refresh');

      this.resetPosition();

      
    },
    _initEvents: function (remove) {
      var eventType = remove ? utils.removeEvent : utils.addEvent;
      var target = this.options.bindToWrapper ? this.wrapper : window;

      eventType(window, 'orientationchange', this);
      eventType(window, 'resize', this);

      if (utils.hasTouch) {
        eventType(this.wrapper, 'touchstart', this);
        eventType(target, 'touchmove', this);
        eventType(target, 'touchcancel', this);
        eventType(target, 'touchend', this);
      } else {
        eventType(this.wrapper, 'mousedown', this);
        eventType(target, 'mousemove', this);
        eventType(target, 'mousecancel', this);
        eventType(target, 'mouseup', this);
      }

      eventType(this.scroller, 'transitionend', this);
      eventType(this.scroller, 'webkitTransitionEnd', this);
      eventType(this.scroller, 'oTransitionEnd', this);
      eventType(this.scroller, 'MSTransitionEnd', this);
    },
    _start: function (e) {
      var options = this.options;

      if (options.scrollX) {
        this._isMovedChecked = false;
        this.enabled = true;
      }

      if (!this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated)) {
        return;
      }


      if (!utils.isBadAndroid && options.preventDefaultException.test(e.target.tagName)) {
        e.preventDefault();
      }

      var point = e.touches ? e.touches[0] : e, pos;
      this.initiated = utils.eventType[e.type];

      this.moved = false;
      
      this.distY = 0;
      this.distX = 0;

      //开启动画时间，如果之前有动画的话，便要停止动画，这里因为没有传时间，所以动画便直接停止了
      this._transitionTime();

      this.startTime = utils.getTime();

      //如果正在进行动画，需要停止，并且触发滑动结束事件
      if (this.isInTransition) {
        this.isInTransition = false;
        pos = this.getComputedPosition();
        var _x = Math.round(pos.x);
        var _y = Math.round(pos.y);

        if (_y < 0 && _y > this.maxScrollY && options.adjustXY) {
          _y = options.adjustXY.call(this, _x, _y).y;
        }

        //移动过去
        this._translate(_x, _y);
        this._execEvent('scrollEnd');
      }

      this.startX = this.x;
      this.startY = this.y;
      this.absStartX = this.x;
      this.absStartY = this.y;
      this.pointX = point.pageX;
      this.pointY = point.pageY;

      this._execEvent('beforeScrollStart');

    },
    // 检测屏幕上下滑动时，不要阻止页面滑动
    _moveCheck: function(e) {
      var options = this.options;

      if (options.scrollX) {
        if (!this._isMovedChecked) {
          var point = e.touches ? e.touches[0] : e;
          var deltaX = Math.abs(point.pageX - this.pointX);
          var deltaY = Math.abs(point.pageY - this.pointY);
          if (deltaY > deltaX) {
            this.disable();
          }
        }
      }

      this._isMovedChecked = true;
    },
    _move: function (e) {
      if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
        return;
      }
      e.preventDefault();
      var options = this.options;
      var point = e.touches ? e.touches[0] : e,
      deltaX = point.pageX - this.pointX,
      deltaY = point.pageY - this.pointY,
      timestamp = utils.getTime(),
      newX, newY,
      absDistX, absDistY;

      this.pointX = point.pageX;
      this.pointY = point.pageY;

      this.distX += deltaX;
      this.distY += deltaY;
      absDistX = Math.abs(this.distX);
      absDistY = Math.abs(this.distY);

      // 如果一直按着没反应的话这里就直接返回了
      if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
        return;
      }

      if (options.scrollX) {
        deltaY = 0;
      }

      if (options.scrollY) {
        deltaX = 0;
      }

      newX = this.x + deltaX;
      newY = this.y + deltaY;

      if ( newX > 0 || newX < this.maxScrollX ) {
        newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
      }

      if (newY > 0 || newY < this.maxScrollY) {
        newY = options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
      }

      if (!this.moved) {
        this._execEvent('scrollStart');
      }

      this.moved = true;

      this._translate(newX, newY);

      if (timestamp - this.startTime > 300) {
        this.startTime = timestamp;
        this.startX = this.x;
        this.startY = this.y;
      }

    },
    _end: function (e) {
      if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
        return;
      }

      var options = this.options;
      var point = e.changedTouches ? e.changedTouches[0] : e,
      momentumY,
      duration = utils.getTime() - this.startTime,
      newX = Math.round(this.x),
      newY = Math.round(this.y),
      distanceX = Math.abs(newX - this.startX),
      distanceY = Math.abs(newY - this.startY),
      time = 0,
      easing = '';

      this.isInTransition = 0;
      this.initiated = 0;
      this.endTime = utils.getTime();

      if (this.resetPosition(options.bounceTime)) {
        return;
      }

      this.scrollTo(newX, newY);

      if (!this.moved) {
        //click 的情况
        this._execEvent('scrollCancel');
        return;
      }

      if (duration < 300) {
        momentumX = utils.momentum(this.x, this.startX, duration, this.maxScrollX, options.bounce ? this.wrapperWidth : 0);
        momentumY = utils.momentum(this.y, this.startY, duration, this.maxScrollY, options.bounce ? this.wrapperHeight : 0);
        newX = momentumX.destination;
        newY = momentumY.destination;
        time = Math.max(momentumX.duration, momentumY.duration);
        this.isInTransition = 1;
      }

      if ( newX != this.x || newY != this.y ) {
        // change easing function when scroller goes out of the boundaries
        if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
          easing = utils.ease.quadratic;
        }

        this.scrollTo(newX, newY, time, easing);
        return;
      }

      this._execEvent('scrollEnd');
    },

    _resize: function () {
      var that = this;

      clearTimeout(this.resizeTimeout);

      this.resizeTimeout = setTimeout(function () {
        that.refresh();
      }, this.options.resizePolling);
    },

    _transitionTimingFunction: function (easing) {
      this.scrollerStyle[utils.style.transitionTimingFunction] = easing;

      this.indicator && this.indicator.transitionTimingFunction(easing);
    },

    //开始或者停止动画
    _transitionTime: function (time) {
      time = time || 0;
      this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

      /*if ( !time && utils.isBadAndroid ) {
        this.scrollerStyle[utils.style.transitionDuration] = '0.00167s';
      }*/

      //滚动条，我们这里只会出现一个滚动条就不搞那么复杂了
      this.indicator && this.indicator.transitionTime(time);

    },

    getComputedPosition: function () {
      var matrix = window.getComputedStyle(this.scroller, null), x, y;

      matrix = matrix[utils.style.transform].split(')')[0].split(', ');
      x = +(matrix[12] || matrix[4]);
      y = +(matrix[13] || matrix[5]);

      return { x: x, y: y };
    },

    _initIndicator: function () {
      //滚动条
      var el;
      var scrollX = this.options.scrollX

      if (scrollX) {
        el = createDefaultScrollbar('h');
      } else {
        el = createDefaultScrollbar();
      }

      this.wrapper.appendChild(el);
      this.indicator = new Indicator(this, { el: el, scrollX: scrollX });
      this.$wrapper.css('position', 'relative');

      this.on('scrollEnd', function () {
        this.indicator.fade();
      });

      var scope = this;
      this.on('scrollCancel', function () {
        scope.indicator.fade();
      });

      this.on('scrollStart', function () {
        scope.indicator.fade(1);
      });

      this.on('beforeScrollStart', function () {
        scope.indicator.fade(1, true);
      });

      this.on('refresh', function () {
        scope.indicator.refresh();
      });

    },
    _translate: function (x, y) {
      this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

      this.x = x;
      this.y = y;

      if (this.options.scrollbars) {
        this.indicator.updatePosition();
      }

    },

    resetPosition: function (time) {
      var x = this.x;
      var y = this.y;
      var options = this.options;

      time = time || 0;

      if ( !options.scrollX || this.x > 0 ) {
        x = 0;
      } else if ( this.x < this.maxScrollX ) {
        x = this.maxScrollX;
      }

      if ( !options.scrollY || this.y > 0 ) {
        y = 0;
      } else if ( this.y < this.maxScrollY ) {
        y = this.maxScrollY;
      }

      if ( x == this.x && y == this.y ) {
        return false;
      }

      this.scrollTo(x, y, time, this.options.bounceEasing);

      return true;
    },

    //移动
    scrollTo: function (x, y, time, easing) {
      easing = easing || utils.ease.circular;

      this.isInTransition = time > 0;

      if (!time || easing.style) {
        this._transitionTimingFunction(easing.style);
        this._transitionTime(time);
        this._translate(x, y);
      }
    },

    //统一的关闭接口
    disable: function () {
      this.enabled = false;
    },
    //统一的open接口
    enable: function () {
      this.enabled = true;
    },

    on: function (type, fn) {
      if (!this._events[type]) {
        this._events[type] = [];
      }

      this._events[type].push(fn);
    },

    _execEvent: function (type) {
      if (!this._events[type]) {
        return;
      }

      var i = 0,
      l = this._events[type].length;

      if (!l) {
        return;
      }

      for (; i < l; i++) {
        this._events[type][i].call(this);
      }
    },
    destroy: function () {
      this._initEvents(true);
      this._execEvent('destroy');
      this.indicator && this.indicator.destroy();
    },

    _transitionEnd: function (e) {
      if (e.target != this.scroller || !this.isInTransition) {
        return;
      }

      this._transitionTime();
      if (!this.resetPosition(this.options.bounceTime)) {
        this.isInTransition = false;
        this._execEvent('scrollEnd');
      }
    },

    //事件具体触发点
    handleEvent: function (e) {
      $('#log').html(e.type);
      switch (e.type) {
        case 'touchstart':
        case 'mousedown':
          this._start(e);
          break;
        case 'touchmove':
        case 'mousemove':
          this._moveCheck(e);
          this._move(e);
          break;
        case 'touchend':
        case 'mouseup':
        case 'touchcancel':
        case 'mousecancel':
          this._end(e);
          break;
        case 'orientationchange':
        case 'resize':
          this._resize();
          break;
        case 'transitionend':
        case 'webkitTransitionEnd':
        case 'oTransitionEnd':
        case 'MSTransitionEnd':
          this._transitionEnd(e);
          break;
      }
    }

  };

  function createDefaultScrollbar(dir) {
    var scrollbar = $('<div>');
    var indicator = $('<div>');
    var scrollbarStyle = {
      position: 'absolute',
      overflow: 'hidden'
    };
    var indicatorStyle = {
      boxSizing: 'border-box',
      position: 'absolute',
      background: 'rgba(0, 0, 0, .5)',
      border: '1px solid rgba(255, 255, 255, .9)'
    };
   
    if (dir === 'h') {
      _.extend(scrollbarStyle, {
        height: 7,
        left: 2,
        right: 2,
        bottom:0
      });
      _.extend(indicatorStyle, {
        height: '100%'
      });
    } else {
      _.extend(scrollbarStyle, {
        width: 7,
        bottom: 2,
        top: 2,
        right: 1
      });
      _.extend(indicatorStyle, {
        width: '100%'
      });
    }
    scrollbar.css(scrollbarStyle);
    indicator.css(indicatorStyle);

    scrollbar.append(indicator);

    return scrollbar[0];
  }

  function Indicator(scroller, opts) {
    this.wrapper = typeof opts.el == 'string' ? document.querySelector(opts.el) : opts.el;
    this.indicator = this.wrapper.children[0];

    this.wrapperStyle = this.wrapper.style;
    this.indicatorStyle = this.indicator.style;
    this.scroller = scroller;

    this.sizeRatioX = 1;
    this.sizeRatioY = 1;
    this.maxPosX = 0;
    this.maxPosY = 0;

    this.options = {
      scrollX: false
    };

    _.extend(this.options, opts);

    this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
    this.wrapperStyle[utils.style.transitionDuration] = '0ms';
  }

  Indicator.prototype = {
    transitionTime: function (time) {
      time = time || 0;
      this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';
    },
    transitionTimingFunction: function (easing) {
      this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
    },
    refresh: function () {
      this.transitionTime();
      var r = this.wrapper.offsetHeight; // force refresh
      var wrapperHeight = this.wrapper.clientHeight;
      var wrapperWidth = this.wrapper.clientWidth;
      var indicatorHeight, indicatorWidth;

      if (this.options.scrollX) {
        indicatorWidth = Math.max(Math.round(wrapperWidth * wrapperWidth / (this.scroller.scrollerWidth || wrapperWidth || 1)), 8);
        this.indicatorStyle.width = indicatorWidth + 'px';
        this.maxPosX = wrapperWidth - indicatorWidth;
        this.sizeRatioX = (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));
      } else {
        indicatorHeight = Math.max(Math.round(wrapperHeight * wrapperHeight / (this.scroller.scrollerHeight || wrapperHeight || 1)), 8);
        this.indicatorStyle.height = indicatorHeight + 'px';
        this.maxPosY = wrapperHeight - indicatorHeight;
        this.sizeRatioY = (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
      }
      
      this.updatePosition();
    },
    destroy: function () {
      //remove bug
      $(this.wrapper).remove();
    },
    updatePosition: function () {
      var y = Math.round(this.sizeRatioY * this.scroller.y) || 0;
      var x = Math.round(this.sizeRatioX * this.scroller.x) || 0;
      var translate;

      this.y = y;
      this.x = x;
      if (this.options.scrollX) {
        translate = 'translate(' + x +'px, 0)';
      } else {
        translate = 'translate(0,' + y + 'px)';
      }
      this.indicatorStyle[utils.style.transform] = translate + this.scroller.translateZ;
    },
    fade: function (val, hold) {
      if (hold && !this.visible) {
        return;
      }

      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;

      var time = val ? 250 : 500,
      delay = val ? 0 : 300;

      val = val ? '1' : '0';

      this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

      this.fadeTimeout = setTimeout($.proxy(function (val) {
        this.wrapperStyle.opacity = val;
        this.visible = +val;
      }, this), delay);
    }
  };

  IScroll.utils = utils;

  return IScroll;

});

/**
*
* by l_wang
*/

define('cUIScrollRadioList',['cBase', 'cUILayer', 'cUIScroll'], function (cBase, Layer, Scroll) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  var _attributes = {};
  _attributes['class'] = _config.prefix + 'warning';

  _attributes.onCreate = function () {
    this.root.html([
        '<div class="cui-pop-box" lazyTap="true">',
              '<div class="cui-hd"><div class="cui-text-center">' + this.title + '</div></div>',
              '<div class="cui-bd cui-roller-bd" style="overflow: hidden; position: relative; ">',
              '</div>',
        '</div>'
    ].join(''));

    this.title = this.root.find('.cui-text-center');
    this.content = this.root.find('.cui-bd');

  };
  _attributes.onShow = function () {
    var scope = this;
    this.maskToHide(function () {
      scope.hide();
    });

    var scroller = $('<ul class="cui-select-view " style="position: absolute; width: 100%; "></ul>');

    this.dataK = {};

    for (var i in this.data) {
      _data = this.data[i];
      _data.index = i;
      if (typeof _data.key == 'undefined') _data.key = _data.id;
      if (typeof _data.val == 'undefined') _data.val = _data.name;
      var val = _data.val || _data.key;
      var _tmp = $('<li>' + val + '</li>');
      _tmp.attr('data-index', i);
      if (typeof _data.disabled != 'undefined' && _data.disabled == false) {
        _tmp.css('color', 'gray');
      }
      if (i == this.index) _tmp.addClass('current');
      this.dataK[_data.key] = _data;
      scroller.append(_tmp);
    }

    this.content.append(scroller);

    var len = this.data.length;

    if (this.disItemNum > len) this.disItemNum = len;
    var _itemHeight = scroller.height() / len;
    var wrapperHeight = _itemHeight * this.disItemNum;
    this.content.css('height', wrapperHeight);

    this.scroll = new Scroll({
      wrapper: this.content,
      scroller: scroller
    });


    var page = 0;
    var index = this.index
    if (this.key) index = this.dataK[this.key].index;

    if (len - index < this.disItemNum) index = len - this.disItemNum;

    //    page = parseInt(index / this.disItemNum);

    var _top = (_itemHeight * index) * (-1);

    this.scroll.scrollTo(0, _top);

    var scope = this;

    scroller.on('click', $.proxy(function (e) {
      var el = $(e.target);

      if (el && el.attr('data-index') !== null) {
        var item = this.data[el.attr('data-index')];
        this.itemClick.call(scope, item);
        this.hide();
      }

    }, this));

    this.scroller = scroller;

    this.setzIndexTop();

    this.root.bind('touchmove', function (e) {
      e.preventDefault();
    });

    this.onHashChange = function () {
      this.hide();
    }
    $(window).on('hashchange', $.proxy(this.onHashChange, this));

  };
  _attributes.onHide = function () {

    this.scroll.destroy();
    this.root.unbind('touchmove');
    this.root.remove();
    $(window).off('hashchange', $.proxy(this.onHashChange, this));
    if (this.scroller) this.scroller.off('click');

  };

  options.__propertys__ = function () {
    this.title;
    this.content;
    this.itemClick = function () { };
    this.scroll = null;
    this.data = []; //用于组装list的数据
    this.index = -1; //当前索引值
    this.key = null;
    this.disItemNum = 5;
  };

  options.initialize = function ($super, opts) {
    this.setOption(function (k, v) {
      this[k] = v;
    });
    $super($.extend(_attributes, opts));
  };

  var ScrollRadioList = new cBase.Class(Layer, options);
  return ScrollRadioList;

});
/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUIEventListener
* @description 用于自建事件机制
*/
define('cUIEventListener',['libs', 'cBase'], function (libs, cBase) {

  var options = {};

  options.__propertys__ = function () {
    this.__events__ = {};
  };

  /** 相关属性 */
  options.initialize = function (opts) {
  };

  /**
  * @method addEvent
  * @param type {String}        需要添加的事件类型
  * @param handler {function}   对应函数回调
  * @description 添加事件
  */
  options.addEvent = function (type, handler) {
    if (!type || !handler) {
      throw "addEvent Parameter is not complete!";
    }
    var handlers = this.__events__[type] || [];
    handlers.push(handler);
    this.__events__[type] = handlers;
  };

  /**
  * @method removeEvent
  * @param type {String}        移除事件类型
  * @param handler {function}   对应函数回调
  * @description 移除事件
  */
  options.removeEvent = function (type, handler) {
    if (!type) {
      throw "removeEvent parameters must be at least specify the type!";
    }
    var handlers = this.__events__[type], index;
    if (!handlers) return;
    if (handler) {
      for (var i = Math.max(handlers.length - 1, 0); i >= 0; i--) {
        if (handlers[i] === handler) handlers.splice(i, 1);
      }
    } else {
      delete handlers[type];
    }
  };

  /**
  * @method trigger
  * @param type {String}        移除事件类型
  * @param args {Object}   数据参数
  * @param scope {function}   作用域
  * @description 触发事件
  */
  options.trigger = function (type, args, scope) {
    var handlers = this.__events__[type];
    if (handlers) for (var i = 0, len = handlers.length; i < len; i++) {
      typeof handlers[i] === 'function' && handlers[i].apply(scope || this, args);
    }
  };

  return new cBase.Class(options);
});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUISwitch
* @description 提供开关阀
*/
define('cUISwitch',['cBase', 'cUIAbstractView'], function (cBase, AbstractView) {

    var options = {};

    var _config = {
        prefix: 'cui-'
    };

    options.__propertys__ = function () {

        /** 鼠标各个位置信息，主要针对touchstart与touchend */
        this.mouseData = {
            sX: 0,
            eX: 0,
            sY: 0,
            eY: 0
        };
        //默认为关闭状态
        this.checkedFlag = false;
    };

    /** 可以传入rootBox已经changed两个参数，一个是控件所处位置，一个是选项改变时候需要触发的事件 */
    options.initialize = function ($super, opts) {
        this.bindEvent();
        this.allowsConfig.changed = true; //开启changed
        this.checkedFlag = opts.checked;
        $super(opts);

        this.show();

        //初始化时不再执行动画
        //  if (opts.checked) this.checked();
        //  else this.unChecked();

    };

    /**
    * @method bindEvent
    * @description 事件绑定
    */
    options.bindEvent = function () {

        this.addEvent('onShow', function () {
            var scope = this;

            this.el = this.root.find('.cui-switch');
            this.switchBar = this.el.find('.cui-switch-bg');

            $.flip(this.root, 'left', $.proxy(function () {
                this.unChecked();
            }, this));

            $.flip(this.root, 'right', $.proxy(function () {
                this.checked();
            }, this));

            $.flip(this.root, 'tap', $.proxy(function () {
                if (this.el.hasClass('current')) {
                    this.unChecked();
                } else {
                    this.checked();
                }
                return;
            }, this));

        });

        this.addEvent('onHide', function () {
            var scope = this;
            $.flipDestroy(this.el);
            this.root.remove();
        });

    };

    /**
    * @method createHtml
    * @description 重写抽象类结构dom
    */
    options.createHtml = function () {
        var checkedStyle = this.checkedFlag ? 'current' : '';
        return [
        '<div class="cui-switch ' + checkedStyle + '">',
          '<div class="cui-switch-bg ' + checkedStyle + '"></div>',
          '<div class="cui-switch-scroll"></div>',
        '</div>'
      ].join('');
    };

    /**
    * @method _getLRDir
    * @description 计算左右方向
    */
    options._getLRDir = function () {
        if (this.mouseData.eX - this.mouseData.sX > 0) return 'right';
        if (this.mouseData.eX - this.mouseData.sX < 0) return 'left';
    };

    /**
    * @method unChecked
    * @description 将控件置为非选择状态
    */
    options.unChecked = function () {
        if (!this.getStatus()) return;
        this.el.removeClass('current');
        this.switchBar.removeClass('current');
        this._triggerChanged();
    };

    /**
    * @method checked
    * @description 将控件置为选择状态
    */
    options.checked = function () {
        if (this.getStatus()) return;
        this.el.addClass('current');
        this.switchBar.addClass('current');
        this._triggerChanged();
    };

    options._triggerChanged = function () {
        if (typeof this.changed == 'function') this.changed.call(this);
    }

    /**
    * @method getStatus
    * @description 获得当前控件是否选择
    */
    options.getStatus = function () {
        return this.el.hasClass('current');
    }

    /**
    * 设置当前状态
    * @parma {boolean} flag
    */
    options.setStatus = function (flag) {
        if (flag) {
            this.el.addClass('current');
            this.switchBar.addClass('current');
        } else {
            this.el.removeClass('current');
            this.switchBar.removeClass('current');
        }
    }

    return new cBase.Class(AbstractView, options);

});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUINum
* @description 加减控件
*/
define('cUINum',['cBase', 'cUIAbstractView'], function (cBase, AbstractView) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  options.__propertys__ = function () {

    //最小值
    this.min = 1;
    this.max = 9;
    this.curNum = 1;

    this.needText = true;


    this.addClass = 'num-add';
    this.minusClass = 'num-minus';
    this.curClass = 'num-value-txt';
    this.invalid = 'num-invalid';

    this.minAble = true;
    this.maxAble = true;

    //单位
    this.unit = '';


    this.minDom = null;
    this.maxDom = null;
    this.curDom = null;

    this.hasBindEvent = false;

    //数字变化时候触发的事件
    this.changed = function () { };

    //变化前的验证
    this.changeAble = function () { };
  };

  /** 可以传入rootBox已经changed两个参数，一个是控件所处位置，一个是选项改变时候需要触发的事件 */
  options.initialize = function ($super, opts) {
    //由于父级有限制，所以此处直接为this赋值属性
    for (var k in opts) {
      this[k] = opts[k];
    }
    $super(opts);
    this.bindEvent();
    this.show();

  };

  /**
  * @method bindEvent
  * @description 事件绑定
  */
  options.bindEvent = function () {

    this.addEvent('onHide', function () {
      //事件绑定
      this.root.off('click');
      this.curDom.off('focus');
      this.curDom.off('blur');
      this.root.remove();
    });

    this.addEvent('onShow', function () {
      var scope = this;

      this.maxDom = this.root.find('.' + this.addClass);
      this.minDom = this.root.find('.' + this.minusClass);
      this.curDom = this.root.find('.' + this.curClass);

      this.resetNum();
      //首先检测选择相关


      if (this.needText == false) {
        this.curDom.attr('disabled', 'disabled');
      }

      //一次绑定事件后，以后便不予注册
      if (this.hasBindEvent == false) {
        this.root.on('click', $.proxy(function (e) {
          var el = $(e.target);


          //获取焦点
          if (el.hasClass(this.curClass)) {
            return;
          }

          //增加，并且当前增加可点击
          if (el.hasClass(this.addClass) && this.maxAble) {
            this.setVal(this.curNum + 1);

          }
          //减少，并且减可点击
          if (el.hasClass(this.minusClass) && this.minAble) {

            this.setVal(this.curNum - 1);
          }

          e.preventDefault();

        }, this));

        //单独为文本框设置事件
        if (this.needText) {

          this.curDom.on('focus', $.proxy(function (e) {
            this.curDom.val('');
          }, this));

          this.curDom.on('blur', $.proxy(function () {
            this.setVal(this.curDom.val());
          }, this));
        }

        this.hasBindEvent = true;
      }

    });
  };

  //设置当前值
  options.resetNum = function (noTrigger) {
    //首先设置当前选择值
    this.curDom.attr('data-key', this.curNum);
    this.curDom.val(this.getText());

    if (typeof this.changed == 'function' && !noTrigger) {
      this.changed.call(this, this.curNum);
    }
    this.testValid();
  };

  options.getVal = function () {
    return this.curNum;
  };

  options.setVal = function (v) {

    //点击时候有可能因为一些原因不应该变化
    if (typeof this.changeAble == 'function' && this.changeAble.call(this, v) == false) {
      this.resetNum(true);
      return false;
    }

    var isChange = true;

    //如果传入是一个数字
    if (v == parseInt(v)) {
      //设置值不等的时候才触发reset
      isChange = this.curNum == v;
      v = parseInt(v);
      this.curNum = v;
      if (v < this.min) {
        this.curNum = this.min;
      }
      if (v > this.max) {
        this.curNum = this.max;
      }
    }

    this.resetNum(isChange);
  };

  options.testValid = function () {
    //如果值不可选的话便置灰处理，并设置相关参数
    if (this.curNum == this.min) {
      this.deactiveItem(this.minDom); this.minAble = false;
    } else {
      if (this.minAble == false) { this.acticeItem(this.minDom); this.minAble = true; }
    }
    if (this.curNum == this.max) {
      this.deactiveItem(this.maxDom); this.maxAble = false;
    } else {
      if (this.maxAble == false) { this.acticeItem(this.maxDom); this.maxAble = true; }
    }
  };

  options.deactiveItem = function (dom) {
    if (dom) dom.addClass(this.invalid);
  };

  options.acticeItem = function (dom) {
    if (dom) dom.removeClass(this.invalid);
  };

  options.getText = function () {
    return this.curNum + this.unit;
  };

  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return [
        '<span class="cui-number-ma">',
            '<i class="' + this.minusClass + '"></i>',
            '<input type="tel"  class="' + this.curClass + '" >',
            '<i class="' + this.addClass + '"></i>',
        '</span>'
      ].join('');
  };

  return new cBase.Class(AbstractView, options);

});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIGroupList
* @description 分组列表，多用于城市相关
*/
define('cUIGroupList',['cBase', 'cUIAbstractView'], function (cBase, AbstractView) {

  var options = {};

  options.__propertys__ = function () {

    //每次需要存放的数据
    this.data = [];

    //是否需要折叠项目
    this.needFold = false;

    //是否全部折叠
    this.foldAll = false;

    //是否只能展开一个
    this.unFoldOne = false;

    this.selectedKey = null;

    //当前选择的dom，可能没有
    this.el = null;

    //需要用于筛选的字段，使用","隔开
    this.filter = '';

    this.click = function () { };

    //当点击时候会触发的事件，这里应该自建事件机制，但是算了......
    this.OnClick = function () { };

    //用于检测事件是否已经创建，避免重复创建，这是框架一个问题
    this.isCreated = false;

    //是否使用模板
    this.itemTemplate = false;

  };

  options.initialize = function ($super, opts) {
    //由于父级有限制，所以此处直接为this赋值属性
    for (var k in opts) {
      this[k] = opts[k];
    }
    $super(opts);

    this.paramFormat();

    this.bindEvent();
    this.show();

  };

  options.paramFormat = function () {
    //简单处理数据
    var filter = this.filter && this.filter.split(',');
    if (typeof filter != 'object') filter = {};
    this.filter = filter;

  };

  /**
  * @method bindEvent
  * @description 事件绑定
  */
  options.bindEvent = function () {

    //    this.addEvent('onHide', function () {
    //      //事件绑定
    //      this.root.off('click');
    //      this.root.remove();
    //    });

    this.addEvent('onShow', function () {
      //如果未被创建才执行此逻辑
      if (this.isCreated) {
        return;
      }
      this.isCreated = true;


      var scope = this;
      this.init();

      this.root.on('click', $.proxy(function (e) {
        var el = $(e.target);

        //判断是否需要触发点击事件
        var needClick = false;

        while (true) {
          if (el.attr('id') == this.id) break;
          if (el.attr('data-flag') == 'c') {
            needClick = true;
            break;
          }
          el = el.parent();
        }

        //处理点击项问题
        if (needClick) {
          this.setSelected(el.attr('data-key'));
          return;
        }

        //处理父级点击，有可能没有这个逻辑，这里暂时忽略
        if (this.needFold == false) return;

        if (!el.hasClass('cui-city-t')) return;

        var p = el.parent();

        if (p.hasClass('cui-arrow-close')) {
          if (this.unFoldOne) {
            this.root.find('.cui-city-itmes > li').attr('class', 'cui-arrow-close');
          }
          p.attr('class', 'cui-arrow-open');
        } else {
          if (this.unFoldOne) {
            this.root.find('.cui-city-itmes > li').attr('class', 'cui-arrow-close');
          }
          p.attr('class', 'cui-arrow-close');
        }

      }, this));

    });

  };

  options.destroy = function () {
    //      //事件绑定
    this.root.off('click');
    this.root.remove();
  };

  options.init = function () {

    //如果全部折叠的情况下，一定可点击
    if (this.foldAll == true) {
      this.needFold = true;
      //这个时候还需要做一次处理，将当前选项的父类设置为展开
      //这个时候需要遍历整个数据有点伤害效率，但是问题不大......
    }

    //考虑itemTemplate item出现模板的情况
    this.tmpt = _.template([
        '<ul class="cui-city-itmes">',
        '<%for(var i = 0, len = data.length; i < len; i++) { %>',
          '<li data-groupindex="<%=i%>" data-key="<%=data[i].id %>"  ' + (this.needFold ? '<%if(foldAll && ((typeof data[i].unFold == "undefined") || data[i].unFold != true)) {%> class="cui-arrow-close" <%} else {%> class="cui-arrow-open" <%}%>' : '') + '>',
            '<span class="cui-city-t" ><%=data[i].name %></span>',
            '<%var item = data[i].data; %>',
            '<ul class="cui-city-n">',
            '<%for(var j = 0, len1 = item.length; j < len1; j++) { %>',
              '<% var itemData = item[j]; %>',
                '<% var _f = ""; for(var k in filter) { _f += (itemData[filter[k]] ? itemData[filter[k]] : "").toLowerCase() + " ";  } %>',
                '<li data-skey="item_<%=itemData.id%>" ' + (typeof this.groupFlag != 'undefined' ? 'data-groupflag="' + this.groupFlag + '"' : '') + ' data-filter="<%=_f%>" data-key="<%=itemData.id%>" data-index="<%=i%>,<%=j%>" data-flag="c" <%if(itemData.id == selectedKey){%> class="current" <%}%> > ' + (this.itemTemplate ? this.itemTemplate : '<%=itemData.name %>') + ' </li>',
            '<%} %>',
            '</ul>',
          '</li>',
        '<%} %>',
        '</ul>'
        ].join(''));

    var html = this.tmpt({ data: this.data, foldAll: this.foldAll, selectedKey: this.selectedKey, filter: this.filter });
    this.root.html(html);

  };

  //更新一组的一项数据
  //待续......
  options.updateItem = function (groupIndex, itemIndex, data) {

  };

  //更新一组数据
  options.updateGroup = function (groupIndex, data) {
    //首先保存之前的数据对象，会被销毁的
    var _data = this.data[groupIndex];
    //如果没有数据就直接返回
    if (!_data) return;

    //更新当前group
    this.data[groupIndex] = data;

    //缓存当前group dom对象
    var _el = this.root.find('li[data-groupindex="' + groupIndex + '"]');

    //生成新的group dom对象
    //模板文件
    this.tmpt = _.template([
      '<li data-groupindex="<%=i%>" data-key="<%=data.id %>"  ' + (this.needFold ? '<%if(foldAll && ((typeof data.unFold == "undefined") || data.unFold != true)) {%> class="cui-arrow-close" <%} else {%> class="cui-arrow-open" <%}%>' : '') + '>',
        '<span class="cui-city-t" ><%=data.name %></span>',
        '<%var item = data.data; %>',
        '<ul class="cui-city-n">',
        '<%for(var j = 0, len1 = item.length; j < len1; j++) { %>',
            '<% var _f = ""; for(var k in filter) { _f += (item[j][filter[k]] ? item[j][filter[k]] : "").toLowerCase() + " ";  } %>',
            '<li data-skey="item_<%=item[j].id%>" ' + (typeof this.groupFlag != 'undefined' ? 'data-groupflag="' + this.groupFlag + '"' : '') + ' data-filter="<%=_f%>" data-key="<%=item[j].id%>" data-index="<%=i%>,<%=j%>" data-flag="c" <%if(item[j].id == selectedKey){%> class="current" <%}%> ><%=item[j].name %></li>',
        '<%} %>',
        '</ul>',
      '</li>'
    ].join(''));

    var html = this.tmpt({ data: data, foldAll: this.foldAll, selectedKey: this.selectedKey, filter: this.filter, i: groupIndex });
    var el = $(html);

    //将新的dom结构搞到久的前面然后移除旧的
    _el.before(el);
    _el.remove();

  };

  //更新全部数据
  options.reload = function (data) {
    if (data) this.data = data;
    this.root.html('');
    this.init();
  };


  options.setSelected = function (k, noEvent) {
    this.selectedKey = k;

    var d = this.getSelected();

    this.root.find('.cui-city-n li').removeClass('current');
    this.el.addClass('current');

    if (typeof this.onClick == 'function') {
      this.onClick.call(this, d);
    }

    if (typeof this.click == 'function' && !noEvent) {
      this.click.call(this, d);
    }

  };

  //根据当前id获得当前选择对象
  options.getSelected = function () {
    this.el = this.root.find('li[data-skey="item_' + (this.selectedKey || '') + '"]');
    //此处需要由一个验证，如果验证不通过，其设置值是无效的
    //    if (!this.el[0]) this.selectedKey = null;

    if (typeof this.el.attr('data-index') != 'string') return null;

    var index = this.el.attr('data-index').split(',');
    if (index.length != 2) return null;
    return this.data[parseInt(index[0])].data[parseInt(index[1])];

  };


  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return '';
  };

  return new cBase.Class(AbstractView, options);

});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIBusinessGroupList
* @description 业务分组插件，带搜索功能，多用于城市列表，航班动态
*/
define('cUIBusinessGroupList',['cBase', 'cUIAbstractView', 'cUIGroupList'], function (cBase, AbstractView, GroupList) {

  var options = {};

  options.__propertys__ = function () {

    //是否需要选项卡，如果需要的话会有以下配置，配置国内以及国际的名字，多了便不予关注了
    this.needTab = true;

    //当前处于哪个tab
    this.groupIndex = 0;
    //默认状况
    this.groupObj = [];

    //用于检测事件是否已经创建，避免重复创建，这是框架一个问题
    this.isCreated = false;

    //当前选择的键值
    this.selectedKey = null;

    //点击input时候的时钟
    this.CLICK_RES = null;

    this.filter = '';

    //是否需要折叠项目
    this.needFold = false;

    //是否全部折叠
    this.foldAll = false;

    //是否只能展开一个
    this.unFoldOne = false;

    //是否显示历史记录按钮
    this.showFnBtn = false;
    this.fnBtnTxt = '清除历史记录'
    this.fnBtnCallback = function () { };


    //模板文件
    this.itemTemplate = false;

    //是否是ajax操作search框，是的话逻辑有所不同
    this.isAjax = false;

    //当isAjax为true时，一定要处理以下两个函数
    this.ajaxCallBack = function () { };

    //记录搜索时候最后一次关键字，做性能优化
    this.lastKeyword = '';

    this.ajaxData = [];

  };

  options.initialize = function ($super, opts) {
    //由于父级有限制，所以此处直接为this赋值属性
    for (var k in opts) {
      this[k] = opts[k];
    }
    $super(opts);

    if (this.isAjax) {
      this.needFold = false;
      this.foldAll = false;
      this.filter = '';
      this.needTab = false;
    }

    this.bindEvent();
    this.show();

  };

  /**
  * @method bindEvent
  * @description 事件绑定
  */
  options.bindEvent = function () {

    this.addEvent('onHide', function () {
      //事件绑定

      //清除子集插件的事件句柄
      this.destroyItemInstance();

      this.unBindTabEvent();
      this.unBindSeachEvent();
      this.unBindSeachItemEvent();
      this.unBindCancelEvent();
      this.unBindFnBtn();

      this.root.remove();

    });

    this.addEvent('onShow', function () {

      //如果未被创建才执行此逻辑
      if (this.isCreated) {
        return;
      }
      this.isCreated = true;
      var scope = this;
      this.init();

      //dom创建结束后开始注册事件
      this.bindTabEvent();
      this.bindSeachEvent();
      this.bindSeachItemEvent();
      this.bindCancelEvent();
      this.bindFnBtn();

    });

  };

  options.bindFnBtn = function () {
    if (!this.showFnBtn) return;
    this.root.find('.cui-btn-history').on('click', $.proxy(function () {
      this.fnBtnCallback.call(this);
    }, this));
  };

  options.unBindFnBtn = function () {
    if (!this.showFnBtn) return;
    this.root.find('.cui-btn-history').off('click');
  };

  options.destroyItemInstance = function () {
    //清除子集插件的事件句柄
    for (var i = 0, len = this.groupObj.length; i < len; i++) {
      this.groupObj[i].instance.destroy();
    }
  };

  options.unBindTabEvent = function () {
    var tabs = this.tabWrapper.find('li');
    tabs.off('click');
  };

  //选择tab时候的事件
  options.bindTabEvent = function () {
    var tabs = this.tabWrapper.find('li');
    tabs.on('click', $.proxy(function (e) {
      var el = $(e.target);
      tabs.removeClass('cui-tab-current');
      el.addClass('cui-tab-current');
      var index = el.attr('data-index');

      //每次切换tab时候，首先隐藏当前tab然后显示选择tab，一样的话应该不予关注
      //切换时候将原来选择项保存下来，查看当前tab是否具有该选项，有就设置
      this.groupObj[this.groupIndex].instance.hide();
      if (this.groupObj[this.groupIndex].instance.selectedKey)
        this.selectedKey = this.groupObj[this.groupIndex].instance.selectedKey;
      //      this.groupObj[this.groupIndex].instance.setSelected(null);
      this.selectedKey && this.groupObj[index].instance.setSelected(this.selectedKey, true);

      this.groupObj[index].instance.show();
      this.groupIndex = index;

    }, this));

  };

  options.getSelected = function () {
    return this.selectedKey;
  };

  options.unBindSeachEvent = function () {
    this.searchBox.off('focus');
  };

  //搜索框的事件
  options.bindSeachEvent = function () {

    this.searchBox.on('focus', $.proxy(function () {
      this.openSeach();
    }, this));

  };

  options.unBindSeachItemEvent = function () {
    this.seachList.off('click');
  };

  //搜索相关事件
  options.bindSeachItemEvent = function () {

    this.seachList.on('click', $.proxy(function (e) {
      var el = $(e.target);

      //判断是否需要触发点击事件
      var needClick = false;

      while (true) {
        if (el.hasClass('seach-list')) break;
        if (el.attr('data-flag') == 'c') {
          needClick = true;
          break;
        }
        el = el.parent();
      }

      if (this.isAjax) {
        if (typeof this.click == 'function') {
          this.click.call(this, this.ajaxData[el.attr('data-index')]);
          this.closeSeach();
        }
        return;
      }

      this.groupIndex = el.attr('data-groupflag');
      this.selectedKey = el.attr('data-key');
      this.groupObj[this.groupIndex].instance.setSelected(this.selectedKey);
      this.closeSeach();

    }, this));

  };

  options.unBindCancelEvent = function () {
    this.cancel.off('click');
  };

  options.bindCancelEvent = function () {
    this.cancel.on('click', $.proxy(function () {
      this.closeSeach();
    }, this));
  };

  //开启搜索模式
  options.openSeach = function () {
    if (!this.CLICK_RES) {
      this.CLICK_RES = setInterval($.proxy(function () {

        //如果当前获取焦点的不是input元素的话便清除定时器
        if (!(document.activeElement.nodeName == 'INPUT' && document.activeElement.type == 'text')) {
          if (this.CLICK_RES) {
            clearInterval(this.CLICK_RES);
            this.CLICK_RES = null;
          }
        }

        var txt = this.searchBox.val().toLowerCase();

        if (txt == '') {
          setTimeout($.proxy(function () {
            if (!(document.activeElement.nodeName == 'INPUT' && document.activeElement.type == 'text')) {
              this.closeSeach();
            }
          }, this), 500);
          return;
        }

        if (this.lastKeyword == txt) return true;
        this.lastKeyword = txt;

        this.wrapper.addClass('cui-input-focus');

        this.root.find('.cui-btn-history').hide();
        this.listWrapper.hide();
        this.tabWrapper.hide();
        this.seachList.show();
        this.seachList.html('');
        this.noData.hide();


        //若是ajax操作，此处逻辑有所不同，如果是ajax操作，便不执行下面逻辑
        if (this.isAjax) {

          //执行用户定义ajax操作，在数据返回成功并且处理后，会调用ajaxDataHandle将控制权交回系统 
          this.ajaxCallBack.call(this, txt);
          this.LOADINGSRC = setTimeout($.proxy(function () {
            this.loading.show();
          }, this), 200);

          return;
        }

        //获取当前输入项
        var list = this.listWrapper.find('li[data-filter*="' + txt + '"]');

        //由于可能出现重复事件此处需要做一次筛选
        var _list = [];

        for (var i = 0, len = list.length; i < len; i++) {
          var repeadted = false;
          for (var k in _list) {
            if ($(_list[k]).attr('data-key') == $(list[i]).attr('data-key')) {
              repeadted = true;
              break;
            }
          }
          if (repeadted == false) _list.push(list[i]);
        }

        if (_list.length == 0) {
          this.noData.show();
          return;
        }

        this.seachList.append($(_list).clone(true));

      }, this), 500);

    }
  };

  //当isAjax为true时，该函数交由用户数据请求成功时候调用，调用后将控制器交回插件
  options.ajaxDataHandle = function (data) {
    this.ajaxData = data;
    var tempt = ['<% for(var i = 0, len = data.length; i < len; i++ ){ %>',
    '<% itemData = data[i]; %>',
    '<li data-key="<%=itemData.id%>" data-index="<%=i%>" data-flag="c" ' + (this.itemTemplate ? this.itemTemplate : '<%=itemData.name %>') + ' </li>',
    '<% } %>'].join('');

    var html = _.template(tempt)({ data: data });

    if (this.LOADINGSRC) {
      clearTimeout(this.LOADINGSRC);
    }
    this.loading.hide();

    this.seachList.html(html);

  };

  //关闭搜索模式
  options.closeSeach = function () {
    //手动清理资源
    if (this.CLICK_RES) {
      clearInterval(this.CLICK_RES);
      this.CLICK_RES = null;
    }
    this.wrapper.removeClass('cui-input-focus');
    this.noData.hide();

    this.searchBox.val('');

    if (this.needTab) this.tabWrapper.show();

    this.seachList.hide();
    this.listWrapper.show();
    this.lastKeyword = '';
    this.root.find('.cui-btn-history').show();

  };

  options.init = function () {
    this.tabWrapper = this.root.find('.cui-tab-mod');
    this.tabBar = this.tabWrapper.find('.cui-tab-scrollbar');
    this.noData = this.root.find('.cui-city-novalue');

    //总容器
    this.wrapper = this.root.find('.cui-citys-hd');
    this.listWrapper = this.root.find('.cui-citys-bd');
    this.searchBox = this.root.find('.cui-input-box');
    this.seachList = this.root.find('.seach-list');
    //取消按钮
    this.cancel = this.root.find('.cui-btn-cancle');

    this.loading = this.root.find('.cui-pro-load');

    this.initTab();
    this.initGroupList();
    this.bindEvent();

  };

  //初始化tab列表
  options.initTab = function () {

    for (var i = 0, len = this.groupObj.length; i < len; i++) {
      var item = '<li data-index="' + i + '" ' + (i == this.groupIndex ? 'class="cui-tab-current"' : '') + ' >' + this.groupObj[i].name + '</li>';

      this.tabBar.before(item);
    }
  };

  //初始化分组列表
  options.initGroupList = function () {
    var scope = this;
    for (var i = 0, len = this.groupObj.length; i < len; i++) {
      var data = this.groupObj[i].data;
      this.groupObj[i].instance = new GroupList({
        rootBox: this.listWrapper,
        data: data,
        filter: this.filter,
        click: this.click,

        foldAll: this.foldAll,
        needFold: this.needFold,
        itemTemplate: this.itemTemplate,
        unFoldOne: this.unFoldOne,
        //分组标识，用于搜索时候
        groupFlag: i,
        //事件机制用于内外层通信
        onClick: function () {
          scope.selectedKey = this.selectedKey;
        }
      });
      this.groupObj[i].instance.hide();
    }

    //设置当前显示的标签，并且设置值
    this.groupObj[this.groupIndex].instance.show();
    this.groupObj[this.groupIndex].instance.setSelected(this.selectedKey, true);

  };

  //重新加载数据
  options.reload = function (data) {
    if (data) this.groupObj = data;
    this.destroyItemInstance();
    this.listWrapper.empty();
    this.initGroupList();
  };

  //更新某一个标签的数据
  options.updateTab = function (tabIndex, data) {

  };

  //更新某一个标签，的一组的数据
  options.updateTabGroup = function (tabIndex, groupIndex, data) {

  };

  //更新全部标签，的一组的数据，暂时只提供该接口
  options.updateAllTabGroup = function (groupIndex, data) {
    for (var i = 0, len = this.groupObj.length; i < len; i++) {
      this.groupObj[i].instance.updateGroup(groupIndex, data);
    }
  };

  //更新某一个标签，的一组的某一项数据
  options.updateTabGroupItem = function (tabIndex, groupIndex, itemIndex, data) {

  };


  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return [
    '<section class="cui-citys-hd ">',
      '<div class="cui-input-bd">',
        '<input type="text" class="cui-input-box" placeholder="中文/拼音/首字母">',
        '<span class="cui-pro-load" style="display: none;">',
		 	'<span class="cui-pro-radius"></span>',
		 	'<span class="cui-i cui-pro-logo"></span>',
	    '</span>',
      '</div>',
      '<button type="button" class="cui-btn-cancle">',
        '取消</button>',
    '</section>',
    '<p class="cui-city-novalue" style="display: none;">没有结果</p>',
    '<ul class="cui-tab-mod" ' + (this.needTab ? '' : 'style="display: none"') + ' >',
      '<i class="cui-tab-scrollbar cui-tabnum' + this.groupObj.length + '"></i>',
    '</ul>',
    '<ul class="cui-city-associate seach-list"></ul>',
    '<section  class="cui-citys-bd">',
    '</section>',
    (this.showFnBtn ? '<button type="button" class="cui-btn-history" >' + this.fnBtnTxt + '</button>' : '')
    ].join('');

  };
  return new cBase.Class(AbstractView, options);

});
/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUINum
* @description 加减控件
*/
define('cUITab',['cBase', 'cUIAbstractView'], function (cBase, AbstractView) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  options.__propertys__ = function () {

    this.selectedKey = null;
    this.data = [];

    //数字变化时候触发的事件
    this.changed = function () { };

    //变化前的验证
    this.changeAble = function () { };

    this.curEl = null;

  };

  /** 可以传入rootBox已经changed两个参数，一个是控件所处位置，一个是选项改变时候需要触发的事件 */
  options.initialize = function ($super, opts) {
    //由于父级有限制，所以此处直接为this赋值属性
    for (var k in opts) {
      this[k] = opts[k];
    }
    $super(opts);
    this.bindEvent();
    this.show();

  };

  /**
  * @method bindEvent
  * @description 事件绑定
  */
  options.bindEvent = function () {

    this.addEvent('onShow', function () {

      //首先创建dom结果
      this.init();

      //事件绑定
      this.root.on('click', $.proxy(function (e) {
        var el = $(e.target);

        if (el[0].tagName.toLowerCase() != 'li') return;
        this.setVal(el.attr('data-key'));

      }, this));

    });

    this.addEvent('onHide', function () {
      //事件绑定
      this.root.off('click');
      this.root.remove();
    });

  };

  options.getVal = function () {
    return this.selectedKey;
  };

  options.setVal = function (v) {
    this.curEl = this.root.find('li[data-key="' + v + '"]');
    var index = this.curEl.attr('data-index');
    var d = this.data[index];

    //如果验证不通过不能进行以下逻辑
    if (typeof this.changeAble == 'function' && this.changeAble.call(this, d) == false) {
      return false;
    }

    if (!d) { console.log('设置值有误'); return; }

    this._tab = this.root.find('.cui-tab-scrollbar')

    //如果当前值与设置的值不相等就change了 
    var isChange = this.selectedKey == v;
    this.selectedKey = v;

    this.tabs.removeClass('cui-tab-current');
    this.curEl && this.curEl.addClass('cui-tab-current');

    //三星手机渲染有问题，这里动态引起一次回流
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
      var width = this._tab.css('width');
      setTimeout($.proxy(function () {
        this._tab.css('width', width);
      }, this), 0);
    }

    if (isChange == false && typeof this.changed == 'function') {
      this.changed.call(this, d);
    }

  };

  options.setIndex = function (i) {
    //如果设置值无意义便不予关注
    if (i < 0 || i > this.data.length - 1) return;
    this.setVal(this.data[i].id);
  };

  options.getIndex = function () {
    for (var i = 0, len = this.data.length; i < len; i++) {
      if (this.getVal() == this.data[i].id) return i;
    }
    return -1;
  };


  //初始化dom结构
  options.init = function () {
    this.tmpt = _.template([
      '<ul class="cui-tab-mod">',
        '<%for(var i = 0, len = data.length; i < len; i++) { %>',
          '<li data-key="<%=data[i].id %>" data-index="<%=i%>" <% if(data[i].id == selectedKey) { %>class="cui-tab-current"<%} %> ><%=data[i].name %></li>',
        '<%} %>',
        '<i class="cui-tab-scrollbar cui-tabnum<%=len %>"></i>',
      '</ul>'
    ].join(''));

    var html = this.tmpt({ data: this.data, selectedKey: this.selectedKey });

    this.root.html(html);
    this.tabs = this.root.find('li');
    this.curEl = this.root.find('.cui-tab-current');
  };

  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return '';
  };

  return new cBase.Class(AbstractView, options);

});
/**
* @author ddpei@Ctrip.com
* @class c.ui.imageSlider
* @description ImageSldier
*/
define('cUIImageSlider',['cBase', 'cUIBase', 'libs'], function (cBase, UIBase) {
  
  return new cBase.Class({
    __propertys__: function () {
      //手势方向
      this.ENUM = {
        DIR: {
          LEFT: "LEFT",
          RIGHT: "RIGHT"
        }
      };

      //轮播图片数组 array [object] object :{src,alt,onClick}
      this.images = [];
      //是否自动播放
      this.autoPlay = true;
      //当前图片索引
      this.index = 0;
      //自动播放延迟(单位：毫秒)
      this.delay = 3 * 1000;
      //轮播方向
      this.dir = this.ENUM.DIR.LEFT;
      //图片加载 失败/错误 后显示的图片
      this.errorImage = "";
      //图片加载中显示的图片
      this.lodingImage = "";
      //轮播开始的事件
      this.onChange;
      //图片点击事件
      this.onImageClick;
      //容器 string
      this.container;
      //轮播结束
      this.onChanged;
      //该控件事件的上下文
      this.scope;
      //是否显示导航
      this.showNav = true;
      //是否使用自动高度
      this.autoHeight = false;
      //默认图，当没有图片数据的时候默认显示
      this.defaultImageUrl;
      //自定义高度
      this.defaultHeight;
      //自定义高度
      this.imageSize;
      //是否循环播放
      this.loop = false;

      //加载中图片
      this.errorImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAYCAMAAAAGTsm6AAAAMFBMVEX6+vr+/v7+/v7+/v7+/v7+/v7+/v7y8vLv7+/+/v7+/v7+/v729vYAAADt7e3+/v6PQhf9AAAADnRSTlOtVTOIZpki1+wRd0TCAMJ8iPYAAAKfSURBVHjaxZWLjqMwDEXJO7FN7v//7WITOgQ6pVpptbdSecTxiW3iLOt/0g3cirj3po1ZL5lcuw8Sud8QgegJbALy+laMZb/UdY2n9Xj9F/wKFnwLXu/KRiSLG7ISwk+s6Fm9n9PgZUjNKvJ34LLeRThECl4L4ssDyMKak7NLTRvKc41z28Bia15dEVWxwkYiShAicgb26QiwAY6ZC1gV4wCTXdXUjey09gFMOCSvVSv46u2kiEnyMm3DNGGIP4GLCLpIgQyOmD266MsqKnuQPnJbkWhTBalSeIEFycAdZi3in2osOjHM4CqmO5i0gvcaG9ipr4gyDT+BaQKbUom3VLc6xqXewaymBfQdOOu3QFew14HSbGPVLYRCediPBHZ5D2b0bOt6BBvvBsZLoqtvGIEGCWRCJVOQOIEFVpMqfwleaEFajLImNId0dKWb6AXWqrQg8NvN8ggmJRHcBNZiJu1OwyIclY8UWZUAxyoinsBqHtcMegSnHcwzOJfKXODUrwfVa8lq7z+uZ7Dboo3gR3CB0q/gcs5kB+I8KSKlnmdwrTu4AXnpj706j213ATvtlQU8knIJ2HdkRjmfoLkplL0ikJAewYTwDnw0icxRbeRyhCPoaGpTEiiGdpwY+RFcDSSbJVu76vacmYlS31PN1nfpRfHVdnjuqPHcWfS919ttoD2BCXWcyRPYYVcgzr533ki1DwLBuJZw9ERsD0mPCUH3+nr7xc9ghu4jEvT18nGFyHvfcx3eTjGbyaEDMuLJgvG+JRTz3pmA1ApQQ/4d3KpOaxraRhhgd65xC0C0gOyiHs/7iBcrZ65HElKFuQkAPp1OLTUFiNoysU7lfKr/usa6L4TS0Vfm8uVoo8q17Y/KdseyXFP9T9VOn9s88gcLTIlzurC4gAAAAABJRU5ErkJggg==';

      this.loadImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAYCAMAAAAGTsm6AAAAMFBMVEX6+vr+/v7+/v7+/v7+/v7+/v7+/v7+/v7y8vLv7+/+/v729vb+/v4AAADt7e3+/v6c4gmbAAAADnRSTlOtM4hmVZkiEdfsRMJ3AHDRYrYAAAGwSURBVHjaxdbZktsgEAVQLSxNL9z//9vQgvFYUjKpkqnkPhgJbI4bJMuL/af8DGeS8IcRZm+Shnwb21U/hQ1Ivx9gLL0pDbqMKbYJsN2TDlGPuiF3RzGhYrJ7FF9Rh42wT4VTbrD40WqBxEM89lAjpL2GA15j7h/gdIIzp0fwd2FijB62ER6TO/zdd40+g0kEVYQgw5EDbn3eWcRznEhFh6t4yhgrz+BXQYztDBfpucNyWmr9GNYTfCTSflrqyXDyO0Wv8OoDlH3cCpmRptmwe3cYr0jrsgzwv4EXXRAX2VTVInJAnL7UCvaXcNnjXGI7zuMdG/gLLuoRSG+fw7HDfIYTFWZCUGVboaXMvY89BNevML1PXIH9BRN7ImJvH8MJ5NwVDqqBCTwWpdjIftnjXfaHsGK7wyMCS9wmVtdmP50K+CCS8fFzVY/zxKwaa19qBlqn5qmwooxn8gkO6NmU01org3KpM2GG30cqqHa5uLad27F/h4q1OcAyEc7Fp8teWhMGHN73OG/9io7evGX78K9PjtkBcZLVa105ve2/2V5CLzHaewTyAJ6QlVf7a34BIRiNTVIrVfEAAAAASUVORK5CYII=';
      //加载中图片节点
      this._loadingNode;
      //错误节点
      this._errorNode;
      //是否正在加载图片
      this._isloadingImage = false;
      //编号前缀
      this._pfix = "slider";
      //当前是是否正在轮播图片
      this._changing = false;
      //容器节点
      this._containerNode;
      //根节点
      this._rootNode;
      //图片层节点
      this._imageNode;
      //导航层节点
      this._navNode;
      //图片加载节点
      this._imageLoaderNode;
      //手指起始位置位置
      this._handerStartPos = {
        x: 0,
        y: 0
      };
      //手指滑动最小偏移量
      this._moveValue = 50;
      //图片数量
      this._imageCount = 0;
      //是否已经创建
      this._played = false;
      //当前轮播尺寸
      this._size = { height: 0, width: 0 };
      //上一次的轮播尺寸
      this._lastSize = { height: 0, width: 0 };
      //当前轮播的对象
      this._displayImage;
      //待切换的图像
      this._nextImage;
      //加载中图片测试
      this._loadingImage = new Image();
      //切换图片完成需要执行的事件
      this._changeCompletedEvents = [];
      //settimeout
      this._autoPlayTimeout;
      //加载信息
      this._loadMsg = "加载中...";
      //是否首次加载
      this.firstLoad = true;
      //保留加载正确的图片尺寸
      this._defaultSize = { width: 0, height: 0 };
      //加载中图片
      this._loadingImage = new Image();
      //错误图片
      this._errorImage = new Image();
    },
    initialize: function (args) {
      for (var key in args) {
        switch (key) {
          case "images":
          case "autoPlay":
          case "delay":
          case "dir":
          case "index":
          case "onChange":
          case "autoPlay":
          case "onImageClick":
          case "scope":
          case "onChanged":
          case "errorImageUrl":
          case "loadImageUrl":
            // case "autoHeight":
          case "loop":
          case "showNav":
          case "defaultImageUrl":
          case "defaultHeight":
          case "imageSize":
            this[key] = args[key];
            break;
          case "container":
            this._containerNode = (typeof args[key] === "string" ? $(args[key]) : args[key]);
            this[key] = args[key];
            break;
        }
      }

      //验证参数
      this._validArgs();
      //纠正参数
      this._correctArgs();
      //图片数量
      this._imageCount = this.images.length;
      //加载中
      this._loadingImage.src = this.loadImageUrl;
      //错误图
      this._errorImage.src = this.errorImageUrl;

      if (this.imageSize && this.imageSize.width && this.imageSize.height) {
        this.autoHeight = false;
      }
      else {
        this.autoHeight = true;
      }

    }
    //开始播放，入口
        , play: function () {
          if (!this._played) {
            this._played = true;
            this._injectHTML();
            this._bindEvents();
          }

          this.rePlay();
        }
    //暂停自动播放
        , stop: function () {
          this._clearAutoPlay();
        }
    //重新自动播放
        , rePlay: function () {
          if (this.autoPlay) {
            this._autoPlay();
          }
        }
    //自动播放
        , _autoPlay: function () {
          this._autoPlayTimeout = setTimeout($.proxy(function () {
            if (!this._isloadingImage) {
              this._play();
            }
          }, this), this.delay);
        }
    //切换至下一张
        , next: function () {
          if (!this._changing) {
            this._play();
          }
        }
    //切换至上一张
        , pre: function () {
          if (this._changing) {
            return;
          }

          if (this.dir === this.ENUM.DIR.RIGHT) {
            if (this.index >= this._imageCount - 1) {
              if (!this.loop) {
                return;
              }
              this.index = 0;
            }
            else {
              this.index++;
            }
          }
          else {
            if (this.index <= 0) {
              if (!this.loop) {
                return;
              }
              this.index = this._imageCount - 1;
            }
            else {
              this.index--;
            }
          }
          this.goto(this.index);
        }
    // 直接按照默认方向跳转至指定索引图片
        , goto: function (index) {
          this.index = index;
          this._changeImage();
        }
    //根据默认的dir立刻切换图片
        , _play: function () {
          if (this.dir === this.ENUM.DIR.RIGHT) {
            this._imageToRight();
          }
          else {
            this._imageToLeft();
          }
        }
    //清除自动播放
        , _clearAutoPlay: function () {
          clearTimeout(this._autoPlayTimeout);
        }
    //验证参数
        , _validArgs: function () {
          if (!this.container || !this._containerNode) {
            throw "[c.widget.imageSlider]:no container!";
          }
        }
    //纠正某些参数设置不合理
        , _correctArgs: function () {
          //轮播延迟过小
          if (this.delay <= 500) {
            this.delay = 2 * 1000;
          }
        }
    //创建HTML
        , _createHTML: function () {
          return ["<div class=\"cui-sliderContainer\" style=\"width:100%;position:relative;\">",
                    "<div class=\"cui-imageContainer\" style=\"width:100%;\">",
                    "</div>",
                    "<div class=\"cui-navContainer\" style=\"color:#1491c5;position:absolute;\"></div>",
                    "<div class=\"cui-imageLoader\">",
                    "</div>"].join("");
        }
    //创建导航
        , _createNav: function () {
          var navhtml = [];
          for (var i = 0; i < this._imageCount; i++) {
            var current = (i == this.index ? "cui-slide-nav-item-current" : "");
            navhtml.push("<span class=\"cui-slide-nav-item " + current + "\"></span>")
            //navhtml.push("<span data-index=\"" + i + "\" style=\"padding-left:10px\"> " + current + "</span>");
          }
          this._navNode.empty().html(navhtml.join(" "));
        }
    //注入HTML 以及 初始化对象
        , _injectHTML: function () {
          this._rootNode = $(this._createHTML());
          this._containerNode.html(this._rootNode);
          //   console.log(this._containerNode);
          this._imageNode = this._rootNode.find(".cui-imageContainer");
          this._navNode = this._rootNode.find(".cui-navContainer");
          if (!this.showNav) {
            this._navNode.css("display", "none");
          }
          this._imageNode.empty();
          this._createLoading();
          if (this._imageCount > 0) {
            this._createImageItem(this.index, $.proxy(function (imageInfo, image) {
              this._createNav();
              //根据第一张图片的高度来设置整个轮播布局的高度
              this._setSize(image.height, image.width);
              this._displayImage = imageInfo;
              this._createImageContainer();
            }, this));
          }
          else {
            this._createDefault();
            this._loadingNode.css("display", "none");
          }
        }
    //单击
        , _onImageClick: function () {
          var imageInfo = this.images[this.index];
          if (imageInfo && imageInfo.onClick) {
            imageInfo.onClick.call(this.scope || this, imageInfo);
            return;
          }
          if (this.onImageClick) {
            this.onImageClick.call(this.scope || this);
          }
        }
    //获取image
        , _createImageItem: function (index, callback) {
          this._isloadingImage = true;
          !index && (index = 0);
          var imageInfo = this._getImageInfo(index);
          var image = new Image();
          imageInfo.src && (image.src = imageInfo.src);
          imageInfo.alt && (image.alt = imageInfo.alt);
          var self = this;
          image.onload = function () {
            imageInfo.orgImage = image;
            if (!self.autoHeight) {
              self._defaultSize.width = image.width;
              self._defaultSize.height = image.height;
            }
            self._isloadingImage = false;
            callback.call(self, imageInfo, image);
          }

          image.onerror = function () {
            imageInfo.loadError = true;
            self._errorImage = new Image();
            self._errorImage.src = self.errorImageUrl;
            self._isloadingImage = false;
            self._errorImage.onload = function () {
              imageInfo.orgImage = self._errorImage;
              callback.call(self, imageInfo, self._errorImage);
            }
          }
        }
    //获取image 配置信息
        , _getImageInfo: function (index) {
          !index && (index = 0);
          for (var i = 0, len = this.images.length; i < len; i++) {
            if (index === i) {
              return this.images[i];
            }
          }
          throw new Error("[c.ui.imageSlider]:image index is " + index + ",but images.length is " + len);
        }
    //绑定事件
        , _bindEvents: function () {
          this._containerNode.bind("touchmove", $.proxy(this._touchmove, this));
          this._containerNode.bind("touchstart", $.proxy(this._touchstart, this));
          this._containerNode.bind("touchend", $.proxy(this._touchend, this));
          $(window).on("resize", $.proxy(this._resize, this));
          this._navNode.bind("click", $.proxy(this._switchImage, this));
          this._imageNode.bind("click", $.proxy(this._onImageClick, this));
        }
    //手动切换图片
        , _switchImage: function (e) {
          var element = e.targetElement || e.srcElement;
          var index = $(element).data("index");

          if (index !== 0 && !index) {
            return;
          }

          if (this.index === (+index)) {
            return;
          }
          this.index = index;
          this._changeImage();
        }
    //图片左滑
        , _imageToRight: function () {
          //当处于第一张时，调到最后一样
          if (this.index <= 0) {
            if (!this.loop) {
              return;
            }
            this.index = this._imageCount - 1
          }
          else {
            this.index--;
          }
          this._changeImage(this.ENUM.DIR.LEFT);
        }
    //图片右滑
        , _imageToLeft: function () {
          if (this.index >= this._imageCount - 1) {
            if (!this.loop) {
              return;
            }
            this.index = 0;
          }
          else {
            this.index++;
          }

          this._changeImage(this.ENUM.DIR.RIGHT);
        }
        , _changeImage: function (dir) {
          if (this._imageCount <= 1) {
            return;
          }
          //清除自动播放    
          this._clearAutoPlay();
          //表示正在轮播图片
          this._changing = true;
          //如果没有指定方向，则按照默认方向滑动
          !dir && (dir = this.dir);
          var imageInfo = this.images[this.index];
          if (imageInfo.node) {
            this._nextImage = imageInfo;
            this._showSliderImage(dir);
          }
          else {
            this._nextImage = { node: this._loadingNode, orgImage: this._loadingImage };
            this._showLoading();
            this._createImageItem(this.index, $.proxy(function (imageInfo, image) {
              this._createImageContainer();
              this._nextImage = imageInfo;
              this._showSliderImage(dir);
            }, this));
          }


        }
        , _showSliderImage: function (dir, moveValue) {
          //获取初始位置，以及目标位置
          var initNextImageLeft = 0,
                initDisplayImageLeft = 0,
                offsetNextImageLeft = 0,
                offsetDisplayImageLeft = 0;
          if (dir === this.ENUM.DIR.LEFT) {
            initNextImageLeft = -1 * this._size.width;
            initDisplayImageLeft = 0;

            offsetNextImageLeft = 0;
            offsetDisplayImageLeft = this._size.width;
          }
          else {
            initNextImageLeft = this._size.width;
            initDisplayImageLeft = 0;

            offsetNextImageLeft = 0;
            offsetDisplayImageLeft = -1 * this._size.width;
          }


          //设置切换图片初始位置
          this._displayImage.node.css("left", initDisplayImageLeft);
          this._nextImage.node.css("left", initNextImageLeft).css("display", "");

          this._nextImage.node.animate({ "left": offsetNextImageLeft }, 500, 'ease-out', $.proxy(function () {
            this._changing = false;
            this._changeCompeted();
            this.rePlay();
          }, this));

          //使用zepto动画
          this._displayImage.node.animate({ "left": offsetDisplayImageLeft }, 500, 'ease-out', $.proxy(function () {
            this._displayImage.node.css("display", "none").css("left", 0);
            this._displayImage = this._nextImage;
          }, this));

        }
        , _touchmove: function (e) {
          if (this._isMoved) return;
          var pos = UIBase.getMousePosOfElement(e.targetTouches[0], e.currentTarget);

          if (!this._isMovedChecked) {
            var differX = Math.abs(pos.x - this._handerStartPos.x);
            var differY = Math.abs(pos.y - this._handerStartPos.y);

            if (differY > differX) {
              this._isMoved = true;
              return;
            }
          }
          this._isMovedChecked = true;

          e.preventDefault();
          if (this._changing) {
            return;
          }

          //计算手势
          var diffX = pos.x - this._handerStartPos.x;
          if (diffX > 0 && diffX > this._moveValue) {
            this._imageToRight();
          }
          else if (diffX < 0 && Math.abs(diffX) > this._moveValue) {
            this._imageToLeft();
          }
        }
        , _touchstart: function (e) {
          this._isMoved = false;
          this._isMovedChecked = false;
          var pos = UIBase.getMousePosOfElement(e.targetTouches[0], e.currentTarget);
          this._handerStartPos = {
            x: pos.x,
            y: pos.y
          };
        }
        , _touchend: function (e) {
          e.preventDefault();
        }
    //根据屏幕宽度，等比例缩放显示高度和宽度
        , _setSize: function (height, width) {
          this._size.width = Math.ceil($(window).width());
          this._size.height = Math.ceil(height * (this._size.width / width));

          if (this._size.height < 100) {
            this._size.height = 100;
            this._size.width = width * (this._size.height / height);
          }

          this._rootNode.css("width", this._size.width).css("height", this._size.height);
          this._imageNode.find("div").find("img").css("width", this._size.width).css("height", this._size.height);

          //定位导航
          if (this.showNav) { //如果不显示导航，则不定位导航
            this._setNavPos();
          }
        }
    //定位导航位置
        , _setNavPos: function () {
          var left = (this._size.width - 2 * (this._imageCount * 10)) / 2; //居中计算LEFT值
          var top = this._size.height - 30; //距离底部边框30px
          this._navNode.css("left", left).css("top", top);
        }
        , _resize: function () {
          //自适应高度，根据图片不同，生成的高度不同
          this._lastSize.width = this._size.width;
          this._lastSize.height = this._size.height;
          //定义了图片宽高，则使用宽高的值，进行图片压缩
          if (this.imageSize && this.imageSize.height && this.imageSize.width) {
            this._setSize(this.imageSize.height, this.imageSize.width);
          }
          //反之，按照图片的宽度与显示设备的宽度来等比缩放
          else {
            if (this._displayImage && !this._displayImage.loadError) {
              this._setSize(this._displayImage.orgImage.height, this._displayImage.orgImage.width);
            }
          }
        }
    //轮播结束时触发
        , _changeCompeted: function () {
          //调用需要在回调结束时触发的事件
          for (var key in this._changeCompletedEvents) {
            this._changeCompletedEvents[key]();
          }
          this._changeCompletedEvents.length = 0;
          //切换导航到相应的索引
          this._changeNav();
          //如果没有设置图片宽高，则根绝当前图片来重新渲染图片大小
          if (this.autoHeight) {
            this._resize();
          }
          //回调
          this.onChanged && this.onChanged.call(this.scope || this, this.images[this.index], this.index);
        }
    //切换导航至对应的图片索引
        , _changeNav: function () {
          if (this.showNav) {
            this._navNode.find("span").removeClass("cui-slide-nav-item-current");
            $(this._navNode.find("span")[this.index]).addClass("cui-slide-nav-item-current");
          }
        }
    //创建图片容器
        , _createImageContainer: function () {
          var imageInfo = this.images[this.index];
          this._loadingNode.css("display", "none");
          if (!imageInfo.node) {
            var top = UIBase.getElementPos(this._rootNode[0]).top - 48;
            if (imageInfo.loadError) {
              imageInfo.node = $(this._createImageHtml(this.errorImageUrl, imageInfo.alt));
            }
            else {
              imageInfo.node = $(this._createImageHtml(imageInfo.src, imageInfo.alt));
            }

            this._imageNode.append(imageInfo.node);
            imageInfo.node.css("position", "absolute").css("left", 0); //.css("top", top);
            imageInfo.node.bind("click", function (e) {
              e.preventDefault();
            });
          }
          if (this.autoHeight) {
            this._resize();
          }
        }
        , _createLoading: function () {
          if (this.firstLoad) {
            this._loadingNode = $(this._createImageHtml(this.loadImageUrl));
            var loading = ["<div class=\"cui-breaking-load\">",
                             "<div class=\"cui-i cui-m-logo\">",
                             "</div> <div class=\"cui-i cui-w-loading\">",
                             "</div></div>"];

            this._loadingNode.html(loading.join(" "));
            if (!this.autoHeight) {
              this._resize();
              this._setLoadingPos();
            }
            this._imageNode.append(this._loadingNode);
            this.firstLoad = false;
          }
        }

        , _setLoadingPos: function () {
          this._loadingNode.css("position", "absolute").css("height", this._size.height).css("width", this._size.width);
          if (this._size.height) {
            var top = (this._size.height - 70) / 2;
            this._loadingNode.find(".cui-breaking-load").css("top", top);
          }
        }
        , _showLoading: function () {
          this._loadingNode.css("display", "");
          this._setLoadingPos();
        }
        , _createDefault: function () {
          if (this.defaultImageUrl) {
            var defaultImage = new Image();
            defaultImage.src = this.defaultImageUrl;
            var self = this;
            defaultImage.onload = function () {
              var defaultImageNode = $(self._createImageHtml(self.defaultImageUrl));
              self._imageNode.append(defaultImageNode);
              self._displayImage = defaultImage;
              if (!self.autoHeight) {
                self._setSize(self.imageSize.height, self.imageSize.width);
              }
              else {
                self._setSize(defaultImage.height, defaultImage.width);
              }
            }
          }
        }
        , _createImageHtml: function (src, alt) {
          return "<div class=\"image-node slider-imageContainerNode\"><img style=\"width:"
                + this._size.width + "px;height:" + this._size.height + "px\" src=\"" +
                src + "\" alt=\"" + (alt ? alt : "") + "\"></div>"
        }
    //指定某个控件在容器中居中


  });
});
define('cUICore',['cHistory', 'cView', 'cDataSource', 'cUIBase', 'cUIAbstractView', 'cAdView', 'cUIAlert', 'cUIAnimation', 'cUICitylist', 'cUIHeadWarning', 'cUIInputClear', 'cUILayer', 'cUILoading', 'cUILoadingLayer', 'cUIMask', 'cUIPageview', 'cUIScrollRadio', 'cUIScrollRadioList', 'cUIScrollList', 'cUIToast', 'cUIWarning', 'cUIWarning404', 'cUIHashObserve', 'cUIEventListener', 'cUISwitch', 'cUINum', 'cUIGroupList', 'cUIBusinessGroupList', 'cUITab', 'cUIImageSlider', 'cUIBubbleLayer'], function (cuiHistory, cuiView, cuiDataSource, cuiBase, cuiAbstractView, cuiAdView, cuiAlert, cuiAnimation, cuiCityList, cuiHeadWarning, cuiInputClear, cuiLayer, cuiLoading, cuiLoadingLayer, cuiMask, cuiPageView, cuiScrollRadio, cuiScrollRadioList, cuiScrollList, cuiToast, cuiWarning, cuiWarning404, cuiHashObserve, cuiEventListener, cuiSwitch, cuiNum, cUIGroupList, cUIBusinessGroupList, cUITab, cUIImageSlider, cUIBubbleLayer) {

  var config = {
    // @description 框架内所有生成的元素的id，class都会加上此前缀
    prefix: 'cui-'
  };

  var cui = {
    History: cuiHistory,
    View: cuiView,
    DataSource: cuiDataSource,
    Tools: cuiBase,
    config: config,
    AbstractView: cuiAbstractView,
    AdView: cuiAdView,
    Alert: cuiAlert,
    Animation: cuiAnimation,
    CityList: cuiCityList,
    HeadWarning: cuiHeadWarning,
    InputClear: cuiInputClear,
    Layer: cuiLayer,
    Loading: cuiLoading,
    LoadingLayer: cuiLoadingLayer,
    Mask: cuiMask,
    PageView: cuiPageView,
    ScrollRadio: cuiScrollRadio,
    ScrollRadioList: cuiScrollRadioList,
    ScrollList: cuiScrollList,
    Toast: cuiToast,
    Warning: cuiWarning,
    HashObserve: cuiHashObserve,
    EventListener: cuiEventListener,
    cuiSwitch: cuiSwitch,
    cuiNum: cuiNum,
    cUIGroupList: cUIGroupList,
    cUIBusinessGroupList: cUIBusinessGroupList,
    cUITab: cUITab,
    cUIImageSlider: cUIImageSlider,
    cUIBubbleLayer: cUIBubbleLayer
  }

  return cui;
});
 // define(['cUICore',
 //     'cUISlide',
 //     'cChineseCal',
 //     'cCalendar',
 //     'cHistory'],
 // function (cui_core, cui_slide, chineseCalendar, cui_calendar, cui_history, cui_cityList) {
 //     var cui = cui_core;
 //     cui.Slide = cui_slide;
 //     cui.chineseCalendar = chineseCalendar;
 //     cui.Calendar = cui_calendar;
 //     cui.History = cui_history;
 //     return cui;
 // });

//define(['cUICore', 'cHistory'], function (cui_core, cui_history) {
// var cui = cui_core;
// cui.History = cui_history;
// return cui;
//});

define('cUI',['cUICore'], function (cuiCore) {
  return cuiCore;
});
/**
 * @author cmli@ctrip.com
 * @class cLazyload
 * @description 延迟加载图片
 */
define('cLazyload',['libs'], function(libs) {

  

  /** 没有图片ICON的Base64位码 */
  var NO_IMG_CODE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAYCAMAAAAGTsm6AAAAMFBMVEXy8vL6+vr+/v7+/v7+/v7v7+/+/v7+/v7+/v7+/v7+/v729vb+/v4AAADt7e3+/v673auIAAAADnRSTlPXrYhVZuwimTMRRMJ3AKjyf0QAAAH3SURBVHjaxdbZkqowGEXhzMM/ZL//2x6IEYh0Cd1addaFUhbJZyKKRv9TZ1iSHirpU6Gme3BB888h3kXwj8PLePZCc0F0lNn1Z0Irl3AQYVhZYnVYY/Zj+Nxze/Aa64ghYyRfrHieZ4Gz398qRV6KiNyL24AsS06e/RGuKqBKpJrWI31NIDo1Tsrt+foR9tfwLresBLcerYvplUu4oMlamGH6BWwXjREZIMGIruBq9jP/Co8pmLmsc9IC1ao6TXaCM0xfttUZnqO3MAkVgjwGaofXklDPQGgUaMA1Q0zW0kx9gQ0fK29hTUQCzuwqzA4TzslzxeJWtbszTPd/uTweNQ4C2eFiZc0hCoP7cQ6HqzpZwPoZbkj34RpZHmRlpAHveeT5+upwChlNpKFZKTsM6CU8Rxz6KvrGT59MRjjDDDRXlnNdQ6xHWLbSDZg4yxa7+UuOeoZTDrU22OUx+H2rCw7RHRiRt8A6KVbP8INxETJ9xgRDI3MPPk48wamBfoZJimqYr2rBtlv82YqrAesGU647nIHoyvxWI/yH8O62tMOCdvw6iQHsESag7vAHW+3buJ9LB0qE3eAe5XAcEZH1Cyv2jO52auSf9+OpMSID6RtwALiOLbdY4/DuH0jq1/gnWx3HgXTnnH2dE20M0F/DQvrlClU99Q/TJ4uko/HGBAAAAABJRU5ErkJggg==';

  /** 加载中ICON的Base64位码 */
  var LOAD_IMG_CODE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAYCAMAAAAGTsm6AAAAMFBMVEX6+vr+/v7+/v7+/v7+/v7+/v7+/v7+/v7y8vLv7+/+/v729vb+/v4AAADt7e3+/v6c4gmbAAAADnRSTlOtM4hmVZkiEdfsRMJ3AHDRYrYAAAGwSURBVHjaxdbZktsgEAVQLSxNL9z//9vQgvFYUjKpkqnkPhgJbI4bJMuL/af8DGeS8IcRZm+Shnwb21U/hQ1Ivx9gLL0pDbqMKbYJsN2TDlGPuiF3RzGhYrJ7FF9Rh42wT4VTbrD40WqBxEM89lAjpL2GA15j7h/gdIIzp0fwd2FijB62ER6TO/zdd40+g0kEVYQgw5EDbn3eWcRznEhFh6t4yhgrz+BXQYztDBfpucNyWmr9GNYTfCTSflrqyXDyO0Wv8OoDlH3cCpmRptmwe3cYr0jrsgzwv4EXXRAX2VTVInJAnL7UCvaXcNnjXGI7zuMdG/gLLuoRSG+fw7HDfIYTFWZCUGVboaXMvY89BNevML1PXIH9BRN7ImJvH8MJ5NwVDqqBCTwWpdjIftnjXfaHsGK7wyMCS9wmVtdmP50K+CCS8fFzVY/zxKwaa19qBlqn5qmwooxn8gkO6NmU01org3KpM2GG30cqqHa5uLad27F/h4q1OcAyEc7Fp8teWhMGHN73OG/9io7evGX78K9PjtkBcZLVa105ve2/2V5CLzHaewTyAJ6QlVf7a34BIRiNTVIrVfEAAAAASUVORK5CYII=';

  /** 加载错误ICON的Base64位码 */
  var ERROR_IMG_CODE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAYCAMAAAAGTsm6AAAAMFBMVEX6+vr+/v7+/v7+/v7+/v7+/v7+/v7y8vLv7+/+/v7+/v7+/v729vYAAADt7e3+/v6PQhf9AAAADnRSTlOtVTOIZpki1+wRd0TCAMJ8iPYAAAKfSURBVHjaxZWLjqMwDEXJO7FN7v//7WITOgQ6pVpptbdSecTxiW3iLOt/0g3cirj3po1ZL5lcuw8Sud8QgegJbALy+laMZb/UdY2n9Xj9F/wKFnwLXu/KRiSLG7ISwk+s6Fm9n9PgZUjNKvJ34LLeRThECl4L4ssDyMKak7NLTRvKc41z28Bia15dEVWxwkYiShAicgb26QiwAY6ZC1gV4wCTXdXUjey09gFMOCSvVSv46u2kiEnyMm3DNGGIP4GLCLpIgQyOmD266MsqKnuQPnJbkWhTBalSeIEFycAdZi3in2osOjHM4CqmO5i0gvcaG9ipr4gyDT+BaQKbUom3VLc6xqXewaymBfQdOOu3QFew14HSbGPVLYRCediPBHZ5D2b0bOt6BBvvBsZLoqtvGIEGCWRCJVOQOIEFVpMqfwleaEFajLImNId0dKWb6AXWqrQg8NvN8ggmJRHcBNZiJu1OwyIclY8UWZUAxyoinsBqHtcMegSnHcwzOJfKXODUrwfVa8lq7z+uZ7Dboo3gR3CB0q/gcs5kB+I8KSKlnmdwrTu4AXnpj706j213ATvtlQU8knIJ2HdkRjmfoLkplL0ikJAewYTwDnw0icxRbeRyhCPoaGpTEiiGdpwY+RFcDSSbJVu76vacmYlS31PN1nfpRfHVdnjuqPHcWfS919ttoD2BCXWcyRPYYVcgzr533ki1DwLBuJZw9ERsD0mPCUH3+nr7xc9ghu4jEvT18nGFyHvfcx3eTjGbyaEDMuLJgvG+JRTz3pmA1ApQQ/4d3KpOaxraRhhgd65xC0C0gOyiHs/7iBcrZ65HElKFuQkAPp1OLTUFiNoysU7lfKr/usa6L4TS0Vfm8uVoo8q17Y/KdseyXFP9T9VOn9s88gcLTIlzurC4gAAAAABJRU5ErkJggg==';

  var Loader = {};

  /**
   * @method lazyload
   * @param {string|dom} img css选择器的表达式或者是dom元素
   * @param {function} onStart optional, 进入加载加载LOAD_IMG_CODE之后的回调阶段的回调
   * @param {function} onError optional, img加载错误之后的回调
   * @param {function} onComplete optional, 加载LOAD_IMG_CODE之后的回调
   * @description 异步加载图片
   */
  Loader.lazyload = function(img, onStart, onError, onComplete) {

    var handler = function(){
      var $el = $(this);
      var $imgDom = $(new Image());
      var imgSrc = $el.attr('src');

      $el.addClass('cui-item-imgbg');

      if (typeof imgSrc === 'string' && imgSrc.length > 0) {
        $el.attr('src', LOAD_IMG_CODE);

        if (typeof onStart === 'function') onStart.call(this, this);

        /** 加载失败给出错误的IMG */
        var errorCallback = function(){
          $el.attr('src', ERROR_IMG_CODE);
        };
        errorCallback = onError || errorCallback;

        /** 触发Image Load事件，赋值新的src地址 */
        var loadCallback = function(){
          $el.attr('src', imgSrc);
          $el.removeClass('cui-item-imgbg');
        };
        loadCallback = onComplete || loadCallback;

        $imgDom.bind('error', errorCallback).bind('load', loadCallback).attr('src', imgSrc);
      }else{

        $el.attr('src', NO_IMG_CODE);
      }
    };

    $(img).each(handler);
  };

  return Loader;
});

/**
 * @author cmli@ctrip.com / oxz欧新志 <ouxz@Ctrip.com>
 * @class c
 * @description Lizard框架集合
 */
define('c',['cBase', 'cUI', 'cUtility', 'cView', 'cModel', 'cStore', 'cStorage', 'cAjax', 'CommonStore', 'cLazyload', 'cLog'],
  function(cBase, cUI, cUtility, cView, cModel, cStore, cStorage, cAjax, cCommonStore, lazyload, cLog) {

  var c = {
    base: cBase,
    ui: cUI,
    view: cView,
    utility: cUtility,
    store: cStore,
    storage: cStorage,
    model: cModel,
    ajax: cAjax,
    log: cLog,
    commonStore: cCommonStore,
    lazyload: lazyload
  };

  return c;

});
/**********************************
* @author:       cmli@Ctrip.com
* @description:  ListAdapter��ListView��������
*/
define('cListAdapter',['libs', 'cBase'], function (libs, cBase) {

    var options = options || {};

    /*************************
    * @description: ����������length���ȵ���
    * @scope: private
    */
    var _random = function (length) {
        var s = '';
        var randomchar = function () {
            var n = Math.floor(Math.random() * 62);
            if (n < 10) return n; //1-10
            if (n < 36) return String.fromCharCode(n + 55); //A-Z
            return String.fromCharCode(n + 61); //a-z
        }
        while (s.length < length) s += randomchar();
        return s;
    }

    /*************************
    * @description: �������ظ��������룬��value���õ�hash������ȥ
    * @scope: private
    */
    var _setValue = function (map, value) {
        var randomCode = _random(8);
        if (!map.getItem(randomCode)) {
            return map.add(randomCode, value);
        } else {
            _setValue(map, value);
        }
    }

    /*************************
    * @description: ����cBase��Hash���󣬽�����ת����Hash�������д洢
    * @scope: private
    */
    var _hashMap = function (map, dataList) {
        for (var i = 0; i < dataList.length; i++) {
            _setValue(map, dataList[i]);
        };
    }

    options.__propertys__ = function () {
        this.observers = [];
    }

    options.initialize = function (options) {
        this.setAdapter(options.data);
    }

    /*************************
    * @description: �����е�β����������
    * @scope: public
    */
    options.add = function (data) {
        if (data instanceof Array) {
            for (var i = 0; i < data.length; i++) {
                _setValue(this.map, data[i]);
                this.list.push(data[i]);
            };
        } else {
            _setValue(this.map, data);
            this.list.push(data);
        }

        this.notifyDataChanged();
    }

    /*************************
    * @description: �Ӷ��е�ͷ���޳�һ�����ݣ�ͬʱ���ظ�����
    * @scope: public
    */
    options.shift = function () {
        this.map.shift();
        this.notifyDataChanged();
        return this.list.shift();
    }

    /*************************
    * @description: �Ӷ��е�β���޳�һ�����ݣ�ͬʱ���ظ�����
    * @scope: public
    */
    options.pop = function () {
        this.map.pop();
        this.notifyDataChanged();
        return this.list.pop();
    }

    /*************************
    * @description: �Ӷ��е�β�����޳�number������
    * @scope: public
    */
    options.remove = function (number) {
        for (var i = 0; i < number; i++) {
            this.map.pop();
            this.list.pop();
        };

        this.notifyDataChanged();
    }

    /*************************
    * @description: ��handler���ص����ݽ�������
    * @scope: public
    */
    options.sortBy = function (handler) {
        this.map.sortBy(handler);
        this.list = _.sortBy(this.list, handler);

        this.notifyDataChanged();
    }

    options.setAdapter = function (dataList) {
        dataList = (dataList && dataList instanceof Array) ? dataList : [];
       // if (dataList && dataList instanceof Array) {
            this.list = $.extend(true, [], dataList);
            this.map = new cBase.Hash();
            _hashMap(this.map, dataList);
            this.notifyDataChanged();
//        } else {
//            throw "ListAdapter: set data is not array";
//        }
    }

    /********************************
    * @description: ���۲���ע�ᵽ���۲�����
    * @param: {observer} ListView �۲���ʵ��
    */
    options.regiseterObserver = function (observer) {
        if (this.observers.indexOf(observer) === -1) {
            this.observers.push(observer);
        }
    }

    /********************************
    * @description: ���۲��ߴӱ��۲����н���
    * @param: {observer} ListView �۲���ʵ��
    */
    options.unregiseterObserver = function (observer) {
        var index = this.observers.indexOf(observer)
        if (index) {
            this.observers.splice(index, 1);
        };
    }

    /********************************
    * @description: ֪ͨ�۲������ݷ����仯��Ҫ����
    */
    options.notifyDataChanged = function () {
        for (var i = 0; i < this.observers.length; i++) {
            this.observers[i].update();
        };
    }

    var ListAdapter = new cBase.Class(options);

    return ListAdapter;

});
/**********************************
 * @author:   cmli@Ctrip.com
 * @description:  组件Geolocation
 *
 * 从cUtility中分离出来的定位组件
 */
define('cWidgetGeolocation',['cBase', 'cUtility', 'cWidgetFactory', 'cStore', 'cHybridFacade'], function(cBase, Util, WidgetFactory, cStore, Facade) {
  

  var WIDGET_NAME = 'Geolocation';

  var KEY = '0b895f63ca21c9e82eb158f46fe7f502';

  // 如果WidgetFactory已经注册了HeaderView，就无需重复注册
  if (WidgetFactory.hasWidget(WIDGET_NAME)) {
    return;
  }

  var Geolocation = Geolocation || {};

  /**
   * 获得设备经纬度
   * @param callback {Function} 获得经纬度的回调
   * @param error {Function} 发生错误时的回调
   *
   * update caofu 更新提示语 2013-09-06
   */
  Geolocation.requestGeographic = function(callback, error) {

    var successCallback = function(position) {
      if (callback) {
        callback(position);
      }
    };

    var errorCallback = function(err) {
      var err_msg = '未能获取到您当前位置，请重试或选择城市'; // '获取经纬度失败!';
      switch (err.code) {
        case err.TIMEOUT:
          err_msg = "获取您当前位置超时，请重试或选择城市！";
          break;
        case err.PERMISSION_DENIED:
          err_msg = "您拒绝了使用位置共享服务，查询已取消，请开启位置共享或选择城市！";
          break;
        case err.POSITION_UNAVAILABLE:
          err_msg = "获取您当前位置信息失败，请重试或选择城市！";
          break;
      }

      if (error) {
        error(err, err_msg);
      }
    };

    window.navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 20000
    });
  };

  /**
   * 高德api经纬度获得详细地址信息
   * @param lng {Number} 经度
   * @param lat {Number} 纬度
   * @param callback {Function} 完成时回调,回传参数为高德下发城市数据
   * @param error {Function} 超时回调
   * @param timeout {Number} 超时的时间长度，默认为8秒
   * @author ouxingzhi
   */
  Geolocation.requestAMapAddress = function(lng, lat, callback, error, timeout) {
    var region = '121.473704,31.230393';
    if (lng && lat) {
      region = lng + ',' + lat;
    }
    var param = $.param({
      'location': region,
      'key': KEY,
      'radius': 0,
      'extensions': 'all'
    });

    timeout = timeout || 8000;

    $.ajax({
      url: "http://restapi.amap.com/v3/geocode/regeo?" + param,
      dataType: 'jsonp',
      success: function(data) {
        var addrs = (data && data.regeocode) || '',
          citys = addrs.addressComponent.city,
          province = addrs.addressComponent.province,
          city = '';
        if (_.isString(citys)) {
          city = citys;
        } else if (_.isString(province)) {
          city = province;
        }
        var info = {
          'address': _.isString(addrs.formatted_address) ? addrs.formatted_address : '',
          'location': region,
          'info': addrs && addrs.addressComponent,
          'city': city,
          'lng': lng,
          'lat': lat
        };
        callback && callback(info);
      },
      error: function(e) {
        error && error(e);
      },
      timeout: timeout
    });
  };

  /**
   * 高德api经纬度获得周边信息
   * @param lng {Number} 经度
   * @param lat {Number} 纬度
   * @param callback {Function} 完成时回调,回传参数为高德下发城市数据
   * @param error {Function} 超时回调
   * @param timeout {Number} 超时的时间长度，默认为8秒
   */
  Geolocation.requestAMapAround = function(lng, lat, callback, error, timeout) {
    var region = '121.473704,31.230393';
    if (lng && lat) {
      region = lng + ',' + lat;
    }
    var param = $.param({
      'location': region,
      'key': KEY,
      'radius': 500,
      'offset': 4,
      'page': 1
    });

    timeout = timeout || 8000;

    $.ajax({
      url: "http://restapi.amap.com/v3/place/around?" + param,
      dataType: 'jsonp',
      success: function(data) {
        var pois = (data && data.pois) || [];
        callback && callback(pois);
      },
      error: function(e) {
        error && error(e);
      },
      timeout: timeout
    });
  };

  /**
   * 高德api关键字查询
   * @param lng {Number} 经度
   * @param lat {Number} 纬度
   * @param callback {Function} 完成时回调,回传参数为高德下发城市数据
   * @param error {Function} 超时回调
   * @param timeout {Number} 超时的时间长度，默认为8秒
   */
  Geolocation.requestAMapKeyword = function(keywords, city, callback, error, timeout) {
    //var region = '121.473704,31.230393';
    //if (lng && lat) {
    //    //region = lng + ',' + lat;
    //}
    var param = $.param({
      'keywords': keywords,
      'city': city,
      'key': KEY,
      'offset': 10,
      'page': 1,
      'extensions': 'all'
    });

    timeout = timeout || 8000;

    $.ajax({
      url: "http://restapi.amap.com/v3/place/text?" + param,
      dataType: 'jsonp',
      success: function(data) {
        var pois = (data && data.pois) || [];
        callback && callback(pois);
      },
      error: function(e) {
        error && error(e);
      },
      timeout: timeout
    });
  };

  /**
   * @description: 获取转换过的经纬度
   * @param lng {Number} 经度
   * @param lat {Number} 维度
   * @param callback {Function} 成功回调
   * @param error {Function} 错误回调
   * @author: ouxz
   */
  Geolocation.tansformLongitude = function(lng, lat, callback, error, timeout) {
    var param = $.param({
      locations: lng + ',' + lat,
      key: KEY,
      coordsys: 'gps'
    });

    timeout = timeout || 8000;

    $.ajax({
      url: "http://restapi.amap.com/v3/assistant/coordinate/convert?" + param,
      dataType: 'jsonp',
      success: function(data) {
        if (data && data.status === '1') {
          var l = data.locations.split(',');
          callback && callback(l[0], l[1]);
        } else {
          error && error();
        }
      },
      error: function(e) {
        error && error(e);
      },
      timeout: timeout
    });
  }

  /*******************************************
   * 获得城市信息
   * @param callback {Function} 成功时的回调
   * @param erro {Function} 失败时的回调
   * @param posCallback {Function} 获取经纬度成功的回调
   * @param posError {Function} 获取经纬度失败的回调
   * @param isAccurate {Boolean} 是否通过高精度查询 (如果使用高精度定位会发起两次请求，定位会需要更多时间，如只需定位城市，不需开启此开关，此开关在app中无效)
   */
  Geolocation.requestCityInfo = function(callback, error, posCallback, posError, isAccurate) {

    var _HybridLocate = function() {
      var successCallback = function(info) {
        if (info && info.locateStatus) {
          if (info.locateStatus == -1) {
            errorCallback('网络不通，当前无法定位', 1);
            return;
          } else if (info.locateStatus == -2) {
            errorCallback('定位没有开启', 2);
            return;
          }
        }

        if (info && info.value && info.value.poi) {
          //info.value.addrs = info.value.poi.address;
          //info.value.lat = info.value.poi.y;
          //info.value.lng = info.value.poi.x;
          if (info.value.poi.address && info.value.poi.address != '') {
            info.value.addrs = info.value.poi.address;
          } else if (info.value.poi.name && info.value.poi.name != '') {
            info.value.addrs = info.value.poi.name;
          }
          if (info.value.poi.y && info.value.poi.y != '') info.value.lat = info.value.poi.y;
          if (info.value.poi.x && info.value.poi.x != '') info.value.lng = info.value.poi.x;
        }

        //ios传ctyName,android传province
        var _city = null;

        if (info && info.value && info.value.ctyName) {
          _city = info.value.ctyName;
        } else if (info && info.value && info.value.cityName) {
          _city = info.value.cityName;
        } else if (info && info.value && info.value.province == "香港特別行政區") {
          _city = "香港特別行政區";
        } else if (info && info.value && info.value.province) {
          _city = info.value.province.indexOf('市') > -1 ? info.value.province : info.value.subLocality;
        }

        var _address = null;
        //if (info && info.value && info.value.poi && info.value.poi.address) {
        //    _address = info.value.poi.address;
        //} else if (info && info.value) {
        //    _address = info.value.addrs;
        //}
        if (info && info.value && info.value.addrs) _address = info.value.addrs;
        var _lat = info.value.lat;
        var _lng = info.value.lng;

        if (_city && _address) {
          if (_address.indexOf(_city) > -1) {
            callback({
              city: _city,
              address: _address,
              lng: _lng,
              lat: _lat
            });
          } else {
            callback({
              city: _city,
              address: _city + _address,
              lng: _lng,
              lat: _lat
            });
          }

          //应Native要求,关闭失败补偿机制, shzhang 2014/7/11
//        } else if (_lat && _lng) {
//          var locateSuccessCallback = function(data) {
//            if (callback) {
//              data.lng = _lng;
//              data.lat = _lat;
//              callback(data);
//            }
//          };
//
//          var locateErrorCallback = function(err, msg) {
//
//            if (error) {
//              error();
//            }
//          };
//
//          Geolocation.requestAMapAddress(_lng, _lat, locateSuccessCallback, locateErrorCallback);
          } else {
            errorCallback('Error', 0);
         }
      };

      var errorCallback = function(err, msg) {
        if (typeof posError === 'function') {
          posError(err, msg);
          return;
        }
        if (error) {
          error(msg);
        }
      };

      Facade.request({
        name: Facade.METHOD_LOCATE,
        success: successCallback,
        error: errorCallback
      });
    };

    var _WebLocate = function() {
      var successCallback = function(pos) {
        var lng = pos.coords.longitude;
        var lat = pos.coords.latitude;
        posCallback && posCallback(lng, lat);
        var locateSuccessCallback = function(data) {
          if (callback) {
            callback(data);
          }
        };

        var locateErrorCallback = function(err, msg) {

          if (error) {
            error();
          }
        };
        if (!isAccurate) {
          Geolocation.requestAMapAddress(lng, lat, locateSuccessCallback, locateErrorCallback);
        } else {
          Geolocation.tansformLongitude(lng, lat, function(lng, lat) {
            Geolocation.requestAMapAddress(lng, lat, locateSuccessCallback, locateErrorCallback);
          }, function(err) {
            locateErrorCallback(err);
          });
        }
      };

      var errorCallback = function(err, msg) {
        if (typeof posError === 'function') {
          posError(msg, err);
          return;
        }
        if (error) {
          error(msg);
        }
      };

      Geolocation.requestGeographic(successCallback, errorCallback);
    };

    var Locate = Util.isInApp() ? _HybridLocate : _WebLocate;
    Locate();
  };

  /**
   * 获得周边信息
   * @param callback {Function} 成功时的回调
   * @param erro {Function} 失败时的回调
   */
  Geolocation.requestAroundInfo = function(pos, callback, error) {
    var lng = pos.split(',')[0];
    var lat = pos.split(',')[1];

    var locateSuccessCallback = function(data) {
      if (callback) {
        callback(data);
      }
    };

    var locateErrorCallback = function() {
      if (error) {
        error();
      }
    };

    Geolocation.requestAMapAround(lng, lat, locateSuccessCallback, locateErrorCallback);
  };

  /**
   * 获得关键字查询信息
   * @param callback {Function} 成功时的回调
   * @param erro {Function} 失败时的回调
   */
  Geolocation.requestKeywordInfo = function(keywords, city, callback, error) {
    var locateSuccessCallback = function(data) {
      if (callback) {
        callback(data);
      }
    };

    var locateErrorCallback = function() {
      if (error) {
        error();
      }
    };

    Geolocation.requestAMapKeyword(keywords, city, locateSuccessCallback, locateErrorCallback);
  };

  /*******************************************
   * 保存定位城市的城市名
   * @author ouxz@ctrip.com
   */
  var PositionStore = Geolocation.PositionStore = cBase.Class(cStore, {
    __propertys__: function() {
      this.key = 'POSITION_CITY';
      this.lifeTime = '10M';
    },
    initialize: function($super, options) {
      $super(options);
    }
  });
  /**
   * 获取经过缓存的城市信息
   * @param callback 完成时的回调
   * @param error  报错时的回调
   * @param scope  回调函数执行的上下文环境
   * @author ouxz@ctrip.com
   */
  Geolocation.requestCacheCityInfo = function(callback, error, scope) {
    var posStore = PositionStore.getInstance(),
      posinfo = posStore.get();
    if (posinfo) {
      callback && callback.call(scope, posinfo);
    } else {
      Geolocation.requestCityInfo(function(posinfo) {
        posStore.set(posinfo);
        callback && callback.call(scope, posinfo);
      }, function(msg, e) {
        error && error.call(scope, msg, e);
      });
    }
  };

  /**
   * @author cmli@ctrip.com
   * @description 加入地图功能
   * @param options.lat 定位点的维度
   * @param options.lng 定位点的精度
   * @param options.id  地图容器的id，某个标签的id名称
   * @param options.content 定位点信息
   * @param options.level 地图显示等级[optional]
   * @instance
   *  需要引入的代码
   * <script language="javascript" src="http://webapi.amap.com/maps?v=1.2&key=0b895f63ca21c9e82eb158f46fe7f502"></script>
   */ 
  Geolocation.requestMap = function(options) {

    var WebMap = function(config) {

      // @description 在web环境中，如果缺少AMap对象和定位点信息，直接返回false，标记错误，无法加载地图
      if (!AMap || !config || !config.lat || !config.lng || !config.id) return false;

      var DEFAULT_LEVEL = 13;

      // @description 初始化地图信息
      var mapContainer = new AMap.Map(config.id, {
        center: new AMap.LngLat(config.lng, config.lat),  // @description 地图中心点
        level: config.level || DEFAULT_LEVEL              // @description 地图显示的比例尺级别
      });

      // @description 自定义点标记内容
      var markerContent = document.createElement("div");
      markerContent.className = 'map-content';

      // @description 点标记中的图标
      var markerImg = document.createElement("img");
      markerImg.src = "http://res.m.ctrip.com/html5/Content/images/map_address.png";
      markerContent.appendChild(markerImg);

      // @description 点标记中的文本
      if (config.content) {
        var markerSpan = document.createElement("span");
        markerSpan.innerHTML = config.content;
        markerContent.appendChild(markerSpan);
      };

      // @description 生成标记点，并且设置position
      var marker = new AMap.Marker({
        position: new AMap.LngLat(config.lng, config.lat)
      });

      // @description 更新点标记内容
      marker.setContent(markerContent);

      // @description 设置marker到Map上去
      marker.setMap(mapContainer);
    }

    var HybridMap = function(config) {
      // @description 留下在Hybrid中调用的接口
    }

    // @description 通过Util判断当前环境是App还是Hybrid
    var Map = Util.isInApp() ? HybridMap : WebMap;

    // @description 调用Map显示地图
    Map(options);
  };

    /**
    * @description 写内容到文件
    * @param {double} options.latitude, 纬度2567.     
    * @param {double} options.longitude, 经度2568.     
    * @param {String} options.title, 在地图上显示的点的主标题2569.     
    * @param {String} options.subtitle, 在地图上显示点的附标题
    */
    Geolocation.show_map = function (options) {
        if (!options) {
            throw new Error('function show_map error is "param is null"');
        }
        options.name = Facade.METHOD_SHOW_MAP;
        Facade.request(options);
    };
	
	
	/**
    * @description 在地图上显示多个POI位置点
    */	
	Geolocation.app_show_map_with_POI_list = function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_SHOW_MAP_WITH_POI_LIST, poiList: options.poiList});
    }  

    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: Geolocation
    });
});
define('cGeoService',['cWidgetFactory', 'cWidgetGeolocation', 'cWidgetGuider'], function (cWidgetFactory) {
    /*
    * 地理相关的服务
    */
    var Geo = {};
    var Geolocation = cWidgetFactory.create('Geolocation');
    var Guider = cWidgetFactory.create('Guider');
    var posStore = Geolocation.PositionStore.getInstance();
    /**
    * 获取的当前城市信息
    */
    Geo.GeoLocation = function () {
        var STATE_INITIALIZE = 0,
			STATE_START = 1,
			STATE_COMPLETE = 2,
			STATE_ERROR = 3;

        //定位回调
        var handler = {},
        //初始状态
			state = STATE_INITIALIZE,
            resource = null;
        //调用回调函数

        function RunCallback(name, args, clearHandler) {
            for (var i in handler) {
                handler[i] && (typeof handler[i][name] === 'function') && handler[i][name].apply(handler[i].scope, args);
            }
            clearHandler && (handler = {});
        }

        return {
            /**
            * 获得当前城市信息
            * @param name {String} 一个字符串标记，用于标记当前请求
            * @param events {Object} 要注册的事件
            *		onStart {Function} 可选,开始时的回调
            *		onComplete {Function} 可选,完成时的回调
            *		onError {Function} 可选,当定位成功，但高德定位错误时的回调
            *       onPosComplete {Function} 可选,获取经纬度成功后的回调
            *       onPosError {Function} 可选，当定位失败的回调
            * @param scope {Object} 可选，当前执行上下文
            * @param nocache {Boolean} 可选，是否不使用缓存
            */
            Subscribe: function (name, events, scope, nocache) {
                var i;
                events = events || {};
                //之前没有注册过则加入到队列中
                if (!handler[name]) {
                    handler[name] = {
                        name: name,
                        onStart: events.onStart,
                        onComplete: events.onComplete,
                        onError: events.onError,
                        onPosComplete: events.onPosComplete,
                        onPosError: events.onPosError,
                        scope: scope
                    };
                }
                var posinfo = posStore.get();
                //此参数为真，则强制请求
                if (nocache) {
                    posinfo = null;
                }
                //有缓存直接调用成功回调，回传结果
                if (posinfo) {
                    state = STATE_START;
                    RunCallback('onStart', null);
                    state = STATE_COMPLETE;
                    RunCallback('onPosComplete', [posinfo.lng, posinfo.lat]);
                    RunCallback('onComplete', [posinfo], true);
                    //无缓存则调用加载中回调，并发起请求
                } else {
                    clearTimeout(resource);
                    resource = setTimeout(function () {
                        if (state === STATE_START) {
                          state = STATE_ERROR;
                          Guider.print({ log: '#cGeoService -- 22 second timeout call onError' });
                          RunCallback('onError', [null], true);
                        }
                    }, 35000);
                    //当在加载中时,加入队列
                    if (state === STATE_START) {
                        handler[name] && (typeof handler[name].onStart === 'function') && handler[name].onStart.call(scope);
                        return;
                    }
                    state = STATE_START;
                    RunCallback('onStart', null);
                    Guider.print({ log: '#cGeoService -- start request city info' });
                    Geolocation.requestCityInfo(function (posinfo) {
                        state = STATE_COMPLETE;
                        posStore.set(posinfo);
                        RunCallback('onComplete', [posinfo], true);
                    }, function (msg, e) {
                        state = STATE_ERROR;
                        //app那边禁用定位，这个值会返回e为2
                        if (typeof e === 'number' && e === 2) e = { code: 1 };
                        Guider.print({ log: '#cGeoService -- locate onError' });
                        RunCallback('onError', [msg, e], true);
                    }, function (lng, lat) {
                        RunCallback('onPosComplete', [lng, lat]);
                    }, function (msg, e) {
                        state = STATE_ERROR;
                        //app那边禁用定位，这个值会返回e为2
                        if (typeof e === 'number' && e === 2) e = { code: 1 };
                        RunCallback('onPosError', [msg, e], true);
                    }, true);

                }
            },
            /**
            * 取消某个请求服务
            */
            UnSubscribe: function (name) {
                name = _.isArray(name) ? name : [name];
                for (var i = 0; i < name.length; i++) delete handler[name[i]];
            },
            /**
            * 清空缓存
            */
            ClearPosition: function () {
                posStore.remove();
            }
        };
    } ();

    /**
    * 获得周边查询信息
    */
    Geo.GeoAround = function () {

        return {
            /**
            * 获得周边查询信息
            * @param onComplete {Function} 完成时的回调
            *		  onError {Function} 错误时的回调
            * @param scope {Object} 可选，当前执行上下文
            */
            Subscribe: function (pos, onComplete, onError, scope) {
                Geolocation.requestAroundInfo(pos, function (posinfo) {
                    onComplete.call(scope, posinfo);
                }, function (e) {
                    onError.call(scope);
                });
            }
        }

    } ();

    /**
    * 获得关键字查询信息
    */
    Geo.GeoKeyword = function () {

        return {
            /**
            * 获得关键字查询信息
            * @param onComplete {Function} 完成时的回调
            *		  onError {Function} 错误时的回调
            * @param scope {Object} 可选，当前执行上下文
            */
            Subscribe: function (keywords, city, onComplete, onError, scope) {
                Geolocation.requestKeywordInfo(keywords, city, function (posinfo) {
                    onComplete.call(scope, posinfo);
                }, function (e) {
                    onError.call(scope);
                });
            }
        }

    } ();

    return Geo;

});
define('cImgLazyload',['libs', 'cBase'], function (libs, cBase) {
  

  var ImgLazyload = new cBase.Class({
    __propertys__: function () {
      this.isError = false;
    },

    initialize: function (opts) {
      this.handleOpts(opts);
      this.checkWrapperDisplay();
      this.init();
    },

    //用以解决父容器不显示导致高度失效问题
    checkWrapperDisplay: function () {
      //如果容器高度为0，一定是父容器高度不显示导致
      if (this.isError) return;
      this.TIMERRES && clearInterval(this.TIMERRES);
      if ($(this.imgs[0]).offset().top == 0) {
        this.isError = true;
        this.TIMERRES = setInterval($.proxy(function () {
          console.log('检测img offset.....');
          if ($(this.imgs[0]).offset().top > 0) {
            this.TIMERRES && clearInterval(this.TIMERRES);
            console.log('检测img offset结束，重设高度');
            this.isError = false;
            this.refresh();
          }
        }, this), 100);
      }
    },

    handleOpts: function (opts) {
      this.isError = false;
      if (!opts || !opts.imgs || !opts.imgs.length) { this.isError = true; return };
      this.imgs = opts.imgs;
      this.container = opts.container || $(window);
      this.width = opts.width;
      this.height = opts.height;

      this.loadingImg = opts.loadingImg || 'http://pic.c-ctrip.com/vacation_v2/h5/group_travel/no_product_pic.png';
      this.loadingBg = opts.loadingBg || '#ebebeb';

      this.needWrapper = false;
      if (this.width || this.height)
        this.needWrapper = true;

      this.wrapper = opts.wrapper || '<div class="cui_lazyload_wrapper" style="text-align: center; vertical-align: middle; "></div>';
      this.imgContainer = {};
    },

    init: function () {
      if (this.isError) return;
      this.initImgContainer();
      this.lazyLoad();
      this.bindEvents();
    },

    refresh: function (opts) {
      if (opts) {
        this.handleOpts(opts);
      }
      this.init();
    },

    bindEvents: function () {
      if (this.isError) return;

      this.destroy();

      //为container绑定事件
      this.container.on('scroll.imglazyload', $.proxy(function () {
        this.lazyLoad();
      }, this));

      $(window).on('resize.imglazyload', $.proxy(function () {
        this.initImgContainer();
      }, this));

      //图片加载失败相关逻辑

    },

    initImgContainer: function () {
      if (this.isError) return;

      var el, i, len, offset;
      for (i = 0, len = this.imgs.length; i < len; i++) {
        el = $(this.imgs[i]);
        if (!el.attr('data-src') || el.attr('data-src') == '' || el.attr('data-load') == '1') continue;

        offset = el.offset();
        if (!this.imgContainer[offset.top]) {
          this.imgContainer[offset.top] = [];
        }
        this.imgContainer[offset.top].push(el);
      }
    },

    //实际操作图片处
    _handleImg: function (tmpImg) {
      var sysImg, wrapper, scope;
      if (tmpImg.attr('data-src') && tmpImg.attr('data-src') != '') {
        if (this.needWrapper) {
          wrapper = $(this.wrapper);
          wrapper.css({
            width: this.width + 'px',
            height: this.height + 'px',
            'background-color': this.loadingBg
          });
          wrapper.insertBefore(tmpImg);
          wrapper.append(tmpImg);
        }

        sysImg = $(new Image());

        if (!tmpImg.attr('src'))
          tmpImg.attr('src', this.loadingImg);

        sysImg.on('error', function () {
          tmpImg.attr('src', this.loadingImg);
        }).on('load', function () {
          tmpImg.attr('src', tmpImg.attr('data-src'));
          tmpImg.attr('data-load', '1');

          setTimeout(function () {
            if (wrapper && wrapper[0]) {
              tmpImg.insertBefore(wrapper);
              wrapper.remove();
            }
          }, 1);
        }).attr('src', tmpImg.attr('data-src'));

      }
    },

    lazyLoad: function () {
      if (this.isError) return;

      var height = this.container.height();
      var srollHeight = this.container.scrollTop();
      var k, _imgs, tmpImg, i, len;

      for (k in this.imgContainer) {
        if (parseInt(k) < srollHeight + height) {
          _imgs = this.imgContainer[k];
          for (i = 0, len = _imgs.length; i < len; i++) {
            tmpImg = $(_imgs[i]);
            this._handleImg(tmpImg);
          }
          delete this.imgContainer[k];
        }
      } // for
    },

    destroy: function () {
      if (this.isError) return;
      this.TIMERRES && clearInterval(this.TIMERRES);
      //为container绑定事件
      this.container.off('.imglazyload');

      $(window).off('.imglazyload');
    }

  });

  //  ImgLazyload.lazyload = function (opts) {
  //    return new ImgLazyload(opts);
  //  };

  return ImgLazyload;

});

define('cMultipleDate',['libs', 'c'], function (libs, c) {
    /**
    * 多model数据加载类
    * @options models {Model}  设置多个要加载model类
    * author:Od
    */
    var cBase = c.base;
    var MultipleData = new cBase.Class({
        __propertys__: function () {
            this.models = new cBase.Hash();
            this.index = 0;
            this.results = {};
        },
        initialize: function (options) {
            this.setOption(options);
        },
        setOption: function (options) {
            for (var i in options) {
                switch (i) {
                    case 'models':
                        this.addModels(options[i]);
                        break;
                }
            }
        },
        addModel: function (name, model) {
            this.models.add(name, model);
        },
        addModels: function (models) {
            for (var i in models) {
                if (models.hasOwnProperty(i)) this.models.add(i, models[i]);
            }
        },
        removeModelByName: function (name) {
            this.models.del(name);
        },
        removeModelByIndex: function (index) {
            this.models.delByIndex(index);
        },
        excute: function (onComplete, onError, isAjax, scope, onAbort) {
            if (!this.models.length()) {
                throw 'No model';
            }
            this.index = 0;
            this._request(onComplete, onError, isAjax, scope, onAbort);
        },
        _request: function (onComplete, onError, isAjax, scope, onAbort) {
            var curModel = this.models.index(this.index), self = this;
            curModel.excute(function (data) {
                self.results[self.models.getKey(self.index)] = data;
                self.index++;
                if (self.index >= self.models.length()) {
                    onComplete && onComplete.call(this, self.results);
                    self.results = {};
                    return;
                }
                self._request(onComplete, onError, isAjax, scope, onAbort);
            }, function (e) {
                onError && onError.call(this, e);
            }, isAjax, scope, onAbort);
        }
    });
    return MultipleData;
});
/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class SessionStore
 * @description SessionStore 存储类
 */
define('cSessionStorage',['cBase', 'cAbstractStorage'], function (cBase, cAbstractStorage) {

  /**
   * @class AbsctractStorage
   * @type {cBase.Class}
   * @description SessionStorage存储类,继承自cAbstractStorage
   */
  var Storage = new cBase.Class(cAbstractStorage, {
    /**
     * @method __propertys__
     * @description 复写自顶层Class的__propertys__，初始化队列
     */
    __propertys__: function () {

    },

    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层继承自cAbstractStorage的initialize，赋值队列
     */
    initialize: function ($super, opts) {
      this.proxy = window.sessionStorage;
      $super(opts);
    }
  });


  Storage.getInstance = function () {
    if (this.instance) {
      return this.instance;
    } else {
      return this.instance = new this();
    }
  };

  Storage.sessionStorage = Storage.getInstance();
  return Storage;
});
/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class LocalStore
 * @description 以SessionStorage为数据存储的Store
 */

define('cSessionStore',['cBase','cAbstractStore','cSessionStorage'], function (cBase,cAbstractStore,cSessionStorage) {

  /**
   * @class SessionStore
   * @type {cBase.Class}
   * @description 使用SessionStorage存储的Store类,继承自cAbstractStore
   */
  var sessionStore = new cBase.Class(cAbstractStore,{
    __propertys__: function () {
      this.sProxy = cSessionStorage.getInstance();
    },
    initialize: function ($super, options) {
      $super(options);
    }
  });

  return sessionStore;
});
define('memStore',['cBase','cStore'], function(cBase,cStore){
  

  var MemStore = new cBase.Class({
    __propertys__: function () {
      //数据变更检查字段
      this.idField = '';
      //内存区数据
      this.data = null;
      //持久化数据
      this.store = null;
    },

    initialize: function (options) {
      //根据参数,生成cStore
      var attrs = ['key','lifeTime','useServerTime','isLocal','defaultData','rollbackEnabled'];
      var opt = {};
      for (var i = 0,ln = attrs.length; i<ln;i++){
          var val = this[attrs[i]];
          if( typeof val !== 'undefined'){
            opt[attrs[i]] = val;
          }
      }
      this.store = new cStore(opt);
      },

    refresh:function(){
      var storeData  = this.store.get();
      //内存区为空 && 持久化区有数据，复制数据到内存区
      //内存区数据不为空 && 内存区标识值不同于持久层，复制数据
      if((!this.data && storeData)&&
        (this.data && this.data[this.idField] !== storeData[this.idField])){
        this.data = storeData;
      }
    },

    commit:function(){
      this.store.set(this.data);
    },

    rollback:function(){
      this.data = null;
    },

    set:function(data){
      this.data = data;
    },

    setAttr:function(attrName,attrValue){
      this.data[attrName] = attrValue;
    },

    set2Store:function(data){
      this.set(data);
      this.commit();
    },

    get: function(){
      return this.data;
    },

    getAttr: function(attrName){
      return this.data[attrName];
    }
  });

  MemStore.getInstance = function () {
      if (this.instance) {
          return this.instance;
      } else {
          return this.instance = new this();
      }
    };
  return MemStore;
});
/**
 * @author cmli@ctrip.com
 * @description 用来进行跨包跳转时使用
 */

define('PageStore',['cBase', 'cStore', 'cUtility'], function (cBase, AbstractStore, cUtility) {

  var AbstractPageCall = new cBase.Class(AbstractStore, {
    __propertys__: function () {
      this.CONST_TAG = 'tag';
      this.CONST_BACKURL = 'backurl';
      this.CONST_CALLBACK = 'callback';
      this.CONST_CURVALUE = 'curvalue';
    },
    initialize: function ($super, options) {
      $super(options);
    },
    //保存的用户选中的值
    save: function (data) {
      var obj = this.get(),
        self = this;
      if ($.isArray(obj.callback)) {
        $.each(obj.callback, function (i, v) {
          self._callFunByStr(v, data);
        });
      } else {
        this._callFunByStr(obj.callback, data);
      }
    },
    /**
    * 设置当前的配置
    * @param backurl  返回地址
    * @param callback 取到的数据传给那个方法
    * @param curvalue
    */
    setCurrent: function (tag, backurl, callback, curvalue) {
      var obj = {};
      obj[this.CONST_TAG] = tag;
      obj[this.CONST_BACKURL] = backurl;
      obj[this.CONST_CALLBACK] = callback;
      obj[this.CONST_CURVALUE] = curvalue;
      this.set(obj);
    },
    /**
    * 获得当前的配置
    */
    getCurrent: function () {
      return this.get();
    },
    /**
    * 获得当前的值
    */
    getValue: function () {
      var obj = this.get();
      return this._callFunByStr(obj.curvalue);
    },
    //通过字符串调用某个类的方法
    _callFunByStr: function (str, data, scope, callback) {
      scope = scope || TaxiStore;
      var minfo = /^(?:(.*)::)?(.*):(.*)$/i.exec(str),
        Cls, Fun, scopeName;
      if (minfo && minfo.length === 4 && !minfo[1]) {
        Cls = scope[minfo[2]];
        Fun = minfo[3];
        if (Cls && Cls.getInstance) {
          var result = (Cls.getInstance()[Fun])(data);
          callback && callback(result);
          return result;
        }
      } else if (minfo && minfo.length === 4 && minfo[1]) {
        scopeName = minfo[1];
        Cls = minfo[2];
        Fun = minfo[3];
        requirejs([scopeName], function (scope) {
          if (scope && scope[Cls] && scope[Cls].getInstance) {
            var instance = scope[Cls].getInstance();
            var result = instance[Fun] && instance[Fun](data);
            callback && callback(result);
          }
        });
      }
      return false;
    }
  });

  return AbstractPageCall;
});
/**********************************
* @author:       cmli@Ctrip.com
* @description:  组件HeaderView
*/
define('cWidgetHeaderView',['cBase', 'cUICore', 'cWidgetFactory', 'cUtility', 'cSales', 'cHybridFacade'], function (cBase, cUICore, WidgetFactory, cUtlity, cSales, Facade) {
  

  var WIDGET_NAME = 'HeaderView';

  // 如果WidgetFactory已经注册了HeaderView，就无需重复注册
  if (WidgetFactory.hasWidget(WIDGET_NAME)) {
    return;
  }

  //var Publisher = new WidgetFactory.create('Publisher');

  var _setView = function () {
    var view = this.templateFactory(this.data);
    return $(view);
  };

  var _setTemplate = function (config) {
    this.html = '';
    if (config && config.data) {
      // @description 当出现自定义的customtitle时，删除title的模板
      if (config.data.customtitle && this.htmlMap.title) {
        delete this.htmlMap.title;
      }
      else {
        this.htmlMap.title = '<h1><%=title %></h1>';
      }

      for (var key in this.htmlMap) {
        if (config.data[key]) {
          this.html += this.htmlMap[key];
        }
      }
      var style = '',
              cstyle = config.data['style'];
      if (cstyle) {
        style = ' style="' + cstyle + '"';
      }

      this.html = '<header' + style + '>' + this.html + '</header>';
    } 
  };

  var options = options || {};

  options.__propertys__ = function () { };
  /********************************
  * @description: HeaderView初始化，主要是配置rootBox、绑定按钮事件
  */
  options.initialize = function ($super, config) {
    if (config) {
      this.rootBox = config.container || ($('#headerview').length > 0?$('#headerview'):$('<div id="headerview"></div>'));
      this.data = config.data;
      this.html = config.html || this.html;
      if (this.data) {
        this.bindEvents = config.data.bindEvents || function () { };
      }
      _setTemplate.call(this, config);
      config.onShow = this.onShow;
    } else {
      this.rootBox = $('#headerview').length > 0 ? $('#headerview') : $('<div id="headerview"></div>');
      config = {
        onShow: this.onShow
      };
    }

    $super(config);
  };

  /********************************
  * @description: 通过模板和开发者传入的数据生成HeaderView
  */
  options.createHtml = function () {
    if (this.html) {
      this.templateFactory = this.template(this.html);
      return _setView.call(this);
    } else {
      return;
    }
  };

  /********************************
  * @description: onShow时候的回调，绑定headerview上的事件
  */
  options.onShow = function () {
    this.rootBox.off('click');

    if (this.data && this.data.btn && typeof this.bindEvents === "function") {
      this.bindEvents(this.getView());
    }

    if (this.data && this.data.events) {
      this.delegateEvents(this.data.events, this.data.view);
    }

    if (this.data && this.data.commit) {
      var commit = this.data.commit;
      var view = this.getView();
      var self = this;

      var callback = function () {
        commit.callback.call(self.view);
      };
      view.find('#' + commit.id).on('click', callback);

      // ?会导致不能出现吗
      // var Publisher = new WidgetFactory.create('Publisher');
      //Publisher.register({ name: 'commit', callback: callback });
      Facade.register({ tagname: Facade.METHOD_COMMIT, callback: callback });
    }
  };

  /********************************
  * @description:  设置HeaderView数据
  * @param:        [optional]{data.title} String 设置HeaderView的显示的栏目标题
  * @param:        [optional]{data.tel} JSON 设置电话链接按钮 tel:{number: 56973183}
  * @param:        [optional]{data.home} boolean 是否需要显示Home按钮
  * @param:        [optional]{data.btn} JSON {title: "完成", id: 'confirmBtn', classname: 'bluebtn'}
  * @param:        [optional]{data.back} boolean 是否需要显示返回按钮
  * @param:        [optional]{data.custom} String 需要设置的自定义html
  * @param:        [optional]{data.events} JSON 设置需要的按钮点击回调事件 { homeHandler: function, returnHandler: function}
  * @param:        [optional]{data.view} function 当前的作用域constructor
  * @param:        [optional]{data.bindEvents} function($el){} $el是当前headerview的$对象，与btn或custom共同设置
  * @param:        [optional]{data.openAds} boolen 是否显示广告，默认为不显示
  * @param:        [optional]{data.commit} JSON {id: '', callback: ''}
  * @return:       $对象
  *
  * 举例来说 data{title: "选择出发地", home: 'true', back: true, events: {homeHandler: function(){console.log('click home')}}};
  *
  */
  options.set = function (data) {
    if (data) {
      if (this.htmlMap && !this.htmlMap.title)
      {
        this.htmlMap.title = '<h1><%=title %></h1>';
      }
      this.data = data;
      _setTemplate.call(this, { data: data });
      // var view = this.createHtml();
      //如果打开广告配置
      /* if (data.openAds) {
      var AdView = WidgetFactory.create('AdView');
      this.adView = new AdView(data);
      }*/
      this.bindEvents = this.data.bindEvents;
      this.isCreate = false;
      this.hide();
      //this.headerview.status = cBase.;
      // return $(view);
    }
  };

  /********************************
  * @description:  设置HeaderView数据
  * @param:        [optional]{data.title} String 设置HeaderView的显示的栏目标题
  * @param:        [optional]{data.tel} JSON 设置电话链接按钮 tel:{number: 56973183}
  * @param:        [optional]{data.home} boolean 是否需要显示Home按钮
  * @param:        [optional]{data.btn} JSON {name: "完成", id: 'confirmBtn', classname: 'bluebtn'}
  * @param:        [optional]{data.back} boolean 是否需要显示返回按钮
  * @param:        [optional]{data.custom} String 需要设置的自定义html
  * @param:        [optional]{data.events} JSON 设置需要的按钮点击回调事件 { homeHandler: function, returnHandler: function}
  * @param:        [optional]{data.view} function 当前的作用域constructor
  * @param:        [optional]{data.bindEvents} function($el){} $el是当前headerview的$对象，与btn或custom共同设置
  * @param:        [optional]{data.commit} JSON {id: '', callback: ''}
  */
  options.reset = function (data) {
    if (data) {   
      this.set(data);
      this.trigger('onShow');
    }
  };

  /********************************
  * @description: 向HeaderView的控件按钮绑定事件
  */
  options.delegateEvents = function (events, view) {
    if (events) {
      _setBindBtnAction.call(this, '#c-ui-header-home', 'click', events.homeHandler, view);
      _setBindBtnAction.call(this, '#c-ui-header-return', 'click', events.returnHandler, view);
      this.rootBox.find('header').append($('#c-ui-header-return'));
      var self = this;
      var callback = function () {
        events.returnHandler.call(view || self);
      }

      // var Publisher = new WidgetFactory.create('Publisher');
      // Publisher.register({ name: 'back', callback: callback });
      Facade.register({ tagname: Facade.METHOD_BACK, callback: callback });

      // @description 只用来提供给Native导航栏中城市选择按钮回调
      if (events.citybtnHandler) {
        var handler = function () {
          events.citybtnHandler.call(view || self);
        }
        Facade.register({ tagname: Facade.METHOD_CITY_CHOOSE, callback: handler });
      }
    }
  };

  var _setBindBtnAction = function (selector, sign, action, view) {
    this.rootBox.find(selector).on(sign, function () {
      action.call(view || this);
    });
  };

  /********************************
  * @description: 获取HeaderView的$(dom)
  */
  options.getView = function () {
    return this.rootBox;
  };

  /********************************
  * @destription: 更新HeaderView
  */
  options.updateHeader = function (name, val) {
    this.data[name] = val;
    //this.reset(this.data);
    this.set(this.data);
    this.show();
  };
  /********************************
  * @description: 默认的HeaderView模板
  */
  options.html = null;
  options.htmlMap = {
    home: '<i class="icon_home i_bef" id="c-ui-header-home"></i>',
    tel: '<a href="tel:<%=tel.number||4000086666 %>" class="icon_phone i_bef __hreftel__" id="c-ui-header-tel"></a>',
    customtitle: '<div><%=customtitle %></div>',
    title: '<h1><%=title %></h1>',
    back: '<i id="c-ui-header-return" class="returnico i_bef"></i>',
    btn: '<i id="<%=btn.id%>" class="<%=btn.classname%>"><%=btn.title %></i>',
    custom: '<%=custom %>'
  };

  //重写create方法，支持新的html结构
  options.create = function () {
    if (!this.isCreate && this.status !== cUICore.AbstractView.STATE_ONCREATE) {
      this.rootBox = this.rootBox || $('body');
      this.rootBox.empty();
      this.root = $(this.createHtml());
      this.rootBox.append(this.root);
      setTimeout($.proxy(function () {
        cSales.replaceContent(this.root);
      }, this), 200);

      if (!cUtlity.isInApp()) this.rootBox.css('height', this.root.css('height'));

      this.trigger('onCreate');
      this.status = cUICore.AbstractView.STATE_ONCREATE;
      this.isCreate = true;
    }
    //如果配置打开了advertisment
    /* if (this.adView) {
    if (this.data.openAds) {
    //this.adView.trigger('onShow');
    this.adView.show();
    } else {
    this.adView.hide();
    }
    }*/
  };

  options.hideHandler = function ($super) {
    if (cUtlity.isInApp()) {
      if (!this.isHidden)
      {
        Facade.request({ name: Facade.METHOD_SET_NAVBAR_HIDDEN, isNeedHidden: true });
        this.isHidden = true;
      }
    } else {
      this.hide();
    }
  };

  //重写showAction方法，以使其支持app嵌入
  options.showAction = function (callback) {
    if (cUtlity.isInApp()) {
        this.rootBox.hide();
        if (this.isHidden)
        {
          Facade.request({ name: Facade.METHOD_SET_NAVBAR_HIDDEN, isNeedHidden: false}); 
          this.isHidden = false;
        }
      this.saveHead();
    } else {
      this.root.show();
    }
    callback();
  };

  //保存数据到Localstorg,供APP使用
  options.saveHead = function () {
    var head = {
      'left': [],
      'center': [],
      'centerButtons': [],
      'right': []
    }, obj = this.data;

    if (obj.back) {
      head.left.push({ 'tagname': 'back' });
    }
    if (obj.title) {
      head.center.push({ 'tagname': 'title', 'value': obj.title });
    }
    if (obj.subtitle) {
      head.center.push({ 'tagname': 'subtitle', 'value': obj.subtitle });
    }
    if (obj.btn) {
      head.right.push({ 'tagname': 'commit', 'value': obj.btn.title });
    }
    if (obj.tel) {
      head.right.push({ 'tagname': 'call' });
    }
    if (obj.home) {
      head.right.push({ 'tagname': 'home' });
    }
    if (obj.citybtn) {
      var cityBynobj = { "tagname": "cityChoose", "value": obj.citybtn}   
      if (obj.citybtnImagePath)
      {
        cityBynobj.imagePath = obj.citybtnImagePath;
        if (obj.citybtnPressedImagePath)
        {
          cityBynobj.pressedImagePath = obj.citybtnPressedImagePath;
        }
        else
        {
          cityBynobj.pressedImagePath = cityBynobj.imagePath;
        }
      }
      else
      {
        cityBynobj = _.extend(cityBynobj, {"a_icon": "icon_arrowx", "i_icon": "icon_arrowx.png"})
      }
      head.centerButtons.push(cityBynobj);
    }
    if (obj.share) {
      head.right.push({ 'tagname': 'share' });
    }
    if (obj.favorite) {
      head.right.push({ 'tagname': 'favorite' });
    }
    if (obj.favorited) {
      head.right.push({ 'tagname': 'favorited' });
    }
    if (obj.phone) {
      head.right.push({ 'tagname': 'phone' });
    }
    try {
      //window.localStorage.setItem('HEAD', JSON.stringify(head));
      //var date = new Date();
      //window.location.hash += '|L-HEAD-' + date.getTime();

      // ? 需要做URI encode还是JSON.stringify ?
      // var headInfo = window.encodeURIComponent(head);
      var headInfo = JSON.stringify(head);
      // app_refresh_nav_bar(headInfo);
      Facade.request({ name: Facade.METHOD_REFRESH_NAV_BAR, config: headInfo });

    } catch (e) {
      // console.warn('浏览器不支持localStorage');
    }

  };

  //var HeaderView = new cBase.Class(cUICore.AbstractView, options);
  //单例模式
  function HeaderView(propertys) {
    if (HeaderView.instance) {
      HeaderView.instance.reset(propertys);
      return HeaderView.instance;
    } else {
      var Header = new cBase.Class(cUICore.AbstractView, options);
      return HeaderView.instance = new Header(propertys);
    }
  }

  WidgetFactory.register({
    name: WIDGET_NAME,
    fn: HeaderView
  });

});

/**********************************
 * @author:       cmli@Ctrip.com
 * @description:  组件ListView
 */
define('cWidgetListView',['cBase', 'cUICore', 'cWidgetFactory'], function (cBase, cUICore, WidgetFactory) {
    

    var WIDGET_NAME = 'ListView';

    // 如果WidgetFactory已经注册了ListView，就无需重复注册
    if (WidgetFactory.hasWidget(WIDGET_NAME)) {
        return;
    }

    /********************************
    * @description: 将已经创建的dom list改变为哈希表
    */
    var _hashMap = function (domlist) {
        var map = new cBase.Hash();
        for (var i = 0; i < domlist.length; i++) {
            map.add($(domlist[i]).data('hash'), $(domlist[i]));
        }
        return map;
    };

    var options = options || {};

    options.__propertys__ = function () { };

    options.initialize = function ($super, config) {
        // container是listview的容器，所有生产的itemview都会被加到container上去
        if (config.container) {
            this.rootBox = config.container;
        }

        // 无查询结果提示文案;
        this.noResultText = '您还没有记录哦';
        // 是否打开默认空视图
        this.autoEmptyView = (typeof config.autoEmptyView != 'undefined') ? config.autoEmptyView : true;
        if (config.noResultText) {
            this.noResultText = config.noResultText;
        }
        // listview的适配器，同时也是被观察者
        if (config.listadapter) {
            this.listadapter = config.listadapter;
            this.listadapter.regiseterObserver(this);
        }
        if (config.origin) {
            this.origin = config.origin;
        }
        // listview的子view
        if (config.itemView) {
            this.templateFactory = this.template(config.itemView);
        } else {
            throw 'ListView:no item view template';
        }

        // 设置用户自定义的时间绑定和回调
        this.bindItemViewEvent = config.bindItemViewEvent;
        this.onUpdatePrepared = config.onUpdatePrepared;
        this.onUpdateFinished = config.onUpdateFinished;

        $super(config);
    };

    /********************************
    * @description: AbstractView中必须override方法，用来在onCreate中创建具体的view
    */
    options.createHtml = function () {
        return this.update();
    };

    /********************************
    * @description: 加入itemview到container中去
    */
    options.createItemView = function (value, key) {
        var itemview = this.templateFactory(value);
        return $(itemview).addClass('c-item-view').data('hash', key);
    };

    /********************************
    * @description: 当listadapter中map的数据发生更新时，会比对dom和map中含有hash值，如果hash值相同则留用
    *               如果不同，以listadapter为主，listadapter有则创建新的itemview，无则删除dom
    */
    options.update = function () {
        var itemlist = this.rootBox.find('.c-item-view');
        this.map = _hashMap(itemlist);

        // 在Update之前进行的动作
        if (this.onUpdatePrepared && typeof this.onUpdatePrepared === 'function') {
            this.onUpdatePrepared();
        }

        var tempHash = new cBase.Hash();
        var self = this;
        var handler = function (value, key, index) {
            var itemview = self.map.getItem(key);
            if (!itemview) {
                value.C_ITEM_INDEX = index;
                value.__origin__ = self.origin;
                itemview = self.createItemView(value, key);
                self.bindItemViewEvent(itemview);
            }
            tempHash.add(key, itemview);
        };
        this.listadapter.map.each(handler);

        this.rootBox.hide();
        this.rootBox.empty();
        if (this.listadapter.list.length > 0) {
            var appendHandler = function (value, key, index) {
                self.rootBox.append(value);
            };
            tempHash.each(appendHandler);
        } else {
            if (this.autoEmptyView) {
              this.rootBox.append('<div class="cui-load-error"><div class="cui-i cui-wifi cui-exclam"></div>' + this.noResultText + '</div>');
            }
        }

        this.rootBox.show();

        // 在Upage之后进行的动作
        if (this.onUpdateFinished && typeof this.onUpdateFinished === 'function') {
            this.onUpdateFinished();
        }
    };

    /********************************
    * @description: 在update之前的回调
    */
    options.onUpdatePrepared = function () { };

    /********************************
    * @description: 在update完成之后的回调
    */
    options.onUpdateFinished = function () { };

    /********************************
    * @description: 开启数据为空时自动显示预订视图功能
    */
    options.openAutoEmptyView = function () {
        this.autoEmptyView = true;
    }
    /********************************
    * @description: 关闭数据为空时自动显示预订视图功能
    */
    options.closeAutoEmptyView = function () {
        this.autoEmptyView = false;
    }
    var ListView = new cBase.Class(cUICore.AbstractView, options);

    // return ListView;
    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: ListView
    });
});
define('cWidgetTipslayer',['cBase', 'cUICore', 'cWidgetFactory', 'cUIScroll'], function (cBase, cUICore, WidgetFactory, Scroll) {
  
  var WIDGET_NAME = 'TipsLayer';

  // 如果WidgetFactory已经注册了ListView，就无需重复注册
  if (WidgetFactory.hasWidget(WIDGET_NAME)) {
    return;
  }

  /**
  * 显示控件，初始化时传入title与html即可
  */
  var TipsLayer = new cBase.Class(cUICore.Layer, {
    __propertys__: function () {
      this.showTitle = true;
      this.contentDom;
      this.title = '';
      this.body = '';
      this.mask = new cUICore.Mask({
        classNames: [cUICore.config.prefix + 'opacitymask']
      });
      var scope = this;
      this.mask.addEvent('onShow', function () {
        this.setzIndexTop(-1);
        $(window).bind('resize', this.onResize);
        this.onResize();
        var scope1 = this;
        this.root.bind('click', function () {
          scope1.hide();
          scope1.root.unbind('click');
          scope.hide();
        });

        //this.root.bind('click',)
      });

      this._loadButtonHtml = function () {
        if (this.buttons.length == 0) {
          return "";
        }
        var btnHtml = ['<div class="cui-roller-btns">'];
        $.each(this.buttons, function (index, item) {
          var cls = 'cui-btns-sure';
          //如果没传按钮类型,认为是确认按钮
          if (item.type == 'cancle') {
            cls = 'cui-btns-cancle';
          }
          btnHtml.push('<div class="cui-flexbd ' + cls + '">' + item.text + '</div>');
        });
        btnHtml.push('</div>');
        return btnHtml.join('')
      },

            this.html = '';
    },
    initialize: function ($super, options) {

      $super({
        onCreate: function () {

        },
        onShow: function () {
          this.title = options.title || '';
          this.buttons = options.buttons || [];
          this.html = options.html || '';

          if (typeof options.showTitle != 'undefined') {
            this.showTitle = options.showTitle;
          }

          this.html = $(this.html);
          this.btns = $(this._loadButtonHtml());

          //新增头尾
          this.header = options.header;
          this.footer = options.footer;

          this.buttons = options.buttons || [];

          this.contentDom.html([
                        '<div class="cui-pop-box">',
                             '<div class="cui-hd">' + this.title + '<div class="lab-close-area"><span class="cui-top-close">×</span></div></div>',
                             '<div class="cui-bd" style="overflow: hidden; position: relative; background-color: #fafafa; width: 100%;">',
                             '</div>',
                        '</div>'
                        ].join(''));

          if (options.width) {
            this.contentDom.find('.cui-pop-box').css({
              'width': options.width + 'px'
            });
          }

          this.mask.show();
          this.reposition();

          this.closeDom = this.contentDom.find('.cui-top-close').parent();
          this.body = this.contentDom.find('.cui-bd');

          //新增头尾
          if (this.header) this.body.before($(this.header));
          if (this.footer) this.body.after($(this.footer));

          if (this.html.length > 1) {
            this.html = $('<div style="width: 100%;"></div>').append(this.html);
          }
          this.html.css('background-color', 'white')

          //检测高度，高度过高就需要处理
          this.body.append(this.html);

          var wh = parseInt($(window).height() * 0.7);
          var _h = options.height || wh;
          var contentHeight = this.html.height();

          if (_h > wh) _h = wh;

          if (_h < contentHeight) {
            this.body.css({
              'height': _h + 'px'
            });
          }
        
          if (!this.showTitle) {
            this.contentDom.find('.cui-hd').hide();
          }

          var scrollParam = {
            wrapper: this.body,
            scroller: this.html
          };

          $.extend(scrollParam, options);


          this.s = new Scroll(scrollParam);

          this.contentDom.find('.cui-pop-box').append(this.btns);

          var scope = this;
          this.closeDom.on('click', function () {
            scope.hide();
          });

          $.each(this.btns.children(), function (index, item) {
            var handler = scope.buttons[index].click;
            $(item).on('click', function () {
              handler.call(scope);
            });
          });

          this.setHtml = function (html) {
            scope.body.html(html);
          };

          var s = '';
        },
        onHide: function () {
          this.s && this.s.destroy();
          this.mask.hide();
          this.closeDom.off('click');
          this.root.remove();
          this.mask.root.remove();
        }
      })
    }
  });

  WidgetFactory.register({
    name: WIDGET_NAME,
    fn: TipsLayer
  });


});
define('cWidgetInputValidator',['cBase', 'cUICore', 'cWidgetFactory', 'cUtility', 'libs'], function (cBase, cUICore, WidgetFactory, util) {
  

  var validate = util.validate;

  var WIDGET_NAME = 'InputValidator';

  // 如果WidgetFactory已经注册了ListView，就无需重复注册
  if (WidgetFactory.hasWidget(WIDGET_NAME)) {
    return;
  }

  /**
  * 显示控件，初始化时传入title与html即可
  */
  var InputValidator = new cBase.Class(cUICore.Layer, {
    __propertys__: function () {
      this.TypeMsg = {
        idCard: '身份证格式错误',
        num: '不是数字',         //数字
        email: 'email格式错误',
        phone: '手机格式错误',
        chinese: '不是中文', //2-6位中文
        password: '密码格式错误' //6-32位密码验证
      };
      this.validatorArr = {};
    },
    initialize: function ($super, opts) {
      opts = opts || {};
      $super(opts);

      this.requredMsg = opts.requredMsg || '该项必填';
      this.rangeMsg = opts.rangeMsg || '您输入的字符范围错误';
      this.regexMsg = opts.regexMsg || '格式错误';
      this.compareMsg = opts.compareMsg || '对比不成立';
      this.els = opts.els || $('.formValidate'); //需要验证的控件
      this.msgPosition = opts.msgPosition || 'bottom'
      //是否显示错误信息
      this.isShowMsg = opts.isShowMsg || false;

      this.init();
    },
    init: function () {
      for (var i = 0, len = this.els.length; i < len; i++) {
        var el = $(this.els[i]);
        this.initItem(el);
      }
    },
    initItem: function (el, insertType) {
      var scope = this;
      if (typeof el == 'string') el = $('#' + el);

      //如果不存在cfg信息则直接退出后续流程
      var cfg = el.attr('data-cfg');
      if (!cfg || cfg.length == 0) return false;

      //            cfg = JSON.parse(cfg);
      cfg = eval('(' + cfg + ')');

      if (cfg.check !== false) cfg.check = true;

      //临时添加的验证，当动态添加一个input时候可以验证
      if (insertType) cfg.check = true;

      //若是未开启验证便退出该项初始化，进入下轮验证（未定义的话视为开启）
      if (cfg.check === false) return false;

      //首先定义好控件id
      cfg.id = el.attr('id') || '_' + Math.random();
      cfg.el = el;

      //该表单的验证的函数存于此
      cfg.validate = function () {
        scope.funcValidate(cfg);
      };
      this.validatorArr[cfg.id] = cfg; //生成相关验证对象

      var s = '';
    },
    validate: {
      //必填验证
      requred: function (val) {
        if (val == '') return false;
        return true;
      },
      regex: function (val, r) {
        if (r.test(val)) return true;
        return false;
      },
      range: function (val, rangeObj) {
        var rangeArr = rangeObj.split('|');
        if (rangeArr.length != 3) {
          console.log('范围参数错误');
          return false;
        }
        return this['_' + rangeArr[0]](val, rangeArr[1], rangeArr[2]);
      },
      _num: function (val, min, max) {
        val = parseInt(val);
        if (val > min && val < max) return true;
        return false;
      },
      _str: function (val, min, max) {
        if (val.length > min && val.length < max) return true;
        return false;
      },
      _date: function (val, min, max) {
        //日期稍后

        return true
      },
      compare: function (v1, compareObj) {
        var compareArr = compareObj.split('|');
        if (compareArr.length != 3) {
          console.log('范围参数错误');
          return false;
        }
        return this['_c' + compareArr[0]](v1, $('#' + compareArr[1]).val(), compareArr[2]);
      },
      _cnum: function (v1, v2, flag) {
        v1 = parseInt(v1);
        v2 = parseInt(v2);
        if (flag == '<') {
          if (v1 < v2) return true;
        } else if (flag == '=') {
          if (v1 == v2) return true;
        } else if (flag == '>') {
          if (v1 > v2) return true;
        }
        return false;
      },
      _cstr: function (v1, v2, flag) {
        v1 = v1.length;
        v2 = v2.length;
        if (flag == '<') {
          if (v1 < v2) return true;
        } else if (flag == '=') {
          if (v1 == v2) return true;
        } else if (flag == '>') {
          if (v1 > v2) return true;
        }
        return false;
      },
      _cdate: function (v1, v2, flag) {

        //日期暂时不管
        return true;
      }
    },
    funcValidate: function (cfg) {

      //取消事件不执行下面逻辑
      //若是没有开启验证便忽略之
      if (this.validatorArr[cfg.id] === undefined) return false;

      var val = cfg.el.val() || cfg.el.html().replace(/(^\s*)|(\s*$)/g, ""); //获取文本框的值
      var validateResult = {}; //用于保存验证结果的对象
      validateResult.isPass = true; //0初始化，1成功，-1错误
      validateResult.el = cfg.el; //保存验证对象
      validateResult.id = cfg.id; //保存验证对象
      validateResult.errorItem = {}; //保存验证失败的项目，一般只有一个

      //开启不需要验证/取消验证
      if (this.validatorArr[cfg.id].check === false) {
        this.validatorArr[cfg.id].result = validateResult;
        return false;
      }

      //首先进行非空验证
      if (cfg.requred) {
        validateResult.errorItem.requred = this.validate.requred(val);
        if (validateResult.errorItem.requred === true) validateResult.isPass = true;
        else {
          validateResult.isPass = false;
          //                    validateResult.msg = cfg.errorMsg || this.requredMsg;
          validateResult.msg = this.requredMsg;
        }
      }

      //type优先，此处的type完全是一些正则表达式
      if (validateResult.isPass && typeof cfg.type == 'string' && val != '') {
        //                validateResult.errorItem[cfg.type] = this.validate.regex(val, this.regexEnum[cfg.type]);

        //此处由小熊提议使用同一套验证代码
        var type = cfg.type;
        type = 'is' + type.substr(0, 1).toUpperCase() + type.substr(1, type.length);
        validateResult.errorItem[cfg.type] = validate[type](val);

        if (validateResult.errorItem[cfg.type] === true) validateResult.isPass = true;
        else {
          validateResult.isPass = false;
          //                    validateResult.msg = cfg.errorMsg || this.TypeMsg[cfg.type] || '格式错误';
          validateResult.msg = this.TypeMsg[cfg.type] || '格式错误';
        }
      }

      //当第一步验证通过便执行自身正则验证
      if (validateResult.isPass && cfg.regexObj && val != '') {
        //当未指定type时候，便执行页面中的正则表达式对象
        validateResult.errorItem.regex = this.validate.regex(val, cfg.regexObj);
        if (validateResult.errorItem.regex === true) validateResult.isPass = true;
        else {
          validateResult.isPass = false;
          validateResult.msg = cfg.errorMsg || this.regexMsg;
        }
      }

      //当第二步验证通过便执行范围验证
      if (validateResult.isPass && cfg.rangeObj && val != '') {
        validateResult.errorItem.range = this.validate.range(val, cfg.rangeObj);
        if (validateResult.errorItem.range === true) validateResult.isPass = true;
        else {
          validateResult.isPass = false;
          validateResult.msg = cfg.errorMsg || this.rangeMsg;
        }
      }

      //第三步执行对比运算，由于id未必唯一，此处需要注意
      if (validateResult.isPass && cfg.compareObj && val != '') {
        validateResult.errorItem.compare = this.validate.compare(val, cfg.compareObj);
        if (validateResult.errorItem.compare === true) validateResult.isPass = true;
        else {
          validateResult.isPass = false;
          validateResult.msg = cfg.errorMsg || this.compareMsg;
        }
      }
      this.validatorArr[cfg.id].result = validateResult;
    },
    showMsg: function (errorArr) {
      if (this.msgTimer) clearTimeout(this.msgTimer);
      var body = $('body')
      for (var i = 0, len = errorArr.length; i < len; i++) {
        var tips = $('#' + errorArr[i].id + 'Tips');
        if (!tips[0]) {
          tips = $('<div class="validateTips validateError" id="' + errorArr[i].id + 'Tips"><div class="triangle_icon"><div class="before"></div><div class="after"></div></div>' + errorArr[i].msg + '</div>');

          var offset = errorArr[i].el.offset();
          var height = parseInt(errorArr[i].el.height());
          var width = parseInt(errorArr[i].el.width());
          var l = offset.left;
          var t = offset.top;

          if (this.msgPosition == 'bottom') {
            tips.addClass('posBottom');
            t += height + 4;
          } else if (this.msgPosition == 'right') {
            tips.addClass('posRight');
            l += width + 6;
          } else if (this.msgPosition == 'top') {
            tips.addClass('posTop');
            t += height * (-1) - 8;
          }
          tips.css({ left: l, top: t });
          body.append(tips);
        }
      }
      //两秒后提示需要消失
      this.msgTimer = setTimeout(function () {
        $('.validateTips').remove();
      }, 3000);
    },
    validateAll: function (success, error, scope) {
      for (var k in this.validatorArr) {
        var v = this.validatorArr[k];
        v.validate();
      }
      //如果不全等于true就会返回错误的项目
      var r = this.getValidatorState();

      if (r === true) {
        typeof success == 'function' && success.call(scope);
      } else {
        if (this.isShowMsg) {
          this.showMsg(r);
        }
        typeof error == 'function' && error.call(scope, r);
      }
    },
    removeValidator: function (id) {
      if (id && this.validatorArr[id]) {
        var sa = this.validatorArr[id];
        this.validatorArr[id]['check'] = false; //将其验证状态置为false 
        var s = '';
      }
    },
    addValidator: function (el) {
      if (typeof el == 'string') el = $('#' + el);
      this.initItem(el, 'add');
    },
    getValidatorState: function () {
      var isPass = true;
      var errorItem = []; //错误的项目
      for (var k in this.validatorArr) {
        if (this.validatorArr[k].result.isPass == false) {
          isPass = false;
          errorItem.push(this.validatorArr[k].result)
        }
      }
      if (isPass) return true;
      return errorItem;
    }
  });

  WidgetFactory.register({
    name: WIDGET_NAME,
    fn: InputValidator
  });


});
/**********************************
 * @deprecated from H5V2.2S5
 **********************************

/**********************************
 * @author:       cmli@Ctrip.com
 * @description:  组件Publisher
 *
 * 将WebApp部分接口暴露出来，绑定在window对象上
 */
define('cWidgetPublisher',['cUtility', 'cWidgetFactory', 'CommonStore'], function(Util, WidgetFactory, CommonStore){
  

  var WIDGET_NAME = 'Publisher';

  var appLock = false;

  // 如果WidgetFactory已经注册了HeaderView，就无需重复注册
  if (WidgetFactory.hasWidget(WIDGET_NAME)) {
    return;
  }

  var Publisher = Publisher || {};

  // defaultFn.register会注册的Handler
  var defaultRegisterHandler = {

    non_member_login: function(options){
      defaultCallback.non_member_login = function(params){
        options.callback(params);
      }
    },

    locate: function(options){
      defaultCallback.locate = function(params){
        try{
          var data = params;
          if (typeof params === 'string') {
            data = JSON.parse(params);
          }

          options.success(data);

        }catch(e){
          options.error(true, '定位失败');
        };
      };
    },

    login: function(options){
      defaultCallback.login = function(params){

        if (typeof params === 'string') {
          params = JSON.parse(params);
        }

        var userStore = CommonStore.UserStore.getInstance();
        var userInfo = userStore.getUser();
        userStore.setUser(params.data);

        var headStore = CommonStore.HeadStore.getInstance();
        var headInfo = headStore.get();
        headInfo.auth = params.data.Auth;
        headStore.set(headInfo);

        // userStore.getUser();

        if (typeof options.success === 'function') {
          options.success();
        }
      }
    },

    back: function(options){
      defaultCallback.back = options.callback;
    },

    commit: function(options){
      defaultCallback.commit = options.callback;
    }
  };

  // defaultFn.callback会调用的不同的Callback
  var defaultCallback = {
    refresh: function(){
      window.location.reload();
    }
  };

  // defaultFn.callback会调用的不同的Handler
  var defaultHandler = {
    non_member_login: function(options){
      if (typeof defaultCallback.non_member_login === 'function') {
        defaultCallback.non_member_login(options);
      };
    },

    locate: function(options){
      if(typeof defaultCallback.locate === 'function'){
        defaultCallback.locate(options);
      }
    },

    login: function(params){
      if(typeof defaultCallback.login === 'function'){
        defaultCallback.login(params);
      }
    },

    back: function(){
      if(typeof defaultCallback.back === 'function'){
        defaultCallback.back();
      }
    },

    commit: function(){
      if(typeof defaultCallback.commit === 'function'){
        defaultCallback.commit();
      }
    }
  };

  var _urldecode = function(str){
    var tempStr = str.replace(/\+/g, '%20');
    return window.decodeURIComponent(tempStr);

    //return decodeURIComponent((str + '').replace(/%(?![\da-f]{2})/gi, function () {
    //    return '%25';
    //}).replace(/\+/g, '%20'));
  };

  // 定义好的需要绑定在window上的方法
  var defaultFn = {
    callback: function(param){

      if (appLock) return;

      var options = param;
      if (typeof(param) === "string") {
        try{
          options = JSON.parse(window.decodeURIComponent(param));
          // param = _urldecode(param);
          // options = JSON.parse(param);
        }catch(e){
          setTimeout(function() {console.error('参数错误');}, 0);
        }
      }

      document.activeElement.blur();

      // alert(param);

      if(typeof defaultHandler[options.tagname] === 'function'){
        defaultHandler[options.tagname](options.param);
      }
    },
  };

  var _registerFn = function(facade){
    for(var key in defaultFn){
      facade[key] = facade[key] || defaultFn[key];
    }
  };

  // ------------------------------------------------
  // --------------定义Publisher具体暴露的API--------

  Publisher.setApi = function(){
    if (Util.isInApp()) {
      var app = window.app = window.app || {};
      _registerFn(app);
    }
  };

  // 调用defaultRegisterHandler将回调方法写到defaultCallback中
  Publisher.register= function(options){
    if (Util.isInApp() && typeof defaultRegisterHandler[options.name] === 'function'){
      defaultRegisterHandler[options.name](options);
    }
  };

  Publisher.lock = function(){
    if (Util.isInApp()) {
      appLock = true;
    }
  };

  Publisher.unlock = function(){
    if (Util.isInApp()) {
      appLock = false;
    };
  };

  Publisher.requestEntryInfo = function(){
    if (Util.isInApp()) {
      app_entry();
    }
  };

  Publisher.requestAnomyousUser = function(){
    if (Util.isInApp()) {
      app_non_member_login();
    }
  };

  // 订单填写页|非登陆状态出现登陆按钮 ====== "UseCarNeedLogin"
  // 送达地点|常用地址    =================== "UseCarCommonAddresses"
  Publisher.monitor = function(eventName){
    if (Util.isInApp()) {
      app_log_event(eventName);
    }
  };

  Publisher.sendHotelInfo = function(hotelId, name, cityId, isOverSea){
    if (Util.isInApp()) {
      app_go_to_hotel_detail(hotelId, name, cityId, isOverSea);
    }
  };

  Publisher.requestAutoLogin = function(){
    if (Util.isInApp()) {
      app_member_auto_login();
    }
  };

  WidgetFactory.register({
    name: WIDGET_NAME,
    fn: Publisher
  });
});

define('cWidgetAbstractCalendar',['cCoreInherit', 'cUIAbstractView', 'cWidgetFactory'], function (cCoreInherit, AbstractView, WidgetFactory) {
  "user strict";

  var WIDGET_NAME = 'Abstract.Calendar';

  // 如果WidgetFactory已经注册了ListView，就无需重复注册
  if (WidgetFactory.hasWidget(WIDGET_NAME)) {
    return;
  }

  var AbstractCalendar = new cCoreInherit.Class(AbstractView, {
    __propertys__: function () {
      this.CONSTANT = {
        CALENDAR_CHINESE_LUNAR_INFO: [
          0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
          0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
          0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
          0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
          0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
          0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
          0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
          0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
          0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
          0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
          0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
          0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
          0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
          0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
          0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
          0x14b63],

        CALENDAR_CHINESE_WEEKDAY: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        CALENDAR_CHINESE_NUMBER: ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
        CALENDAR_CHINESE_CARRT: ['初', '十', '廿', '卅', '　'],
        CALENDAR_CHINESE_HOLIDAY: {
          '1230': '除夕',
          '0101': '初一',
          '0115': '元宵',          
          '0505': '端午',
          '0707': '七夕',
          '0815': '中秋',
          '0909': '重阳'
        },

        CALENDAR_COMMON_HOLIDAY: {
          '0101': '元旦',
          '0214': '情人节',
          '0501': '五一',
          '1001': '国庆',
          '1225': '圣诞节'
        },

        CALENDAR_WEEKDAY_NAME: {
          0: '星期日',
          1: '星期一',
          2: '星期二',
          3: '星期三',
          4: '星期四',
          5: '星期五',
          6: '星期六'
        },

        CALENDAR_WEEKDAY_SHORTNAME: {
          0: '周日',
          1: '周一',
          2: '周二',
          3: '周三',
          4: '周四',
          5: '周五',
          6: '周六'
        },

        CALENDAR_WEEKDAY_SHORTNAME2: {
          0: '日',
          1: '一',
          2: '二',
          3: '三',
          4: '四',
          5: '五',
          6: '六'
        },
        CALENDAR_INIT_DATE: 1,
        CALENDAR_MONTH: 5,
        INIT_DATE_TIME: {
          H: 0,
          M: 0,
          S: 0,
          MS: 0
        },

        CALENDAR: 'calendar'
      };
    },
    
    initialize: function ($super, options) {
      if (this.isLeapYear(this.startMonth.getFullYear())|| this.isLeapYear(this.startMonth.getFullYear() - 1))
      {
          this.CONSTANT.CALENDAR_COMMON_HOLIDAY['0404'] = '清明';
          delete this.CONSTANT.CALENDAR_COMMON_HOLIDAY['0405'];           
      }
      else
      {
          this.CONSTANT.CALENDAR_COMMON_HOLIDAY['0405'] = '清明';
          delete this.CONSTANT.CALENDAR_COMMON_HOLIDAY['0404'];    
      }
      $super(options);
    },    

    setCalendarDate: function(dateObj){
      this.dateObj = (dateObj !== 'undefined') ? dateObj : new Date();
      this.SY = this.dateObj.getFullYear();
      this.SM = this.dateObj.getMonth();
      this.SD = this.dateObj.getDate();
      this.lunarInfo = this.CONSTANT.CALENDAR_CHINESE_LUNAR_INFO;
    },

    //传回农历 y年闰哪个月 1-12 , 没闰传回 0
    leapMonth: function (year) {
      return this.lunarInfo[year - 1900] & 0xf;
    },

    //传回农历 y年m月的总天数
    monthDays: function (year, month) {
      return (this.lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
    },

    leapDays: function (year) {
      if (this.leapMonth(year)) {
        return (this.lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
      } else {
        return 0;
      }
    },

    //传回农历 y年的总天数
    lYearDays: function (y) {
      var sum = 348;
      for (var i = 0x8000; i > 0x8; i >>= 1) {
        sum += (this.lunarInfo[y - 1900] & i) ? 1 : 0;
      }
      return sum + this.leapDays(y);
    },

    //算出农历, 传入日期对象, 传回农历日期对象
    //该对象属性有 .year .month .day .isLeap .yearCyl .dayCyl .monCyl
    Lunar: function(dateObj) {
      var i,
      leap = 0,
      temp = 0,
      lunarObj = {};
      var baseDate = new Date(1900, 0, 31);
      var offset = (dateObj - baseDate) / 86400000;
      lunarObj.dayCyl = offset + 40;
      lunarObj.monCyl = 14;
      for (i = 1900; i < 2050 && offset > 0; i++) {
        temp = this.lYearDays(i);
        offset -= temp;
        lunarObj.monCyl += 12;
      }
      if (offset < 0) {
        offset += temp;
        i--;
        lunarObj.monCyl -= 12;
      }

      lunarObj.year = i;
      lunarObj.yearCyl = i - 1864;
      leap = this.leapMonth(i);
      lunarObj.isLeap = false;
      for (i = 1; i < 13 && offset > 0; i++) {
        if (leap > 0 && i === (leap + 1) && lunarObj.isLeap === false) {
          --i;
          lunarObj.isLeap = true;
          temp = this.leapDays(lunarObj.year);
        } else {
          temp = this.monthDays(lunarObj.year, i);
        }
        if (lunarObj.isLeap === true && i === (leap + 1)) {
          lunarObj.isLeap = false;
        }
        offset -= temp;
        if (lunarObj.isLeap === false) {
          lunarObj.monCyl++;
        }
      }

      if (offset === 0 && leap > 0 && i === leap + 1) {
        if (lunarObj.isLeap) {
          lunarObj.isLeap = false;
        } else {
          lunarObj.isLeap = true;
          --i;
          --lunarObj.monCyl;
        }
      }

      if (offset < 0) {
        offset += temp;
        --i;
        --lunarObj.monCyl;
      }
      lunarObj.month = i;
      lunarObj.day = offset + 1;
      return lunarObj;
    },

    //中文日期
    cDay: function (m, d) {
      var nStr1 = this.CONSTANT.CALENDAR_CHINESE_NUMBER;
      var nStr2 = this.CONSTANT.CALENDAR_CHINESE_CARRT;
      var s;
      if (m > 10) {
        s = '十' + nStr1[m - 10];
      } else {
        s = nStr1[m];
      }
      s += '月';
      switch (d) {
        case 10:
          s += '初十';
          break;
        case 20:
          s += '二十';
          break;
        case 30:
          s += '三十';
          break;
        default:
          s += nStr2[Math.floor(d / 10)];
          s += nStr1[d % 10];
      }
      return s;
    },

    solarDay2: function (date) {
      this.setCalendarDate(date);
      var sDObj = new Date(this.SY, this.SM, this.SD);
      var lDObj = this.Lunar(sDObj);
      var tt = (lDObj.month >= 10 ? lDObj.month : '0' + lDObj.month) + "" + (lDObj.day >= 10 ? lDObj.day : '0' + lDObj.day);
      lDObj = null;
      return tt;
    },

    weekday: function () {
      var day = this.CONSTANT.CALENDAR_CHINESE_WEEKDAY;
      return day[this.dateObj.getDay()];
    },

    YYMMDD: function () {
      var dateArr = [this.SY, '年', this.SM + 1, '月', this.SD, '日'];
      return dateArr.join('');
    },

    _isDate: function(obj){
      var types = Object.prototype.toString.call(obj);
      return types === '[object Date]';

    },

    _objectKey: function(obj){
      var keys = [];
      if (obj) for (var i in obj) {
        if (obj.hasOwnProperty(i)) keys.push(i);
      }
      return keys;
    },

    //是否闰年
    isLeapYear :function(year)
    {
        if(year === 0) {
            return false;
        }                
        else {
            if( year%4 != 0 )
                return false;
            else if(year%100 == 0 )
                if(year%400 != 0 )
                    return false;
        }
        return true;
    },
  });
  


  WidgetFactory.register({
    name: WIDGET_NAME,
    fn: AbstractCalendar
  });

});
define('cWidgetCalendar',['cCoreInherit', 'cUtility', 'cUIBase', 'cUIHashObserve', 'cWidgetFactory', 'cWidgetAbstractCalendar'], function (cCoreInherit, util, Tools, HashObserve, WidgetFactory) {
  "user strict";

  var WIDGET_NAME = 'Calendar';

  // 如果WidgetFactory已经注册了ListView，就无需重复注册
  if (WidgetFactory.hasWidget(WIDGET_NAME)) {
    return;
  }

  var AbstractCalendar = WidgetFactory.create('Abstract.Calendar');

  var Calendar = new cCoreInherit.Class(AbstractCalendar, {
    __propertys__: function () {
      this.chineseHoliday = this.CONSTANT.CALENDAR_CHINESE_HOLIDAY;
      this.holiday = this.CONSTANT.CALENDAR_COMMON_HOLIDAY;
      this.DAYTITLE = this.CONSTANT.CALENDAR_WEEKDAY_SHORTNAME;     //按周排布
      this.SDAYTITLE = this.CONSTANT.CALENDAR_WEEKDAY_SHORTNAME2;     //周短名称
      this.DAYTITLE2 = this.CONSTANT.CALENDAR_WEEKDAY_NAME;

      this.addClass(Tools.config.prefix + this.CONSTANT.CALENDAR);
      this.startMonth = util.getServerDate();       //开始月份
      this.startMonth.setDate(this.CONSTANT.CALENDAR_INIT_DATE);
      this.Months = this.CONSTANT.CALENDAR_MONTH;       //显示几个月
      this.validStartDate = util.getServerDate();     //有效选择开始时间
      this.validStartDate.setHours(this.CONSTANT.INIT_DATE_TIME.H, this.CONSTANT.INIT_DATE_TIME.M, this.CONSTANT.INIT_DATE_TIME.S, this.CONSTANT.INIT_DATE_TIME.MS);
      this.validEndDate;                  //有效选择结束时间
      this.date;                      //被选中时间
      this.dateVal = {};                  //时间值
      this.titledom;                    //titledom
      this.leftback;                    //leftback
      this.cls = [this.CONSTANT.CALENDAR];          //类
      this.title;                       //标题
      this.noabsolute = false;                //定位方式不是绝对定位
      this.curDate;                     //当前时间
      this.dateDoms = {};
      this._chineseHoliday = {};
      this.html;
      //      this.windowResizeHander;

      this.clickEnabled = true;
      this.msg = "";

      this.callback = function () {
      };
      this.hashObserve = new HashObserve({
        hash: this.id,
        callback: function () {
          this._hide();

        },
        scope: this
      });

      this.animatSwitch = false;
      this.timeNum = 250;
    },
    initialize: function ($super, options) {
      this.setOption(function (k, v) {
        switch (k) {
          case 'Months':
          case 'timeNum':
          case 'date':
          case 'curDate':
          case 'root':
          case 'callback':
          case 'title':
          case 'noabsolute':
          case 'msg':
          case 'clickEnabled':
          case 'animatSwitch':
            this[k] = v;
            break;
          case 'cls':
            this.cls.push(v);
            break;
          case 'validStartDate':
          case 'validEndDate':
            this[k] = v;
            this[k].setHours(0, 0, 0, 0);
            break;
          case 'startMonth':
            this[k] = v;
            this[k].setDate(1);
            break;
        }
      });
      $super(options);
      this.buildEvent();
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
    buildElement: function () {
      this.titledom = this.root.find('header');
      this.leftback = this.root.find('#js_return');
    },
    onCreate: function () {
      this.selectedDate();
      this.buildElement();
      this.buildElementsEvent();
      if (!this.noabsolute) {
        this.root.css({
          position: 'absolute'
        });
      }
      this.windowResizeHander = $.proxy(this.position, this);
    },
    onShow: function () {

      //为了开启动画的牺牲
      this.root.css({ top: 0, left: 0, width: '100%' });

      $(window).bind('resize', this.windowResizeHander);

      this.setzIndexTop();
      this.hashObserve.start();

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
    onHide: function ($super) {
      $(window).unbind('resize', this.windowResizeHander);
      this.hashObserve.end();
    },
    createHtml: function () {
      return this.createCalendar();
    },
    buildElementsEvent: function () {
      var self = this;
      if (this.clickEnabled) {
        this.root.delegate('.cui_cld_daybox li', 'click', function () {
          b = $(this);
          if (!b.hasClass('valid')) {
            b = b.closest('.valid');
          }
          var date = b.attr('data-date');
          if (date) {
            date = util.Date.parse(date).valueOf();
            if (self.isAccordBound(date)) {
              self._setDate(date, b);
            }
          } else {
            return;
          }
        });
      }

      this.root.delegate('#js_return', 'click', $.proxy(function () {

        this._hide();

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
        date.setHours(0, 0, 0, 0);
        if (compare) {
          compare.setHours(0, 0, 0, 0);
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
      }
      return true;
    },
    _setDate: function (date, el) {
      var rel = this.root.find('.' + this.buildSelectCls(this.curDate));
      //if (rel.length) {
      rel.each($.proxy(function (k, v) {
        var el = $(v);
        el.html(this.formatTitle(util.Date.parse(rel.attr('data-date')).valueOf()));
        el.removeClass(this.buildSelectCls(this.curDate));
        el.removeClass(this.buildSelectCls());
      }, this));
      this.dateDoms[this.curDate] = el;
      var tel = $(el);
      var formatTitle,
                self = this,
                format = this.date[this.curDate].title;
      if (typeof format === 'function') {
        formatTitle = this.formatTitle2(format);
      } else {
        formatTitle = this.formatTitle;
      }
      tel.html(formatTitle.call(this, date));
      tel.removeClass('cui_cld_dayfuture');
      tel.removeClass('cui_cld_day_hint');
      tel.addClass('cui_cld_day_havetxt');
      tel.addClass(this.buildSelectCls(this.curDate));
      tel.addClass(this.buildSelectCls());
      this.dateVal[this.curDate] = date;
      this.callback && this.callback.call(this, date, this.curDate, this.dateVal, this.getDateInfo(date), this.calendarend);
      //}
    },
    setCurDate: function (curDate) {
      this.curDate = curDate;
      this.create();
      var title = this.getCurTitle();
      this.titledom.html(title);
    },
    getEndDate: function () {
      return this.calendarend;
    },
    buildSelectCls: function (suffix) {
      return suffix ? 'selected-' + suffix : 'cui_cld_daycrt';
    },
    getCurTitle: function () {
      var dateOption = this.date[this.curDate],
                title = '';
      if (dateOption) {
        title = dateOption.headtitle || this.title;
      }
      return title || this.title;
    },
    createCalendar: function () {
      var html = [],
                Month,
                title = this.getCurTitle(),
                isInApp = util.isInApp(),
                appStyle = isInApp ? ' style=" margin-top: 0"' : '';

      if (this.title && !isInApp) {
        html.push([
                    '<header>',
                    '<h1>' + title + '</h1><i class="returnico i_bef" id="js_return"></i>',
                    '</header>'
                ].join(''));
      }
      html.push([
                '<article class="cont_wrap"',
                appStyle,
                '><div class="cui_cldwrap">'
            ].join(''));

      html.push(this.createWeek(isInApp));
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


    createWeek: function (isApp) {
      var appStyle = isApp ? ' cui_cldweek_top0' : '',
                whtml = ['<ul class="cui_cldweek' + appStyle + '">'];
      if (this.msg) {
        whtml.push('<p  class="cui_cldmsg">' + this.msg + '</p>');
      }
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
      for (var i = 0; i < dln; i++) {
        wln = data.days[i].length;
        for (var t = 0; t < wln; t++) {
          cls = {};
          //日期是否可用
          var tmpDate = data.days[i][t];
          if (tmpDate) {
            var start = this.validStartDate || data.start;
            var end = this.validEndDate || data.end;
            if (tmpDate >= start && tmpDate <= end) {
              //cls['cui_cld_dayfuture'] = true;
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

          var title,
                        info = this.getDateInfo(tmpDate);
          if (info) {
            title = info.daytitle || info.holiday || info.chineseday;
            if (title) {
              cls['cui_cld_day_havetxt'] = true;
              if (info.holiday || info.chineseday) {
                cls['cui_cld_day_hint'] = true;
              }
              title = '<em>' + info.date + '</em><i>' + title + '</i>';
            } else {
              title = '<em>' + info.date + '</em>'; ;
            }
          } else {
            title = ""
          }
          if (this.date) {
            for (var o in this.date) {
              if (tmpDate && util.Date.format((this.dateVal[o] || this.date[o].value), 'Y-m-d') == util.Date.format(tmpDate, 'Y-m-d')) {
                delete cls['cui_cld_dayfuture'];
                delete cls['cui_cld_day_hint'];
                cls['cui_cld_day_havetxt'] = true;
                cls[this.buildSelectCls()] = true;
                cls[this.buildSelectCls(o)] = true;
                title = this.date[o].title(tmpDate, function () {
                  return info.daytitle || info.holiday || info.chineseday || info.date;
                });
                title = '<em>' + title + '</em>';
              }
            }
          }
          mhtml.push('<li data-date="' + util.Date.format(tmpDate, 'Y-m-d') + '" ' + (cls ? ' class="' + this._objectKey(cls).join(' ') + '"' : '') + '>' + title + '</li>');
        }

      }
      mhtml.push('</ul></section>');
      return mhtml.join('');
    },

    formatTitle: function (date) {
      if (!date) {
        return "";
      } else {
        var info = this.getDateInfo(date);
        return info.holiday || info.chineseday || info.daytitle || info.date;
      }
    },
    getDateInfo: function (date) {
      if (!date) {
        return;
      }
      var today = util.getServerDate();
      var _date = new Date(date);
      _date.setHours(1, 1, 1, 0);
      today.setHours(1, 1, 1, 0);
      var day = (_date - today) / (3600000 * 24);
      var info = {};

      if (util.Date.format(today, 'Ymd') == util.Date.format(date, 'Ymd')) {
        info.daytitle = '今天';
      } else if (day == 1) {
        info.daytitle = '明天';
      } else if (day == 2) {
        info.daytitle = '后天';
      } else {
        info.daytitle = '';
      }
      var ckey = this.solarDay2(date);
      //农历节日过前不够后
      if (this.chineseHoliday[ckey] && !this._chineseHoliday[ckey]) {
        this._chineseHoliday[ckey] = 1;
        info.chineseday = this.chineseHoliday[ckey];
      } else {
        info.chineseday = '';
      }
      var gkey = util.Date.format(date, 'md')
      if (this.holiday[gkey]) {
        info.holiday = this.holiday[gkey];
      } else {
        info.holiday = '';
      }
      info.week = this.DAYTITLE[date.getDay()];
      info.week2 = this.DAYTITLE2[date.getDay()];
      info.date = util.Date.format(date, 'j');
      return info;
    },
    formatTitle2: function (fun) {
      return $.proxy(function (date) {
        return fun(date, $.proxy(function (date) {
          return this.formatTitle(date);
        }, this));
      }, this);
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
      this.calendarend = et;
      return {
        start: st,
        end: et,
        days: days,
        loops: loops
      };
    },
    setDate: function (dates) {
      this.create();
      for (var i in dates) {
        if (this.date[i]) {
          if (this._isDate(dates[i])) {
            dates[i].setHours(0, 0, 0, 0);
            this.date[i].value = dates[i];
            this.dateVal[i] = dates[i];
            var el = this.root.find('.' + this.buildSelectCls(i));
            if (el.length) {
              var sdate = util.Date.parse(el.data('date')).valueOf();
              el.removeClass(this.buildSelectCls(i));
              el.removeClass(this.buildSelectCls());
              el.html(this.formatTitle(sdate));
            }
            var cur = this.root.find('[data-date="' + util.Date.format(dates[i], 'Y-m-d') + '"]');
            cur.each($.proxy(function (n, cur) {
              cur = $(cur);
              if (cur.hasClass('valid')) {
                cur.addClass(this.buildSelectCls(i));
                cur.addClass(this.buildSelectCls());
                cur.html(this.formatTitle2(this.date[i].title)(dates[i]));
              }
            }, this));
            this.dateDoms[i] = cur;
          }
        }
      }
    },
    addDate: function (dates, overrive) {
      this.create();
      var date, title, dom;
      for (var i in dates) {
        if (!this.date[i] || overrive) {
          this.date[i] = dates[i];
          date = this.date[i] && this.date[i].value;
          title = this.date[i] && this.date[i].title;
          title = typeof title === 'function' ? this.formatTitle2(title) : $.proxy(this.formatTitle, this);
          var el = this.root.find('.' + this.buildSelectCls(i));
          if (el.length) {
            el.removeClass(this.buildSelectCls(i));
            el.removeClass(this.buildSelectCls());
          }
          if (date) {
            dom = this.root.find('[data-date="' + util.Date.format(date, 'Y-m-d') + '"]');
            dom.each($.proxy(function (n, dom) {
              dom = $(dom);
              if (dom.hasClass('valid')) {
                dom.html(title(date));
                dom.addClass(this.buildSelectCls(i));
                dom.addClass(this.buildSelectCls());
                this.dateVal[i] = date;
              }
            }, this));
          }
        }
      }
    },
    removeDate: function (dates) {
      this.create();
      for (var t = 0, i, len = dates.length; t < len; t++) {
        i = dates[t];
        if (this.date[i]) {
          var els = this.root.find('.' + this.buildSelectCls(i));
          els.each($.proxy(function (k, v) {
            var el = $(v);
            el.removeClass(this.buildSelectCls(i));
            el.removeClass(this.buildSelectCls());
            el.html(this.formatTitle(util.Date.parse(el.data('date')).valueOf()));
          }, this));
          delete this.date[i];
          delete this.dateVal[i];
        }
      }
    },
    getDate: function () {
      var data = {};
      for (var i in this.date) {
        data[i] = this.date[i].value;
      }
      return !_.isEmpty(this.dateVal) ? this.dateVal : (!_.isEmpty(data) ? data : {});
    },
    update: function (options) {
      this.setOption(function (k, v) {
        switch (k) {
          case 'Months':
          case 'date':
          case 'curDate':
          case 'root':
          case 'callback':
          case 'title':
          case 'noabsolute':
            this[k] = v;
            break;
          case 'cls':
            this.cls.push(v);
            break;
          case 'validStartDate':
          case 'validEndDate':
            this[k] = v;
            this[k].setHours(0, 0, 0, 0);
            break;
          case 'startMonth':
            this[k] = v;
            this[k].setDate(1);
        }
      });
      this.readOption(options);
      //清空节日判断bug
      this._chineseHoliday = {};
      this.create();
      this.root.html(this.createCalendar());
      this.trigger('onChange');
    }
  });

  WidgetFactory.register({
    name: WIDGET_NAME,
    fn: Calendar
  });

});
define('cWidgetCalendarPrice',['cCoreInherit', 'cUtility', 'cUIBase', 'cWidgetFactory', 'cWidgetAbstractCalendar', 'cWidgetGuider'], function (cCoreInherit, util, Tools, WidgetFactory) {
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
define('cWidgetSlide',['cBase', 'cUICore', 'cWidgetFactory', 'libs'], function(cBase, cUICore, WidgetFactory) {
  

  var WIDGET_NAME = 'Slide';

  // 如果WidgetFactory已经注册了ListView，就无需重复注册
  if (WidgetFactory.hasWidget(WIDGET_NAME)) {
    return;
  }

  var IMG_DEFAULT_HEIGHT = 0;

  /**
   * slide图片展示
   * by ouxingzhi
   * @params
   * {
   *     images:[{ title:'', src:'', link:''}],    //图片集
   *     autoplay:true,                            //是否自动播放
   *     index:0,                                  //显示第几张
   *     loop:true                                 //是否增页循环
   * }
   */
  var Slide = new cBase.Class({
    __propertys__: function() {

      this.images = []; //图片列表
      this.index = 1; //当前索引
      this.delay = 3; //延迟多长时间跳转
      this.defaultIndex; //默认索引
      this.autoplay = false; //是否自动播放
      this.root; //页面根节点
      this.imageinter; //图片内部层
      this.imageouter; //图片外部层
      this.navbox; //导航层
      this.navs; //导航
      this.navinter; //导航内层
      this.container; //容器
      this.interWidth; //内容器的宽度
      this.itemWidth; //单个图片的宽度
      this.onchange = function() {}; //当图片切换时触发
      this.onerror = function() {}; //图片加载失败时触发
      this.loop = true; //是否循环

      this.ENUM_STATE_EMPTY = 0; //状态
      this.ENUM_STATE_NOTEMPTY = 1;

      this.state = this.ENUM_STATE_EMPTY;
      this.notimage = '';
      this.notimagedom; //无数据时显示的层
      this.setTimeoutResoure; //记录setTimeout的记录
      this.isMove = false; //slide是否在动画中
      this.isadaptive = false;

      this.dirs = {
        'left': 'next',
        'right': 'pre'
      }; //移动方向已定

      this.dir = 'left'; //默认方向

      this.startX = 0; //记录touchstart时手指的位置
      this.startY = 0;
    },

    initialize: function(options) {
      this.setOption(options);
      this.createLayout();//初始化结构
      this.addImageItems();//加入图片

      var handler = function() {
        // @description 计算元素内部高度
        this.calcinterWidth();

        // @description 如果内部元素不为空的话开始计算初始元素
        if (this.state === this.ENUM_STATE_NOTEMPTY) {
          this.initposition();
          if (this.autoplay) {
            this.play();
          }
          if (this.images && this.images.length > 1) this.buildEvent();
        }
      };

      setTimeout($.proxy(handler, this), 0);//计算宽度

      var scope = this;

      if (this.isadaptive) {
        $(window).on('resize', function(){
          scope.calcinterWidth();
          scope.initposition();
          var height = 0;
          $('.' + cUICore.config.prefix + 'slide-img-item img').each(function(index, item){
            if($(item).height() > height) height = $(item).height();
          });

          scope.imageinter.height(height);
          scope.imageouter.height(height);
          scope.container.height(height);
        });
      };
    },

    setOption: function(ops) {

      for (var i in ops) {
        switch (i) {
          case 'autoplay':
          case 'defaultIndex':
          case 'container':
          case 'notimage':
          case 'delay':
          case 'dir':
          case 'loop':
          case 'onchange':
          case 'onerror':
          case 'isadaptive':
            this[i] = ops[i];
            break;
          case 'images':
            if (ops[i] && typeof ops[i][0] === 'string') {
              var imgs = [];
              for (var t = 0, len = ops[i].length; t < len; t++) {
                imgs.push({
                  src: ops[i][t]
                });
              }
              this[i] = imgs;
            } else {
              this[i] = ops[i];
            }
            break;
        }
      }
    },

    // @description 计算图片内容器的宽度
    calcinterWidth: function() {
      var subs = this.imageinter.find('.' + cUICore.config.prefix + 'slide-img-item');
      var width = 0;

      this.interWidth = width;
      this.itemWidth = this.imageouter.width();
      subs.css('width', this.itemWidth + 'px');
      subs.each(function() {
        width += $(this).width();
      });
      this.imageinter.css('width', width + 'px');
    },

    // @description 创建一个布局结构
    createLayout: function() {
      this.root = $([
        '<div class="' + cUICore.config.prefix + 'slide">',
        '<div class="' + cUICore.config.prefix + 'slide-imgsouter">',
        '<div class="' + cUICore.config.prefix + 'slide-imgsinter">',
        '</div>',
        '</div>',
        '<div class="' + cUICore.config.prefix + 'slide-nav">',
        '<div class="' + cUICore.config.prefix + 'slide-nav-padding">',
        '</div>',
        '</div>',
        '</div>'
      ].join(''));
      this.imageouter = this.root.find('.' + cUICore.config.prefix + 'slide-imgsouter');
      this.imageinter = this.root.find('.' + cUICore.config.prefix + 'slide-imgsinter');
      this.navbox = this.root.find('.' + cUICore.config.prefix + 'slide-nav');
      this.navinter = this.root.find('.' + cUICore.config.prefix + 'slide-nav-padding');

      if (this.isadaptive) {
        // @description 设置默认高度
        this.container.height(IMG_DEFAULT_HEIGHT);
      };

      this.container.empty().append(this.root);
    },

    // @description 创建一个图片项
    createImageItem: function(obj, current, Class) {
      var cls = [cUICore.config.prefix + 'slide-img-item'];
      if (current) cls.push(cUICore.config.prefix + 'slide-img-item-current');
      if (Class)[].push.call(cls, Class);
      var item = $([
        '<div class="' + cls.join(' ') + '">',
        '<a href="' + (obj.link ? obj.link : 'javascript:void(0);') + '"><img src="' + obj.src + '" title="' + (obj.title || '') + '"/></a>',
        '</div>'
      ].join(''));
      var self = this;
      item.find('img').bind('error', function() {
        var img = this;
        setTimeout(function() {
          self.notimage && (img.src = self.notimage);
          self.onerror && self.onerror(img);
          $(img).unbind('error');
        }, 100);
      });
      return item;
    },

    // @description 添加items
    addImageItems: function() {
      for (var i = 0, len = this.images.length, img; i < len; i++) {
        this.addItem(this.images[i], this.defaultIndex === i);
      }
      var firstItem, lastItem;
      if (this.images.length) {
        this.state = this.ENUM_STATE_NOTEMPTY;
        firstItem = this.createImageItem(this.images[0], null, [cUICore.config.prefix + 'slide-img-pre']);
        lastItem = this.createImageItem(this.images[Math.max(0, this.images.length - 1)], null, [cUICore.config.prefix + 'slide-img-last']);
        if (!this.loop) {
          firstItem.css({
            visibility: 'hidden'
          });
          lastItem.css({
            visibility: 'hidden'
          });
        }

        if (this.isadaptive) {
          // @description 调整高度
          var scope = this;
          var $img = firstItem.find('img');
          $img.on('load', function(){
            scope.container.height($img.height());
          });
        };

        this.imageinter.append(firstItem);
        this.imageinter.prepend(lastItem);
        this.navs = this.navinter.find('.' + cUICore.config.prefix + 'slide-nav-item');
      } else {
        this.state = this.ENUM_STATE_EMPTY;
        this.addEmptyItem(this.notimage);
      }
    },

    initposition: function() {
      this.go(this.index, function() {}, true);
      this.onchange(this.index, this.index);
      var pi = this.calcNextIndex();
      this.setNavCurrent(pi);
    },

    addEmptyItem: function(obj) {
      var cls = [cUICore.config.prefix + 'slide-img-item', cUICore.config.prefix + 'slide-img-item-empey'];
      this.notimagedom = $('<div class="' + cls.join(' ') + '"></div>');
      this.notimagedom.append(obj);
      this.imageinter.append(this.notimagedom);
    },

    buildEvent: function() {
      this.imageouter.bind('touchstart', $.proxy(this.onTouchStart, this));
      this.imageouter.bind('touchmove', $.proxy(this.onTouchMove, this));
      this.imageouter.bind('touchend', $.proxy(this.onTouchEnd, this));
      this.imageouter.bind('touchcancel', $.proxy(this.onTouchEnd, this));
    },

    onTouchStart: function(e) {
      e.preventDefault();
      if (this.isMove) {
        this.isTouchStart = false;
        return;
      }
      this.isTouchStart = true;
      var pos = cUICore.Tools.getMousePosOfElement(e.targetTouches[0], e.currentTarget);
      this.stop();
      this.startX = pos.x;
      this.startY = pos.y;
      this.imageinterLeft = parseInt(this.imageinter.css('left'));
    },
    onTouchMove: function(e) {
      e.preventDefault();
      if (this.isMove || !this.isTouchStart) {
        return;
      }
      var pos = cUICore.Tools.getMousePosOfElement(e.targetTouches[0], e.currentTarget);
      var diffX = pos.x - this.startX,
        diffY = pos.y - this.startY;
      this.imageinter.css('left', (this.imageinterLeft + diffX) + 'px');
    },
    onTouchEnd: function(e) {
      e.preventDefault();
      if (this.isMove || !this.isTouchStart) {
        return;
      }
      var pos = cUICore.Tools.getMousePosOfElement(e.changedTouches[0], e.currentTarget);
      var diffX = pos.x - this.startX,
        diffY = pos.y - this.startY,
        callback = $.proxy(function() {
          this.autoplay && this.loop && this.play();
        }, this);
      var pi = this.calcNextIndex() + 1,
        len = this.images.length;

      if (diffX > 50 && this.loop || (diffX > 50 && !this.loop && pi !== 1)) {
        this.pre(callback);
      } else if (diffX < -50 && this.loop || (diffX < -50 && !this.loop && pi < len)) {
        this.next(callback);
      } else {
        this.imageinter.animate({
          left: this.imageinterLeft + 'px'
        }, null, callback)
      }
    },
    //创建一个导航
    createNavItem: function(current) {
      return $([
        '<span class="' + cUICore.config.prefix + 'slide-nav-item' + (current ? cUICore.config.prefix + 'slide-nav-item-current' : '') + '"></span>'
      ].join(''));
    },
    addItem: function(obj, current) {
      var img = this.createImageItem(obj, current),
        navItem = this.createNavItem(current);
      this.imageinter.append(img);
      this.navinter.append(navItem);
    },
    play: function() {
      clearInterval(this.setTimeoutResoure);
      if (!this.images || this.images.length < 2) return;
      this.setTimeoutResoure = setInterval($.proxy(function() {
        this[this.dirs[this.dir]]();
      }, this), this.delay * 1000);
    },
    stop: function() {
      clearInterval(this.setTimeoutResoure);
    },

    go: function(i, callback, cancelAnimte) {
      this.isMove = true;
      var left = -(this.itemWidth * i);
      if (cancelAnimte) {
        this.imageinter.css({
          'left': left + 'px'
        });
        this.isMove = false;
        callback && callback();
      } else {
        this.imageinter.animate({
          'left': left + 'px'
        }, null, null, $.proxy(function() {
          this.isMove = false;
          callback && callback();
        }, this));
      }
    },

    next: function(callback) {
      var lastIndex = this.index;
      this.go(++this.index, $.proxy(function() {
        if (this.index === this.images.length + 1) {
          this.index = 1;
          var left = -(this.itemWidth * this.index);
          this.imageinter.css({
            'left': left + 'px'
          });
        }
        var pi = this.calcNextIndex();
        this.setNavCurrent(pi);
        this.onchange(this.index, lastIndex);
        callback && callback();
      }, this));
    },
    setNavCurrent: function(pi) {
      this.navs.removeClass(cUICore.config.prefix + 'slide-nav-item-current');
      $(this.navs.get(pi)).addClass(cUICore.config.prefix + 'slide-nav-item-current');
    },
    calcNextIndex: function() {
      return this.index > this.images.length ? 0 : (this.index + 1);
    },
    pre: function(callback) {
      this.index == 0 && (this.index = 1);
      var lastIndex = this.index;
      this.go(--this.index, $.proxy(function() {
        if (this.index === 0) {
          this.index = this.images.length;
          var left = -(this.itemWidth * this.index);
          this.imageinter.css({
            'left': left + 'px'
          });

        }
        var pi = this.calcPreIndex();
        this.setNavCurrent(pi);
        this.onchange(this.index, lastIndex);
        callback && callback();
      }, this));
    },
    calcPreIndex: function() {
      return this.index < 1 ? Math.max(0, this.images.length - 1) : this.index - 1;
    },
    empty: function() {
      this.stop();
      this.imageinter.find('img').remove();
    }
  });

  // return Slide;
  WidgetFactory.register({
    name: WIDGET_NAME,
    fn: Slide
  });


});
/**********************************
 * @author:       wjxiong@Ctrip.com
 * @description:  验证码组件
 */
define('cWidgetCaptcha',['cWidgetFactory', 'cStorage', 'c'], function (WidgetFactory, cStorage, c) {
    
    var WIDGET_NAME = 'Captcha';
    var Captcha = function () {
    }
    Captcha = {
        islock: false,
        getCode: function (model, self) {
            var that = this;
            if (!that.islock) {
                self.showLoading();
                this.islock = true;
                var time;
                model.excute(function (item) {
                    self.hideLoading();
                    that.islock = false;
                    if (item.rc == 0) {
                        that.islock = true;
                        //cStorage.localStorage.oldSet('VERIFYTIMEOUT', JSON.stringify({ time: time || new Date().valueOf() }));
                        that.showtime(self.els.sendcodebtn);
                    }
                    else if (item.rc == 2) {
                        item.rmsg = "很抱歉，您的验证次数已达上限，请明天再试";
                        var a = new c.ui.Alert({
                            message: item.rmsg,
                            buttons: [{
                                text: '确定',
                                click: function () {
                                    this.hide();
                                    for (var o in self.els) {
                                        var oi = self.els[o][0];
                                        if (oi && oi.nodeName == "INPUT" && !oi.disabled) {
                                            oi.value = "";
                                        }
                                    }
                                }
                            }]
                        });
                        a.show();
                    }
                    else {
                        item.rmsg = item.rmsg || "获取验证码失败，请重试";
                        self.showToast(item.rmsg);
                    }
                }, function () {
                    that.islock = false;
                    self.hideLoading();
                    self.showToast("获取验证码失败，请重试");
                });
            }
        },
        showtime: function (ele) {
            var i = 60;
            var that = this;
            if (that.islock) {
                var resource = setInterval(function () {
                    ele.addClass('cgrey');
                    ele.removeClass('cblue1');
                    ele.text(i + '秒后重发');
                    if (i <= 0 || !that.islock) {
                        clearInterval(resource);
                        ele.removeClass('cgrey');
                        ele.addClass('cblue1');
                        ele.text('免费获取');
                        that.islock = false;
                    }
                    i--;
                }, 1000);
            }
        },
        setinit: function (ele) {
            this.islock = false;
        }
    }

    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: Captcha
    });
});

/**
 * @author wliao廖伟 <wliao@ctrip.com>
 * @requires underscore
 * @class Calendar
 * @description 日历插件
 * @example
  var calender = new Calendar({
    monthsNum: 5,
    header: {
      title: '选择日期',
      tel: '4000086666',
      home: true,
      homeHandler: function() {
        
      }
    },
    endTime: new Date(2014, 6, 10),
    callback: function(date, dateStyle, target) {
      this.$el.find('.cui_cld_daycrt').removeClass('cui_cld_daycrt');
      target.addClass('cui_cld_daycrt');
      this.hide();
    },
    onShow: function() {
    },
    onHide: function() {
      //销毁日历组件
      this.remove();
    }
  });
  calender.show();
 */
define('cCalendar',[
  'cUtility'
], function(util) { 
  /**
   * @name isLeap
   *
   * @description Check a year is leap. 
   * @param {string} year 
   * @returns {num}
   */
  function isLeapYear(year) {
    if (year % 100 === 0) {
      if (year % 400 === 0) {
        return true;
      }
    } else if (year % 4 === 0) {
      return true;
    }
    return false;
  }

  /**
   * @name getDaysInMonth
   *
   * @description get 
   * @param {string} year
   * @param {string} month
   * @returns {string} 
   */
  function getDaysInMonth(year, month) {
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  }

  //Keep date format method reference
  var dateFormat = util.Date.format;
  var serverDate = util.getServerDate();
  var serverDateZero = (function() {
    var date = new Date(serverDate);
    date.setHours(0, 0, 0, 0);
    return date;
  })();

  /**
   * @name noop 
   *
   * @description None operation
   */
  function noop() {}
  //日历默认参数
  var defaults = {
    cls: 'cui-calendar',        //组件根类
    monthsNum: 1,               //月数
    animateSwitch: 'right',      //right, left, top, bottom
    format: 'Y-m-d',            //日期返回格式,在callback中的dateStyle.value中获取
    days: 'min',                //可选值'min', 'short', '',显示'日'或者'星期天','周日'
    monthFormate: 'Y年n月',     //月份显示格式
    //根元素选择器
    appendElement: 'body',      //日历的根元素插入哪里
    startTime: serverDateZero,  //开始时间，默认为服务器时间
    todayCls: 'cui_cld_today',  //今天，后天，明天类
    endTime: Number.MAX_VALUE,  //结束时间，默认为无限大
    header: {                   //日期头部
      title: '',
      tel: false,
      home: false,
      homeHandler: noop
    },
    headerTemplate: 
      '<header>' +
        '<h1><%= title %></h1>' + 
        '<i id="js_return" class="returnico lefthead"></i>' +
        '<% if(home) { %> <i class="icon_home i_bef" id="c-ui-header-home"></i> <% } %>' +
        '<% if(tel) { %><a href="tel:<%= tel %>" class="icon_phone i_bef __hreftel__" id="c-ui-header-tel"></a><% } %>' +
      '</header>',
    bodyPrefixTemplate:
      '<article class="cont_wrap"><div class="cui_cldwrap">',
    daysTemplate: 
      '<ul class="cui_cldweek">' +
        '<% _.each(days, function(day) { %>' +
        '<li><%= day %>' +
        '<% }); %>' +
      '</ul>',
    monthTemplate:
      '<section class="cui_cldunit">' +
        '<h1 class="cui_cldmonth"><%= monthFormate %></h1>' + 
        '<ul class="cui_cld_daybox">' +
          '<% _.each(month, function(day) { %>' +
          '<li data-date="<%= day.format %>" class="<% if (day.invalid) { print("cui_cld_invalid cui_cld_daypass"); } else { print("cui_cld_valid"); } if(day.desc) { print(" cui_cld_day_havetxt"); } if (day.cls) { print(" " + day.cls); } %>">' +
            '<em><%= day.value %></em>' +
            '<% if (day.desc) { %>' +
            '<i><%= day.desc %></i>' +
            '<% } %>' +
          '<% }); %>' +
        '</ul>' +
      '</section>',
    bodySuffixTemplate: '</div></article>',
    callback: noop,            //日期被点后的回调函数        
    onShow: noop,              //日期展示后的回调函数
    onHide: noop,              //日期隐藏后的回调函数
    constant: {
      days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      daysMin:  ['日', '一', '二', '三', '四', '五', '六'],
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthsShort: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月']
    }
  };

  var Calendar = function(options) {
    options = options || {};
    this.options = $.extend(true, {}, defaults, options);
    this.$el = $('<div>').addClass(this.options.cls);
    this.initialize.apply(this, arguments);
    this.render();
  };

  Calendar.prototype = {
    constructor: Calendar,
    initialize: noop,
    hasPushState: history && history.pushState,
    show: function() {
      var options = this.options;
      var $el = this.$el;
      var prepareCss = this.animateHandler();
      var self = this;

      if (this._isShow) {
        return;
      }
      //增加浏览器回退功能
      if (this.hasPushState && this.options.header) {
        history.pushState({}, document.title, location.href);
        $(window).one('popstate', function() {
          self.hide(true);
        });
      }

      if (options.animateSwitch) {
        $el.css({
              '-webkit-transform': prepareCss,
              transform: prepareCss
        })
          .show()
          .animate({
            '-webkit-transform': 'translate(0, 0)',
            transform: 'translate(0, 0)'
          }, 500, 'ease-in-out', function() {
            $el.css({
              '-webkit-transform': '',
              transform: ''
            });
          });
      } else {
        $el.show();
      }
      this._isShow = true;
      options.onShow.call(this);
      return this;
    },
    hide: function(historyBack) {
      var self = this;
      var options = this.options;
      var $el = this.$el;
      var prepareCss = this.animateHandler();
      //浏览器回退消失
      if (this._isShow && !historyBack && this.hasPushState && this.options.header) {
        history.back();
      }

      if (options.animateSwitch) {
        $el.animate({
          '-webkit-transform': prepareCss,
          transform: prepareCss
        }, 500, 'ease-in-out', function() {
          $el.hide();
        });
      } else {
        $el.hide();
      }
      options.onHide.call(self);
      this._isShow = false;
      return this;
    },
    //销毁日历组件
    remove: function() {
      var $el = this.$el;
      if (this.options.animateSwitch) {
        setTimeout(function() {
          $el.remove();
        }, 501);
      } else {
        $el.remove();
      }
    },
    //处理动画方向
    animateHandler: function() {
      var animateSwitch = this.options.animateSwitch;
      var prepareCss;
      if (animateSwitch) {
        switch (animateSwitch) {
          case 'top':
            prepareCss = 'translate(0, 100%)';
            break;
          case 'bottom':
            prepareCss = 'translate(0, -100%)';
            break;
          case 'left':
            prepareCss = 'translate(-100%, 0)';
            break;
          case 'right':
            prepareCss = 'translate(100%, 0)';
            break;
          default:
            prepareCss = 'translate(100%, 0)';
        }
      }
      return prepareCss;
    },
    setOptions: function(key, value) {
      if (_.isObject(key)) {
        _.each(key, function(itemValue, itemKey) {
          this.options[itemKey] = itemValue;
        }, this);
      } else {
        this.options[key] = value;
      }
      return this;
    },
    isValid: function(time) {
      var startTime = this.options.startTime.getTime();
      var endTime;
      time = time.getTime();
      if (_.isDate(this.options.endTime)) {
        endTime = this.options.endTime.getTime();
      } else {
        endTime = this.options.endTime;
      }

      return time - startTime >= 0 && endTime - time >= 0;
    },
    bindEvents: function() {
      var self = this;
      var header = this.options.header;
      this.$el.on('click', '.cui_cld_valid', function() {
        var target = $(this);
        var dateArr = target.attr('data-date').split('-');
        var date = new Date(dateArr[0], parseInt(dateArr[1], 10) - 1, dateArr[2]);
        var getDay = date.getDay();
        var getMonth = date.getMonth();
        var datesTxt = self.options.constant;
        var dateStyle = {
          days: datesTxt.days[getDay],
          daysShort: datesTxt.daysShort[getDay],
          daysMin: datesTxt.daysMin[getDay],
          months: datesTxt.months[getMonth],
          monthsShort: datesTxt.monthsShort[getMonth],
          value: dateFormat(date, self.options.format),
          holiday: self.getDateDesc(date).desc
        };

        //选中日期，样式，被点击的目标
        self.options.callback.call(self, date, dateStyle, target);
      });

      if (header) {
        this.$el.on('click', '#js_return', function() {
          self.hide();
        });

        if (header.home) {
          this.$el.on('click', '#c-ui-header-home', function() {
            header.homeHandler.call(self);
          });
        }
      }
    },
    render: function() {
      var options = this.options;
      var html = [];
      var year = options.startTime.getFullYear();
      var month = options.startTime.getMonth();

      html.push(this.createHeader());
      html.push(options.bodyPrefixTemplate);
      html.push(this.createDays());
      for (var i = 0; i < options.monthsNum; i++) {
        //月份超过12月，换下一年
        if (month + 1 > 12) {
          month = 0;
          year++;
        }
        html.push(this.createMonth(year, month++));
      }
      html.push(options.bodySuffixTemplate);
      this.$el
          .css('display', 'none')
          .html(html.join(''))
          .appendTo($(options.appendElement));
      if (options.appendElement === 'body') {
        this.$el.css({
          position: 'absolute',
          zIndex: 3001,
          top: 0,
          right: 0,
          left: 0
        });
      } else {
        this.$el.addClass('cui-calendar-static');
      }
      this.bindEvents();
    },
    //创建头部
    createHeader: function() {
      var header = this.options.header;
      if (!header) {
        return '';
      }

      return _.template(this.options.headerTemplate, header);
    },
    //创建周的描述
    createDays: function() {
      var daysStyle = this.options.days;
      var datesTxt = this.options.constant;
      var data;
      
      if (daysStyle === 'short') {
        data = datesTxt.daysShort;
      } else if (daysStyle === 'min') {
        data = datesTxt.daysMin;
      } else {
        data = datesTxt.days;
      }

      return _.template(this.options.daysTemplate, {days: data});
    },
    /**
     * @description 创建月历
     * @param {string} 年份
     * @param {string} 月份，月份是从0开始计算的
     * @returns {string} 月历html代码
     */
    createMonth: function(year, month) {
      var firstDayDate = new Date(year, month);
      var firstDay = firstDayDate.getDay();
      var ret = {
        monthFormate: dateFormat(firstDayDate, this.options.monthFormate),
        month: []
      };
      var monthModel = this.generateMonthModel(year, month);

      //每月第一天前面的暂位标签
      for (var i = 0; i < firstDay; i++) {
        ret.month.push({ invalid: true, value: '' });
      }
      
      ret.month = ret.month.concat(monthModel);
      return _.template(this.options.monthTemplate, ret); 
    },
    //转换月历模型
    generateMonthModel: function(year, month) {
      var days = getDaysInMonth(year, month);
      var monthModel = [];
      var temporaryTime, temporaryDay;

      for (var j = 1; j <= days; j++) {
        temporaryTime = new Date(year, month, j);
        temporaryDay = { invalid: true, value: j };
        _.extend(temporaryDay, this.getDateDesc(temporaryTime));
        if (this.isValid(temporaryTime)) {
          temporaryDay.invalid = false;
          temporaryDay.format = dateFormat(temporaryTime, 'Y-m-d');
        }
        monthModel.push(temporaryDay);
      }

      return monthModel;
    },
    //判断当前日期的文本描述
    getDateDesc: function(date) {
      var oneDay = 86400000; //oneday = 1000 * 60 * 60 * 24;
      var txt = '';
      var todayCls = '';
      var dateTime = date.getTime();
      var serverDateTime = serverDateZero.getTime();

      //今天，明天，后天逻辑
      if (dateTime === serverDateTime) {
        txt = '今天';
        todayCls = this.options.todayCls;
      } else if(dateTime - serverDateTime === oneDay) {
        txt = '明天';
        todayCls = this.options.todayCls;
      } else if (dateTime - serverDateTime === 2 * oneDay) {
        txt = '后天';
        todayCls = this.options.todayCls;
      }

      return {
        cls: todayCls,
        desc: txt
      };
    }
  };

  //Extend static method
  _.extend(Calendar, {
    isLeapYear: isLeapYear,
    getDaysInMonth: getDaysInMonth,
    extend: Backbone.View.extend,
    dateFormat: dateFormat,
    defaults: defaults,
    serverDate: serverDate
  });

  /* Css hack */
/*  (function() {
    var css = '.cui-calendar-static .cui_cldweek { position: static; border-top: 1px solid #c8c8c8; } .cui-calendar-static .cont_wrap { margin: 0; } .cui-calendar-static .cui_cldwrap { padding-top: 0; }';
    $('<style>').html(css).appendTo(document.head);
  })()*/
  return Calendar;
});
/**
 * @fileoverview 中国节日日历
 * @author wliao廖伟 <wliao@ctrip.com>
 */
define('cHolidayCalendar',[
  'cCalendar'
], function(Calendar) { 
  var CHINESE_LUNAR_INFO = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
          0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
          0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
          0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
          0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
          0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
          0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
          0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
          0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
          0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
          0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
          0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
          0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
          0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
          0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
          0x14b63
  ];

  //传回农历 y年闰哪个月 1-12 , 没闰传回 0
  function leapMonth(year) {
    return CHINESE_LUNAR_INFO[year - 1900] & 0xf;
  }

  //传回农历 y年m月的总天数
  function monthDays(year, month) {
    return (CHINESE_LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
  }

  function leapDays(year) {
    if (leapMonth(year)) {
      return (CHINESE_LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
    } else {
      return 0;
    }
  }

  //传回农历 y年的总天数
  function lYearDays(year) {
    var sum = 348;
    for (var i = 0x8000; i > 0x8; i >>= 1) {
      sum += (CHINESE_LUNAR_INFO[year - 1900] & i) ? 1 : 0;
    }
    return sum + leapDays(year);
  }

  //算出农历, 传入日期对象, 传回农历日期对象
  //该对象属性有 .year .month .day .isLeap .yearCyl .dayCyl .monCyl
  function toLunar(dateObj) {
     var i,
      leap = 0,
      temp = 0,
      lunarObj = {};
      var baseDate = new Date(1900, 0, 31);
      var offset = (dateObj - baseDate) / 86400000;
      lunarObj.dayCyl = offset + 40;
      lunarObj.monCyl = 14;
      for (i = 1900; i < 2050 && offset > 0; i++) {
        temp = lYearDays(i);
        offset -= temp;
        lunarObj.monCyl += 12;
      }
      if (offset < 0) {
        offset += temp;
        i--;
        lunarObj.monCyl -= 12;
      }

      lunarObj.year = i;
      lunarObj.yearCyl = i - 1864;
      leap = leapMonth(i);
      lunarObj.isLeap = false;
      for (i = 1; i < 13 && offset > 0; i++) {
        if (leap > 0 && i === (leap + 1) && lunarObj.isLeap === false) {
          --i;
          lunarObj.isLeap = true;
          temp = leapDays(lunarObj.year);
        } else {
          temp = monthDays(lunarObj.year, i);
        }
        if (lunarObj.isLeap === true && i === (leap + 1)) {
          lunarObj.isLeap = false;
        }
        offset -= temp;
        if (lunarObj.isLeap === false) {
          lunarObj.monCyl++;
        }
      }

      if (offset === 0 && leap > 0 && i === leap + 1) {
        if (lunarObj.isLeap) {
          lunarObj.isLeap = false;
        } else {
          lunarObj.isLeap = true;
          --i;
          --lunarObj.monCyl;
        }
      }

      if (offset < 0) {
        offset += temp;
        --i;
        --lunarObj.monCyl;
      }
      lunarObj.month = i;
      lunarObj.day = offset + 1;
      return lunarObj;
  }

  /**
   * @name HolidayCalendar.defaults
   * @description 节日日历参数, 扩展于Calendar.defaults
   */
  var defaults = _.defaults({
    holidayCls: 'cui_cld_holiday',            //节日的类
    solarHoliday: {                           //阳历节日
      '0101': '元旦',
      '0214': '情人节',
      '0405': '清明',
      '0501': '劳动节',
      '1001': '国庆',
      '1225': '圣诞节'
    },
    lunarHoliday: {                           //阴历节日,不需要请设置为false
      '1230': '除夕',
      '0101': '春节',
      '0115': '元宵',
      '0505': '端午',
      '0707': '七夕',
      '0815': '中秋',
      '0909': '重阳'
    },
    _lunarHoliday: {

    }
  }, Calendar.defaults);

  /**
   * @constructor HolidayCalendar
   * @extends Calendar
   * @example
      var calender = new HolidayCalendar({
        monthsNum: 5,
        title: '选择日期',
        endTime: new Date(2014, 6, 10),
        callback: function(date, dateStyle, currentTarget) {
          this.hide();
        },
        onShow: function() {
        },
        onHide: function() {
        }
      });
      calender.show();
   */
  var HolidayCalendar = Calendar.extend({
    initialize: function(options) {
      this.options = $.extend(true, {}, defaults, options);
    },
    // 重写当前日期的文本描述
    getDateDesc: function(date) {
      //调用父元素的文本描述
      var dateDesc = HolidayCalendar.__super__.getDateDesc.apply(this, arguments);
      var holidayKey = this.generateHolidayKey(date.getMonth() + 1, date.getDate());
      var options = this.options;
      var lunarKey, lunarObj, _lunarKey;

      //节日判断
      if (options.solarHoliday[holidayKey]) {
        dateDesc.desc = options.solarHoliday[holidayKey];
        dateDesc.cls = options.holidayCls;
      } else {
        lunarObj = toLunar(date);
        lunarKey = this.generateHolidayKey(lunarObj.month, lunarObj.day);
        _lunarKey = date.getFullYear() + lunarKey;

        //农历节日判断, 农历节日过前不过后
        if (options.lunarHoliday[lunarKey]) {
          if (
              options._lunarHoliday[_lunarKey] &&
              options._lunarHoliday[_lunarKey] === holidayKey
            ) {
            dateDesc.desc = options.lunarHoliday[lunarKey];
            dateDesc.cls = options.holidayCls;
          } else if (!options._lunarHoliday[_lunarKey]) {
            dateDesc.desc = options.lunarHoliday[lunarKey];
            dateDesc.cls = options.holidayCls;
            options._lunarHoliday[_lunarKey] = holidayKey;
          }
        }
      }
      
      return dateDesc;
    },
    generateHolidayKey: function(month, day) {
      if (month < 10) {
        month = '0' + month;
      }
      if (day < 10) {
        day = '0' + day;
      }

      return '' + month + day;
    }
  }, {
    defaults: defaults
  });

  return HolidayCalendar;
});
/**
* @author wliao廖伟 <wliao@ctrip.com>
* @requires HolidayCalendar
* @class HolidayPriceCalendar
* @description 中国节日价格日历,参数会继承于中国节日插件
* @example
var calender = new HolidayPriceCalendar({
rootElement: '.calendar-wrap',
monthsNum: 5,
animatSwitch: 'top',
startPriceTime: null,
priceDate: [
{ date: new Date('2014/5/1 0:00:00'), price: 25 },
{ date: new Date('2014/5/2 0:00:00'), price: 30 },
{ date: new Date('2014/5/3 0:00:00'), price: 35 },
{ date: new Date('2014/5/4 0:00:00'), price: 36 },
{ date: new Date('2014/5/5 0:00:00'), price: 37 },
{ date: new Date('2014/6/1 0:00:00'), price: 30 },
{ date: new Date('2014/6/2 0:00:00'), price: 30 },
],
callback: function(date) {
      
},
onShow: function() {
this.findMinPrice();
}
});
calender.show();
*/
define('cHolidayPriceCalendar',['cHolidayCalendar'], function (HolidayCalendar) {
  
  //节日价格日历默认参数,扩展于节日参数
  var defaults = _.defaults({
    unit: '¥', //价格单位
    lowestCls: 'price_lowest', //当月最低价格类
    monthTemplate:
      '<section class="cui_cldunit">' +
        '<h1 class="cui_cldmonth"><%= monthFormate %></h1>' +
        '<ul class="cui_cld_daybox">' +
          '<% _.each(month, function(day) { %>' +
          '<li <% if (day.price) { %> data-price="<%= day.price %>" <% } %> data-date="<%= day.format %>" class="<% if (day.invalid) { print("cui_cld_invalid cui_cld_daypass"); } else { print("cui_cld_valid"); } if(day.desc) { print(" cui_cld_day_havetxt"); } if (day.cls) { print(" " + day.cls); } %>">' +
            '<em><%= day.value %></em>' +
            '<% if (day.desc) { %>' +
            '<i><%= day.desc %></i>' +
            '<% } %>' +
          '<% }); %>' +
        '</ul>' +
      '</section>',
    priceDate: [], //价格日期
    startPriceTime: false, //价格开始时间
    voidInvalid: true //没有价格的日期是否有效可点
  }, HolidayCalendar.defaults);

  var HolidayPriceCalendar = HolidayCalendar.extend({
    initialize: function (options) {
      this.options = $.extend(true, {}, defaults, options);
      this.setPriceDate(this.options.priceDate);
    },
    generateMonthModel: function(year, month) {
      var days = HolidayCalendar.getDaysInMonth(year, month);
      var monthModel = [];
      var options = this.options;
      var tempDate, tempDay, tempTime, tempDesc, tempPrice;

      for (var j = 1; j <= days; j++) {
        tempDate = new Date(year, month, j);
        tempTime = tempDate.getTime();
        tempDay = this.getDateDesc(tempDate);
        tempPrice = options.priceDate[tempTime];

        //如果存在价格
        if (typeof tempPrice !== 'undefined') {
          if (tempDay.desc) {
            tempDay.value = tempDay.desc;
          } else {
            tempDay.value = j;
          }
          //价格不为0
          if (tempPrice != 0) {
            tempDay.desc = options.unit + tempPrice;
          } else {
            tempDay.desc = '';
          }

          tempDay.price = tempPrice;
        } else {
          tempDay.invalid = options.voidInvalid;
          tempDay.value = j;
        }

        if (!this.isPriceValidTime(tempDate)) {
          tempDay.invalid = true;
        }

        tempDay.format = HolidayCalendar.dateFormat(tempTime, 'Y-m-d');
        monthModel.push(tempDay);
      }

      return monthModel;
    },
    isPriceValidTime: function (date) {
      var startPriceTime = this.options.startPriceTime;
      if (startPriceTime) {
        return date.getTime() - startPriceTime.getTime() >= 0;
      } else {
        return this.isValid(date);
      }
    },
    findMinPrice: function () {
      var months = this.$el.find('.cui_cld_daybox');
      var lowestCls = this.options.lowestCls;
      months.each(function () {
        var days = $(this).find('[data-price]');
        var prices = [];
        var min;
        days.each(function () {
          prices.push(parseInt(this.getAttribute('data-price'),
            10));
        });
        min = Math.min.apply(null, prices);
        days.each(function () {
          var item = $(this);
          var price = parseInt(item.attr('data-price'), 10);
          if (price === min) {
            item.addClass(lowestCls);
          }
        });
      });
    },
    //处理priceDate参数
    setPriceDate: function(value) {
      var ret = {};

      _.each(value, function(item) {
        ret[item.date.getTime()] = item.price;
      });

      this.options.priceDate = ret;
    }
  });
  return HolidayPriceCalendar;
});
define('cBasePageView',['libs','c', 'cWidgetFactory', 'cWidgetHeaderView', 'cWidgetGuider'], function(libs, c, WidgetFactory){
  

  var Guider = WidgetFactory.create('Guider');
  var options = options || {};

  /********************************
   * @description: 向PageView注入HeaderView实例
   */
  options.injectHeaderView = function(data){
    var HeaderView = WidgetFactory.create('HeaderView');
    this.headerview = new HeaderView(data);
    //this.$el.append(this.headerview.getView());
    $('#main').before(this.headerview.getView());
  };

  // 复写c.view对于header的设置，去除过去设置对于现在的控件影响
  options._initializeHeader = function(){};
  options._getDefaultHeader = function(){};

  // @deprecated
  //options.registerCallback = function(callback, timeout){
    //timeout =  timeout ? timeout:400;
    //var self = this;
    //var Publisher = WidgetFactory.create('Publisher');

    //Publisher.register({
    //  name: 'login',
    //  success: function(){
    //    setTimeout(function() { callback(); }, timeout);
    //  }
    //});
  //};

  options.hybridBridgeRender = function () {
    //------------------------
    // @author Michael.Lee
    // 在渲染页面之前，App环境和Web环境不同的处理。对所有App跳转H5的页面都要用callAppInit去初始化参数

    var self = this;
    //var Guider = widgetFactory.create('Guider');

    //var hybridCallback = function () {
    //  self.callAppInit($.proxy(self.showView, self));
    //};
    var hybridCallback = $.proxy(self.showView, self);
    var callback = $.proxy(self.showView, self);

    Guider.apply({
      hybridCallback: hybridCallback,
      callback: callback
    });
    //-------------------------  
  };

  options.registerCallback = function (callback) {
    //var Guider = WidgetFactory.create('Guider');
    //Guider.register({ tagname: 'METHOD_BECOME_ACTIVE', callback: callback });
  };

  options.callAppInit = function (callback) {
    var version = 0;
    if (window.localStorage) {
      var appInfo = window.localStorage.getItem('APPINFO');

      appInfo = JSON.parse(appInfo);
      if(appInfo) version = appInfo.version;
    }
    Guider.init({version: version, callback: callback});
  };

  var BasePageView = c.view.extend(options);

  //定义点击事件名
  BasePageView.ONCLICK = 'click';

  return BasePageView;

  // ----------------------------------------------------------------- //
  // 使用方法
  //
  //  var View = BasePageView.extend({
  //    onCreate: function(){
  //       this.injectHeaderView();
  //    },
  //    onLoad: function(){
  //       需要HeaderView的数据
  //       this.headerview.set(data);
  //       this.headerview.show();
  //    }
  //  });
  //  在onCreate中显示的调用injectHeaderView，这里可以传递数据，如果这里传递了数据，那么onLoad那里去set数据就不需要了
  //  在onLoad或者加载完数据开始渲染画面的时候调用this.headerview.set(data)都可以
  // ----------------------------------------------------------------- //

});
/**********************************
 * @author:       cmli@Ctrip.com
 * @description:  常用页面工厂，用来动态的创建常用页面
 */
define('cCommonPageFactory',['libs'], function(libs){
  

  var CommonPageFactory = CommonPageFactory || {};

  CommonPageFactory.products = {};

  /********************************
   * @description: 检查CommonPageFactory是否已经注册了该名称的常用页面
   * @param: {name} String 常用页面名称
   * @return boolean
   */
  CommonPageFactory.hasPage = function(name){
    return !!(CommonPageFactory.products[name]);
  };

  /********************************
   * @description: 向CommonPageFactory注册常用页面
   * @param: {product.name} String 常用页面名称
   * @param: {product.fn} Function 常用页面，Backbone.View对象
   */
  CommonPageFactory.register = function(product){
    if (product && product.name && product.fn) {
      if (CommonPageFactory.products[product.name]) {
        throw "CommonPageFactory: factory has been register in CommonPageFactory";
      }
      CommonPageFactory.products[product.name] = product.fn;
    }else{
      throw "CommonPageFactory: factory is lack of necessary infomation.";
    }
  };

  /********************************
   * @description: 通过CommonPageFactory生产常用页面
   * @param: {name} String 常用页面名称
   * @return: Function 常用页面，AbstractView对象
   */
  CommonPageFactory.create = function(name){
    return CommonPageFactory.products[name];
  };

  return CommonPageFactory;
});
define('cCommonListPage',['libs', 'cUI', 'cBasePageView', 'cWidgetFactory', 'cCommonPageFactory', 'cWidgetListView'], function (libs, cUI, BasePageView, WidgetFactory, CommonPageFactory) {
    

    var PAGE_NAME = 'CommonListPage';
    if (CommonPageFactory.hasPage(PAGE_NAME)) {
        return;
    }

    var options = options || {};

    /********************************
    * ##需要再重构，思考workspace设置
    * @description: 向CommonListPageView注入ListView
    */
    options.injectListView = function (data) {
        if (!data.workspace) {
            data.workspace = $(this.defaultHtml);
        }
        this.$el.append(data.workspace);

        if (!data.container) {
            data.container = data.workspace.find('#c-list-view-container');
        } else {
            data.container = this.$el.find(data.container);
        }

        //l_wang 如果需要标签，此处需要标签


        var ListView = WidgetFactory.create('ListView');
        this.listview = new ListView(data);
    };

    options._onWidnowScroll = null;
    options.__isComplete__ = false;
    options.__isLoading__ = false;
    options.bottomLoading = null;

    options.addScrollListener = function () {
        this.__isComplete__ = false;
        this.__isLoading__ = false;
        $(window).bind('scroll', this._onWidnowScroll);
    },

    options.removeScrollListener = function () {
        $(window).unbind('scroll', this._onWidnowScroll);
        if (this.bottomLoading) {
            this.bottomLoading.remove();
            this.bottomLoading = null;
        }
    }

    options.onWidnowScroll = function () {

        //l_wang app.js会默认window.scrollTo(0, 1)，导致触发，所以当scroll为0时候不触发，张爸爸需要确认
        var pos = cUI.Tools.getPageScrollPos();
        if (pos.top == 0) return;
        var h = pos.pageHeight - (pos.top + pos.height);
        //console.log(h);
        //fix ios 不容易加载更多数据问题 shbzhang 2014/1/6
        if (h <= 81 && !this.__isComplete__ && !this.__isLoading__) {
            this.__isLoading__ = true;
            this.onBottomPull && this.onBottomPull();
        }
    },

    options.closeBottomPull = function () {
        this.__isComplete__ = true;
    },

    options.endPull = function () {
        this.__isLoading__ = false;
    },

    /**
    * 显示loading图标
    */
    options.showBottomLoading = function () {
        if (!this.bottomLoading) {
          this.bottomLoading = $('<div class="cui-zl-load" id="zlLoading" style=""> <div class="cui-i cui-b-loading"></div><div class="cui-i  cui-mb-logo"></div> <p>加载中</p></div>');
        }
		//保证每次bottomload在最下面
		this.$el.append(this.bottomLoading);
        this.bottomLoading.show();
    },

    /**
    * 隐藏loading图标
    */
    options.hideBottomLoading = function () {
        if (this.bottomLoading) {
            this.bottomLoading.hide();
        }
        this.__isLoading__ = false;
    },


    /********************************
    * @description: 默认的ListView容器模板
    */
    options.defaultHtml = '<section class="res_list"><ul class="res_list_tab_arr_r" id="c-list-view-container"></ul></section>';

    var CommonListPageView = BasePageView.extend(options);

    CommonPageFactory.register({
        name: PAGE_NAME,
        fn: CommonListPageView
    });

    // ------------------------------------------------------- //
    // 使用方法
    //
    // var CommonListPage = CommonPageFactory.create('CommonListPage');
    // var View = CommonListPage.extend({
    //   onCreate: function(){
    //     this.injectHeaderView();
    //   },
    //   onLoad: function(){
    //     console.log('/--------------onLoad--------------/');
    //     this.headerview.set(headerview_data);
    //     this.headerview.show();
    //
    //    这里injectListView的数据可能是从服务器来的所以可以在Model的回调中使用
    //    var listadapter = new ListAdapter({data: data_arr});
    //    var data = {
    //      workspace: 整个模板文件渲染出来的dom,
    //      container: ListView的容器，用'#id'方式传入String,
    //      listadapter: ListAdapters实例,
    //      itemView: 每一个Item View的模板,
    //      bindItemViewEvent: function($el){
    //        $el是每个Item View，需要对ItemView进行事件绑定在这里做
    //      }
    //    }
    //     this.injectListView(listview_data);
    //     this.listview.show();
    //
    //     this.turning();
    //   },
    // });
    //
    // ------------------------------------------------------- //
});
