define(['cUtilityHybrid', 'cUtilityHash', 'cUtilityDate', 'cUtilityServertime', 'Validate'], function (UtilityHybrid, UtilityHash, UtilityDate, UtilityServertime, Validate) {
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