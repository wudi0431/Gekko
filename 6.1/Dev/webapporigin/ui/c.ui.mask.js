/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUIMask
* @description 蒙版
*/
define(['libs', 'cBase', 'cUIAbstractView'], function (libs, cBase, AbstractView) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  /** 相关属性 */
  options.__propertys__ = function () {
  };

  /** 构造函数入口 */
  options.initialize = function ($super, opts) {
    this.bindEvent();
    this.addClass(_config.prefix + 'mask');
    $super(opts);
  };

  /**
  * @method bindEvent
  * @description 为各个事件点注册事件
  */
  options.bindEvent = function () {
    this.addEvent('onCreate', function () {
      this.setRootStyle();
      this.onResize = $.proxy(function () {
        this.resize();
      }, this);

      this.onResize();
    });

    this.addEvent('onShow', function () {
      this.setzIndexTop(-1);
      $(window).bind('resize', this.onResize);

      this.root.bind('touchmove', function (e) {
        e.preventDefault();
      });

      this.onResize();
    });

    this.addEvent('onHide', function () {
      $(window).unbind('resize', this.onResize);
      this.root.unbind('touchmove');
    });

  };

  /**
  * @method setRootStyle
  * @description 设置根节点样式
  */
  options.setRootStyle = function () {
    this.root.css({
      position: 'absolute',
      left: '0px',
      top: '0px'
    });
  };

  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return '<div></div>';
  };

  /**
  * @method resize
  * @description 尺寸改变时候要重新计算位置
  */
  options.resize = function () {
    var w = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    var h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    this.root.css({
      width: '100%',
      height: h + 'px'
    });
  };

  return new cBase.Class(AbstractView, options);

});