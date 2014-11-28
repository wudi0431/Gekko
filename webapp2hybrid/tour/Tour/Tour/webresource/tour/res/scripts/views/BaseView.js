// 汉字
define(['cPageView', 'Util', 'TourStore'], function(cPageView, util, baseStore) {
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString;
    var utilConst = util.CONST;
    var CONST = {
        TYPE_OBJECT: '[object Object]',
        TYPE_ARRAY: '[object Array]'
    };
    var caches = {
        back_forward: null
    };
    //清除store配置
    var viewClearStore = (function() {
        //填写页用到的store
        var orderStore = [baseStore.OrderParamStore, baseStore.OrderDataSaveStore];
        return {
            'order.detail': orderStore
        }
    })();
    //延迟id
    var interval;
    var TourBaseView = cPageView.extend({
        /*
         * 重写 Backbone 的 delegateEvents
         *
         * 让 events 属性，默认可以继承父类的events，而不是覆盖
         *
         * 如果不这样做，又想继承父类的 events 的话，只能把events都写成函数，然后
         *    events: function () {
         *        return util.extendDeep(this.constructor.__super__.events(), {});
         *    }
         */
        delegateEvents: function() {
            var thisEvents = this.events;
            var parentEvents = this.constructor.__super__.events;
            if (parentEvents && thisEvents !== parentEvents) {
                thisEvents = _.isFunction(thisEvents) ? thisEvents.call(this) : thisEvents;
                parentEvents = _.isFunction(parentEvents) ? parentEvents.call(this) : parentEvents;
                this.events = _.extend({}, parentEvents, thisEvents);
            }
            // 调用 Backbone 的 delegateEvents
            return cPageView.__super__.delegateEvents.apply(this, arguments);
        },
        //events: {},
        //events: function () { return {} },
		
		onShow: function()
		{
		    //var ret = cPageView.prototype.onShow.apply(this, arguments);
            this.__onShow && this.__onShow();
            //return ret;			
		},
		
		/**
         *  重写 __onShow
         *
         *  负责调用 onLoad 的一层，直接在这一层处理即可
         *  这样的话，即便有 onLoad 属性，也不会影响 vaOnLoad 被调用
         */
        __onShow: function(prevViewname) {
            window.vaStorage = this.vaStorage;
            // 调用原本的 __onShow
            //var proto__onShow_result = cPageView.__super__.__onShow.apply(this, arguments);

            var args = slice.call(arguments),
                storedData;

            // 1. 拿到 vaForward / vaBack 传递的数据
            if (caches.back_forward && caches.back_forward.viewname == prevViewname) {
                storedData = caches.back_forward.data;
            }
            // 2. 拿到 URL 数据
            // URL 的参数合并数据，并覆盖传递的同名参数
            var storedData = _.extend(storedData || {}, util.paramParse());

            // 3. 拿到 localStorage 数据
            var storage_data = this.vaStorage.get();
            // 先把数据合并到一起，但是优先级最低
            storedData = _.extend({}, storage_data, storedData);
            // 同时把数据挂载到一个 storage_data 的名字下面，避免有同名数据被覆盖
            storedData[this.vaStorage.not_store_key] = storage_data;

            args.unshift(storedData);
            if (this.vaOnLoad) {
                // 只能传递一次
                delete caches.back_forward;
                this.vaOnLoad.apply(this, args)
            }
            //清除store
            this.clearStore();
            //return proto__onShow_result;
        },
        //vaOnLoad: function () { },
        vaStorage: util.getStorage('VACATION_TOURE_VIEW'),
        /**
         * @param {Object} [data]
         */
        vaBack: function(data, otherParams) {
            var args = arguments;
            if (toString.call(data) == CONST.TYPE_OBJECT) {
                args = slice.call(arguments, 1);
                caches.back_forward = {
                    viewname: this.viewname,
                    data: data
                };
            }
            return this.back.apply(this, args);
        },
        /**
         * @param {Object} [data]
         */
        vaForward: function(data, otherParams) {
            var args = arguments;
            if (toString.call(data) == CONST.TYPE_OBJECT) {
                args = slice.call(arguments, 1);
                caches.back_forward = {
                    viewname: this.viewname,
                    data: data
                };
            }
            if (!args[0]) throw TypeError("[vaForward] no URL was provided.");

            return this.forward.apply(this, args);
        },
        /**
         * @param {Object} [data]
         */
        vaJump: function(data, otherParams) {
            var args = arguments;
            if (toString.call(data) == CONST.TYPE_OBJECT) {
                args = slice.call(arguments, 1);
                caches.back_forward = {
                    viewname: this.viewname,
                    data: data
                };
            }
            if (!args[0]) throw TypeError("[vaJump] no URL was provided.");

            return this.jump.apply(this, args);
        },
        //update showloading 延迟显示
        /**
         * @param {int} [t]
         */
        vaShowLoading: function(t) {
            interval = setTimeout($.proxy(function() {
                this.showLoading();
            }, this), t || 300);
        },
        vaHideLoading: function() {
            interval && clearTimeout(interval);
            this.hideLoading()
        },
        _storageInStep: [{
            name: utilConst.STORE_DETAIL,
            contain: []
        }, {
            name: utilConst.STORE_BOOKING_STEP1,
            contain: [utilConst.STORE_BOOKING_CALENDAR, utilConst.STORE_BOOKING_STEP1]
        }, {
            name: utilConst.STORE_BOOKING_STEP2,
            contain: [utilConst.STORE_BOOKING_STEP2, utilConst.STORE_BOOKING_CHOOSED_RESOURCE,
                utilConst.STORE_BOOKING_HOTEL, utilConst.STORE_BOOKING_SINGLE, utilConst.STORE_BOOKING_OPTIONAL, utilConst.STORE_BOOKING_TMP_ORDER
                //, utilConst.STORE_BOOKING_GUID
            ]
        }, {
            name: utilConst.STORE_BOOKING_STEP3,
            contain: []
        }],
        //storageCleaner: function(currentStepName) {
        //    var vaStorage = this.vaStorage;
        //    var find = false;
        //    _.each(this._storageInStep, function(entity) {
        //        if (find) {
        //            _.each(entity.contain, function(storageKey) {
        //                vaStorage.remove(storageKey);
        //            });
        //        }
        //        // 当前步骤之后的全部清除
        //        else if (entity.name == currentStepName) {
        //            find = true;
        //        }
        //    });
        //},
        util: util,
        clearStore: function() {
            var str, hash = location.hash.slice(1);
            if (str = viewClearStore[hash]) {
                if (toString.call(str) === CONST.TYPE_ARRAY) {
                    for (var i = 0, len = str.length; i < len; i++) {
                        (str[i].getInstance()).remove();
                    }
                } else {
                    (str.getInstance()).remove();
                }
            }
        }
    });
    return TourBaseView;
});