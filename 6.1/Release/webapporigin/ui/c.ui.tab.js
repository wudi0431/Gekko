/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUINum
* @description 加减控件
*/
define(['cBase', 'cUIAbstractView'], function (cBase, AbstractView) {

  var options = {};

  var _config = {
    prefix: 'cui-'
  };

  options.__propertys__ = function () {

    this.selectedKey = null;
    this.data = [];

    //数字变化时候触发的事件
    this.changed = function () { };

    //变化前的验证
    this.changeAble = function () { };

    this.curEl = null;

  };

  /** 可以传入rootBox已经changed两个参数，一个是控件所处位置，一个是选项改变时候需要触发的事件 */
  options.initialize = function ($super, opts) {
    //由于父级有限制，所以此处直接为this赋值属性
    for (var k in opts) {
      this[k] = opts[k];
    }
    $super(opts);
    this.bindEvent();
    this.show();

  };

  /**
  * @method bindEvent
  * @description 事件绑定
  */
  options.bindEvent = function () {

    this.addEvent('onShow', function () {

      //首先创建dom结果
      this.init();

      //事件绑定
      this.root.on('click', $.proxy(function (e) {
        var el = $(e.target);

        if (el[0].tagName.toLowerCase() != 'li') return;
        this.setVal(el.attr('data-key'));

      }, this));

    });

    this.addEvent('onHide', function () {
      //事件绑定
      this.root.off('click');
      this.root.remove();
    });

  };

  options.getVal = function () {
    return this.selectedKey;
  };

  options.setVal = function (v) {
    this.curEl = this.root.find('li[data-key="' + v + '"]');
    var index = this.curEl.attr('data-index');
    var d = this.data[index];

    //如果验证不通过不能进行以下逻辑
    if (typeof this.changeAble == 'function' && this.changeAble.call(this, d) == false) {
      return false;
    }

    if (!d) { console.log('设置值有误'); return; }

    this._tab = this.root.find('.cui-tab-scrollbar')

    //如果当前值与设置的值不相等就change了 
    var isChange = this.selectedKey == v;
    this.selectedKey = v;

    this.tabs.removeClass('cui-tab-current');
    this.curEl && this.curEl.addClass('cui-tab-current');

    //三星手机渲染有问题，这里动态引起一次回流
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
      var width = this._tab.css('width');
      setTimeout($.proxy(function () {
        this._tab.css('width', width);
      }, this), 0);
    }

    if (isChange == false && typeof this.changed == 'function') {
      this.changed.call(this, d);
    }

  };

  options.setIndex = function (i) {
    //如果设置值无意义便不予关注
    if (i < 0 || i > this.data.length - 1) return;
    this.setVal(this.data[i].id);
  };

  options.getIndex = function () {
    for (var i = 0, len = this.data.length; i < len; i++) {
      if (this.getVal() == this.data[i].id) return i;
    }
    return -1;
  };


  //初始化dom结构
  options.init = function () {
    this.tmpt = _.template([
      '<ul class="cui-tab-mod">',
        '<%for(var i = 0, len = data.length; i < len; i++) { %>',
          '<li data-key="<%=data[i].id %>" data-index="<%=i%>" <% if(data[i].id == selectedKey) { %>class="cui-tab-current"<%} %> ><%=data[i].name %></li>',
        '<%} %>',
        '<i class="cui-tab-scrollbar cui-tabnum<%=len %>"></i>',
      '</ul>'
    ].join(''));

    var html = this.tmpt({ data: this.data, selectedKey: this.selectedKey });

    this.root.html(html);
    this.tabs = this.root.find('li');
    this.curEl = this.root.find('.cui-tab-current');
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