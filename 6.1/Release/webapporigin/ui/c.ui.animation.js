/**
* @author zsb张淑滨 <shbzhang@Ctrip.com> / ghj龚汉金 <hjgong@Ctrip.com>
* @class cLog
* @description 提供App在手机端的后门
* @comment 需要zsb与新代码再核对一遍
*/
define([], function () {

  return {

    slideleft: function (inView, outView, callback, scope) {
      $('body').addClass('hiddenx');
      inView.addClass('animatestart');
      inView.addClass('sliderightin');

      inView.__show();

      var self = this;
      return setTimeout(function () {
        $('body').removeClass('hiddenx');
        inView.removeClass('animatestart');
        inView.removeClass('sliderightin');

        if (outView) {
          outView.__hide(inView.viewname);
          outView.__onHide(inView.viewname);
        }
        inView.__onShow();

        callback && callback.call(scope, inView, outView);
      }, 340);
    },
    slideright: function (inView, outView, callback, scope) {
      $('body').addClass('hiddenx');

      if (outView) {
        outView.addClass('animatestart');
        outView.addClass('sliderightout');
      }

      inView.__show();

      var self = this;
      return setTimeout(function () {
        $('body').removeClass('hiddenx');
        if (outView) {
          outView.removeClass('animatestart');
          outView.removeClass('sliderightout');
          outView.__hide(inView.viewname);
          outView.__onHide(inView.viewname);
        }

        inView.__onShow();

        callback && callback.call(scope, inView, outView);

      }, 340);
    },


    noAnimate: function (inView, outView, callback, scope) {
      //减少重绘和回流，但是会引起页面滚动条BUG
      //      this.mainframe.hide();

      //in 一定会有 out则不一定
      if (outView) {
        outView.__hide(inView.viewname);
        outView.__onHide(inView.viewname);
      }
      inView.__show();
      inView.__onShow();

      //      this.mainframe.show();

      callback && callback.call(scope, inView, outView);

    }

  };
});