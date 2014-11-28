/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUIPageView
* @description 用于非弹出层类继承
*/
define(['libs', 'cBase', 'cUIAbstractView', 'cUIMask', 'cUIHashObserve'], function (libs, cBase, AbstractView, Mask, HashObserve) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

//  var _mask = new Mask({
//    classNames: [_config.prefix + 'warning-mask']
//  });

  /** 相关属性 */
  options.__propertys__ = function () {
    this.mask = new Mask({
      classNames: [_config.prefix + 'warning-mask']
    }); ;
    this.hashObserve = new HashObserve({
      hash: this.id,
      scope: this,
      callback: function () {
        this.hide();
      }
    });

  };

  /** 构造函数入口 */
  options.initialize = function ($super, opts) {
    this.addClass(_config.prefix + 'pageview');

    this.addEvent('onCreate', function () {
      this.mask.create();
      this.mask.root.css({
        background: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAPX19QAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==) repeat'
      });
      this.root.css({
        position: 'absolute',
        left: '0px',
        top: '0px'
      });
    });

    this.addEvent('onShow', function () {
      this.mask.show();
//      this.mask.root.css({
//        'z-index': '500'
//      });

      this.hashObserve.start();

      this.root.bind('touchmove', function (e) {
        e.preventDefault();
      });

    });

    this.addEvent('onHide', function () {
      this.mask.hide();
      setTimeout($.proxy(function () {
        this.hashObserve.end();
      }, this), 10);
    });

    // $super($.extend(_attributes, opts));
    $super(opts);
  };

  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return '';
  };

  return new cBase.Class(AbstractView, options);

});