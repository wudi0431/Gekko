define(['cHistory', 'cView', 'cDataSource', 'cUIBase', 'cUIAbstractView',  'cUIAlert', 'cUIAnimation', 'cUICitylist', 'cUIHeadWarning', 'cUIInputClear', 'cUILayer', 'cUILoading', 'cUILoadingLayer', 'cUIMask', 'cUIPageview', 'cUIScrollRadio', 'cUIScrollRadioList', 'cUIScrollList', 'cUIToast', 'cUIWarning', 'cUIWarning404', 'cUIHashObserve', 'cUIEventListener', 'cUISwitch', 'cUINum', 'cUIGroupList', 'cUIBusinessGroupList', 'cUITab', 'cUIImageSlider', 'cUIBubbleLayer'], function (cuiHistory, cuiView, cuiDataSource, cuiBase, cuiAbstractView, cuiAlert, cuiAnimation, cuiCityList, cuiHeadWarning, cuiInputClear, cuiLayer, cuiLoading, cuiLoadingLayer, cuiMask, cuiPageView, cuiScrollRadio, cuiScrollRadioList, cuiScrollList, cuiToast, cuiWarning, cuiWarning404, cuiHashObserve, cuiEventListener, cuiSwitch, cuiNum, cUIGroupList, cUIBusinessGroupList, cUITab, cUIImageSlider, cUIBubbleLayer) {

  var config = {
    // @description 框架内所有生成的元素的id，class都会加上此前缀
    prefix: 'cui-'
  };

  var cui = {
    History: cuiHistory,
    View: cuiView,
    DataSource: cuiDataSource,
    Tools: cuiBase,
    config: config,
    AbstractView: cuiAbstractView,

    Alert: cuiAlert,
    Animation: cuiAnimation,
    CityList: cuiCityList,
    HeadWarning: cuiHeadWarning,
    InputClear: cuiInputClear,
    Layer: cuiLayer,
    Loading: cuiLoading,
    LoadingLayer: cuiLoadingLayer,
    Mask: cuiMask,
    PageView: cuiPageView,
    ScrollRadio: cuiScrollRadio,
    ScrollRadioList: cuiScrollRadioList,
    ScrollList: cuiScrollList,
    Toast: cuiToast,
    Warning: cuiWarning,
    HashObserve: cuiHashObserve,
    EventListener: cuiEventListener,
    cuiSwitch: cuiSwitch,
    cuiNum: cuiNum,
    cUIGroupList: cUIGroupList,
    cUIBusinessGroupList: cUIBusinessGroupList,
    cUITab: cUITab,
    cUIImageSlider: cUIImageSlider,
    cUIBubbleLayer: cUIBubbleLayer
  }

  return cui;
});