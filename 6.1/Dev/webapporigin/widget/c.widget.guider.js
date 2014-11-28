/**********************************
* @author:       cmli@Ctrip.com
* @description:  组件Guider
* @see: http://git.dev.sh.ctripcorp.com/cmli/ctrip-h5-document/blob/master/widget/t.widget.guider.md
*
*/
define(['cUtilityHybrid', 'cWidgetFactory', 'cHybridFacade', 'cHybridShell'], function (Util, WidgetFactory, Facade, Hish) {
  "use strict";

  var WIDGET_NAME = 'Guider';

  var HybridGuider = {
    jump: function (options) {
      var model = {
        refresh: function () {
          Facade.request({ name: Facade.METHOD_OPEN_URL, targetMode: 0, title: options.title, pageName: options.pageName});
        },
        app: function () {
          if (options && options.module) {
            var openUrl = Facade.getOpenUrl(options);
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: openUrl, targetMode: 1, title: options.title, pageName: options.pageName});
          } else if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 1, title: options.title, pageName: options.pageName});
          }
        },
        h5: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 2, title: options.title, pageName: options.pageName, isShowLoadingPage: options.isShowLoadingPage});
          }
        },
        browser: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 3, title: options.title, pageName: options.pageName, isShowLoadingPage: options.isShowLoadingPage});
          }
        },
        open: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 4, title: options.title, pageName: options.pageName, isShowLoadingPage: options.isShowLoadingPage});
          }
        },
        open_relative: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 5, title: options.title, pageName: options.pageName, isShowLoadingPage: options.isShowLoadingPage});
          }
        }
      };

      if (typeof model[options.targetModel] === 'function') {
        model[options.targetModel]();
      }
    },

    apply: function (options) {
      if (_.isObject(options) && _.isFunction(options.hybridCallback)) {
        options.hybridCallback();
      }
    },

    call: function (options) {
      return false;
    },

    init: function (options) {
      if (options && window.parseFloat(options.version) < 5.2) {
        Facade.request({ name: Facade.METHOD_ENTRY, callback: options.callback });
      } else {
        Facade.request({ name: Facade.METHOD_INIT, callback: options.callback });
      }
    },

    log: function (options) {
      Facade.request({ name: Facade.METHOD_LOG_EVENT, event_name: options.name });
    },

    print: function (options) {
      Facade.request({ name: Facade.METHOD_NATIVE_LOG, log: options.log, result: options.result });
    },

    callService: function () {
      Facade.request({ name: Facade.METHOD_CALL_SERVICE_CENTER });
    },

    backToLastPage: function (options) {
      var param = options ? options.param : '';
      Facade.request({ name: Facade.METHOD_BACK_TO_LAST_PAGE, param: param });
    },

    checkUpdate: function () {
      Facade.request({ name: Facade.METHOD_CHECK_UPDATE });
    },

    recommend: function () {
      Facade.request({ name: Facade.METHOD_RECOMMEND_APP_TO_FRIEND });
    },

    addWeixinFriend: function () {
      Facade.request({ name: Facade.METHOD_ADD_WEIXIN_FRIEND });
    },

    showNewestIntroduction: function () {
      Facade.request({ name: Facade.METHOD_SHOW_NEWEST_INTRODUCTION });
    },

    register: function (options) {
      if (options && options.tagname && options.callback) {
        Facade.register({ tagname: options.tagname, callback: options.callback });
      }
    },

    create: function () {
      Facade.init();
    },

    home: function () {
      Facade.request({ name: Facade.METHOD_BACK_TO_HOME });
    },

    jumpHotel: function (options) {
      Facade.request({ name: Facade.METHOD_GO_TO_HOTEL_DETAIL, hotelId: options.hotelId, hotelName: options.name, cityId: options.cityId, isOverSea: options.isOverSea });
    },

    injectUbt: function () {
      return false;
    },

    checkAppInstall: function (options) {
      Facade.request({ name: Facade.METHOD_CHECK_APP_INSTALL, url: options.url, package: options.package, callback: options.callback });
    },

    callPhone: function (options) {
      Facade.request({ name: Facade.METHOD_CALL_PHONE, tel: options.tel });
    },

    cross: function (options) {
      Facade.request({ name: Facade.METHOD_CROSS_JUMP, param: options.param, path: options.path });
    },

    refreshNative: function (options) {
      Facade.request({ name: Facade.METHOD_REFRESH_NATIVE, package: options.package, json: options.json });
    },

    copyToClipboard: function (options) {
      Facade.request({ name: Facade.METHOD_COPY_TO_CLIPBOARD, content: options.content });
    },

    readFromClipboard: function (options) {
      Facade.request({ name: Facade.METHOD_READ_FROM_CLIPBOARD, callback: options.callback });
    },

    shareToVendor: function (options) {
      Facade.request({ name: Facade.METHOD_SHARE_TO_VENDOR, imgUrl: options.imgUrl, text: options.text, title: options.title, linkUrl: options.linkUrl, isIOSSystemShare: options.isIOSSystemShare});
    },

    downloadData: function (options) {
      Facade.request({ name: Facade.METHOD_DOWNLOAD_DATA, url: options.url, callback: options.callback, suffix: options.suffix });
    },

    encode: function (options) {
      if (options && options.mode === 'base64') {
        Facade.request({ name: Facade.METHOD_ENCRYPT_BASE64, callback: options.callback, info: options.info });
      }
    },

    //+…2014-08-26……JIANGJing
    chooseContactFromAddressbook: function(options) {
      Facade.request({ name: Facade.METHOD_CHOOSE_CONTACT_FROM_ADDRESSBOOK, callback: options.callback });
    },

    //+…2014-08-26……JIANGJing
    hideLoadingPage: function() {
      Facade.request({ name: Facade.METHOD_HIDE_LOADING_PAGE });
    },

    //+…2014-08-26……JIANGJing
    showLoadingPage: function() {
      Facade.request({ name: Facade.METHOD_SHOW_LOADING_PAGE });
    },

    choose_invoice_title: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_CHOOSE_INVOICE_TITLE, callback: options.callback, title: options.title });
    },
    
    get_device_info: function(options)
    {
      Facade.request({name: Facade.METHOD_APP_GET_DEVICE_INFO, callback: options.callback});
    },
    
    show_voice_search: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_SHOW_VOICE_SEARCH, bussinessType: options.bussinessType});
    },
    
    choose_photo: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_CHOOSE_PHOTO, maxFileSize: options.maxFileSize, maxPhotoCount: options.maxPhotoCount, meta: options.meta, callback: options.callback});
    },
    
    finished_register: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_FINISHED_REGISTER, userInfo: options.userInfo});
    },
    
    app_call_system_share: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_CALL_SYSTEM_SHARE, imageRelativePath: options.imageRelativePath, 
          text: options.text, title: options.title, linkUrl: options.linkUrl});
    },
    
    app_check_network_status: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_CHECK_NETWORK_STATUS, callback: options.callback});
    },
    
    app_check_android_package_info: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_CHECK_ANDROID_PACKAGE_INFO, callback: options.callback});
    },
    
    app_log_google_remarkting: function(url)
    {
      Facade.request({ name: Facade.METHOD_APP_LOG_GOOGLE_REMARKTING,url:url});
    },
    
    app_read_verification_code_from_sms: function(options)
    {
      Facade.request({ name: Facade.METHOD_APP_READ_VERIFICATION_CODE_FROM_SMS, callback: options.callback});
    },
    
    app_h5_page_finish_loading: function(options)
    {
      Facade.request({ name: Facade.METHOD_H5_PAGE_FINISH_LOADING });
    },
    
    enable_drag_animation: function(options)
    {
      Facade.request({ name: Facade.METHOD_ENABLE_DRAG_ANIMATION, show: options.show});
    },
    
    save_photo: function(options)
    {
      if (!options.photoUrl) options.photoUrl = null;
      if (!options.photoBase64String) options.photoBase64String = null;
      options.name = Facade.METHOD_SAVE_PHOTO;
      Facade.request(options);
    }
  };

  HybridGuider.file = {

    isFileExist: function (options) {
      Facade.request({ name: Facade.METHOD_CHECK_FILE_EXIST, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    deleteFile: function (options) {
      Facade.request({ name: Facade.METHOD_DELETE_FILE, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    getCurrentSandboxName: function (options) {
      Facade.request({ name: Facade.METHOD_GET_CURRENT_SANDBOX_NAME, callback: options.callback });
    },

    getFileSize: function (options) {
      Facade.request({ name: Facade.METHOD_GET_FILE_SIZE, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    makeDir: function (options) {
      Facade.request({ name: Facade.METHOD_MAKE_DIR, callback: options.callback, dirname: options.dirname, relativeFilePath: options.relativeFilePath });
    },

    readTextFromFile: function (options) {
      Facade.request({ name: Facade.METHOD_READ_TEXT_FROM_FILE, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    writeTextToFile: function (options) {
      Facade.request({ name: Facade.METHOD_WRITE_TEXT_TO_FILE, callback: options.callback, text: options.text, isAppend: options.isAppend, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    }
  };

  HybridGuider.pipe = {

    /**
    * @param options.serviceCode 需要发送服务的服务号
    * @param options.header 服务的header
    * @param options.data 服务所需要的数据部分，各个服务都不同
    * @param options.callback 服务请求的回调
    */
    socketRequest: function (options) {
      var timestamp = Date.now();
      Facade.request({ name: Facade.METHOD_SEND_H5_PIPE_REQUEST, callback: options.callback, serviceCode: options.serviceCode, header: options.header, data: options.data, sequenceId: timestamp, pipeType: options.pipeType });
      return timestamp;
    },

    /**
    * @param options.url  HTTP请求发送的URL地址
    * @param options.method HTTP请求方式GET/POST/DELETE/PUT
    * @param options.header HTTP请求的头部
    * @param options.param HTTP请求参数
    * @param options.retry { timeout: "", retry:"", retryInterval:"" }
    * @param options.callback HTTP请求回调
    * @return sequenceId
    */
    httpRequest: function (options) {
      var timestamp = Date.now();
      Facade.request({ name: Facade.METHOD_SEND_HTTP_PIPE_REQUEST, callback: options.callback, target: options.url, method: options.method, header: options.header, queryData: options.param, retryInfo: options.retry, sequenceId: timestamp });
      return timestamp;
    },

    /**
    * @param options.id 需要取消的服务id
    */
    abortRequest: function (options) {
      Facade.request({ name: Facade.METHOD_ABORT_HTTP_PIPE_REQUEST, sequenceId: options.id });
    },

    /**
     * 取消socket pipe
     * @param sequenceId 需要取消的服务id
     */
    abortSocketRequest: function (sequenceId) {
      Facade.unregister({ name: Facade.METHOD_SEND_H5_PIPE_REQUEST, sequenceId: sequenceId });
    }

  };

  HybridGuider.pay = {

    /**
    * @see  http://jimzhao2012.github.io/api/classes/CtripPay.html#method_app_check_pay_app_install_status
    * @param options.callback 检查支付之后的回调 function(param){}
    * @example callback返回数据实例
    *    {
    *       platform:"iOS", //Android
    *       weixinPay:true,
    *       aliWalet:true,
    *       aliQuickPay:true,
    *    }
    */
    checkStatus: function (options) {
      Facade.request({ name: Facade.METHOD_CHECK_PAY_APP_INSTALL_STATUS, callback: options.callback });
    },

    /**
    * @see http://jimzhao2012.github.io/api/classes/CtripPay.html#method_app_check_pay_app_install_status
    * @param payAppName 支付App的URL，暂固定为以下4个， aliWalet/aliQuickPay/wapAliPay/weixinPay(微信支付暂未支持)
    * @param payURL 服务器返回的支付URL
    * @param successRelativeURL 支付成功跳转的URL
    * @param detailRelativeURL 支付失败或者支付
    */
    payOut: function (options) {
      Facade.request({ name: Facade.METHOD_OPEN_PAY_APP_BY_URL, payAppName: options.payAppName, payURL: options.payURL, successRelativeURL: options.successRelativeURL, detailRelativeURL: options.detailRelativeURL });
    },

    callPay: function(options) {
      Hish.Fn('call_pay').run(options);
    }
  };

  HybridGuider.encrypt = {
    /**
     * 携程自有加密
     * @param {String} options.inStr 输入字符串
     * @param {Function} options.callback 回调函数,
     *  回调参数格式为
      {
            inString:"abcdxxxx",
            outString:"ABScdXkYZunwXVF5kQpffnY+oL/MFmJGkn8ra8Ab5cI=",
            encType:1
        },
     */
    ctrip_encrypt: function (options) {
      Facade.request({ name: Facade.METHOD_ENCRYPT_CTRIP, callback: options.callback, inString:options.inStr, encType:1 });
    },
    /**
     * 携程自有解密
     * @param {String} options.inStr 输入字符串
     * @param {Function} options.callback 回调函数
     */
    ctrip_decrypt: function (options) {
      Facade.request({ name: Facade.METHOD_ENCRYPT_CTRIP, callback: options.callback, inString:options.inStr, encType:2 });
    }
  };

  var Guider = cloneEmptyFunc(HybridGuider);
  function cloneEmptyFunc(obj)
  {
    var emptyFuncObj = {};
    _.each(obj, function(val, key) {
      if (_.isFunction(val))
      {
        emptyFuncObj[key] = function() {
          return false;
        };  
      }
      else if (_.isObject(val))
      {
        emptyFuncObj[key] = cloneEmptyFunc(obj[key])  
      }
    });
    return emptyFuncObj;
  }
  Guider = _.extend(Guider, {
    jump: function (options) {
      if (options && options.url && typeof options.url === 'string') {
        window.location.href = options.url;
      }
    },

    apply: function (options) {
      if (options && options.callback && typeof options.callback === 'function') {
        options.callback();
      }
    },

    call: function (options) {
      var $caller = document.getElementById('h5-hybrid-caller');

      if (!options || !options.url || !typeof options.url === 'string') {
        return false;
      } else if ($caller && $caller.src == options.url) {
        $caller.contentDocument.location.reload();
      } else if ($caller && $caller.src != options.url) {
        $caller.src = options.url;
      } else {
        $caller = document.createElement('iframe');
        $caller.id = 'h5-hybrid-caller';
        $caller.src = options.url;
        $caller.style.display = 'none';
        document.body.appendChild($caller);
      }
    },    

    log: function (options) {
      if (window.console) {
        window.console.log(options.name);
      }
    },

    print: function (options) {
      return console.log(options.log, options.result);
    },

    callService: function () {
      window.location.href = 'tel:4000086666';
    },

    backToLastPage: function () {
      window.location.href = document.referrer;
    },

    home: function () {
      window.location.href = '/';
    } 
  })

  Guider.encrypt = {
    ctrip_encrypt : function(){return false},
    ctrip_decrypt : function(){return false}
  };
  WidgetFactory.register({
    name: WIDGET_NAME,
    fn: Util.isInApp() ? HybridGuider : Guider
  });
});
