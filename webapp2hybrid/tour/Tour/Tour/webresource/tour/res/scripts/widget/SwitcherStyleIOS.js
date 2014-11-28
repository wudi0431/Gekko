/**
* SwitcherStyleIOS 开关切换：选择/已选
* 组件来源：http://localhost/webapp/tour/index.html#booking.select.taocan
*/
define(['res/libs/inherit', './Switcher'], function (inherit, Switcher) {

    var CLASS_NAME = {
        SELECTED: 'btn_on',
        NOT_SELECT: 'btn_off'
    };

    var SwitcherStyleIOS, SwitcherStyleIOSManager;

    SwitcherStyleIOSManager = inherit({
        name: 'SwitcherStyleIOSManager',
        base: Switcher.Manager,
        proto: {
            __constructor: function () {
                this.Switcher = SwitcherStyleIOS;
                this.__base.apply(this, arguments);
            }
        }
    });

    SwitcherStyleIOS = inherit({
        name: 'SwitcherStyleIOS',
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
            onNodeClick: function (e) {
                var nowIsSelected = this.isSelected;
                this.__base(e);
                if (nowIsSelected) {
                    this.unselect();
                }
            }
        },
        statics: {
            Manager: SwitcherStyleIOSManager
        }
    });

    return SwitcherStyleIOS;
});