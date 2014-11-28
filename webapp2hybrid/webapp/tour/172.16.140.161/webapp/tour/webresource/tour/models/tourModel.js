define(["cModel", "cBase", 'TourStore', 'Util', 'cUtility'],
    function (cModel, cBase, store, util, cUtility) {
        var _ret = {};
        var _base = new cBase.Class(cModel, {
            __propertys__: function () {
                var bdomain, bpath;
                var evn = util.getEnvCode(cUtility);
                if (evn == 0) {
                    bdomain = 'm.fat19.qa.nt.ctripcorp.com';
                    bpath = 'restapi.tour/vacationapi/';
                } else if (evn == 1) {
                    bdomain = '10.8.2.111';
                    bpath = 'restapi/vacationapi/';
                }else{
                    bdomain = 'm.ctrip.com';
                    bpath = 'restapi/vacationapi/'
                }
                bdomain = 'm.ctrip.com';
                bpath = 'restapi/vacationapi/'
                this.baseurl = {
                    domain: bdomain,
                    path: bpath
                };
                this.method = 'POST';
                this.param = {};
                this.result = null;

                // 详情页，图片数据
                //this.KEY_DETAIL_PICS = 'detail.pictures';
                // 预定页，第一步
            },
            initialize: function ($super, options) {
                $super(options);
            },
            vaGet: function (name) {
                return util.memoryCache.get(name);
            },
            vaGetCache: function (name) {
                return this.vaGet(name || this._buildurl());
            },
            vaSet: function (name, value) {
                return util.memoryCache.set(name, value);
            },
            vaRemove: function (name) {
                return util.memoryCache.remove(name);
            },
            /*
            * @param {Boolean} [cacheInMemory = true] // 是否需要内存缓存
            * @param {String} [cacheKey = apiPath] //
            * @param {Function} onComplete
            * @param {Function} onError
            * @param {Function} onAlways // 无论成功或失败，都会调用
            * @param {Boolean} ajaxOnly
            * @param {Object} scope
            * @param {Function} onAbort
            */
            vaExec: function (options) {
                options = _.extend({
                    cacheInMemory: true,
                    cacheKey: this._buildurl()
                }, options);

                var cacheValue, callbackArgs;
                var self = this;
                var scope = options.scope || this;
                //if (options.cacheInMemory && (cacheValue = this.vaGet(options.cacheKey))) {
                //    options.onComplete.call(scope, cacheValue, checkNotError);
                //    always([cacheValue]);
                //    return this;
                //} else {
                    return this.execute(function (json) {
                        callbackArgs = arguments;
                        // 成功，直接保存和传递使用 json.data
                        if (json.errno == 0) {
                            if (options.cacheInMemory) {
                                self.vaSet(options.cacheKey, json.data);
                            }
                            // 保证还使用原来的 this
                            options.onComplete && options.onComplete.call(scope, json.data, checkNotError);
                        }
                        // 失败，直接走 onError 的流程
                        else {
                            error();
                        }
                        always(callbackArgs);
                    }, function () {
                        callbackArgs = arguments;
                        error();
                        always(callbackArgs);
                    }, options.ajaxOnly, scope, options.onAbort);
                //}

                function checkNotError(trueCondition, errorMessage) {
                    if (!trueCondition) {
                        error(errorMessage);
                        self.vaRemove(options.cacheKey);
                    }
                    return trueCondition;
                }

                function error(errorMessage) {
                    var error = callbackArgs[0];
                    if (Object.prototype.toString.call(error) !== '[object Object]') error = { originError: error };
                    error.errmsg = errorMessage || error.errmsg || error.msg;
                    options.onError && options.onError.call(scope, error);
                }

                function always(args) {
                    options.onAlways && options.onAlways.apply(scope, args);
                }
            },
            // 改自 Lizard
            _buildurl: function () {
                return this.protocol + '://' + this.baseurl.domain + '/' + this.baseurl.path + (typeof this.url === 'function' ? this.url() : this.url) + util.paramStringify(this.param);
            }
        });

        //详情页统一接口，根据reqType类型请求不同的数据
        _ret.DetailModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/productdetail';
                this.param = {};
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        //详情页预定须知,返回的数据存入localStorage
        _ret.DetailBookingNoteModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/productdetail';
                this.param = {};
                this.result = store.DetailBookNoteStore.getInstance();
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        //详情页签证,返回的数据存入localStorage
        _ret.DetailVisaModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/productdetail';
                this.param = {};
                this.result = store.DetailVisaStore.getInstance();
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        //详情页图片详情,返回的数据存入localStorage
        _ret.DetailPicModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/productdetail';
                this.param = {};
                this.result = store.DetailPicStore.getInstance();
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        //填写页
        _ret.OrderModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/bookform';
                this.param = {
                    'dataItms': '2,3,4,5,6,7,8,9'
                }
                this.result = store.OrderStore.getInstance();
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        // 预定页，价格日历
        _ret.BookingPriceCalendar = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/productcalendar';
                /**
                this.param = {
                pId: 51114,
                saleCity: 2,
                departureCity: 2,
                sDate: '2014-03-13',
                eDate: '2014-04-20'
                }
                */
                this.result = null;
                this.dataformat = function (json) {
                    return json;
                };
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        // peic@Ctrip.com 资源查询 -- 预定 step2
        _ret.BookingResourceSearch = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/resourcesearch';

                //this.baseurl.domain = 'localhost:8989';
                //this.baseurl.path = '';
                //this.url = 'resource_search';
                /*
                this.param = {
                // ProductId
                pId: 51114,
                // DepartureCityId
                departCId: 2,
                // DepartureDate
                departDate: '2014-03-05',
                // AdultQuantity
                adultNum: 2,
                // ChildQuantity
                childNum: 0,
                // SaleCityId
                saleCId: 2,
                ocMode: 2,
                // GUID
                guid: '',
                chosedResource: ''
                };
                */
                this.result = store.BookingResourceSearch.getInstance();
                this.dataformat = function (json) {
                    return json;
                }
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        // 资源酒店重选查询
        _ret.BookingResourceHotelSearch = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/hotelsearch';
                this.param = {};
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        // peic@Ctrip.com 资源查询 -- 预定 step2 -- 单选资源
        _ret.BookingSelectSingle = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/singleresource';
                /*
                this.param = {
                "pId": 51114,
                "departCId": 2,
                "segmId": 125159,
                "segmNumb": 3,
                "departDate": "2014-03-15",
                "adultQ": 2,
                "childQ": 0
                };
                */
                this.result = null;
                this.dataformat = function (json) {
                    return json;
                }
            },
            initialize: function () {

            }
        });

        _ret.QuestionModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/productdetail';
                this.param = {
                    "pId": 0,
                    "reqType": [6],
                    "start": 1,
                    "count": 3
                };
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        //常用旅客列表
        _ret.PassengersModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/bookform';
                this.param = {
                    'dataItms': '1,10'
                }
                this.result = store.PassengersStore.getInstance();
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        //预订须知
        _ret.OrderContractOrder = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/bookform';
                this.param = {
                    'dataItms': '11'
                }
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        // 搜索结果列表
        _ret.VacationsListModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/productsearch';
                this.param = {
                    "saleCity": 2,
                    "startCity": 2,
                    "key": "beijing",
                    "selectorId": 0,
                    "line": 1,
                    "pType": 0,
                    "start": 1,
                    "count": 100
                };
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        // 目的地搜索列表
        _ret.DestSearchList = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/addresstip';
                this.param = {
                    "key": "",
                    "depCityId": 0
                };
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        //创建订单
        _ret.CreateOrderModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/createorder';
                this.param = {};
                this.result = store.OrderCreateStore.getInstance();
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        //保存订单
        _ret.SaveOrderModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/booksave';
                this.param = {};
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        //优惠券验证
        _ret.CouponVerifyModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/promovalid';
                this.param = {};
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        //订单提交
        _ret.OrderSubmitModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/submit';
                this.param = {};
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        // 订单详情
        _ret.OrderDetailModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/orderdetail';
                this.param = {};
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        // 订单详情明细
        _ret.OrderDetailListModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/orderresource';
                this.param = {};
                this.result = store.OrderDetailListStore.getInstance();
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        // 取消订单
        _ret.OrderCancelModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'booking/ordercancel';
                this.param = {};
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        // 首页产品推荐
        _ret.homeInfoModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = 'product/homeInfo';
                this.param = {'SalesCityID': 2 };
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        /********************************
         * @description:  获取匿名用户Auth
         */
        _ret.AnonymousUserModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.url = "/User/Nonmember/Login";
                this.param = {
                    "uuid": 0,
                    "ver": 0
                };
                this.protocol = 'https';
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        // C秒杀产品
        _ret.CsKillAdModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.baseurl = {
                    domain: 'gateway.m.fws.qa.nt.ctripcorp.com',
                    path: 'restapi/soa2/'
                };
                this.url = '10043/json/GetSecKillSetting';
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });

        // C秒杀产品
        _ret.CsKillModel = new cBase.Class(_base, {
            __propertys__: function () {
                this.baseurl = {
                    domain: 'gateway.m.fws.qa.nt.ctripcorp.com',
                    path: 'restapi/soa2/'
                };
                this.url = '10043/json/GetProducts';
                this.result = null;
            },
            initialize: function ($super, options) {
                $super(options);
            }
        });
        return _ret;
    });