/**
 * @author cmli@ctrip.com
 * @description 用来进行跨包跳转时使用
 */

define(['cBase', 'cStore', 'cUtility'], function (cBase, AbstractStore, cUtility) {

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