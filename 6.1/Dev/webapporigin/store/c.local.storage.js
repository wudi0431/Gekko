/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class LocalStorage
 * @description LocalStorage 存储类
 */
define(['cBase', 'cAbstractStorage'], function (cBase, cAbstractStorage) {

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