/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIToast
* @description 提示框
*/
define(['libs', 'cBase', 'cUILayer'], function (libs, cBase, Layer) {

  var options = {};

  var _config = {
    prefix: 'cui-',
    sleep: 2
  };

  var _handler = null;

  var _showHandler = null;
  var _hideHandler = null;
  var _superReposition = null;

  var _resetClickEvent = function (callback) {
    this.hide();

    if (callback && typeof callback === 'function') {
      callback.call(this);
    }

    $('.cui-opacitymask').unbind('click');
    $('.cui-toast').unbind('click');
  };

  var _setClickToHideEvent = function (clickToHide, callback) {
    var scope = this;
    var _clickCallback = function () {

        // 为什么要先unbind再rebind？
        //答:为了避免click事件队列的产生.确认每次注册的事件是干净的
      $('.cui-opacitymask').unbind('click').bind('click', function () {
        _resetClickEvent.call(scope, callback);
      });

      $('.cui-toast').unbind('click').bind('click', function () {
        _resetClickEvent.call(scope, callback);
      });
    }

    if (clickToHide) {
      setTimeout(_clickCallback, 400);
    }
  };

  var _show = function (title, sleep, callback, clickToHide) {
    var scope = this;
    this.setContent(title);

    //在toast显示前，就计算出显示的位置 shbzhang 2014-10-14 17:30:12
    var el = document.activeElement;
    if ($.needFocus(el)) {
      if (!this.focusPosition) this.focusPosition = true;
      var _top = parseInt($(el).offset().top) + 30;
      this.root.css({ 'top': _top + 'px', position: 'absolute' });

      this.reposition = function () { };
    } else {
      this.reposition = _superReposition;
    }

    if (typeof _showHandler === 'function') {
      _showHandler.call(this);
    };

    var _callback = function () {
      _resetClickEvent.call(scope, callback);
    }
    var _timeout = (sleep || _config.sleep) * 1000;
    _handler = setTimeout(_callback, _timeout);

    _setClickToHideEvent.call(this, clickToHide, callback);

    /*this.focusPosition = setInterval($.proxy(function () {
      var el = document.activeElement;
      if ($.needFocus(el)) {
        if (!this.focusPosition) this.focusPosition = true;
        var _top = parseInt($(el).offset().top) + 30;
        this.root.css({ 'top': _top + 'px', position: 'absolute' });
      }
    }, this), 20);*/

  };

  var _hide = function () {
    clearTimeout(_handler);
    if (this.focusPosition) {
        //clearInterval(this.focusPosition);
        this.root.css({ 'top': '50%', position: 'fixed' });
    }
    if (typeof _hideHandler === 'function') {
      _hideHandler.call(this);
    };
  };

  options.__propertys__ = function () {

    _showHandler = this.show;
    _hideHandler = this.hide;
    _superReposition = this.reposition;

    this.show = _show;
    this.hide = _hide;
  };

  options.initialize = function ($super, options) {
    this.addClass([_config.prefix + 'toast']);
    $super(options);
  };

  options.setContent = function (content) {
    this.create();
    this.contentDom.html(content);
  };

  var Toast = new cBase.Class(Layer, options);
  return Toast;
});