
/**
*
* by l_wang
*/

define(['cBase', 'cUILayer', 'cUIScroll'], function (cBase, Layer, Scroll) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  var _attributes = {};
  _attributes['class'] = _config.prefix + 'warning';

  _attributes.onCreate = function () {
    this.root.html([
        '<div class="cui-pop-box" lazyTap="true">',
              '<div class="cui-hd"><div class="cui-text-center">' + this.title + '</div>' + (this.needCloseBtn ? '<div class="lab-close-area" ><span class="cui-top-close">×</span></div>' : '') + '</div>',
              '<div class="cui-bd cui-roller-bd" style="overflow: hidden; position: relative; ">',
              '</div>',
        '</div>'
    ].join(''));

    this.title = this.root.find('.cui-text-center');
    this.content = this.root.find('.cui-bd');

  };
  _attributes.onShow = function () {
    var scope = this;
    this.maskToHide(function () {
      scope.hide();
    });

    var scroller = $('<ul class="cui-select-view " style="position: absolute; width: 100%; "></ul>');

    this.dataK = {};

    for (var i in this.data) {
      _data = this.data[i];
      _data.index = i;
      if (typeof _data.key == 'undefined') _data.key = _data.id;
      if (typeof _data.val == 'undefined') _data.val = _data.name;
      var val = _data.val || _data.key;
      var _tmp = $('<li>' + val + '</li>');
      _tmp.attr('data-index', i);
      if (typeof _data.disabled != 'undefined' && _data.disabled == false) {
        _tmp.css('color', 'gray');
      }
      if (i == this.index) _tmp.addClass('current');
      this.dataK[_data.key] = _data;
      scroller.append(_tmp);
    }

    this.content.append(scroller);

    var len = this.data.length;

    if (this.disItemNum > len) this.disItemNum = len;
    var _itemHeight = scroller.height() / len;
    var wrapperHeight = _itemHeight * this.disItemNum;
    this.content.css('height', wrapperHeight);

    this.scroll = new Scroll({
      wrapper: this.content,
      scroller: scroller
    });


    var page = 0;
    var index = this.index
    if (this.key) index = this.dataK[this.key].index;

    if (len - index < this.disItemNum) index = len - this.disItemNum;

    //    page = parseInt(index / this.disItemNum);

    var _top = (_itemHeight * index) * (-1);

    this.scroll.scrollTo(0, _top);

    var scope = this;

    scroller.on('click', $.proxy(function (e) {
      var el = $(e.target);

      if (el && el.attr('data-index') !== null) {
        var item = this.data[el.attr('data-index')];
        this.itemClick.call(scope, item);
        this.hide();
      }

    }, this));

    this.root.find('.cui-top-close').on('click', $.proxy(function () {
      this.hide();
    }, this));

    this.scroller = scroller;

    this.setzIndexTop();

    this.root.bind('touchmove', function (e) {
      e.preventDefault();
    });

    this.onHashChange = function () {
      this.hide();
    }
    $(window).on('hashchange', $.proxy(this.onHashChange, this));

  };
  _attributes.onHide = function () {

    this.scroll.destroy();
    this.root.unbind('touchmove');
    this.root.remove();
    $(window).off('hashchange', $.proxy(this.onHashChange, this));
    if (this.scroller) this.scroller.off('click');

    this.root.find('.cui-top-close').off('click');

  };

  options.__propertys__ = function () {
    this.title;
    this.content;
    this.itemClick = function () { };
    this.scroll = null;
    this.data = []; //用于组装list的数据
    this.index = -1; //当前索引值
    this.key = null;
    this.disItemNum = 5;

    this.needCloseBtn = false;

  };

  options.initialize = function ($super, opts) {
    this.setOption(function (k, v) {
      this[k] = v;
    });
    $super($.extend(_attributes, opts));
  };

  var ScrollRadioList = new cBase.Class(Layer, options);
  return ScrollRadioList;

});