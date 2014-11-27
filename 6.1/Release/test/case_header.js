var assert = require('assert');
var requirejs = require('requirejs');
var c_require = require;
var expect = require('chai').expect;
var sinon = require('sinon');
document = jsdom('<html><head><script></script></head><body></body></html>');
window = document.createWindow();
jQuery = $ = require("jquery").create(window)
requirejs.config({
  //Pass the top-level main.js/index.js require
  //function to requirejs so that node modules
  //are loaded relative to the top-level JS file.
  baseUrl: '../webapporigin/',
  paths: {
   // ---------------------------------------------------
      // 基础库
            'cJquery': '../webapporigin/../test/jquery',
            'c':'common/c',
            'cBase':'common/c.base',
            'cLog':'common/c.log',
            'cAjax':'common/c.ajax',
            'cSales':'common/c.sales', //渠道模块
            'cLazyload':'common/c.lazyload', //加载
            'cListAdapter':'common/c.common.listadapter',
            'cGeoService':'common/c.geo.service',

            // ------------------------------------------------------------
            'cUtilityHybrid':'util/c.utility.hybrid',
            'cUtilityHash':'util/c.utility.hash',
            'cUtilityDate':'util/c.utility.date',        // Date对象，对时间提供一些常用方法
            'cUtilityServertime':'util/c.utility.servertime',
            'cUtilityCrypt':'util/c.utility.crypt',
            'cUtility':'util/c.utility',
            'Validate':'util/c.validate', //数据验证

            //-------------------------------------------------------------
            'cCoreInherit':'core/c.core.inherit',        // Class类，框架的基础类体系

            //-------------------------------------------------------------
            // Store
            'cAbstractStore':'store/c.abstract.store',        //抽象store
            'cAbstractStorage':'store/c.abstract.storage',      //抽象storage
            'cStore':'store/c.local.store',           //提供存取具体数据的Store基础类
            'cStorage':'store/c.local.storage',         //提供存取localStorage/sessionStorage的静态方法
            'cSessionStore':'store/c.session.store',           //提供存取具体数据的Store基础类
            'cSessionStorage':'store/c.session.storage',         //提供存取localStorage/sessionStorage的静态方法
            'memStore':'store/c.memorystore',
            'CommonStore':'store/c.common.store',      //公用的store
            'PageStore':'store/c.store.package',

            //-----------------------------------------------------------
            // Model
            'cAbstractModel':'model/c.abstract.model',
            'cModel':'model/c.model',
            'cUserModel':'model/c.user.model',
            'cMultipleDate':'model/c.multiple.data', //多重数据对象

            //-----------------------------------------------------------
            // UI组件
            'cUI':'ui/c.ui',
            'cUICore':'ui/c.ui.core',
            'cHistory':'ui/c.ui.history',
            'cUIView':'ui/c.ui.view',
            'cDataSource':'ui/c.ui.datasource', //数据源
            'cUIBase':'ui/c.ui.base',
            'cUIAbstractView':'ui/c.ui.abstract.view',
            'cAdView':'ui/c.ui.ad',
            'cUIAlert':'ui/c.ui.alert',
            'cUIAnimation':'ui/c.ui.animation',
            'cUICitylist':'ui/c.ui.citylist',
            'cUIHeadWarning':'ui/c.ui.head.warning',
            'cUIInputClear':'ui/c.ui.input.clear',
            'cUILayer':'ui/c.ui.layer',
            'cUILoading':'ui/c.ui.loading',
            'cUILoadingLayer':'ui/c.ui.loading.layer',
            'cUIMask':'ui/c.ui.mask',
            'cUIPageview':'ui/c.ui.page.view',
            'cUIScrollRadio':'ui/c.ui.scroll.radio',
            'cUIScrollRadioList':'ui/c.ui.scroll.radio.list',
            'cUIScrollList':'ui/c.ui.scrolllist',
            'cUIToast':'ui/c.ui.toast',
            'cUIWarning':'ui/c.ui.warning',
            'cUIWarning404':'ui/c.ui.warning404',
            'cUIHashObserve':'ui/c.ui.hash.observe',
            'cUIEventListener':'ui/c.ui.event.listener',
            'cUISwitch':'ui/c.ui.switch',
            'cUIScroll':'ui/c.ui.scroll',
            'cUINum':'ui/c.ui.num',
            'cUIGroupList':'ui/c.ui.group.list',
            'cUIBusinessGroupList':'ui/c.ui.business.group.list', //新的citylist，航班动态，可直接使用
            'cUITab':'ui/c.ui.tab', //标签插件
            'cUIImageSlider':'ui/c.ui.imageSlider',
            'cUIBubbleLayer':'ui/c.ui.bubble.layer',


            //--------------------------------------------------------------
            // Widget组件
            'cWidgetFactory':'widget/c.widget.factory',
            'cWidgetHeaderView':'widget/c.widget.headerview',
            'cWidgetListView':'widget/c.widget.listview',
            'cWidgetTipslayer':'widget/c.widget.tipslayer',
            'cWidgetInputValidator':'widget/c.widget.inputValidator',
            'cWidgetPublisher':'widget/c.widget.publisher',
            'cWidgetGeolocation':'widget/c.widget.geolocation',
            'cWidgetAbstractCalendar':'widget/c.widget.abstract.calendar',
            'cWidgetCalendar':'widget/c.widget.calendar',
            'cWidgetCalendarPrice':'widget/c.widget.calendar.price',
            'cWidgetSlide':'widget/c.widget.slide',
            'cWidgetMember':'widget/c.widget.member',
            'cWidgetGuider':'widget/c.widget.guider',
            'cWidgetCaptcha':'widget/c.widget.captcha',
            'cCalendar':'widget/c.calendar',
            'cHolidayCalendar':'widget/c.holiday.calendar',
            'cHolidayPriceCalendar':'widget/c.holiday.price.calendar',

            //--------------------------------------------------------------
            // Page
            'cBasePageView':'page/c.page.base',
            'cCommonPageFactory':'page/c.page.factory',
            'cCommonListPage':'page/c.page.common.list',

            //--------------------------------------------------------------
            // Hybrid
            'cHybridFacade':'hybrid/c.hybrid.facade',
  	        'libs': '../webapporigin/../test/libs'
  },    
  nodeRequire: require
});


require = function(path, callback)
{
  if (arguments.length == 2)
  {
    return requirejs.call(global, path, callback);         
  }
  else
  {
    return c_require.call(global, path);   
  }
};
