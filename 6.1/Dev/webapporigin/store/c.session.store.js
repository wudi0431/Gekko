/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com>
 * @class LocalStore
 * @description 以SessionStorage为数据存储的Store
 */

define(['cBase','cAbstractStore','cSessionStorage'], function (cBase,cAbstractStore,cSessionStorage) {

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