/**
* Switcher -- SwitcherStyleSelect 和 SwitcherStyleIOS 的父类 开关切换：选择/已选
*/
define(['res/libs/inherit', 'res/libs/EventEmitter'],
    function (inherit, EventEmitter) {

        var Switcher, Manager;

        Manager = inherit({
            name: 'SwitcherManager',
            proto: {
                /*
                * @param {zpNode} nodes
                */
                __constructor: function (options) {
                    this.switchers = [];
                    this.selectedSwitcher = null;

                    _.extend(this, options);
                    this._check();
                    if (this.nodes) {
                        var self = this;
                        _.each(this.nodes, function (dom) {
                            var switcher = new self.Switcher({
                                node: $(dom)
                            });
                            self.addSwitcher(switcher);
                        });
                    }
                },
                _check: function () {
                    if (this.nodes && !this.Switcher) {
                        throw new Error("[SwitcherManager] need the argument Switcher.");
                    }
                },
                getByIndex: function (index) {
                    return this.switchers[index];
                },
                addSwitcher: function (switcher) {
                    if (!(switcher instanceof Switcher)) throw new Error('[Switcher.manager.addSwitcher] the object is not a Switcher');
                    switcher.on('all', _.bind(function (eventName) {
                        this.onSwitcherAll(eventName, switcher);
                    }, this));
                    this.switchers.push(switcher);
                    return this;
                },
                onSwitcherAll: function (eventName, switcher) {
                    this.emit(eventName, switcher);
                }
            }
        });
        EventEmitter.mixTo(Manager);

        Switcher = inherit({
            name: 'Switcher',
            proto: {
                /**
                * @param {zpNode} node
                * @param {Object} CLASS_NAME{ SELECTED, NOT_SELECT } 
                */
                __constructor: function (options) {
                    _.extend(this, options);
                    this.isSelected = this.node.hasClass(this.CLASS_NAME.SELECTED);

                    this.node.on('click', _.bind(this.onNodeClick, this));
                },
                getValue: function () {
                    return this.isSelected;
                },
                unselect: function () {
                    this.node.removeClass(this.CLASS_NAME.SELECTED).addClass(this.CLASS_NAME.NOT_SELECT);
                    this.isSelected = false;
                    this.emit('unselect');
                },
                select: function () {
                    this.node.removeClass(this.CLASS_NAME.NOT_SELECT).addClass(this.CLASS_NAME.SELECTED);
                    this.isSelected = true;
                    this.emit('select');
                },
                onNodeClick: function (e) {
                    if (this.isSelected) {
                        //this.unselect();
                    }
                    else {
                        this.select();
                    }
                }
            },
            statics: {
                Manager: Manager
            }
        });
        EventEmitter.mixTo(Switcher);

        return Switcher;
    });