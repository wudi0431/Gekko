/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class SessionStore
 * @description SessionStore 存储类
 */
define(['cBase', 'cAbstractStorage'], function (cBase, cAbstractStorage) {

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