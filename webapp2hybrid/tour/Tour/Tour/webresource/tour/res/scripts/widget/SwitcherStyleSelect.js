/**
* SwitcherStyleSelect 开关切换：选择/已选
* 组件来源：http://localhost/webapp/tour/index.html#booking.select.taocan
*/
define(['res/libs/inherit', './Switcher'], function (inherit, Switcher) {

    var CLASS_NAME = {
        SELECTED: 'btn_cur',
        NOT_SELECT: 'btn_blue'
    };
    var TEXT = {
        SELECTED: '已选',
        NOT_SELECT: '选择'
    };

    var SwitcherStyleSelect, SwitcherStyleSelectManager;

    SwitcherStyleSelectManager = inherit({
        name: 'SwitcherStyleSelectManager',
        base: Switcher.Manager,
        proto: {
            __constructor: function () {
                this.Switcher = SwitcherStyleSelect;
                this.__base.apply(this, arguments);
            },
            onSwitcherAll: function (eventName, switcher) {
                this.__base.apply(this, arguments);
                if (eventName == 'select') {
                    this.selectedSwitcher && this.selectedSwitcher.unselect();
                    this.selectedSwitcher = switcher;
                }
            }
        }
    });

    SwitcherStyleSelect = inherit({
        name: 'SwitcherStyleSelect',
        base: Switcher,
        proto: {
            /**
            * @param {zpNode} node
            */
            __constructor: function (options) {
                options = _.extend({
                    CLASS_NAME: CLASS_NAME
                }, options);
                this.__base(options);
            },
            unselect: function () {
                this.node.text(TEXT.NOT_SELECT);
                return this.__base.apply(this, arguments);
            },
            select: function () {
                this.node.text(TEXT.SELECTED);
                return this.__base.apply(this, arguments);
            }
        },
        statics: {
            Manager: SwitcherStyleSelectManager
        }
    });

    return SwitcherStyleSelect;
});