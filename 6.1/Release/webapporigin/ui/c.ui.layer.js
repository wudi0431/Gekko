/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUILayer
* @description 弹出层类的父类
*/
define(['libs', 'cBase', 'cUIAbstractView', 'cUIMask'], function (libs, cBase, AbstractView, Mask) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  //  var _mask = new Mask({
  //    classNames: [_config.prefix + 'opacitymask']
  //  });

  /** 相关属性 */
  options.__propertys__ = function () {
    this.tpl = this.template([
                '<div class="' + _config.prefix + 'layer-padding">',
                '<div class="' + _config.prefix + 'layer-content"><%=content%></div>',
                '</div>'
            ].join(''));
    this.content = '';
    this.contentDom;
    this.mask = new Mask({
      classNames: [_config.prefix + 'opacitymask']
    });
    this.addClass(_config.prefix + 'layer');
    this.viewdata = {};
    this.windowResizeHander;
    this.setIntervalResource;
    this.setIntervalTotal = 0;
  };

  /** 构造函数入口 */
  options.initialize = function ($super, opts) {
    var allowConfig = {
      content: true
    };
    this.setOption(function (k, v) {
      switch (true) {
        case allowConfig[k]:
          this[k] = v;
          break;
        case 'class' === k:
          this.addClass(v);
          break;
      }
    });

    this.bindEvent();
    $super(opts);
    this.loadViewData();
  };

  /**
  * @method loadViewData
  * @description 加载viewdata
  */
  options.loadViewData = function () {
    this.viewdata.content = this.content;
  };

  /**
  * @method setViewData
  * @param data {Object}    数据参数
  * @description 设置viewdata
  */
  options.setViewData = function (data) {
    this.viewdata = cUtility.mix(this.viewdata, data);
    this.setRootHtml(this.createHtml());
  };

  /**
  * @method bindEvent
  * @description 绑定事件
  */
  options.bindEvent = function () {

    this.addEvent('onCreate', function () {
      this.windowResizeHander = $.proxy(this.reposition, this);
      this.contentDom = this.root.find('.' + _config.prefix + 'layer-content');
    });

    this.addEvent('onShow', function () {
      this.mask.show();
      $(window).bind('resize', this.windowResizeHander);

      //解决三星浏览器渲染问题
//      this.root.css('visibility', 'hidden');
      this.reposition();
      //显示以后，连续计算位置
      this.setIntervalResource = setInterval($.proxy(function () {
        if (this.setIntervalTotal < 10) {
          this.windowResizeHander();
        } else {
          this.setIntervalTotal = 0;
          this.root.css('visibility', 'visible');
          clearInterval(this.setIntervalResource);
        }
        this.setIntervalTotal++;
      }, this), 1);
      this.setzIndexTop();
    });

    this.addEvent('onHide', function () {
      $(window).unbind('resize', this.windowResizeHander);
      clearInterval(this.setIntervalResource);
      this.root.css('visibility', 'visible');
      this.mask.hide();

    });
  };

  /**
  * @method createHtml
  * @description 移除各个事件点添加需要回调的函数
  */
  options.createHtml = function () {
    return this.tpl(this.viewdata);
  };

  /**
  * @method createHtml
  * @param fn {function}    回调函数
  * @description 点击蒙版关闭控件时候要触发的事件
  */
  options.maskToHide = function (fn) {

    this.mask.root.on('click', $.proxy(function () {
      this.hide();
      typeof fn == 'function' && fn();
      this.mask.root.off('click');
    }, this));

    this.mask.addEvent('onHide', function () {
      this.root.off('click');
      this.root.remove();
    });

  };

  return new cBase.Class(AbstractView, options);
});