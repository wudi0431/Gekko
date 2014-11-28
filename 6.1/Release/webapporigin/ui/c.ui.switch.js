/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUISwitch
* @description 提供开关阀
*/
define(['cBase', 'cUIAbstractView'], function (cBase, AbstractView) {

    var options = {};

    var _config = {
        prefix: 'cui-'
    };

    options.__propertys__ = function () {

        /** 鼠标各个位置信息，主要针对touchstart与touchend */
        this.mouseData = {
            sX: 0,
            eX: 0,
            sY: 0,
            eY: 0
        };
        //默认为关闭状态
        this.checkedFlag = false;
    };

    /** 可以传入rootBox已经changed两个参数，一个是控件所处位置，一个是选项改变时候需要触发的事件 */
    options.initialize = function ($super, opts) {
        this.bindEvent();
        this.allowsConfig.changed = true; //开启changed
        this.checkedFlag = opts.checked;
        $super(opts);

        this.show();

        //初始化时不再执行动画
        //  if (opts.checked) this.checked();
        //  else this.unChecked();

    };

    /**
    * @method bindEvent
    * @description 事件绑定
    */
    options.bindEvent = function () {

        this.addEvent('onShow', function () {
            var scope = this;

            this.el = this.root.find('.cui-switch');
            this.switchBar = this.el.find('.cui-switch-bg');

            $.flip(this.root, 'left', $.proxy(function () {
                this.unChecked();
            }, this));

            $.flip(this.root, 'right', $.proxy(function () {
                this.checked();
            }, this));

            $.flip(this.root, 'tap', $.proxy(function () {
                if (this.el.hasClass('current')) {
                    this.unChecked();
                } else {
                    this.checked();
                }
                return;
            }, this));

        });

        this.addEvent('onHide', function () {
            var scope = this;
            $.flipDestroy(this.el);
            this.root.remove();
        });

    };

    /**
    * @method createHtml
    * @description 重写抽象类结构dom
    */
    options.createHtml = function () {
        var checkedStyle = this.checkedFlag ? 'current' : '';
        return [
        '<div class="cui-switch ' + checkedStyle + '">',
          '<div class="cui-switch-bg ' + checkedStyle + '"></div>',
          '<div class="cui-switch-scroll"></div>',
        '</div>'
      ].join('');
    };

    /**
    * @method _getLRDir
    * @description 计算左右方向
    */
    options._getLRDir = function () {
        if (this.mouseData.eX - this.mouseData.sX > 0) return 'right';
        if (this.mouseData.eX - this.mouseData.sX < 0) return 'left';
    };

    /**
    * @method unChecked
    * @description 将控件置为非选择状态
    */
    options.unChecked = function () {
        if (!this.getStatus()) return;
        this.el.removeClass('current');
        this.switchBar.removeClass('current');
        this._triggerChanged();
    };

    /**
    * @method checked
    * @description 将控件置为选择状态
    */
    options.checked = function () {
        if (this.getStatus()) return;
        this.el.addClass('current');
        this.switchBar.addClass('current');
        this._triggerChanged();
    };

    options._triggerChanged = function () {
        if (typeof this.changed == 'function') this.changed.call(this);
    }

    /**
    * @method getStatus
    * @description 获得当前控件是否选择
    */
    options.getStatus = function () {
        return this.el.hasClass('current');
    }

    /**
    * 设置当前状态
    * @parma {boolean} flag
    */
    options.setStatus = function (flag) {
        if (flag) {
            this.el.addClass('current');
            this.switchBar.addClass('current');
        } else {
            this.el.removeClass('current');
            this.switchBar.removeClass('current');
        }
    }

    return new cBase.Class(AbstractView, options);

});