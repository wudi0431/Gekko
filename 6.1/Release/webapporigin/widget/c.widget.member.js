/**********************************
 * @author:       cmli@Ctrip.com
 * @description:  组件Member
 * @see: http://git.dev.sh.ctripcorp.com/cmli/ctrip-h5-document/blob/master/widget/t.widget.member.md
 *
 */
define(['cUtility', 'cUserModel', 'cWidgetFactory', 'cHybridFacade', 'cUtility', 'cUtilityCrypt', 'CommonStore'], function (Util, UserModel, WidgetFactory, Facade, cUtility, cUtilityCrypt, CommonStore) {
  "use strict";

  var WIDGET_NAME = 'Member';
  var host = window.location.host;
  var domain = "accounts.ctrip.com";
  if (host.match(/^m\.ctrip\.com/i)) {
    domain = "accounts.ctrip.com";
  } else if (host.match(/\.uat\.qa/i)) {
    domain = "accounts.uat.qa.nt.ctripcorp.com";
  } else if (host.match(/\.fat/i) || (host.match(/\.lpt/i))|| host.match(/\.fws/i) || host.match(/^(localhost|172\.16|127\.0)/i)) {
    domain = "accounts.fat49.qa.nt.ctripcorp.com";
  }
  var LINKS = {
    MEMBER_LOGIN: 'https://' + domain + '/H5Login/#login',
    REGISTER:     'https://' + domain + '/H5Register/'
  };

  /**
   * 获得url
   * @param link
   * @param options
   * @private
   */
  var _getLink = function (link, options) {
    var url = link, lt = location;
    var param = (options && options.param && typeof options.param === 'string') ? options.param : "";
    if (param) {
	    param = cUtility.getUrlParams(options.param);
	    var backUrl = (param && param.backurl)? decodeURIComponent(param.backurl) : "";
	    var from = (param && param.from) ? decodeURIComponent(param.from) : "";
	    var pHost = lt.protocol + "//" + lt.host;
	    //判断参数是否为完整url，不是的话，补全host
	    if(cUtility.validate.isUrl(backUrl)){
		    param.backurl = backUrl;
	    }else{
		    if(backUrl !== ""){
			    param.backurl = pHost + backUrl;
		    }
	    }
	    if (cUtility.validate.isUrl(from)) {
		    param.from = from;
	    } else {
		    if(from !== ""){
			    param.from  = pHost + from;
		    }
	    }
	    var paramStr = $.param(param);
	    if(paramStr != ""){
		    url = url + "?" + paramStr;
	    }
    }
    window.location.href = url;
  };

  var Member = {

    memberLogin: function (options) {
      _getLink(LINKS.MEMBER_LOGIN, options);
    },

    nonMemberLogin: function (options) {
      //_getLink(LINKS.NON_MEMBER_LOGIN, options);
      var model = UserModel.NotUserLoginModel.getInstance();

      options = _.extend({
        callback: function () {
        }
      }, options || {});

      model.excute(options.callback, options.callback);
    },

    register: function (options) {
      _getLink(LINKS.REGISTER, options);
    },

    /**
     * 自动登录
     * @param url
     */
    autoLogin:          function (opt) {
	    var url = opt.url || window.location.href;
	    //var result = cUtility.urlParse(url),
	    var token = cUtility.getUrlParam(url, '__token__'),
		    userStore = CommonStore.UserStore.getInstance(),
		    headStore = CommonStore.HeadStore.getInstance(),
		    userInfo, self = this;
	    //如果URL中存在用户auth,去取登录信息
	    if (token) {
		    try {
			    var data = cUtilityCrypt.Base64.decode(decodeURIComponent(token));
			    userInfo = JSON.parse(data);
		    } catch (e) {
			    opt.callback && opt.callback();
			    return;
		    }
		    var getuUserInfo = function(){
			    //用戶auth不同，或者auth相同，旧的用户为未注册用户
			    userStore.removeUser();
			    headStore.setAuth(userInfo.auth)
			    var userModel = UserModel.UserLoginModel.getInstance();
			    userModel.param = {
				    'Auth': userInfo.auth
			    };
			    var sucCb = function (data) {
				    //如果返回的没有UserID字段,认为是无效数据
				    if (data.UserID) {
					    data.Auth = userInfo.auth;
					    data.LoginName = data.LoginName || "";
					    delete data.ResponseStatus;
					    delete data.Result;
					    userStore.setUser(data);
					    userStore.setExpireTime(userInfo.time);
				    }
				    //继续app初始化过程
				    opt.callback && opt.callback();
			    };
			    var errCb = function () {
				    self.memberLogin();
			    }
			    userModel.excute(sucCb, errCb);
		    }
		    //如果用户旧的auth与新传来的auth相同，需要判断旧的auth是否是注册用户
		    if(userStore.getAuth() === userInfo.auth){
			    if(userStore.isNonUser()){
				    //如果是非注册用户,重新调用用户登录接口
				    getuUserInfo();
			    } else {
				    //继续app初始化过程
				    opt.callback && opt.callback();
			    }
		    }else if (userStore.getAuth() !== userInfo.auth) {
			    //如果用户旧auth与新传来的auth不同,则取新用户信息
			    getuUserInfo();
		    }
	    } else {
		    //继续app初始化过程
		    opt.callback && opt.callback();
	    }
    },
    /**
     * 获取登录auth完成
     * @returns {boolean}
     */
    app_finished_login: function () {
      return false
    }
  };

  var HybridMember = {
    memberLogin: function (options) {
      Facade.request({ name: Facade.METHOD_MEMBER_LOGIN, callback: options.callback, isShowNonMemberLogin: options.isShowNonMemberLogin});
    },

    nonMemberLogin: function (options) {
      Facade.request({ name: Facade.METHOD_NON_MEMBER_LOGIN, callback: options.callback });
    },

    register: function (options) {
      Facade.request({ name: Facade.METHOD_REGISTER, callback: options.callback });
    },

    autoLogin:          function (options) {
      Facade.request({ name: Facade.METHOD_AUTO_LOGIN, callback: options.callback });
    },
    app_finished_login: function (options) {
      Facade.request({ name: Facade.METHOD_APP_FINISHED_LOGIN, userInfo: options.userInfo, callback: options.callback});
    }
  };

  WidgetFactory.register({
    name: WIDGET_NAME,
    fn:   Util.isInApp() ? HybridMember : Member
  });
});
