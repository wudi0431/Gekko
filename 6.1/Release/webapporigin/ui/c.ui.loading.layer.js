/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUILoadingLayer
* @description 带关闭按钮的loading层
*/
define(['libs', 'cBase', 'cUILayer'], function (libs, cBase, Layer) {
  var _config = {
    prefix: 'cui-'
  };

  /** 用于abstractView执行的对象 */
  var _attributes = {};

  _attributes['class'] = _config.prefix + 'loading';
  _attributes.onShow = function () {
    this.contentDom.html([
                     '<div class="cui-grayload-text">',
                         '<div class="cui-i cui-w-loading"></div>',
                         '<div class="cui-i cui-m-logo"></div>',
                         '<div class="cui-grayload-close"></div>',
                         '<div class="cui-grayload-bfont">' + this.text + '</div>',
                    '</div>'
                    ].join(''));
    this.root.find('.cui-grayload-close').off('click').on('click', $.proxy(function () {
      this.callback && this.callback();
      this.hide();
    }, this));
    this.reposition();
  };

  var options = {};

  /** 相关属性 */
  options.__propertys__ = function () {
    this.contentDom;
    this.callback = function () { };
    this.text = '发送中...';
  };

  /** 构造函数入口 */
  options.initialize = function ($super, callback, text) {
    this.callback = callback || function () { };
    this.text = text || '发送中...';
    $super(_attributes);
  };

  return new cBase.Class(Layer, options);

});