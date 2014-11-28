/* File Created: 六月 23, 2013 */
window.onunload = function () {};
define(['libs', 'cUIAlert', 'cUIWarning', 'cUIHeadWarning', 'cUIWarning404', 'cUIToast', 'cStorage', 'cBase', 'CommonStore', 'cUtility', 'cUILoading', 'cUIBubbleLayer', 'cWidgetFactory', 'cWidgetGuider'],
  function (libs, Alert, Warning, HeadWarning, Warning404, Toast, cStorage, cBase, CommonStore, cUtility, Loading, cUIBubbleLayer, WidgetFactory) {

  //适配app 张爸爸
  var Guider = WidgetFactory.create('Guider');

  var localStorage = cStorage.localStorage;
  //用于切换页面时，让当前input失去焦点
  document.body && (document.body.tabIndex = 10000);

  var _alert = new Alert({
      title : '提示信息',
      message : '',
      buttons : [{
          text : '知道了',
          click : function () {
            this.hide();
          }
        }
      ]
    });

  var _confirm = new Alert({
      title : '提示信息',
      message : '您的订单还未完成，是否确定要离开当前页面？',
      buttons : [{
          text : '取消',
          click : function () {
            this.hide();
          },
          type : Alert.STYLE_CANCEL
        }, {
          text : '确定',
          click : function () {
            this.hide();
          },
          type : Alert.STYLE_CONFIRM
        }
      ]
    });

  var _warning = new Warning({
      title : ''
    });

  var _headwarning = new HeadWarning({
      title : ''
    });

  var _warning404 = new Warning404();

  var _loading = new Loading();

  var _toast = new Toast();

  //气泡弹层
  var _bubbleLayer = new cUIBubbleLayer();

  //l_wang新增验证方法解决fixed导致问题
  var elSelector = ['.fix_bottom', '.fix_b', 'header', '.order_btnbox'];

  //需要处理的wrapper
  var elWrapper = '.cont_blue , .cont_blue1';

  //保存fixed定时器
  var FIXED_RESOURCE = null;

  //修正fixed引起的问题
  function reviseFixed() {
    return false;
    var el = $(elSelector.join(','));
    if (document.activeElement.nodeName == 'INPUT' && (document.activeElement.type == 'tel' || document.activeElement.type == 'text')) {
      el.css('position', 'static');

      //需要处理的wrapper，左盟主48px问题
      $(elWrapper).css('margin-top', '0px');

    } else {
      el.css('position', 'fixed');
      $(elWrapper).css('margin-top', '48px');

      if (FIXED_RESOURCE) {
        clearInterval(FIXED_RESOURCE);
        FIXED_RESOURCE = null;
      }
    }
  }

  return Backbone.View.extend({

    ENUM_STATE_NOCREATE : 0,
    ENUM_STATE_CREATE : 1,
    ENUM_STATE_LOAD : 2,
    ENUM_STATE_SHOW : 3,
    ENUM_STATE_HIDE : 4,
    //子类可以设置此pageid，用于autotest
    pageid : 0,
    hpageid : 0,

    

    //视图的scroll位置
    scrollPos : {
      x : 0,
      y : 0
    },
    header : null,
    footer : null,

    // ui controller
    warning : null,
    alert : null,
    // ------------

    //viewPath
    viewPath: "",
    //ubt 使用的模拟 reffer
    ubtReferrer: "",

    onCreate : function () {},
    viewInitialize : function () {},
    initialize : function (request, appliction, viewname) {
      this.$el.addClass('sub-viewport');
      this.id = _.uniqueId('viewport');
      this.$el.attr('id', 'id_' + this.id);
      this.viewname = viewname;
      //添加自定义pageid
      if (this.pageid)
        this.$el.attr('page-id', this.pageid);

      this.viewdata = {};
      this.appliction = appliction;
      this.request = request;
      this.$el.attr('page-url', this.request.viewpath);
      this.state = this.ENUM_STATE_CREATE;

      //初始化alert
      this.alert = _alert;

      //初始化warning
      this.warning = _warning;

      //初始化headwarning
      this.headwarning = _headwarning;

      //初始化headwarning
      //this.NoHeadWarning = new cUI.NoHeadWarning({
      //  content: ''
      //});

      //初始化404提示
      this.warning404 = _warning404;

      //初始化loading框，将app.js里面的loading移过来
      this.loading = _loading;

      //初始化toast
      this.toast = _toast;

      //初始化气泡浮层
      this.bubbleLayer = _bubbleLayer;

      this.confirm = _confirm;

      //加入页面自定义的css
      if (_.isArray(this.css)) {
        this.appendCss(this.css);
      }

      try {
        this.onCreate();
      } catch (e) {
        //alert(this.request.viewpath+'/onCreate/Error:'+JSON.stringify(e));
      }
    },
    _initializeHeader : function () {
      var self = this;
      if (this.header.backUrl) {
        this.$el.on('click', '#js_return', function () {
          self.back(self.header.backUrl);
        });
      }
      if (this.header.home) {
        this.$el.delegate('#js_home', 'click', function () {
          self.home();
        });
      }
      if (this.header.phone) {
        this.$el.find('#js_phone').attr('href', 'tel:' + this.header.phone);
      }
      if (this.header.title) {
        this.$el.find('header h1').text(this.header.title);
      }
      if (this.header.subtitle) {
        this.$el.find('header p').text(this.header.subtitle);
      }
      if (this.header.rightAction) {
        this.$el.delegate('header div', 'click', this.header.rightAction);
      }
    },
    _initializeFooter : function () {

      if (cUtility.isInApp()) {
        return;
      }

      if (this.footer) {
        this.footer.hide();
        //设置footer的view
        this.footer.setCurrentView(this);

        //临时解决广告不消失问题
        if (this.hasAd && !this.footer.isExpire()) {
          var ctn = this.adContainer ? this.$el.find('#' + this.adContainer) : $('#footer');
          var oldRootBox = this.footer.rootBox;
          if (oldRootBox && oldRootBox.attr('id') != ctn.attr('id')) {
            this.footer.remove();
            this.footer.isCreate = false;
          }
          this.footer.update({
            rootBox : ctn
          });
          this.footer.show();
        }
      }

    },

    //触发load事件
    __onLoad : function (lastViewName) {

      //l_wang 检测android localstorage 读写问题
      if (location.href.indexOf('ugly_andriod2') > 0) {
        window.location = 'http://m.ctrip.com/html5/';
        return;
      }
      this.TEST_ANDRIOD_STORAGE = 1;
      localStorage.set('TEST_ANDRIOD_STORAGE', 1);

      //切换页面时，确保当前input失去焦点
      document.activeElement && document.activeElement.blur();
      this.getServerDate();

      this.header = this._getDefaultHeader();
      this.state = this.ENUM_STATE_LOAD;

      if (!this.ubtReferrer) {
        this.ubtReferrer = this._getViewReffer(lastViewName);
      }
      // try {
      this.onLoad && this.onLoad(lastViewName);
      //  } catch (e) {
      //alert(this.request.viewpath+'/onLoad/Error:'+JSON.stringify(e));
      //  }

    },
    //触发Show事件
    __onShow : function () {

      //切换页面时，确保当前input失去焦点
      document.activeElement && document.activeElement.blur();
      document.activeElement.blur;

      this.state = this.ENUM_STATE_SHOW;
      //fix scroll bug shbzhang 2013.10.10
      window.scrollTo(0, 0);
      try {
        this.onShow && this.onShow();
      } catch (e) {
        //alert(this.request.viewpath + '/onShow/Error:' + JSON.stringify(e));
      }
      //add by byl   onshow完毕之后，判断getAppUrl 的返回值，并且放到隐藏域中
      this.saveAppUrl();
      //ubt统计
      //if (!location.host.match(/localhost|172\.16|127\.0|210\.13/ig)) {
      this._sendUbt();
      //}
      this._initializeHeader();
      this._initializeFooter();

      if (this.addScrollListener) {
       this._onWidnowScroll = $.proxy(this.onWidnowScroll, this);
        this.addScrollListener();
      }
      //ga统计
      this._sendGa();

      //Kenshoo统计
      this._sendKenshoo();
      this._sendMarin();

      this._googleReMark();
      this.resetViewMinHeight();

      //l_wang 新增代码用以解决
      //事件只能绑定一次
      //&& ('ontouchstart' in window)
      if (!this.FixedInput) {
        this.$('input').on('focus', function (e) {
          if (e.target.type == 'tel' || e.target.type == 'text') {
            if (!FIXED_RESOURCE) {
              reviseFixed();
              FIXED_RESOURCE = setInterval(function () {
                  reviseFixed();
                }, 500);
            }
          }
        });
        this.FixedInput = true;
      }

      //l_wang检测android问题
      if (!(localStorage.get('TEST_ANDRIOD_STORAGE') && localStorage.get('TEST_ANDRIOD_STORAGE') == this.TEST_ANDRIOD_STORAGE)) {
        //读写失效了我还何必存...
        //window.navigator.userAgent
        if (location.href.indexOf('ugly_andriod1') > 0) {
          window.location.search = 'ugly_andriod2=' + Math.random();
          return;
        } else {
          window.location.search = 'ugly_andriod1=' + Math.random();
          return;
        }
        localStorage.remove('TEST_ANDRIOD_STORAGE');
      }

    },
    //add by byl 如果BU实现了getAppUrl,并且有返回值，则将返回值写到隐藏域app_url中
    saveAppUrl : function () {
      var appUrlDoom = $('#app_url');
      var isNewAppUrl = false;
      //add by byl   onshow完毕之后，创建隐藏域
      if (this.getAppUrl && typeof this.getAppUrl === 'function') {
        var newAppUrl = this.getAppUrl();
        //创建隐藏域节点
        if (newAppUrl && _.isString(newAppUrl)) {
          isNewAppUrl = true;
          if (!appUrlDoom.length) {
            $('<INPUT type="hidden" id="app_url" value="' + newAppUrl + '"/>').appendTo($('body'));
          } else {
            appUrlDoom.val(newAppUrl);
          }
        }
      }
      if (!isNewAppUrl) {
        //如果没有,需要将隐藏域置空
        if (appUrlDoom.length > 0) {
          appUrlDoom.val("");
        }
      }
    },
    //兼容min-height，重置view高度
    resetViewMinHeight : function () {
      //暂时兼容性处理
      //            var main = $('#main');
      //            var main_frame = main.find('.main-frame');
      //            var main_viewport = main_frame.find('.main-viewport');
      //            var sub_viewport = main_viewport.find('.sub-viewport');
      //            var h = $(window).height();
      //            $('body').css('min-height', h);
      //            main.css('min-height', h);
      //            main_frame.css('min-height', h);
      //            main_viewport.css('min-height', h);
      //            sub_viewport.css('min-height', h);

    },
    //触发hide事件
    __onHide : function (id) {
      this.state = this.ENUM_STATE_HIDE;
      this.onHide && this.onHide(id);
      this.hideHeadWarning();
      //this.hideNoHeadWarning(;)
      this.hideWarning();
      this.hideLoading();
      this.hideWarning404();
      this.hideToast();
      this.hideConfirm();
      this.hideMessage();

      if (this.onBottomPull) {
        this.removeScrollListener();
      }
      //      this.scrollPos = {
      //        x: window.scrollX,
      //        y: window.scrollY
      //      }

    },

    showLoading : function () {
      this.loading.show();
      this.loading.firer = this;
    },
    hideLoading : function () {
      if (!this.loading.firer || this.loading.firer == this)
        this.loading.hide();
    },

    forward : function (url, replace) {
      this.appliction.forward.apply(null, arguments);
    },
    back : function (url) {
      // 在ios环境中使用application.back()会出现问题！
      // 作为一个调查点保留
      // if (cUtility.isInApp()) {
      // this.appliction.forward(url);
      // } else {
      this.appliction.back.apply(null, arguments);
      // }
    },
    jump : function (url, replace) {
      if (replace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
    },
    home : function () {
      this.appliction.forward('');
    },
    setTitle : function (title) {
      this.appliction.setTitle("携程旅行网-" + title);
    },
    //还原到原来的滚动条位置
    restoreScrollPos : function () {
      window.scrollTo(this.scrollPos.x, this.scrollPos.y);

      //      setTimeout($.proxy(function () {
      //        window.scrollTo(this.scrollPos.x, this.scrollPos.y);
      //      }, this), 20)
    },
    /**
     * 获得url中查询字符串，类似于get的请求参数
     * @param name {String} 要查询参数的key
     * @return {String}
     * @demo
     * #ticketlist/?name=value
     * var v = this.getQuery('name');
     * console.log(v);//value;
     *
     */
    getQuery : function (name) {
      return this.request.query[name] || null;
    },
    /**
     * 获得url中路径中的某一部分
     * @param index {Number} 在路径中某个段的值
     * @param {String} 要查询的路径的value
     * @demo
     * #ticketlist/!value/hoe
     * var v = this.getPath(0);
     * console.log(v);//value;
     */
    getPath : function (index) {
      return this.request.path[index] || null;
    },
    getRoot : function () {
      return this.request.root || null;
    },
    showMessage : function (message, title) {
      this.alert.setViewData({
        message : message,
        title : title
      });
      this.alert.show();
    },

    hideMessage : function () {
      this.alert.hide();
    },

    showConfirm : function (message, title, okFn, cancelFn, okTxt, cancelTxt) {
      //如果传入的是对象的话，直接用作初始化
      if (typeof message == 'object' && message.message) {
        this.confirm.setViewData(message);
      } else {
        this.confirm.setViewData({
          message : message,
          title : title,
          buttons : [{
              text : (cancelTxt || '取消'),
              click : function () {
                if (typeof cancelFn == 'function') {
                  cancelFn();
                }
                this.hide();
              },
              type : Alert.STYLE_CANCEL
            }, {
              text : (okTxt || '确定'),
              click : function () {
                if (typeof okFn == 'function') {
                  okFn();
                }
                this.hide();
              },
              type : Alert.STYLE_CONFIRM
            }
          ]
        });
      }
      this.confirm.show();
    },

    hideConfirm : function () {
      this.confirm.hide();
    },

    showWarning : function (title, callback) {
      if (title)
        this.warning.setTitle(title, callback);
      this.warning.show();
    },
    hideWarning : function () {
      this.warning.hide();
    },
    showHeadWarning : function (title, content, callback) {
      if (title)
        this.headwarning.setTitle(title, content, callback);
      this.headwarning.show();
    },

    hideHeadWarning : function () {
      this.headwarning.hide();
    },

    showBubbleLayer : function (opts) {
      this.bubbleLayer.showMenu(opts);
    },

    hideBubbleLayer : function () {
      this.bubbleLayer.hide();
    },

    showWarning404 : function (callback, options) {
      if (callback)
        this.warning404.retryClick(callback);
      this.warning404.show();
      if (options)
        this.warning404.options(options);
      this.warning404.firer = this;
    },

    hideWarning404 : function () {
      if (!this.warning404.firer || this.warning404.firer === this)
        this.warning404.hide();
    },

    showNoHeadWarning : function (content, top) {
      if (content)
        this.NoHeadWarning.setContent(content, top);
      this.NoHeadWarning.show();
    },
    //hideNoHeadWarning: function () {
    //  this.NoHeadWarning.hide();
    //},
    showToast : function (title, timeout, callback, clickToHide) {
      if (this.toast.isShow()) {
        return;
      }
      clickToHide = (typeof clickToHide != 'undefined') ? clickToHide : true;
      this.toast.show(title, timeout, callback, clickToHide);
      this.toast.firer = this;
    },
    hideToast : function () {
      if (!this.toast.firer || this.toast.firer == this)
        this.toast.hide();
    },
    updateHeader : function (options) {
      for (var key in options) {
        this.header[key] = options[key];
      }
      this._initializeHeader();
    },
    _getDefaultHeader : function () {
      return {
        backUrl : null,
        home : false,
        phone : null,
        title : null,
        subtitle : null,
        rightAction : null
      };
    },

    getServerDate : function (callback) {
      return cUtility.getServerDate(callback);
    },
    now : function () {
      return cUtility.getServerDate();
    },

    _sendUbt : function () {
      if (window.$_bf && window.$_bf.loaded == true) {

        var query = this.request.query;
        var pId = $('#page_id'),
        oId = $('#bf_ubt_orderid');
        var url = this._getViewUrl(),
        pageId,
        orderid = "";

        if (cUtility.isInApp()) {
          if (this.hpageid == 0) {
            return;
          }
          pageId = this.hpageid;
        } else {
          if (this.pageid == 0) {
            return;
          }
          pageId = this.pageid;
        }

        if (query) {
          orderid = query.orderid || query.oid || "";
        }

        if (oId.length == 1) {
          oId.val(orderid)
        }

        window.$_bf['asynRefresh']({
          page_id : pageId,
          orderid : orderid,
          url : url,
          refer : this.ubtReferrer
        });
      } else {
        if (!cUtility.isInApp()) {
          setTimeout($.proxy(this._sendUbt, this), 300);
        }
      }
    },

    /**
     * 统计GA
     */
    _sendGa : function () {
      //ga统计
      if (typeof ga !== 'undefined') {
        // _gaq.push(['_trackPageview', location.href]);
        ga('send', 'pageview', location.href);
      } else {
        setTimeout($.proxy(this._sendGa, this), 300);
      }
    },

    /**
     * Kenshoo统计代码
     */
    _sendKenshoo : function () {
      var query = this.request.query;
      if (query && query.orderid) {
        var kurl = "https://2113.xg4ken.com/media/redir.php?track=1&token=8515ce29-9946-4d41-9edc-2907d0a92490&promoCode=&valueCurrency=CNY&GCID=&kw=&product="
          kurl += "&val=" + (query.val || query.price) + "&orderId=" + query.orderid + "&type=" + query.type;
        var imgHtml = "<img style='position: absolute;' width='1' height='1' src='" + kurl + "'/>"
          $('body').append(imgHtml);
      }
    },

    /**
     * 发送Marinsm 统计
     */
    _sendMarin : function () {
      var query = this.request.query;
      if (query && query.orderid) {
        var murl = "https://tracker.marinsm.com/tp?act=2&cid=6484iki26001&script=no"
          murl += "&price=" + (query.val || query.price) + "&orderid=" + query.orderid + "&convtype=" + query.type;
        var imgHtml = "<img style='position: absolute;' width='1' height='1' src='" + murl + "'/>"
          $('body').append(imgHtml);
      }
    },

    /**
     * google 再分销
     */
    _googleReMark : function () {
      var url = this._getViewUrl();
      Guider.app_log_google_remarkting(url);
    },

    /**
     * 获得页面Url,hyrbid会增加一个虚拟域名
     */
    _getViewUrl : function () {
      /*var url = this._getViewPath() + "#" + this.viewname
      return url;*/
      var url = location.href;
      if (cUtility.isInApp()) {
        var idx = url.indexOf('webapp');
        url = 'http://hybridm.ctrip.com/' + url.substr(idx);
      }
      this.viewPath = url;
      return this.viewPath;
    },

    /**
     * 获得UBT的reffer
     */
    _getViewReffer : function (prePageName) {
      var reffer = document.referrer;
      if (prePageName) {
        reffer = this._getViewPath() + "#" + prePageName;
      }
      return reffer;
    },

    /**
     * 获取当前路径
     */
    _getViewPath : function () {
      var l = window.location;
      var host = l.protocol + "//" + l.host;
      var pathName = l.pathname;
      if (cUtility.inApp) {
        host = "http://hybridm.ctrip.com";
        var idx = pathName.indexOf('webapp');
        pathName = "/" + pathName.substr(idx);
      }

      return host + pathName;
    },

    //获得guid
    getGuid : function () {
      return cUtility.getGuid();
    },
    setTitle : function (title) {
      document.title = title;
    },
    appendCss : function (styles) {
      if (!styles)
        return;
      for (var i = 0, len = styles.length; i < len; i++) {
        if (!this.css[styles[i]]) {
          this.head.append($('<link rel="stylesheet" type="text/css" href="' + styles[i] + '" />'));
          this.css[styles[i]] = true;
        }
      }
    },

    addClass : function (name) {
      this.$el.addClass(name);
    },

    removeClass : function (name) {
      this.$el.removeClass(name);

    },

    //新增view load 方法，此方法会触发其onload事件
    __load : function (lastViewName) {

      this.__onLoad(lastViewName);
    },

    //新增view 的show方法
    __show : function () {

      //在快速前进或是返回时，viewport会莫名其妙丢失view
      //这里强制判断，不存在则强行插入。
      if (!this.viewport) {
        return;
      }
      if (!this.viewport.find('#id_' + this.id).length) {
        this.viewport.append(this.$el);
      }

      this.$el.show();
    },

    //新增view 的hide方法
    __hide : function (viewname) {

      this.$el.hide();
    }

  });
});
