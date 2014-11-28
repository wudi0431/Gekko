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

    //最小值
    this.min = 1;
    this.max = 9;
    this.curNum = 1;

    this.needText = true;


    this.addClass = 'num-add';
    this.minusClass = 'num-minus';
    this.curClass = 'num-value-txt';
    this.invalid = 'num-invalid';

    this.minAble = true;
    this.maxAble = true;

    //单位
    this.unit = '';


    this.minDom = null;
    this.maxDom = null;
    this.curDom = null;

    this.hasBindEvent = false;

    //数字变化时候触发的事件
    this.changed = function () { };

    //变化前的验证
    this.changeAble = function () { };
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

    this.addEvent('onHide', function () {
      //事件绑定
      this.root.off('click');
      this.curDom.off('focus');
      this.curDom.off('blur');
      this.root.remove();
    });

    this.addEvent('onShow', function () {
      var scope = this;

      this.maxDom = this.root.find('.' + this.addClass);
      this.minDom = this.root.find('.' + this.minusClass);
      this.curDom = this.root.find('.' + this.curClass);

      this.resetNum();
      //首先检测选择相关


      if (this.needText == false) {
        this.curDom.attr('disabled', 'disabled');
      }

      //一次绑定事件后，以后便不予注册
      if (this.hasBindEvent == false) {
        this.root.on('click', $.proxy(function (e) {
          var el = $(e.target);


          //获取焦点
          if (el.hasClass(this.curClass)) {
            return;
          }

          //增加，并且当前增加可点击
          if (el.hasClass(this.addClass) && this.maxAble) {
            this.setVal(this.curNum + 1);

          }
          //减少，并且减可点击
          if (el.hasClass(this.minusClass) && this.minAble) {

            this.setVal(this.curNum - 1);
          }

          e.preventDefault();

        }, this));

        //单独为文本框设置事件
        if (this.needText) {

          this.curDom.on('focus', $.proxy(function (e) {
            this.curDom.val('');
          }, this));

          this.curDom.on('blur', $.proxy(function () {
            this.setVal(this.curDom.val());
          }, this));
        }

        this.hasBindEvent = true;
      }

    });
  };

  //设置当前值
  options.resetNum = function (noTrigger) {
    //首先设置当前选择值
    this.curDom.attr('data-key', this.curNum);
    this.curDom.val(this.getText());

    if (typeof this.changed == 'function' && !noTrigger) {
      this.changed.call(this, this.curNum);
    }
    this.testValid();
  };

  options.getVal = function () {
    return this.curNum;
  };

  options.setVal = function (v) {

    //点击时候有可能因为一些原因不应该变化
    if (typeof this.changeAble == 'function' && this.changeAble.call(this, v) == false) {
      this.resetNum(true);
      return false;
    }

    var isChange = true;

    //如果传入是一个数字
    if (v == parseInt(v)) {
      //设置值不等的时候才触发reset
      isChange = this.curNum == v;
      v = parseInt(v);
      this.curNum = v;
      if (v < this.min) {
        this.curNum = this.min;
      }
      if (v > this.max) {
        this.curNum = this.max;
      }
    }

    this.resetNum(isChange);
  };

  options.testValid = function () {
    //如果值不可选的话便置灰处理，并设置相关参数
    if (this.curNum == this.min) {
      this.deactiveItem(this.minDom); this.minAble = false;
    } else {
      if (this.minAble == false) { this.acticeItem(this.minDom); this.minAble = true; }
    }
    if (this.curNum == this.max) {
      this.deactiveItem(this.maxDom); this.maxAble = false;
    } else {
      if (this.maxAble == false) { this.acticeItem(this.maxDom); this.maxAble = true; }
    }
  };

  options.deactiveItem = function (dom) {
    if (dom) dom.addClass(this.invalid);
  };

  options.acticeItem = function (dom) {
    if (dom) dom.removeClass(this.invalid);
  };

  options.getText = function () {
    return this.curNum + this.unit;
  };

  /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
    return [
        '<span class="cui-number-ma">',
            '<i class="' + this.minusClass + '"></i>',
            '<input type="tel"  class="' + this.curClass + '" >',
            '<i class="' + this.addClass + '"></i>',
        '</span>'
      ].join('');
  };

  return new cBase.Class(AbstractView, options);

});