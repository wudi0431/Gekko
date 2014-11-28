/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class AbsctractStore
 * @description 抽象Store
 */

define(['cBase', 'cStorage', 'cUtility'], function (cBase, Storage, cUtility) {

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
      var cTime = CDate.parse(time);
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