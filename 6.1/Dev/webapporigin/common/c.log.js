/**
 * @author zsb张淑滨 <shbzhang@Ctrip.com> / ghj龚汉金 <hjgong@Ctrip.com>
 * @class cLog
 * @description 提供App在手机端的后门
 * @comment 需要zsb与新代码再核对一遍
 */
define(['cUtilityServertime', 'cUtility'], function (cUtility, cUtil) {

  /** 声明cLog命名空间 */
  var cLog = {
    serverTime: cUtility.getServerDate().getTime(),
    isInApp: cUtil.isInApp()?"1":"0",
    event:         {
      DOMREADY:  'JS.Lizard.Domready',
      ONLOAD:    'JS.Lizard.OnLoad',
      AJAXREADY: 'JS.Lizard.AjaxReady',
      AJAXMESSAGESIZE: 'JS.Lizard.AjaxMessageSize',
      GEOREQUEST: 'JS.Lizard.GeoRequest'
    }
  };

  /**
   * @method cLog.restlog
   * @param {string} name log的key名称
   * @param {string} param 具体写入log的信息
   * @description 重置Log
   */
  cLog.applog = cLog.appLog = function (name, param) {

  };

  /**设置每个metric的tag
  *@param privateTag metric对应的私有的tag
  */
  cLog._prossExtparam = function(privateTag) {    
    var param = this._createExtParam();

     /*清理Url中带版本号/时间戳的querystring, 防止metric中的tag冗余*/
    if(privateTag.hasOwnProperty("url")){
      param.url = privateTag["url"].replace(new RegExp((+new Date()+'').slice(0,8)+'\\d{5}'),'__TIME__');
    }

    /*计算性能数据value落在哪个区间内*/
    if(privateTag.hasOwnProperty("distribution")){
      param.distribution = this._chooseTimeZone(privateTag["distribution"]);
    }
    
    return param;
  };

  /**
   * onDomReady,标记为页面第一次渲染后执行,在view.onCreate方法完成时调用
   */
  cLog.onDomReady = function (sTime) {
    var value =  this.getNow() - ( sTime ? sTime : this.localTime )
    var param = this._prossExtparam({"distribution":value});
    this.sendTrack(this.event.DOMREADY, param, value);
  };

  /**
   * onLoad,数据取回,模板渲染完毕后执行, 在view.turning方法前调用
   */
  cLog.onLoad = function (sTime) {
    var value =  this.getNow() - ( sTime ? sTime : this.localTime )
    var param = this._prossExtparam({"distribution":value});
    this.sendTrack(this.event.ONLOAD, param, value);
  };
  

  /**
   * ajax 请求时间统计
   * @param url 请求url
   * @param sTime 请求开始时间
   * @param eTime 请求结束时间
   * @constructor
   */
  cLog.ajaxReady = function (url, sTime, eTime) {
    if (!eTime) {
      eTime = this.getNow();
    }
    var value = eTime - sTime;
    var param = this._prossExtparam({"url":url, "distribution":value});
    this.sendTrack(this.event.AJAXREADY, param, value);
  };
  
  /**
   * ajax 请求大小
   * @param url 请求url
   * @param contentLength 请求长度
   * @constructor
   */
  cLog.ajaxMessageSize = function (url, contentLength) { 
    var param = this._prossExtparam({"url":url});
    this.sendTrack(this.event.AJAXMESSAGESIZE, param, contentLength);
  };
  
  /**
   * ajax 请求时间统计
   * @param url 请求url
   * @param sTime 请求开始时间
   * @param eTime 请求结束时间
   * @constructor
   */
  cLog.geoRequest = function (url, sTime, eTime) {    
    //~1……2014-09-11……JIANGJing……仅匹配开头以支持Native|Web function erro <errno>格式。
    //+1……2014-09-10……JIANGJing……临时禁用GeoRequest中除指定之外的其他性能监控点
    if (typeof url != 'string' || !url.match(/^(Native|Web) function (number|detail|error)/)) { return; }
    if (!eTime) {
      eTime = this.getNow();
    }
    var value = eTime - sTime;
    var param = this._prossExtparam({"url":url,"distribution":value,"errno":"0"});
    this.sendTrack(this.event.GEOREQUEST, param, value);
  };

  /**
   * 通用事件
   * @param eventName
   * @param sTime
   */
  cLog.sendCommonTrack = function (eventName, sTime) {
   return true;
  };
  /**
   * 发送ubt的性能统计
   * @param name metric的名称
   * @param extParam tag的对象
   * @param time 每条记录的值
   */
  cLog.sendTrack = function (name, extParam, time) {
    if (!window.__bfi) {
      window.__bfi = [];
    }

    //+……2014-09-11……JIANGJing……对于 url = Native|Web function erro <errno> 的记录作格式转换处理。
    if (name == 'JS.Lizard.GeoRequest' && extParam.url.match(/^(Native|Web) function error (\d+)$/)) {
      extParam.url = RegExp.$1 + ' function error';
      extParam.errno = RegExp.$2;
    }

    for (var key in extParam) {
      if (extParam.hasOwnProperty(key)) 
        extParam[key] = extParam[key] + '';
    }
   // extParam.network = cUtil.networkType || 'unknown';
    //extParam.isapp = this.isInApp;
   // extParam.landingpage = cUtil.landing + '';
    //计算出服务器当前时间
    var ts = this.serverTime + (this.getNow() - this.localTime);
    // if (name == 'JS.Lizard.GeoRequest') {   alert(extParam.url + ':' + extParam.errno); }
    
    //-1……2014-09-10……JIANGJing……隐藏调试信息
    //console.log(name+":"+time +",ts:"+ts);
    window.__bfi.push(['_trackMatrix', name, extParam, time, ts])
  };

  /**
   * 生成metric的common tag信息
   * @param name
   * @param time
   * @private
   */
  cLog._createExtParam = function () {
    var tag = {
      "version": "1.1", /*Lizard版本号*/
      "network":cUtil.networkType || 'unknown', /*网络状态*/
      "isapp":this.isInApp /*区分Hybrid/H5*/
    }
    return tag;
  },

  /**
   * 返回当前时间的毫秒值
   */
    cLog.getNow = function () {
      return  new Date().getTime();
    },

  /**
   * 返回日期区间
   */
    cLog._chooseTimeZone = function (time) {
      var zone = "[0,500]";
      if (time > 4000) {
        zone = "[4001,--]";
      } else if (time > 3000) {
        zone = "[3001,4000]";
      } else if (time > 2000) {
        zone = "[2001,3000]";
      } else if (time > 1000) {
        zone = "[1001,2000]";
      } else if (time > 500) {
        zone = "[501,1000]";
      } else if (time >= 0) {
        zone = "[0,500]";
      }
      return zone +"(ms)";
    }
   
  cLog.localTime = ((typeof __SERVERDATE__ != 'undefined')&&__SERVERDATE__.local) ? __SERVERDATE__.local.getTime() : cLog.getNow();
  
  return cLog;

});