/**
* @author l_wang王磊 <l_wang@Ctrip.com>
*/
define(['cBase', 'cUIAbstractView'], function (cBase, cUIAbstractView) {

  return cBase.Class(cUIAbstractView, {
    __propertys__: function () {

      this.template = [
        '<div class="cui-hd"><span>完成</span></div>',
        '<div class="cui-bd">',
          '<ul>',
            '<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li><li class="cui-wrapper-x"><div class="cui-letter-x"></div></li><li>0</li><li class="cui-wrapper-delete"><div class="cui-btn-delete"></div></li>',
          '</ul>',
        '</div>'
      ].join('');

      this.addClass('cui-keyboard');
      this.addClass('cui-keyboard-hide');

      this.eventArr = {
        'click .cui-hd span': 'closeAction',
        'click .cui-bd li': 'itemAction'
        //        'click .cui-btn-delete': 'deleteAction'
      };

      //目标元素，必填
      this.targetEl = null;

      this.emptyEl = $('<div style="height: 1000px"></div>');

    },

    deleteAction: function () {
      console.log('delete');
    },

    itemClickAction: function (val) {
      console.log(val);

    },

    itemAction: function (e) {
      var el = $(e.currentTarget);
      el.addClass('cui-on-t');
      setTimeout(function () {
        el.removeClass('cui-on-t');
      }, 150);

      if (el.hasClass('cui-wrapper-delete')) {
        this.deleteAction();
        return;
      }
      var val = el.html();
      if (el.hasClass('cui-wrapper-x')) val = 'X';


      this.itemClickAction(val);
    },

    closeAction: function () {
      this.addClass("cui-keyboard-hide");
      setTimeout($.proxy(function () {
        this.hide();
      }, this), 200)
    },

    createHtml: function () {
      return _.template(this.template)(this.viewdata);
    },

    _scrollToTarget: function () {
      var offset = this.targetEl.offset();

      $.scrollTo({ endY: (offset.top - 50) });
      this.removeClass('cui-keyboard-hide');

    },

    bindEvent: function () {

      this.addEvent('onShow', function () {

        $('body').append(this.emptyEl);
        this._scrollToTarget();

      }, this);

      this.addEvent('onHide', function () {
        this.addClass('cui-keyboard-hide');
        this.emptyEl.remove();
      }, this);

    },

    initialize: function ($super, opts) {
      for (var k in opts) {
        if (k == 'viewdata') {
          _.extend(this.viewdata, opts[k]);
          continue;
        }
        this[k] = opts[k];
      }
      $super(opts);

      this.bindEvent();
    }

  });
});