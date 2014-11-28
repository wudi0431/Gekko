define(['libs', 'cBase', 'AbstractAPP', 'cWidgetFactory', 'cWidgetGuider'], function (libs, cBase, AbstractAPP, WidgetFactory) {

  var Appliction = new cBase.Class(AbstractAPP, {
    __propertys__: function () {
      this.appMode = 'phone'; //phone or pad


      //记录pad 的url历史
      this.padHistory = [];


      this.animForwardName = 'fadein';
      this.animBackwardName = 'fadeout';

      this.animatSwitch = false;

      this.padHistory = {
        history: [],
        main: [],
        sub: []
      };

      this.curMainView = null;
      this.curSubView = null;
      this.lastMainView = null;
      this.lastSubView = null;

    },
    getAppMode: function () {
      return this.appMode;
    },
    initialize: function ($super, options) {

      //初始化操作，判断当前是不是ipad，或者是不是ipad横屏等模式
      this.initWebAppMode();


      //增加接口
      this.setInterface('notify', this.notify);
      this.setInterface('getAppMode', this.getAppMode)

      $super(options);

      //适配app 张爸爸
      var Guider = WidgetFactory.create('Guider');
      Guider.create();

      //l_wang提升响应速度
      $.bindFastClick && $.bindFastClick();

      //      $(window).resize(_.bind(this.initWebAppMode, this));

      var supportsOrientationChange = "onorientationchange" in window, orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

      window.addEventListener(orientationEvent, $.proxy(function (e) {

        //        return false;

        this.appMode = window.orientation == 0 || window.orientation == 180 ? 'phone' : 'pad';

        var w = $(window).width();
        if (w > 800) {
          this.appMode = 'pad';
        } else {
          this.appMode = 'phone';
        }

        var path = this.request.fullhash;
        var pathObj = this._parsePath(path);


        if (this.appMode == 'pad') {
          this.switchPadMode(pathObj);
        } else {
          this.switchPhoneMode(pathObj);
        }

      }, this), false);

      this.openIpadAdapte = false;

    },

    //切换浏览模式，ipad或者phone
    switchPadMode: function (pathObj) {
      this._loadView(pathObj.mainPath, 'main', function () {
        this._loadView(pathObj.subPath, 'sub');
      });
    },

    //切换浏览模式， phone
    switchPhoneMode: function (pathObj) {
      this.switchView(pathObj.history);
    },

    //设置ipad的映射关系，各个频道有所不同，会配置到main.js里面
    //获取当前APP所处模式ipad或者iphone模式
    initWebAppMode: function () {
      var isPad = $.os.ipad || $.os.tablet;

      //电脑情况下，都认为是pad，如果不是ipad根本就不具备ipad相关特性了
      isPad = true;
      var w = $(window).width();

      if (isPad && w > 850) {
        this.appMode = 'pad';
      } else {
        this.appMode = 'phone';
      }
    },

    //做ipad适配，如果是ipad情况下才会执行
    adaptePad: function () { },


    //用于处理ipad的url链接
    _parsePath: function (path) {
      if (!path) return false;

      var pathArr = path.split('!');
      if (pathArr.length != 2) return false;

      var pathObj = {};

      var mainPath = pathArr[0];
      var subPath = pathArr[1];

      if (mainPath.indexOf('@') != -1) pathObj.history = mainPath = mainPath.substr(1);
      if (subPath.indexOf('@') != -1) pathObj.history = subPath = subPath.substr(1);

      pathObj.mainPath = mainPath;
      pathObj.subPath = subPath;

      return pathObj;
    },

    //hashchange观察点函数，处理url，动画参数
    switchView: function (path) {

      if (!path) return;

      path = this.viewpath.indexOf('@') != -1 ? this.viewpath : path;
      path = this.request.fullhash.indexOf('@') != -1 ? this.request.fullhash : path;

      if (path.indexOf('@') == -1) { this._loadView(path, 'main'); return; }

      var pathObj = this._parsePath(path);
      var mainPath = pathObj.mainPath;
      var subPath = pathObj.subPath;

      this.padHistory.history.push(pathObj.history);
      this.padHistory.main.push(mainPath);
      this.padHistory.sub.push(subPath);

      if (this.appMode == 'pad') {
        this._loadView(mainPath, 'main', function () {
          this._loadView(subPath, 'sub');
        });
      } else {
        this._loadView(pathObj.history, 'main');
      }
    },


    /******
    处理ipad的view切换有两种方案：
    ① 当前的main view 与 sub view同时hide 然后一次加载另一轮view
    此种方案与原方案较为贴近，但是可能出现这种情况：A|B => C|D A、B同时隐藏后，C加载时间过长可能白页，
    否则Onhide事件执行时间点需要延后
    ② main hide sub show sub hide sub show 
    这里先使用方案一，比较简单
    ******/
    //专为ipad加载模式设计 isChild
    //subFlag是是否为子的标识
    _loadView: function (path, viewFlag, callback) {
      if (!path) return;

      //在这里搞算了
      this.createViewPort();

      if (!viewFlag) viewFlag = 'main';

      this.viewFlag = viewFlag;

      //因为子view可能转换为父级view，而子view turning内部会维护自己一个内存环境
      //所以viewport以及相关的回调需要发生变化，所以这里使用this传递
      this._callback = callback;

      var lastMainViewId = this.padHistory.main[this.padHistory.main.length - 2];
      var lastSubViewId = this.padHistory.sub[this.padHistory.sub.length - 2];

      //切换前的当前view，马上会隐藏
      this.lastMainView = null;
      this.lastSubView = null;

      //只有切换main view时候存在隐藏
      if (viewFlag == 'main') {
        //如果当前是主框架切换
        this.lastMainView = lastMainViewId ? this.views.getItem(lastMainViewId) : null;
        //子框架的情况
        this.lastSubView = lastSubViewId ? this.views.getItem(lastSubViewId) : null;
      }

      var id = path;
      var curView = this.views.getItem(id);

      //如果当前view存在，则执行请onload事件
      if (curView) {
        //因为初始化只会执行一次，所以每次需要重写request
        curView.request = this.request;

        curView.viewFlag = this.viewFlag;

        //这里有一个问题，view与view之间并不需要知道上一个view是什么，下一个是什么，这个接口应该在app中
        this.curView = curView;
        curView.__load();

      } else {
        //重来没有加载过view的话需要异步加载文件
        //此处快速切换可能导致view文件未加载结束，而已经开始执行其它view的逻辑而没有加入dom结构
        this.loadView(path, function (View) {
          curView = new View(this.request, this.inteface, id);

          //保存至队列
          this.views.push(id, curView);

          //这个是唯一需要改变的
          curView.turning = _.bind(function () {

            curView.viewport = this.viewport;
            curView.viewFlag = this.viewFlag;

            this.curView = curView;

            if (this.lastMainView && this.lastMainView != curView) {
              this.lastMainView.__onHide();
              this.lastMainView.__hide();
            }
            if (this.lastSubView && this.lastView != curView) {
              this.lastSubView.__onHide();
              this.lastSubView.__hide();
            }

            curView.__show();
            curView.__onShow();

            //为下一个加载做准备，需要注意的是，这里只能做简单的准备，要加载数据什么的是不行的，需要放到onload里面
            if (curView.onLoadView) curView.onLoadView();

            this._callback && this._callback.call(this);

          }, this);

          curView.viewFlag = this.viewFlag;
          curView.__load();

        });
      }
    },

    //id 为view id
    notify: function (id, data) {
      var view = this.views.getItem(id);
      //动态切换
      this.viewFlag = view.viewFlag;
      if (view && view.onUpdate) {
        if (view.onUpdate) view.onUpdate(data); 
        else view.onLoad();
      }
    },

    forward: function (url, replace, isNotAnimat) {

      var pathObj = this._parsePath(url);

      var len = this.padHistory.history.length - 1;

      //强制加入ipad notify 逻辑，这个时候认为是notify
      //???这里是有问题的?????????
      if (this.appMode == 'pad' && (pathObj.history == this.padHistory.history[len] && this.padHistory.main[len] == pathObj.mainPath && this.padHistory.sub[len] == pathObj.subPath)) {

        //这里逻辑有问题，不太容易确认到底通知谁，应该交给业务
        var viewId = pathObj.history;

        this.notify(viewId);

        var s = '';

        return;
      }

      url = url.toLowerCase();
      if (isNotAnimat) this.isAnimat = false;
      this.endObserver();
      if (replace) {
        window.location.replace(('#' + url).replace(/^#+/, '#'));
      } else {
        window.location.href = ('#' + url).replace(/^#+/, '#');
      }
      this._onHashChange(url, true);
      setTimeout(_.bind(this.startObserver, this), 1);
    }


  });
  return Appliction;
});

