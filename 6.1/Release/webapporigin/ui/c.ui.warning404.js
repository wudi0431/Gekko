/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIWarning404
* @description 404提示框
*/
define(['libs', 'cBase', 'cUIPageview', 'cWidgetFactory', 'cWidgetGuider'], function (libs, cBase, PageView, WidgetFactory) {

  var Guider = WidgetFactory.create('Guider');


  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  var _calback = function () { };

  var _attributes = {};
  _attributes['class'] = _config.prefix + 'warning';

  _attributes.onCreate = function () {
    this.options();
  }

  _attributes.onShow = function () {
    this.mask.root.css({
      'z-index': '1000'
    });
    this.root.css({
      'z-index': '1001'
    });

    window.scrollTo(0, 0);
  };

  _attributes.onHide = function () {
    //this.root.find(".cui-btns-retry").css({display: ''});
    //重置为默认参数
    this.options({});
  };

  options.__propertys__ = function () {
    this.retryDom;
    this.tel = '4000086666';
    this.callback = function () { };

    this.hashObserve = {
      start: function () { },
      end: function () { }
    };
  };

  options.initialize = function ($super, opts) {
    $super(_attributes, opts);
  };
  options.retryClick = function (callback) {
    if (callback) {
      this.callback = callback;
    }
  }

  //add by wliao <wliao@Ctrip.com>
  var defaults = {
    loadFailCls: 'cui-wifi cui-fail-icon',
    loadFail: '加载失败，请稍后再试试吧',
    telText: '或者拨打携程客服电话',
    tryAgain: '重试',
    contact: '联系客服',
    showContact: true
  };

  var template = [
        '<div class="head-warning">',
            '<div class="head-warning-padding">',
                '<div class="head-warning-content">',
                    '<div class="cui-load-fail cui-text-center">',
                      '<div class="cui-load-error">',
                            '<div class="cui-i <%= loadFailCls %>">',
                            '</div>',
                      '</div>',
                      '<p class="cui-gray"><%= loadFail %></p>',
                      '<button type="button" class="cui-btns-retry"><%= tryAgain %></button>',
                      '<% if (showContact) { %>',
                      '<div class="cui-404-tel">',
                      '<div class="cui-glines"></div>',
                      '<p class="cui-grayc"><%= telText %></p>',
                      '<span id="telBtn" class="cui-btns-tel"><span class="cui-i cui-warning-kf"></span><%= contact %></span>',
                      '</div>',
                      '<% } %>',
                  '</div>',
                '</div>',
            '</div>',
        '</div>'
      ].join('');

  options.options = function (options) {
    options = _.extend({}, defaults, options || {});

    this.root.html(_.template(template, options));

    this.addClass('head-warning-top');
    this.retryDom = this.root.find('.cui-btns-retry');

    this.retryDom.on('click', $.proxy(function () {
      this.callback && this.callback();
    }, this));

    var self = this;
    if (options.showContact) {
      this.root.find('#telBtn').click(function () {
        Guider.apply({
          hybridCallback: function () {
            Guider.callService();
          },
          callback: function () {
            window.location.href = 'tel:' + self.tel;
          }
        });
      });
    }
  }

  return new cBase.Class(PageView, options);

});