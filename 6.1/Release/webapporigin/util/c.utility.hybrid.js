/**
 * @author cmli@ctrip.com
 * @class cUtilityHybrid
 */
define([], function () {
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
    return false;
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
  /**
   * @public
   * @description 获取版本号
   * @method getVision
   * @return {num}
  */
  Util.getVision = function(){
     var useragent = navigator.userAgent;
     var reg =  /CtripWireless_((\d{0,3})\.{0,1}(\d{0,3}))/;
     var temp = useragent.match(reg);
     return parseFloat(temp[1]);
  }
  return Util;

});