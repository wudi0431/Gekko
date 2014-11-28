/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIGroupList
* @description 分组列表，多用于城市相关
*/
define(['cBase', 'cUIAbstractView'], function (cBase, AbstractView) {

  var options = {};

  options.__propertys__ = function () {

    //是否使用模板
    this.itemTemplate = false;

    //触发弹层的元素
    this.triggerEl = null;

    this.click = function () { };

  };

  options.initialize = function ($super, opts) {
    for (var k in opts) {
      this[k] = opts[k];
    }
    $super(opts);
    this.bindEvent();
    this.show();
    this.hide();

  };

  options.showMenu = function (opts) {
    for (var k in opts) {
      this[k] = opts[k];
    }

    //如果重置了data数据这块就需要处理
    if (opts.data) this.init();
    if (opts.dir) {
      this.el.removeClass('f-layer-before');
      this.el.removeClass('f-layer-after');

      if (opts.dir == 'up') {
        this.el.addClass('f-layer-before');
      } else {
        this.el.addClass('f-layer-after');
      }
    }

    //插件位置宽度调整
    this.adjustEl();

    this.show();

  };

  options.bindEvent = function () {
    this.addEvent('onHide', function () {
      this.root.off('click');
      if (this.clsLayer) document.removeEventListener('click', this.clsLayer, true);
    });

    this.addEvent('onShow', function () {

      this.init();
      //插件位置宽度调整
      this.adjustEl();

      this.setzIndexTop();

      this.root.on('click', $.proxy(function (e) {
        var el = $(e.target);

        //判断是否需要触发点击事件
        var needClick = false;

        while (true) {
          if (el.attr('id') == this.id) break;
          if (el.attr('data-flag') == 'c') {
            needClick = true;
            break;
          }
          el = el.parent();
        }

        //不需要点击便退出
        if (!needClick) return;

        if (typeof this.click == 'function') {
          this.click.call(this, this.data[el.attr('data-index')]);
        }

        //          this.hide();
      }, this));

      //点击非元素以外的位置则关闭插件
      this.clsLayer = $.proxy(function (e) {
        var el = $(e.target);

        //判断是否需要触发点击事件
        var needClick = false;

        while (true) {
          if (el.attr('id') == this.id) {
            needClick = true;
            break;
          }
          if (!el[0]) break;
          el = el.parent();
        }

        if (needClick == false) {
          this.hide();
//          e.stopImmediatePropagation && e.stopImmediatePropagation();
        }

      }, this);

      document.addEventListener('click', this.clsLayer, true);

    });
  };

  //调整元素位置
  options.adjustEl = function () {
    //如果传入了引发插件显示的元素，便根据他调整样式
    if (!this.triggerEl) return;
    var offset = this.triggerEl.offset();
    //首先清除元素的几个属性
    this.el.css({
      width: '',
      transform: ''
    });

    var step = 6;

    if (this.dir == 'up') {
      this.el.css({
        width: offset.width - step,
        '-webkit-transform': 'translate(' + (offset.left + 2) + 'px, ' + (offset.top + offset.height + 8) + 'px) translateZ(0px)'
      });
    } else {
      this.el.css({
        width: offset.width - step,
        '-webkit-transform': 'translate(' + (offset.left + 2) + 'px, ' + (offset.top - this.el.offset().height - 8) + 'px) translateZ(0px)'
      });
    }
  };

  options.init = function () {
    if (!this.data) return;

    this.tmpt = _.template([
        '<ul class="cui-f-layer ' + (this.dir ? (this.dir == 'up' ? 'f-layer-before' : 'f-layer-after') : '') + '" style="position: absolute; top: 0; left: 0; ">',
          '<% for(var i = 0, len = data.length; i < len; i++) { %>',
            '<% var itemData = data[i]; %>',
            '<li data-index="<%=i%>" data-flag="c"  >' + (this.itemTemplate ? this.itemTemplate : '<%=itemData.name %>') + '</li>',
          '<% } %>',
        '</ul>'
      ].join(''));

    var html = this.tmpt({ data: this.data });
    this.root.html(html);

    this.el = this.root.find('.cui-f-layer');

  };

  options.createHtml = function () {
    return '';
  };

  return new cBase.Class(AbstractView, options);

});