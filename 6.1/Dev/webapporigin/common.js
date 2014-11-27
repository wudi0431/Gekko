(function () {

  var protocol = document.location.protocol;
  if (protocol != "https:") protocol = "http:";
  var app = protocol + '//webresource.c-ctrip.com/code/lizard/1.1/web/';

//  if (document.location.href.indexOf('localhost') > 0 || document.location.href.indexOf('172') > 0) app = 'http://172.16.140.104:5389//webapp/app/';
  require.config({
    //baseUrl: '/webapp/',
    shim: {
      _: {
        exports: '_'
      },
      B: {
        deps: [
        '_'
      ],
        exports: 'Backbone'
      },
      cBase: {
        exports: 'cBase'
      },
      cAjax: {
        exports: 'cAjax'
      },
      cView: {
        deps: [
        'B'
      ],
        exports: 'cView'
      }
    },
    paths: {
      'text': app + '3rdlibs/require.text',

      'AbstractAPP': app + 'c.abstract.app',
      'App': app + 'business/c.business.app',
      'rsa': app + 'business/c.business.rsa',
      'cView': app + 'business/c.business.view',

      // ---------------------------------------------------
      // 基础库
      'c': app + 'common/c',
      'cBase': app + 'common/c.base',
      'cLog': app + 'common/c.log',
      'cAjax': app + 'common/c.ajax',
      'cSales': app + 'common/c.sales', //渠道模块
      'cLazyload': app + 'common/c.lazyload', //加载
      'cListAdapter': app + 'common/c.common.listadapter',
      'cGeoService': app + 'common/c.geo.service',
      'cGeoHelper': app + 'common/c.geo.helper',
      'cImgLazyload': app + 'common/c.img.lazyload', 


      // ------------------------------------------------------------
      'cUtilityHybrid': app + 'util/c.utility.hybrid',
      'cUtilityHash': app + 'util/c.utility.hash',
      'cUtilityDate': app + 'util/c.utility.date',        // Date对象，对时间提供一些常用方法
      'cUtilityServertime': app + 'util/c.utility.servertime',
      'cUtilityCrypt': app + 'util/c.utility.crypt',
      'cUtility': app + 'util/c.utility',
      'Validate': app + 'util/c.validate', //数据验证


      //-------------------------------------------------------------
      'cCoreInherit': app + 'core/c.core.inherit',        // Class类，框架的基础类体系

      //-------------------------------------------------------------
      // Store
      'cAbstractStore': app + 'store/c.abstract.store',        //抽象store
      'cAbstractStorage': app + 'store/c.abstract.storage',      //抽象storage
      'cStore': app + 'store/c.local.store',           //提供存取具体数据的Store基础类
      'cStorage': app + 'store/c.local.storage',         //提供存取localStorage/sessionStorage的静态方法
      'cSessionStore': app + 'store/c.session.store',           //提供存取具体数据的Store基础类
      'cSessionStorage': app + 'store/c.session.storage',         //提供存取localStorage/sessionStorage的静态方法
      'memStore': app + 'store/c.memorystore',
      'CommonStore': app + 'store/c.common.store',      //公用的store
      'PageStore': app + 'store/c.store.package',

      //-----------------------------------------------------------
      // Model
      'cAbstractModel': app + 'model/c.abstract.model',
      'cModel': app + 'model/c.model',
      'cUserModel': app + 'model/c.user.model',
      'cMultipleDate': app + 'model/c.multiple.data', //多重数据对象

      //-----------------------------------------------------------
      // UI组件
      'cUI': app + 'ui/c.ui',
      'cUICore': app + 'ui/c.ui.core',
      'cHistory': app + 'ui/c.ui.history',
      'cUIView': app + 'ui/c.ui.view',
      'cDataSource': app + 'ui/c.ui.datasource', //数据源
      'cUIBase': app + 'ui/c.ui.base',
      'cUIAbstractView': app + 'ui/c.ui.abstract.view',

      'cUIAlert': app + 'ui/c.ui.alert',
      'cUIAnimation': app + 'ui/c.ui.animation',
      'cUICitylist': app + 'ui/c.ui.citylist',
      'cUIHeadWarning': app + 'ui/c.ui.head.warning',
      'cUIInputClear': app + 'ui/c.ui.input.clear',
      'cUILayer': app + 'ui/c.ui.layer',

      'cUILayerList': app + 'ui/c.ui.layer.list',

      'cUILoading': app + 'ui/c.ui.loading',
      'cUILoadingLayer': app + 'ui/c.ui.loading.layer',
      'cUIMask': app + 'ui/c.ui.mask',
      'cUIPageview': app + 'ui/c.ui.page.view',
      'cUIScrollRadio': app + 'ui/c.ui.scroll.radio',
      'cUIScrollRadioList': app + 'ui/c.ui.scroll.radio.list',
      'cUIScrollList': app + 'ui/c.ui.scrolllist',
      'cUIToast': app + 'ui/c.ui.toast',
      'cUIWarning': app + 'ui/c.ui.warning',
      'cUIWarning404': app + 'ui/c.ui.warning404',
      'cUIHashObserve': app + 'ui/c.ui.hash.observe',
      'cUIEventListener': app + 'ui/c.ui.event.listener',
      'cUISwitch': app + 'ui/c.ui.switch',
      'cUIScroll': app + 'ui/c.ui.scroll',
      'cUINum': app + 'ui/c.ui.num',
      'cUIGroupList': app + 'ui/c.ui.group.list',
      'cUIBusinessGroupList': app + 'ui/c.ui.business.group.list', //新的citylist，航班动态，可直接使用
      'cUITab': app + 'ui/c.ui.tab', //标签插件
      'cUIImageSlider': app + 'ui/c.ui.imageSlider',
      'cUIBubbleLayer': app + 'ui/c.ui.bubble.layer',
      'cUISlider': app + 'ui/c.ui.slider',
      'cUIIdentitycard': app + 'ui/c.ui.identitycard',


      //--------------------------------------------------------------
      // Widget组件
      'cWidgetFactory': app + 'widget/c.widget.factory',
      'cWidgetHeaderView': app + 'widget/c.widget.headerview',
      'cWidgetListView': app + 'widget/c.widget.listview',
      'cWidgetTipslayer': app + 'widget/c.widget.tipslayer',
      'cWidgetInputValidator': app + 'widget/c.widget.inputValidator',
      'cWidgetPublisher': app + 'widget/c.widget.publisher',
      'cWidgetGeolocation': app + 'widget/c.widget.geolocation',
      'cWidgetAbstractCalendar': app + 'widget/c.widget.abstract.calendar',
      'cWidgetCalendar': app + 'widget/c.widget.calendar',
      'cWidgetCalendarPrice': app + 'widget/c.widget.calendar.price',
      'cWidgetSlide': app + 'widget/c.widget.slide',
      'cWidgetMember': app + 'widget/c.widget.member',
      'cWidgetGuider': app + 'widget/c.widget.guider',
      'cWidgetCaptcha': app + 'widget/c.widget.captcha',
      'cCalendar': app + 'widget/c.calendar',
      'cHolidayCalendar': app + 'widget/c.holiday.calendar',
      'cHolidayPriceCalendar': app + 'widget/c.holiday.price.calendar',

      //--------------------------------------------------------------
      // Page
      'cBasePageView': app + 'page/c.page.base',
      'cCommonPageFactory': app + 'page/c.page.factory',
      'cCommonListPage': app + 'page/c.page.common.list',

      //--------------------------------------------------------------
      // Hybrid
      'cHybridFacade': app + 'hybrid/c.hybrid.facade',
      'cHybridShell': app + 'hybrid/c.hybrid.shell'
    }

  });
  console.log('--common.js OK--')
})();