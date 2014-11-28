define(['libs', 'cUI', 'cBasePageView', 'cWidgetFactory', 'cCommonPageFactory', 'cWidgetListView',''],
  function (libs, cUI, BasePageView, WidgetFactory, CommonPageFactory) {
    "use strict";

    var PAGE_NAME = 'CommonListPage';
    if (CommonPageFactory.hasPage(PAGE_NAME)) {
        return;
    }

    var options = options || {};


    /********************************
    * ##需要再重构，思考workspace设置
    * @description: 向CommonListPageView注入ListView
    */
    options.injectListView = function (data) {
        if (!data.workspace) {
            data.workspace = $(this.defaultHtml);
        }
        this.$el.append(data.workspace);

        if (!data.container) {
            data.container = data.workspace.find('#c-list-view-container');
        } else {
            data.container = this.$el.find(data.container);
        }

        //l_wang 如果需要标签，此处需要标签


        var ListView = WidgetFactory.create('ListView');
        this.listview = new ListView(data);
    };

   options._onWidnowScroll = null;
    options.__isComplete__ = false;
    options.__isLoading__ = false;
    options.refreshLoading = null;

    options.addScrollListener = function () {
        this.__isComplete__ = false;
        this.__isLoading__ = false;
        $(window).bind('scroll', this._onWidnowScroll);
        var self = this;
        if (this.onTopPull) {
          $.flip(this.$el, 'down', function () {
            var pos = cUI.Tools.getPageScrollPos();
            if (pos.top <= 10 && !self.__isLoading__) {
              self.__isLoading__ = true;
              self.onTopPull();
            }
          }, function (dir) {
        	var pos = cUI.Tools.getPageScrollPos();
            return  dir != 'down' || pos.top >=10;
          }, 0,5);
        };
    },

    options.removeScrollListener = function () {
        $(window).unbind('scroll', this._onWidnowScroll);
        if (this.refreshLoading) {
            this.refreshLoading.remove();
            this.refreshLoading = null;
        }
        $.flipDestroy(this.$el);
    }

    options.onWidnowScroll = function () {
      var pos = cUI.Tools.getPageScrollPos();
      //if (pos.top == 0) return;
      var h = pos.pageHeight - (pos.top + pos.height);

      //fix ios 不容易加载更多数据问题 shbzhang 2014/1/6
      if (h <= 81 && !this.__isComplete__ && !this.__isLoading__) {
        this.__isLoading__ = true;
        this.onBottomPull && this.onBottomPull();
      }
    },

    options.closeBottomPull = function () {
      this.__isComplete__ = true;
    },

    /**
     * 通知Pull动作完成
     */
    options.endPull = function () {
      this.__isLoading__ = false;
    },

    /**
     * 显示顶部loading
     */
    options.showTopLoading = function (listRoot) {
      var listRoot = listRoot || this.$el.find('section');
      if (listRoot.length > 0) {
        listRoot.before(this.getLoading());
        this.refreshLoading.show();
      }
    },
    /**
    * 显示底部loading图标
    */
    options.showBottomLoading = function () {
      //保证每次bottomload在最下面
      this.$el.append(this.getLoading());
      this.refreshLoading.show();
    },

    /**
    * 隐藏loading图标,建议使用hideRefreshLoading代替
    */
    options.hideBottomLoading = function () {
      if (this.refreshLoading) {
        this.refreshLoading.hide();
      }
      this.__isLoading__ = false;
    },

    /**
     * 隐藏loading图标
     */
    options.hideRefreshLoading = function () {
      this.hideBottomLoading();
    },

    options.getLoading = function () {
         if (!this.refreshLoading) {
           this.refreshLoading = $('<div class="cui-zl-load" id="zlLoading"> <div class="cui-i cui-b-loading"></div><div class="cui-i  cui-mb-logo"></div> <p>加载中</p></div>');
         }
         return this.refreshLoading;
     },
    /********************************
    * @description: 默认的ListView容器模板
    */
    options.defaultHtml = '<section class="res_list"><ul class="res_list_tab_arr_r" id="c-list-view-container"></ul></section>';

    var CommonListPageView = BasePageView.extend(options);

    CommonPageFactory.register({
        name: PAGE_NAME,
        fn: CommonListPageView
    });

    // ------------------------------------------------------- //
    // 使用方法
    //
    // var CommonListPage = CommonPageFactory.create('CommonListPage');
    // var View = CommonListPage.extend({
    //   onCreate: function(){
    //     this.injectHeaderView();
    //   },
    //   onLoad: function(){
    //     console.log('/--------------onLoad--------------/');
    //     this.headerview.set(headerview_data);
    //     this.headerview.show();
    //
    //    这里injectListView的数据可能是从服务器来的所以可以在Model的回调中使用
    //    var listadapter = new ListAdapter({data: data_arr});
    //    var data = {
    //      workspace: 整个模板文件渲染出来的dom,
    //      container: ListView的容器，用'#id'方式传入String,
    //      listadapter: ListAdapters实例,
    //      itemView: 每一个Item View的模板,
    //      bindItemViewEvent: function($el){
    //        $el是每个Item View，需要对ItemView进行事件绑定在这里做
    //      }
    //    }
    //     this.injectListView(listview_data);
    //     this.listview.show();
    //
    //     this.turning();
    //   },
    // });
    //
    // ------------------------------------------------------- //
});