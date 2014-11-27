/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class LocalStore
 * @description 以localstorage为数据存储的Store
 */

define(['cBase','cAbstractStore','cStorage'], function (cBase,cAbstractStore,cLocalStorage) {

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