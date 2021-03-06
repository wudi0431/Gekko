/**
*	AbstractModel abstract class
*	File:	c.Model.js
*	Author:	ouxingzhi@vip.qq.com
*	Date:	2013/6/23
* update: l_wang
* Date: 2013/12/25(OD快快好来，祝圣诞快乐)
*/
define(['libs', 'cBase', 'cAjax', 'cLog'], function (libs, cBase, cAjax, cLog) {
  var AbstractModel = new cBase.Class({
    __propertys__: function () {
      /* 子类需要复写的字段 */
      /**
      * {String} 必填，数据读取url
      */
      this.url = null;
      /**
      * {Object|Store} 必选，用于存贮请求参数
      */
      this.param = null;

      /**
      * {Function} 可选，数据返回时的自定义格式化函数
      */
      this.dataformat = null;

      /**
      * {Function} 可选，存放用于验证的函数集合
      */
      this.validates = [];

      // 加入debug模式
      this.debug = false;

	  /**
	   * 通讯协议,http/https,默认为当前地址的协议
	   * @var {String} [cAbstractModel.protocol=http] 可覆盖，通讯协议,http/https
	   */
	  this.protocol = (window.location.protocol.indexOf("https") > -1) ? "https" : "http";

      //      {Boolean} 可选，只通过ajax获取数据
      //      this.ajaxOnly = false;

      /**
      * {String} 可选，提交数据格式
      */
      this.contentType = AbstractModel.CONTENT_TYPE_JSON;
      /**
      * {String} 可选， 提交数据的方法
      */
      this.method = 'POST';

      //当前的ajax对象
      this.ajax;
      //是否主动取消当前ajax
      this.isAbort = false;

      //参数设置函数
      this.onBeforeCompleteCallback = null;
    },

    initialize: function (options) {
      this.assert();
      for (var key in options) {
        this[key] = options[key];
      }
    },
    assert: function () {
      if (this.url === null) {
        throw 'not override url property';
      }
      if (this.param === null) {
        throw 'not override param property';
      }
    },

    pushValidates: function (handler) {
      if (typeof handler === 'function') {
        this.validates.push($.proxy(handler, this));
      }
    },

    /**
    *	设置提交参数
    *	@param {String} param 提交参数
    *	@return void
    */
    setParam: function (key, val) {
      if (typeof key === 'object' && !val) {
        this.param = key;
      } else {
        this.param[key] = val;
      }
    },

    /**
    *	获得提交
    *	@param void
    *	@return {Object} 返回一个Object
    */
    getParam: function () {
      return this.param;
    },

    //构建url请求方式，子类可复写，我们的model如果localstorage设置了值便直接读取，但是得是非正式环境
    buildurl: function () {
      //      var baseurl = AbstractModel.baseurl(this.protocol);
      //      return this.protocol + '://' + baseurl.domain + '/' + baseurl.path + (typeof this.url === 'function' ? this.url() : this.url);
      throw "[ERROR]abstract method:buildurl, must be override";

    },

    //    baseurl: function () {
    //      // @description baseurl必须被复写，同时返回的对象应为
    //      // { domain: '', path: ''}
    //      throw "[ERROR]abstract method:baseurl, must be override";
    //    },

    /**
    *	取model数据
    *	@param {Function} onComplete 取完的回调函
    *	传入的第一个参数为model的数第二个数据为元数据，元数据为ajax下发时的ServerCode,Message等数
    *	@param {Function} onError 发生错误时的回调
    *	@param {Boolean} ajaxOnly 可选，默认为false当为true时只使用ajax调取数据
    * @param {Boolean} scope 可选，设定回调函数this指向的对象
    * @param {Function} onAbort 可选，但取消时会调用的函数
    */
    execute: function (onComplete, onError, scope, onAbort, params) {

      // @description 定义是否需要退出ajax请求
      this.isAbort = false;

      // @description 请求数据的地址
      var url = this.buildurl();

      var self = this;

      var __onComplete = $.proxy(function (data) {
        //保存服务请求日志
       // cLog.serverLog(self.buildurl(), self.getParam(), data);

        if (this.validates && this.validates.length > 0) {

          // @description 开发者可以传入一组验证方法进行验证
          for (var i = 0, len = this.validates.length; i < len; i++) {
						var validates = this.validates[i](data);
	          if((typeof validates === 'boolean')){
		          if (!validates) {

			          // @description 如果一个验证不通过就返回
			          if (typeof onError === 'function') {
				          return onError.call(scope || this, data);
			          } else {
				          return false;
			          }
		          }
	          } else {
		          if(validates && validates.overdue){
			          require(['cWidgetMember','cWidgetFactory'],function(Member,WidgetFactory){
				          Member = WidgetFactory.create('Member');
				          Member.memberLogin({'param':'from='+encodeURIComponent(window.location.href)});
			          });
		          }
		          //此处不需要执行任何回调，直接跳转到登录页面
		          return false;
	          }
          }
        }

        // @description 对获取的数据做字段映射
        var datamodel = typeof this.dataformat === 'function' ? this.dataformat(data) : data;

        if (typeof this.onBeforeCompleteCallback === 'function') {
          this.onBeforeCompleteCallback(datamodel);
        }

        if (typeof onComplete === 'function') {
          onComplete.call(scope || this, datamodel, data);
        }

      }, this);

      var __onError = $.proxy(function (e) {
        //保存服务请求日志
       // cLog.serverLog(self.buildurl(), self.getParam());
        if (self.isAbort) {
          self.isAbort = false;

          if (typeof onAbort === 'function') {
            return onAbort.call(scope || this, e);
          } else {
            return false;
          }
        }

        if (typeof onError === 'function') {
          onError.call(scope || this, e);
        }

      }, this);

      // @description 从this.param中获得数据，做深copy
      var params = params || _.clone(this.getParam() || {});

      //设置contentType无效BUG，改动一，将contentType保存
      params.contentType = this.contentType;

      if (this.contentType === AbstractModel.CONTENT_TYPE_JSON) {

        // @description 跨域请求
        return this.ajax = cAjax.cros(url, this.method, params, __onComplete, __onError);
      } else if (this.contentType === AbstractModel.CONTENT_TYPE_JSONP) {

        // @description jsonp的跨域请求
        return this.ajax = cAjax.jsonp(url, params, __onComplete, __onError);
      } else {

        // @description 默认post请求
        return this.ajax = cAjax.post(url, params, __onComplete, __onError);
      }
    },
    abort: function () {
      this.isAbort = true;
      this.ajax && this.ajax.abort && this.ajax.abort();
    }
  });
  /**
  * 获得model的实例
  */
  AbstractModel.getInstance = function () {
    if (this.instance instanceof this) {
      return this.instance;
    } else {
      return this.instance = new this;
    }
  };

  AbstractModel.baseurl = function () {
    // @description baseurl必须被复写，同时返回的对象应为
    // { domain: '', path: ''}
    throw "[ERROR]abstract method:baseurl, must be override";
  };

  /** ajax提交数据的格式，目前后面可能会有两种提交格式：json数据提交,form表单方式 **/
  AbstractModel.CONTENT_TYPE_JSON = 'json';
  AbstractModel.CONTENT_TYPE_FORM = 'form';
  AbstractModel.CONTENT_TYPE_JSONP = 'jsonp';
  return AbstractModel;
});


