/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class AbsctractStorage
 * @description Storage抽象类
 */
define(['cBase'], function (cBase) {

  "use strict";

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
      __propertys__ : function () {
        this.proxy = null;
        //存储缓存中的key和过期时间
        this.overdueClearKey = "C_CLEAR_OVERDUE_CATCH"; //名字写错了
      },

      /**
       * @method initialize
       * @param {Object} obj
       * @description 复写自顶层Class的initialize，赋值队列
       */
      initialize : function ($super, options) {},
      /**
       *删除过期缓存
       * @private
       */
      removeOverdueCathch : function () {
        //比较缓存中的过期时间是否超过了最新时间
        var dateNow = new CDate().getTime(),
        objsdInCatchStr = this.proxy.getItem(this.overdueClearKey),
        objsdInCatch = [],
        objsCatchNew = [];
        if (!objsdInCatchStr) {
          return;
        }
        objsdInCatch = JSON.parse(objsdInCatchStr);
        for (var i = 0, tempObj; i < objsdInCatch.length; i++) {
          tempObj = objsdInCatch[i];
          if (new Date(tempObj.timeout).getTime() <= dateNow) {
            //过期的删除
            this.proxy.removeItem(tempObj.key);
          } else {
            //未过期添加到新的数组中
            objsCatchNew.push(tempObj);
          }
        };
        //最后将新数组放到缓存中
        this.proxy.setItem(this.overdueClearKey, JSON.stringify(objsCatchNew));
      },
	  /**
	   * 删除离过期时间最近的缓存
	   * @param num 必须
	   * @private
	   */
      _removeOdCLately : function (num) {
		    //设置num的默认值为5
		    num = num || 5;
        var objsdInCatchStr = this.proxy.getItem(this.overdueClearKey),
        objsdInCatch = [];
        if (objsdInCatchStr) {
          objsdInCatch = JSON.parse(objsdInCatchStr);
          //排序删除第一个，排序比较耗时
          objsdInCatch.sort(function (a, b) {
            var timeA = new Date(a.timeout).getTime(),
            timeB = new Date(b.timeout).getTime();
            return timeA - timeB
          });
	        //删除N个 缓存
	        var delCatch = objsdInCatch.splice(0,num) || [];
	        for(var i=0;i<delCatch.length;i++){
		        this.proxy.removeItem(delCatch[i].key);
	        }
	        //将剩余的key存入缓存中
	        this.proxy.removeItem(this.overdueClearKey);
	        if(objsdInCatch.length > 0){
		        this.proxy.setItem(this.overdueClearKey, JSON.stringify(objsdInCatch));
	        }
        }
      },
      /**
       * 将缓存的key和过期时间放到缓存中
       * @param key
       * @param timeout
       * @private
       */
      _setOverdueCathch : function (key, timeout) {
        if (!key || !timeout || CDate.parse(timeout, true) < new Date()) {
          return;
        };
        var overdueObj = {},
        oldObjs = [],
        oldObjsStr = this.proxy.getItem(this.overdueClearKey);
        overdueObj.key = key;
        overdueObj.timeout = timeout;
        if (oldObjsStr) {
          oldObjs = JSON.parse(oldObjsStr);
        }
        var isKeyAlreadyIn = false;
        for (var i = 0, tempObj; i < oldObjs.length; i++) {
          tempObj = oldObjs[i];
          if (tempObj.key == key) {
            //更新最新的过期时间
            oldObjs[i] = overdueObj;
            isKeyAlreadyIn = true;
          }
        }
        if (!isKeyAlreadyIn) {
          //添加新的过期时间对象
          oldObjs.push(overdueObj);
        }
        //最后将新数组放到缓存中
        this.proxy.setItem(this.overdueClearKey, JSON.stringify(oldObjs));
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
      _buildStorageObj : function (value, timeout, tag, savedate, oldVal) {
        return {
          value : value,
          oldvalue : oldVal || null,
          timeout : timeout,
          tag : tag,
          savedate : savedate
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
      set : function (key, value, timeout, tag, savedate, oldVal) {
        savedate = savedate || (new CDate()).format('Y/m/d H:i:s');
        timeout = timeout ? new CDate(timeout) : new CDate().addDay(30);
        var formatTime = timeout.format('Y/m/d H:i:s');
        //将key和过期时间放到缓存中
        this._setOverdueCathch(key, formatTime);

        var entity = this._buildStorageObj(value, formatTime, tag, savedate, oldVal);
        try {
          this.proxy.setItem(key, EJSON.stringify(entity));
          return true;
        } catch (e) {
          //localstorage写满时,全清掉
          if (e.name == 'QuotaExceededError') {
            //            this.proxy.clear();
            //localstorage写满时，选择离过期时间最近的数据删除，这样也会有些影响，但是感觉比全清除好些，如果缓存过多，此过程比较耗时，100ms以内
            this._removeOdCLately(5);
            this.set(key, value, timeout, tag, savedate, oldVal);
          }
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
      get : function (key, tag, oldFlag) {
        var result,
        value = null;
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
      getTag : function (key) {
        var result,
        value = null,
        tag = null;
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
      getSaveDate : function (key, useCDate) {
        var result,
        value = null;
        try {
          result = this.proxy.getItem(key);
          if (result) {
            result = EJSON.parse(result);
            if (result.savedate) {
              value = CDate.parse(result.savedate);
              if (!useCDate)
                value = value.valueOf();
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
      getExpireTime : function (key) {
        var result = null,
        time = null;
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
      remove : function (key) {
        return this.proxy.removeItem(key);
      },

      /**
       * @method getAll
       * @return {Array} result,形式如[{key:'aa',value:{}}]
       * @description 返回storage存储的所有数据
       */
      getAll : function () {
        var ln = this.proxy.length;
        var vs = [];
        for (var i = 0; i < ln; i++) {
          var key = this.proxy.key(i);
          var obj = {
            key : key,
            value : this.get(key)
          }
          vs.push(obj);
        }
        return vs;
      },

      /**
       * @method clear
       * @discription 清空所有storage内容
       */
      clear : function () {
        this.proxy.clear();
      },

      /**
       * @method gc
       * @discription 垃圾收集,清掉失效的数据
       */
      gc : function () {
        var storage = this.proxy,
        ln = this.proxy.length;
        for (var i = 0; i < ln; i++) {
          var name = storage.key(i);
          if (name == 'GUID') {
            break;
          }
          try {
            if (!this.get(name)) {
              this.remove(name);
            }
          } catch (e) {}
        }
      }

    });

  return AbstractStorage;
});
