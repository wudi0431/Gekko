/**
 * @author cmli@ctrip.com / vzyq张有泉 <yq.zhang@Ctrip.com>
 * @class cUtilityServertime
 * @description 获取服务器时间
 */
define(['cUtilityHybrid'], function(UtilityHybrid) {

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