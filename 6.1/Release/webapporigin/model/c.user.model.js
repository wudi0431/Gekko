/**
 * @author cmli@ctrip.com / oxz欧新志 <ouxz@Ctrip.com>
 * @namespace UserModel
 */
define(['cBase', 'cModel', 'CommonStore'],
  function(cBase, cModel, CommonStore) {

    "use strict";

    var UserStore = CommonStore.UserStore.getInstance();
    var HeadStore = CommonStore.HeadStore.getInstance();

    var UserModel = {};

    /**
     * @description 非会员登录
     * @author od
     * @class NotUserLoginModel
     * @construct
     */
    UserModel.NotUserLoginModel = new cBase.Class(cModel, {

      /**
       * @private
       * @method __propertys__
       * @returns void
       */
      __propertys__: function() {
        this.url = "/html5/Account/NonUserLogin";
        this.param = {};
        this.baseurl = cModel.baseurl.call(this);
        this._abortres = {};
        this.isAbort = false;
      },

      /**
       * @private
       * @method initialize
       * @param {function} $super
       * @param {object} options
       * @description 对象初始化工作
       * @returns void
       */
      initialize: function($super, options) {
        $super(options);
      },

      /**
       * @public
       * @method excute
       * @param {function} onComplete 取完的回调函
       * @param {function} onError 发生错误时的回调
       * @param {boolean} ajaxOnly 可选，默认为false当为true时只使用ajax调取数据
       * @param {boolean} scope 可选，设定回调函数this指向的对象
       * @param {function} onAbort 可选，但取消时会调用的函数
       * @description 向服务端做非会员登陆
       * @returns void
       */
      excute: function(onComplete, onError, ajaxOnly, scope, onAbort) {
        //add by byl 此处添加，如果已经是非会员登录，则不重新调用非会员登录，并且执行成功的回调函数
        var userData = UserStore.getUser();
        if(userData && !!userData.IsNonUser){
          if(typeof onComplete === 'function'){
            onComplete.call(scope, userData);
          }
          return;
        }
        this.isAbort = false;
        var url = 'http://' + this.baseurl.domain + this.url;

        var successCallback = function(data) {
          if (data.ServerCode == 1 && data.Data) {
            UserStore.setUser(data.Data);

            if (typeof onComplete === 'function') {
              onComplete.call(scope, data);
            }
          } else {
            if (typeof onError === 'function') {
              onError.call(scope);
            }
          }
        };

        var errorCallback = function() {
          if (this.isAbort) {
            if (typeof onAbort === 'function') {
              onAbort.call(scope);
            }

            this.isAbort = false;
            return;
          }

          if (typeof onError === 'function') {
            onError.apply(scope, arguments);
          }
        };

        this._abortres = $.ajax({
          'type': 'get',
          'url': url,
          'dataType': 'json',
          'crossDomain': true,
          'success': $.proxy(successCallback, this),
          'error': $.proxy(errorCallback, this),
          'timeout': 25000
        });
      },

      /**
       * @public
       * @method abort
       * @returns void
       */
      abort: function() {
        this.isAbort = true;

        if (this._abortres && typeof this._abortres.abort === 'function') {
          this._abortres.abort();
        }
      }
    });


    /**
     * 用户登录model
     * @type {cBase.Class}
     */
    UserModel.UserLoginModel = new cBase.Class(cModel, {

      /**
       * @private
       * @method __propertys__
       * @returns void
       */
      __propertys__: function() {
        this.param = {};
        this.url = '10090/GetUserInfoToH5.json';
      },


      /**
       * @private
       * @method initialize
       * @param {function} $super
       * @param {object} options
       * @description 对象初始化工作
       * @returns void
       */
      initialize: function($super, options) {
        $super(options);
        this.baseurl = this.seturl();
      },

      seturl:function(){
        var host = window.location.host,
          path = 'restapi/soa2/',
          domain = "m.ctrip.com",
	      isHttps = cModel.isHttps(this.protocol);
        if (host.match(/^m\.ctrip\.com/i)){
	        if (isHttps) {
		        domain = "sec-m.ctrip.com";
	        } else {
		        domain = "m.ctrip.com";
	        }
        }else if (host.match(/\.uat\.qa/i)){
          domain = "gateway.m.uat.qa.nt.ctripcorp.com";
        }else if (host.match(/\.fat/i) || (host.match(/\.lpt/i))|| host.match(/\.fws/i) || host.match(/^(localhost|172\.16|127\.0)/i)) {
          domain = "gateway.m.fws.qa.nt.ctripcorp.com";
        }
        return {
          'domain': domain,
          'path': path
        }
      }
    });

    return UserModel;
  });