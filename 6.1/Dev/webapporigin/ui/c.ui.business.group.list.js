/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIBusinessGroupList
* @description 业务分组插件，带搜索功能，多用于城市列表，航班动态
*/
define(['cBase', 'cUIAbstractView', 'cUIGroupList'], function (cBase, AbstractView, GroupList) {

  var options = {};

  options.__propertys__ = function () {

    //是否需要选项卡，如果需要的话会有以下配置，配置国内以及国际的名字，多了便不予关注了
    this.needTab = true;

    //当前处于哪个tab
    this.groupIndex = 0;
    //默认状况
    this.groupObj = [];

    //用于检测事件是否已经创建，避免重复创建，这是框架一个问题
    this.isCreated = false;

    //当前选择的键值
    this.selectedKey = null;

    //点击input时候的时钟
    this.CLICK_RES = null;

    this.filter = '';

    //是否需要折叠项目
    this.needFold = false;

    //是否全部折叠
    this.foldAll = false;

    //是否只能展开一个
    this.unFoldOne = false;

    //是否显示历史记录按钮
    this.showFnBtn = false;
    this.fnBtnTxt = '清除历史记录'
    this.fnBtnCallback = function () { };


    //模板文件
    this.itemTemplate = false;

    //是否是ajax操作search框，是的话逻辑有所不同
    this.isAjax = false;

    //当isAjax为true时，一定要处理以下两个函数
    this.ajaxCallBack = function () { };

    //记录搜索时候最后一次关键字，做性能优化
    this.lastKeyword = '';

    this.ajaxData = [];

  };

  options.initialize = function ($super, opts) {
    //由于父级有限制，所以此处直接为this赋值属性
    for (var k in opts) {
      this[k] = opts[k];
    }
    $super(opts);

    if (this.isAjax) {
      this.needFold = false;
      this.foldAll = false;
      this.filter = '';
      this.needTab = false;
    }

    this.bindEvent();
    this.show();

  };

  /**
  * @method bindEvent
  * @description 事件绑定
  */
  options.bindEvent = function () {

    this.addEvent('onHide', function () {
      //事件绑定

      //清除子集插件的事件句柄
      this.destroyItemInstance();

      this.unBindTabEvent();
      this.unBindSeachEvent();
      this.unBindSeachItemEvent();
      this.unBindCancelEvent();
      this.unBindFnBtn();

      this.root.remove();

    });

    this.addEvent('onShow', function () {

      //如果未被创建才执行此逻辑
      if (this.isCreated) {
        return;
      }
      this.isCreated = true;
      var scope = this;
      this.init();

      //dom创建结束后开始注册事件
      this.bindTabEvent();
      this.bindSeachEvent();
      this.bindSeachItemEvent();
      this.bindCancelEvent();
      this.bindFnBtn();

    });

  };

  options.bindFnBtn = function () {
    if (!this.showFnBtn) return;
    this.root.find('.cui-btn-history').on('click', $.proxy(function () {
      this.fnBtnCallback.call(this);
    }, this));
  };

  options.unBindFnBtn = function () {
    if (!this.showFnBtn) return;
    this.root.find('.cui-btn-history').off('click');
  };

  options.destroyItemInstance = function () {
    //清除子集插件的事件句柄
    for (var i = 0, len = this.groupObj.length; i < len; i++) {
      this.groupObj[i].instance.destroy();
    }
  };

  options.unBindTabEvent = function () {
    var tabs = this.tabWrapper.find('li');
    tabs.off('click');
  };

  //选择tab时候的事件
  options.bindTabEvent = function () {
    var tabs = this.tabWrapper.find('li');
    tabs.on('click', $.proxy(function (e) {
      var el = $(e.target);
      tabs.removeClass('cui-tab-current');
      el.addClass('cui-tab-current');
      var index = el.attr('data-index');

      //每次切换tab时候，首先隐藏当前tab然后显示选择tab，一样的话应该不予关注
      //切换时候将原来选择项保存下来，查看当前tab是否具有该选项，有就设置
      this.groupObj[this.groupIndex].instance.hide();
      if (this.groupObj[this.groupIndex].instance.selectedKey)
        this.selectedKey = this.groupObj[this.groupIndex].instance.selectedKey;
      //      this.groupObj[this.groupIndex].instance.setSelected(null);
      this.selectedKey && this.groupObj[index].instance.setSelected(this.selectedKey, true);

      this.groupObj[index].instance.show();
      this.groupIndex = index;

    }, this));

  };

  options.getSelected = function () {
    return this.selectedKey;
  };

  options.unBindSeachEvent = function () {
    this.searchBox.off('focus');
  };

  //搜索框的事件
  options.bindSeachEvent = function () {

    this.searchBox.on('focus', $.proxy(function () {
      this.openSeach();
    }, this));

  };

  options.unBindSeachItemEvent = function () {
    this.seachList.off('click');
  };

  //搜索相关事件
  options.bindSeachItemEvent = function () {

    this.seachList.on('click', $.proxy(function (e) {
      var el = $(e.target);

      //判断是否需要触发点击事件
      var needClick = false;

      while (true) {
        if (el.hasClass('seach-list')) break;
        if (el.attr('data-flag') == 'c') {
          needClick = true;
          break;
        }
        el = el.parent();
      }

      if (this.isAjax) {
        if (typeof this.click == 'function') {
          this.click.call(this, this.ajaxData[el.attr('data-index')]);
          this.closeSeach();
        }
        return;
      }

      this.groupIndex = el.attr('data-groupflag');
      this.selectedKey = el.attr('data-key');
      this.groupObj[this.groupIndex].instance.setSelected(this.selectedKey);
      this.closeSeach();

    }, this));

  };

  options.unBindCancelEvent = function () {
    this.cancel.off('click');
  };

  options.bindCancelEvent = function () {
    this.cancel.on('click', $.proxy(function () {
      this.closeSeach();
    }, this));
  };

  //开启搜索模式
  options.openSeach = function () {
    if (!this.CLICK_RES) {
      this.CLICK_RES = setInterval($.proxy(function () {

        //如果当前获取焦点的不是input元素的话便清除定时器
        if (!(document.activeElement.nodeName == 'INPUT' && document.activeElement.type == 'text')) {
          if (this.CLICK_RES) {
            clearInterval(this.CLICK_RES);
            this.CLICK_RES = null;
          }
        }

        var txt = this.searchBox.val().toLowerCase();

        if (txt == '') {
          setTimeout($.proxy(function () {
            if (!(document.activeElement.nodeName == 'INPUT' && document.activeElement.type == 'text')) {
              this.closeSeach();
            }
          }, this), 500);
          return;
        }

        if (this.lastKeyword == txt) return true;
        this.lastKeyword = txt;

        this.wrapper.addClass('cui-input-focus');

        this.root.find('.cui-btn-history').hide();
        this.listWrapper.hide();
        this.tabWrapper.hide();
        this.seachList.show();
        this.seachList.html('');
        this.noData.hide();


        //若是ajax操作，此处逻辑有所不同，如果是ajax操作，便不执行下面逻辑
        if (this.isAjax) {

          //执行用户定义ajax操作，在数据返回成功并且处理后，会调用ajaxDataHandle将控制权交回系统 
          this.ajaxCallBack.call(this, txt);
          this.LOADINGSRC = setTimeout($.proxy(function () {
            this.loading.show();
          }, this), 200);

          return;
        }

        //获取当前输入项
        var list = this.listWrapper.find('li[data-filter*="' + txt + '"]');

        //由于可能出现重复事件此处需要做一次筛选
        var _list = [];

        for (var i = 0, len = list.length; i < len; i++) {
          var repeadted = false;
          for (var k in _list) {
            if ($(_list[k]).attr('data-key') == $(list[i]).attr('data-key')) {
              repeadted = true;
              break;
            }
          }
          if (repeadted == false) _list.push(list[i]);
        }

        if (_list.length == 0) {
          this.noData.show();
          return;
        }

        this.seachList.append($(_list).clone(true));

      }, this), 500);

    }
  };

  //当isAjax为true时，该函数交由用户数据请求成功时候调用，调用后将控制器交回插件
  options.ajaxDataHandle = function (data) {
    this.ajaxData = data;
    var tempt = ['<% for(var i = 0, len = data.length; i < len; i++ ){ %>',
    '<% itemData = data[i]; %>',
    '<li data-key="<%=itemData.id%>" data-index="<%=i%>" data-flag="c" ' + (this.itemTemplate ? this.itemTemplate : '<%=itemData.name %>') + ' </li>',
    '<% } %>'].join('');

    var html = _.template(tempt)({ data: data });

    if (this.LOADINGSRC) {
      clearTimeout(this.LOADINGSRC);
    }
    this.loading.hide();

    this.seachList.html(html);

  };

  //关闭搜索模式
  options.closeSeach = function () {
    //手动清理资源
    if (this.CLICK_RES) {
      clearInterval(this.CLICK_RES);
      this.CLICK_RES = null;
    }
    this.wrapper.removeClass('cui-input-focus');
    this.noData.hide();

    this.searchBox.val('');

    if (this.needTab) this.tabWrapper.show();

    this.seachList.hide();
    this.listWrapper.show();
    this.lastKeyword = '';
    this.root.find('.cui-btn-history').show();

  };

  options.init = function () {
    this.tabWrapper = this.root.find('.cui-tab-mod');
    this.tabBar = this.tabWrapper.find('.cui-tab-scrollbar');
    this.noData = this.root.find('.cui-city-novalue');

    //总容器
    this.wrapper = this.root.find('.cui-citys-hd');
    this.listWrapper = this.root.find('.cui-citys-bd');
    this.searchBox = this.root.find('.cui-input-box');
    this.seachList = this.root.find('.seach-list');
    //取消按钮
    this.cancel = this.root.find('.cui-btn-cancle');

    this.loading = this.root.find('.cui-pro-load');

    this.initTab();
    this.initGroupList();
    this.bindEvent();

  };

  //初始化tab列表
  options.initTab = function () {

    for (var i = 0, len = this.groupObj.length; i < len; i++) {
      var item = '<li data-index="' + i + '" ' + (i == this.groupIndex ? 'class="cui-tab-current"' : '') + ' >' + this.groupObj[i].name + '</li>';

      this.tabBar.before(item);
    }
  };

  //初始化分组列表
  options.initGroupList = function () {
    var scope = this;
    for (var i = 0, len = this.groupObj.length; i < len; i++) {
      var data = this.groupObj[i].data;
      this.groupObj[i].instance = new GroupList({
        rootBox: this.listWrapper,
        data: data,
        filter: this.filter,
        click: this.click,

        foldAll: this.foldAll,
        needFold: this.needFold,
        itemTemplate: this.itemTemplate,
        unFoldOne: this.unFoldOne,
        //分组标识，用于搜索时候
        groupFlag: i,
        //事件机制用于内外层通信
        onClick: function () {
          scope.selectedKey = this.selectedKey;
        }
      });
      this.groupObj[i].instance.hide();
    }

    //设置当前显示的标签，并且设置值
    this.groupObj[this.groupIndex].instance.show();
    this.groupObj[this.groupIndex].instance.setSelected(this.selectedKey, true);

  };

  //重新加载数据
  options.reload = function (data) {
    if (data) this.groupObj = data;
    this.destroyItemInstance();
    this.listWrapper.empty();
    this.initGroupList();
  };

  //更新某一个标签的数据
  options.updateTab = function (tabIndex, data) {

  };

  //更新某一个标签，的一组的数据
  options.updateTabGroup = function (tabIndex, groupIndex, data) {

  };

  //更新全部标签，的一组的数据，暂时只提供该接口
  options.updateAllTabGroup = function (groupIndex, data) {
    for (var i = 0, len = this.groupObj.length; i < len; i++) {
      this.groupObj[i].instance.updateGroup(groupIndex, data);
    }
  };

  //更新某一个标签，的一组的某一项数据
  options.updateTabGroupItem = function (tabIndex, groupIndex, itemIndex, data) {

  };


  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return [
    '<section class="cui-citys-hd ">',
      '<div class="cui-input-bd">',
        '<input type="text" class="cui-input-box" placeholder="中文/拼音/首字母">',
        '<span class="cui-pro-load" style="display: none;">',
		 	'<span class="cui-pro-radius"></span>',
		 	'<span class="cui-i cui-pro-logo"></span>',
	    '</span>',
      '</div>',
      '<button type="button" class="cui-btn-cancle">',
        '取消</button>',
    '</section>',
    '<p class="cui-city-novalue" style="display: none;">没有结果</p>',
    '<ul class="cui-tab-mod" ' + (this.needTab ? '' : 'style="display: none"') + ' >',
      '<i class="cui-tab-scrollbar cui-tabnum' + this.groupObj.length + '"></i>',
    '</ul>',
    '<ul class="cui-city-associate seach-list"></ul>',
    '<section  class="cui-citys-bd">',
    '</section>',
    (this.showFnBtn ? '<button type="button" class="cui-btn-history" >' + this.fnBtnTxt + '</button>' : '')
    ].join('');

  };
  return new cBase.Class(AbstractView, options);

});