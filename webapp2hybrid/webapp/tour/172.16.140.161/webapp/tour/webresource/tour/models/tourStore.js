define(["cStore", "cBase", "cUtility"], function(cs, cb, cu) {
    var _ret = {};
    var cache = window.TOURCACHE || (window.TOURCACHE = {});
    var _base = new cb.Class(cs, {
        __propertys__: function() {},
        initialize: function($super, options) {
            $super(options);
        },
    });
    _ret.CustomStore = function(key, lifeTime) { //自定义
        return new cb.Class(_base, {
            __propertys__: function() {
                this.key = key;
                this.lifeTime = lifeTime;
            },
            initialize: function($super, options) {
                $super(options)
            }
        })
    };
    //产品详情签证
    _ret.DetailVisaStore = _ret.CustomStore("VACATIONS-DETAIL-VISA", "1d");
    //产品详情预定须知
    _ret.DetailBookNoteStore = _ret.CustomStore("VACATIONS-DETAIL-BOOKING-NOTE", "1d");
    //产品详情图片
    _ret.DetailPicStore = _ret.CustomStore("VACATIONS-DETAIL-PIC", "1d");
    // 订单详情明细
    _ret.OrderDetailListStore = _ret.CustomStore("VACATIONS-ORDER-DETAIL-LIST", "1d");

    _ret.ProdListParamStore = _ret.CustomStore("VACATIONS_PRODUCT_LIST_PARAM", "1d");
    _ret.CityHistoryStore = _ret.CustomStore("VACATIONS_CITY_HISTORY", "365d");
    _ret.GeoLocationStore = _ret.CustomStore("VACATIONS_GEOLOCATION", "1d");

    // 预定第二步
    _ret.BookStep2Store = _ret.CustomStore("TOUR-BOOK-STEP2", "1000d");
    // 预定第二步GUID
    _ret.BookStep2GUIDStore = _ret.CustomStore("TOUR-BOOK-STEP2-GUID", "1000d");
    // 预定第二步保险
    _ret.BookStep2BaoxianStore = _ret.CustomStore("TOUR-BOOK-STEP2-BAOXIAN", "1000d");
    // 预定第二步choosedResource
    _ret.BookStep2ChoosedResourceStore = _ret.CustomStore("TOUR-BOOK-STEP2-CHOOSEDRESOURCE", "1000d");
    // 预定第二步酒店
    _ret.BookStep2HotelStore = _ret.CustomStore("TOUR-BOOK-STEP2-HOTEL", "1000d");
    // 预定第二步单选项
    _ret.BookStep2SingleStore = _ret.CustomStore("TOUR-BOOK-STEP2-SINGLE", "1000d");
    // 预定第二步可选项
    _ret.BookStep2OptionalStore = _ret.CustomStore("TOUR-BOOK-STEP2-OPTIONAL", "1000d");
    // 预定第三步订单的数据
    _ret.BookStep3OrderData = _ret.CustomStore("TOUR-BOOK-STEP3-ORDER-DATA", "1000d");

    //常用旅客
    _ret.PassengersStore = new cb.Class(_base, {
        __propertys__: function() {
            this.key = "TOUR-COMMON-PASSENGERS";
            this.lifeTime = "1D";
        },
        initialize: function($super, options) {
            $super(options)
        }
    });
    //常用地址
    _ret.AddressStore = new cb.Class(_base, {
        __propertys__: function() {
            this.key = "S-TOUR-ADDRESS";
            this.lifeTime = "1D";
        },
        initialize: function($super, options) {
            $super(options)
        }
    });
    //order表单数据store
    _ret.OrderDataSaveStore = new cb.Class(_base, {
        __propertys__: function() {
            this.key = "TOUR-DATA-STORE";
            this.lifeTime = "1D";
        },
        initialize: function($super, options) {
            $super(options)
        }
    });
    //order传递参数store
    _ret.OrderParamStore = new cb.Class(_base, {
        __propertys__: function() {
            this.key = "TOUR-ORDER-PARAM";
            this.lifeTime = "1D";
        },
        initialize: function($super, options) {
            $super(options)
        }
    });
    //order store
    _ret.OrderStore = new cb.Class(_base, {
        __propertys__: function () {
            this.key = "TOUR-ORDER-FORM";
            this.lifeTime = "30M";
        },
        initialize: function ($super, options) {
            $super(options)
        }
    });
    //order store
    _ret.TempPassengerStore = new cb.Class(_base, {
        __propertys__: function () {
            this.key = "TOUR-ORDER-TMPPSG";
            this.lifeTime = "1D";
        },
        initialize: function ($super, options) {
            $super(options)
        }
    });
    //order create
    _ret.OrderCreateStore = new cb.Class(_base, {
        __propertys__: function () {
            this.key = "TOUR-ORDER-CREATE";
            this.lifeTime = "30M";
        },
        initialize: function ($super, options) {
            $super(options)
        }
    });
    // 预定 step2 -- 资源查询
    _ret.BookingResourceSearch = new cb.Class(_base, {
        __propertys__: function () {
            this.key = 'TOUR-RESOURCE-SEARCH';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //记录用户填写的数据，以备以后填写默认带入
    _ret.OrderDefaultStore = new cb.Class(_base, {
        __propertys__: function () {
            this.key = 'TOUR-ORDER-DEFAULT';
            this.lifeTime = '30D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
   //订单修改的数据缓存
    _ret.OrderModificationStore = new cb.Class(_base, {
        __propertys__: function () {
            this.key = 'TOUR-ORDER-Modification';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //用户发票明显
       _ret.OrderInvoiceStore = new cb.Class(_base, {
        __propertys__: function () {
            this.key = 'TOUR-ORDER-Invoice';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    return _ret;
});
