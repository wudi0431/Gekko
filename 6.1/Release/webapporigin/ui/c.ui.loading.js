/**
* @author oxz欧新志 <ouxz@Ctrip.com> / l_wang王磊 <l_wang@Ctrip.com>
* @class cUILoading
* @description loading层
*/
define(['libs', 'cBase', 'cUILayer'], function (libs, cBase, Layer) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  /** 用于abstractView执行的对象 */
  var _attributes = {};

  _attributes['class'] = _config.prefix + 'loading';

  _attributes.onCreate = function () { };

  _attributes.onShow = function () {
    this.contentDom.html('<div class="cui-breaking-load"><div class="cui-i cui-w-loading"></div><div class="cui-i cui-m-logo"></div></div>');
    this.reposition();
  };

  /** 相关属性 */
  options.__propertys__ = function () {
    this.contentDom;
    this.loadHtml = '';
  };

  /** 构造函数入口 */
  options.initialize = function ($super) {

    $super(_attributes);
  };

  /**
  * @method setHtml
  * @param html {String}    内容体
  * @description 设置loading的内容
  */
  options.setHtml = function (html) {
    this.loadHtml = html;
  };

  return new cBase.Class(Layer, options);

});