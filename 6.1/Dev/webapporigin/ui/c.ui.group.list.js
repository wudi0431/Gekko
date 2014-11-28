/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIGroupList
* @description 分组列表，多用于城市相关
*/
define(['cBase', 'cUIAbstractView'], function (cBase, AbstractView) {

  var options = {};

  options.__propertys__ = function () {

    //每次需要存放的数据
    this.data = [];

    //是否需要折叠项目
    this.needFold = false;

    //是否全部折叠
    this.foldAll = false;

    //是否只能展开一个
    this.unFoldOne = false;

    this.selectedKey = null;

    //当前选择的dom，可能没有
    this.el = null;

    //需要用于筛选的字段，使用","隔开
    this.filter = '';

    this.click = function () { };

    //当点击时候会触发的事件，这里应该自建事件机制，但是算了......
    this.OnClick = function () { };

    //用于检测事件是否已经创建，避免重复创建，这是框架一个问题
    this.isCreated = false;

    //是否使用模板
    this.itemTemplate = false;

  };

  options.initialize = function ($super, opts) {
    //由于父级有限制，所以此处直接为this赋值属性
    for (var k in opts) {
      this[k] = opts[k];
    }
    $super(opts);

    this.paramFormat();

    this.bindEvent();
    this.show();

  };

  options.paramFormat = function () {
    //简单处理数据
    var filter = this.filter && this.filter.split(',');
    if (typeof filter != 'object') filter = {};
    this.filter = filter;

  };

  /**
  * @method bindEvent
  * @description 事件绑定
  */
  options.bindEvent = function () {

    //    this.addEvent('onHide', function () {
    //      //事件绑定
    //      this.root.off('click');
    //      this.root.remove();
    //    });

    this.addEvent('onShow', function () {
      //如果未被创建才执行此逻辑
      if (this.isCreated) {
        return;
      }
      this.isCreated = true;


      var scope = this;
      this.init();

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

        //处理点击项问题
        if (needClick) {
          this.setSelected(el.attr('data-key'));
          return;
        }

        //处理父级点击，有可能没有这个逻辑，这里暂时忽略
        if (this.needFold == false) return;

        if (!el.hasClass('cui-city-t')) return;

        var p = el.parent();

        if (p.hasClass('cui-arrow-close')) {
          if (this.unFoldOne) {
            this.root.find('.cui-city-itmes > li').attr('class', 'cui-arrow-close');
          }
          p.attr('class', 'cui-arrow-open');
        } else {
          if (this.unFoldOne) {
            this.root.find('.cui-city-itmes > li').attr('class', 'cui-arrow-close');
          }
          p.attr('class', 'cui-arrow-close');
        }

      }, this));

    });

  };

  options.destroy = function () {
    //      //事件绑定
    this.root.off('click');
    this.root.remove();
  };

  options.init = function () {

    //如果全部折叠的情况下，一定可点击
    if (this.foldAll == true) {
      this.needFold = true;
      //这个时候还需要做一次处理，将当前选项的父类设置为展开
      //这个时候需要遍历整个数据有点伤害效率，但是问题不大......
    }

    //考虑itemTemplate item出现模板的情况
    this.tmpt = _.template([
        '<ul class="cui-city-itmes">',
        '<%for(var i = 0, len = data.length; i < len; i++) { %>',
          '<li data-groupindex="<%=i%>" data-key="<%=data[i].id %>"  ' + (this.needFold ? '<%if(foldAll && ((typeof data[i].unFold == "undefined") || data[i].unFold != true)) {%> class="cui-arrow-close" <%} else {%> class="cui-arrow-open" <%}%>' : '') + '>',
            '<span class="cui-city-t" ><%=data[i].name %></span>',
            '<%var item = data[i].data; %>',
            '<ul class="cui-city-n">',
            '<%for(var j = 0, len1 = item.length; j < len1; j++) { %>',
              '<% var itemData = item[j]; %>',
                '<% var _f = ""; for(var k in filter) { _f += (itemData[filter[k]] ? itemData[filter[k]] : "").toLowerCase() + " ";  } %>',
                '<li data-skey="item_<%=itemData.id%>" ' + (typeof this.groupFlag != 'undefined' ? 'data-groupflag="' + this.groupFlag + '"' : '') + ' data-filter="<%=_f%>" data-key="<%=itemData.id%>" data-index="<%=i%>,<%=j%>" data-flag="c" <%if(itemData.id == selectedKey){%> class="current" <%}%> > ' + (this.itemTemplate ? this.itemTemplate : '<%=itemData.name %>') + ' </li>',
            '<%} %>',
            '</ul>',
          '</li>',
        '<%} %>',
        '</ul>'
        ].join(''));

    var html = this.tmpt({ data: this.data, foldAll: this.foldAll, selectedKey: this.selectedKey, filter: this.filter });
    this.root.html(html);

  };

  //更新一组的一项数据
  //待续......
  options.updateItem = function (groupIndex, itemIndex, data) {

  };

  //更新一组数据
  options.updateGroup = function (groupIndex, data) {
    //首先保存之前的数据对象，会被销毁的
    var _data = this.data[groupIndex];
    //如果没有数据就直接返回
    if (!_data) return;

    //更新当前group
    this.data[groupIndex] = data;

    //缓存当前group dom对象
    var _el = this.root.find('li[data-groupindex="' + groupIndex + '"]');

    //生成新的group dom对象
    //模板文件
    this.tmpt = _.template([
      '<li data-groupindex="<%=i%>" data-key="<%=data.id %>"  ' + (this.needFold ? '<%if(foldAll && ((typeof data.unFold == "undefined") || data.unFold != true)) {%> class="cui-arrow-close" <%} else {%> class="cui-arrow-open" <%}%>' : '') + '>',
        '<span class="cui-city-t" ><%=data.name %></span>',
        '<%var item = data.data; %>',
        '<ul class="cui-city-n">',
        '<%for(var j = 0, len1 = item.length; j < len1; j++) { %>',
            '<% var _f = ""; for(var k in filter) { _f += (item[j][filter[k]] ? item[j][filter[k]] : "").toLowerCase() + " ";  } %>',
            '<li data-skey="item_<%=item[j].id%>" ' + (typeof this.groupFlag != 'undefined' ? 'data-groupflag="' + this.groupFlag + '"' : '') + ' data-filter="<%=_f%>" data-key="<%=item[j].id%>" data-index="<%=i%>,<%=j%>" data-flag="c" <%if(item[j].id == selectedKey){%> class="current" <%}%> ><%=item[j].name %></li>',
        '<%} %>',
        '</ul>',
      '</li>'
    ].join(''));

    var html = this.tmpt({ data: data, foldAll: this.foldAll, selectedKey: this.selectedKey, filter: this.filter, i: groupIndex });
    var el = $(html);

    //将新的dom结构搞到久的前面然后移除旧的
    _el.before(el);
    _el.remove();

  };

  //更新全部数据
  options.reload = function (data) {
    if (data) this.data = data;
    this.root.html('');
    this.init();
  };


  options.setSelected = function (k, noEvent) {
    this.selectedKey = k;

    var d = this.getSelected();

    this.root.find('.cui-city-n li').removeClass('current');
    this.el.addClass('current');

    if (typeof this.onClick == 'function') {
      this.onClick.call(this, d);
    }

    if (typeof this.click == 'function' && !noEvent) {
      this.click.call(this, d);
    }

  };

  //根据当前id获得当前选择对象
  options.getSelected = function () {
    this.el = this.root.find('li[data-skey="item_' + (this.selectedKey || '') + '"]');
    //此处需要由一个验证，如果验证不通过，其设置值是无效的
    //    if (!this.el[0]) this.selectedKey = null;

    if (typeof this.el.attr('data-index') != 'string') return null;

    var index = this.el.attr('data-index').split(',');
    if (index.length != 2) return null;
    return this.data[parseInt(index[0])].data[parseInt(index[1])];

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