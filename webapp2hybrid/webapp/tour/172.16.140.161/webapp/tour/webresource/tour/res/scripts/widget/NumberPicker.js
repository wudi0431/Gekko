/**
* NumberPicker 数值增减器
* 组件来源：http://localhost/webapp/tour/index.html#booking.step1
*/
define(['inherit', 'EventEmitter'], function (inherit, EventEmitter) {

    var CLASS_NAME = {
        DISABLE: 'num_invalid'
    };
    var int = function (num) { return parseInt(num, 10) };

    /*

    @event change(value, prevValue)
    @event max(value)
    @event min(value)
    @event range(max, min)
    @event step(value)

    */
    var NumberPicker = inherit({
        name: 'NumberPicker',
        proto: {
            /**
            * @param {zpNode} node
            * @param {Number} min
            * @param {Number} max
            * @param {Number} [step = 1]
            * @param {Number} defaultNum
            */
            __constructor: function (options) {
                _.extend(this, {
                    step: 1
                }, options);

                var node = this.node;
                this.btnDecreaser = node.find('.list_num_dec');
                this.btnIncreaser = node.find('.list_num_inc');
                this.nodeNumber = node.find('.list_num');

                this._init();
            },
            _init: function () {
                this.nodeNumber.text(this.defaultNum);
                var val = this.getValue();
                // 有可能默认值也是不合法的（比如模版默认都写1，但是实际的最小值是2）
                // 同时，check 也会初始化按钮等
                this.check();

                _.bindAll(this, 'onBtnDecreaserClick', 'onBtnIncreaserClick');
                this.btnDecreaser.on('click', this.onBtnDecreaserClick);
                this.btnIncreaser.on('click', this.onBtnIncreaserClick);
            },
            getValue: function () {
                return this.value = int(this.nodeNumber.text());
            },
            setValue: function (value) {
                if (value >= this.min && value <= this.max
                    && this.value != value
                    && this.check(value)) {
                    var prevValue = this.value;
                    this.value = value;
                    this.nodeNumber.text(value);
                    this.emit('change', value, prevValue);
                }
                return this;
            },
            /*
            检查给定的值 或 现有的值 是否合法

            @param {Number} [value = this.value]
            */
            check: function (value) {
                value = _.isUndefined(value) ? this.value : value, result = true;
                this[(value >= this.max || this.max - value < this.step) ? 'disable' : 'enable'](true);
                // value - this.min < this.step // 这种情况应该不会发生，因为都是从 min 累加 step 来设置值的
                this[(value <= this.min || value - this.min < this.step) ? 'disable' : 'enable'](false);
                // 范围是否正确
                if (this.max < this.min) {
                    this.emit('range', this.max, this.min);
                    this.setMax(this.min);
                    result = false;
                }
                // 值是否在范围内
                else if (value > this.max) {
                    this.emit('max', value);
                    this.setValue(this.max);
                    result = false;
                }
                // 值是否在范围内
                else if (value < this.min) {
                    this.emit('min', value);
                    this.setValue(this.min);
                    result = false;
                }
                // 值是否在 step 阶梯上
                else {
                    var diff = value - this.min;
                    var res = diff % this.step;
                    // 是否整除
                    if (res !== 0) {
                        this.emit('step', value);
                        // 设置为 比 设置的值更小的最接近的合理的值
                        this.setValue(value - res);
                        result = false;
                    }
                }

                return result;
            },
            disable: function (increaser) {
                if (increaser) {
                    this.isIncreaserDisabled = true;
                    this.btnIncreaser.addClass(CLASS_NAME.DISABLE);
                }
                else {
                    this.isDecreaserDisabled = true;
                    this.btnDecreaser.addClass(CLASS_NAME.DISABLE);
                }
            },
            enable: function (increaser) {
                if (increaser) {
                    this.isIncreaserDisabled = false;
                    this.btnIncreaser.removeClass(CLASS_NAME.DISABLE);
                }
                else {
                    this.isDecreaserDisabled = false;
                    this.btnDecreaser.removeClass(CLASS_NAME.DISABLE);
                }
            },
            setMin: function (min) {
                this.min = min;
                this.check();
                return this;
            },
            setMax: function (max) {
                this.max = max;
                this.check();
                return this;
            },
            onBtnDecreaserClick: function (e) {
                if (!this.isDecreaserDisabled) {
                    this.setValue(this.getValue() - this.step);
                }
            },
            onBtnIncreaserClick: function (e) {
                if (!this.isIncreaserDisabled) {
                    this.setValue(this.getValue() + this.step);
                }
            }
        }
    });
    EventEmitter.mixTo(NumberPicker);

    //window.NumberPicker = NumberPicker;

    return NumberPicker;
});