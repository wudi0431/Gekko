/**
 * @author zsb张淑滨 <oxz@ctrip.com|shbzhang@ctrip.com>
 * @description 存放H5使用的一些通用Store,如用户信息Store,HeadStore,分销联盟Store,渠道参数Store,渠道信息Store
 */
define(['cBase', 'cStore', 'cStorage', 'cUtility'], function (cBase, cLocalStore, cLocalStorage, cUtility) {
  var Common = {};
  var ls =  cLocalStorage.localStorage;
  /**
   * @class UserStore
   * @type {cBase.Class}
   * @description 同时操作USER和USERINFO, 其中USERINFO是兼容老的数据格式,可以去掉.
   */
  Common.UserStore = new cBase.Class(cLocalStore, {
    __propertys__: function () {
      this.key = 'USER';
      this.lifeTime = '30D';
    },
    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层Class的initialize，赋值队列
     */
    initialize:    function ($super, options) {
      $super(options);
    },

    /**
     * @method getUser
     * @returns {Object} 用户信息
     * @description 返回用户信息
     */
    getUser: function () {
      var userinfo = ls.oldGet('USERINFO');
      userinfo = userinfo && userinfo.data || null
      if (userinfo) {
        this.set(userinfo)
      }
      return userinfo || this.get();
      /*var userinfo = cLocalStorage.localStorage.oldGet('USERINFO');
      userinfo = userinfo && userinfo.data || null;

      this.set(userinfo);
      return userinfo;*/
    },

    /**
     * @method setUser
     * @param {Object} UserInfo用户信息
     * @description 保存用户信息
     */
    setUser: function (data) {
      this.set(data);
      var timeout = ls.getExpireTime('USERINFO');
      var userinfo = { data: data, timeout: timeout };
      ls.oldSet('USERINFO', JSON.stringify(userinfo));
    },

    /**
     * @method removeUser
     * @description 移除用户信息
     */
    removeUser:    function () {
      //cLocalStorage.localStorage.oldRemove('USERINFO');
     // this.set(null);
      ls.oldRemove('USERINFO');
      this.remove();
    },

    /**
     * @method isNonUser
     * @returns {Object|boolean} 返回当前用户是否是未注册用户
     * @description 返回当前用户是否是未注册用户
     */
    isNonUser:     function () {
      var user = this.getUser();
      return user && !!user.IsNonUser;
    },

    /**
     * @method isLogin
     * @returns {Object|boolean} 当前用户是否登陆
     * @description 判断当前用户是否登陆
     */
    isLogin:       function () {
      var user = this.getUser();
      return user && !!user.Auth && !user.IsNonUser;
    },

    /**
     * @method getUserName
     * @returns {String} 用户名
     * @description 返回当前登陆用户的用户名
   */
    getUserName:   function () {
      var user = this.getUser();
      return user.UserName;
    },

    /**
     * @method getUserId
     * @returns {*|string}
     * @description 返回当前登陆用户的ID
     */
    getUserId:     function () {
      var user = this.getUser() || {};
      return user.UserID || cUtility.getGuid();
    },

    /**
     * @method getAuth
     * @returns {*|string}
     * @description 返回当前登陆用户的Auth值
     */
    getAuth:       function () {
      var HeadStore = Common.HeadStore.getInstance(),
        userinfo = this.getUser();
      if (userinfo && userinfo.Auth) HeadStore.setAttr('auth', userinfo.Auth);
      return HeadStore.getAttr('auth');
    },

    /**
     * @method setAuth
     * @param {String} auth 用户auth字段
     * @description 返回当前登陆用户的Auth值
     */
    setAuth:       function (auth) {
      var isLogin = this.isLogin(),
        userinfo = this.getUser() || {};
      userinfo.Auth = auth;
      userinfo.IsNonUser = isLogin ? false : true;
      this.setUser(userinfo);
    },

    /**
     * @method setNonUser
     * @param {String} auth 用户auth
     * @description 设置当前用户为非注册用户
     */
    setNonUser:    function (auth) {
      var HeadStore = Common.HeadStore.getInstance();
      HeadStore.setAttr('auth', auth);
      var data =  {};
      data.Auth = auth;
      data.IsNonUser = true;
      this.setUser(data);
    },

    /**
     * 设置过期时间，同时会操作USERINFO
     * @param $super
     * @param timeout
     */
    setExpireTime: function($super,timeout){
      $super(timeout);
      var data = this.get();
      var userinfo = { data: data, timeout: timeout };
      ls.oldSet('USERINFO', JSON.stringify(userinfo));
    }
  });

  /**
   * @class HeadStore
   * @type {cBase.Class}
   * @description Restful 服务的HeadStore
   */
  Common.HeadStore = new cBase.Class(cLocalStore, {
    userStore:     Common.UserStore.getInstance(),
    __propertys__: function () {
      this.key = 'HEADSTORE';
      this.lifeTime = '15D';
      this.defaultData = {
        "cid":     cUtility.getGuid(),
        "ctok":    "351858059049938",
        "cver":    "1.0",
        "lang":    "01",
        "sid":     "8888",
        "syscode": '09',
        "auth":    ""
      };
      var get = this.get;

      /**
       * @method get
       * @returns {*}
       * @description 重写get方法,获得userinfo中auth
       */
      this.get = function () {
        var head = get.apply(this, arguments),
          userinfo = this.userStore.getUser();
        //来源渠道
        var sales = Common.SalesObjectStore.getInstance().get();
        //fix app 环境 sid 一直为8888的bug shzhang 2014.4.22
        if(!cUtility.isInApp()){
          if (sales && sales.sid) {
            head.sid = sales.sid;
          } else {
            head.sid = '8888';
          }
        }
        if (userinfo && userinfo.Auth) {
          head.auth = userinfo.Auth;
        } else {
          head.auth = '';
        }
        this.set(head);
        return head;
      }
    },
    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层Class的initialize，赋值队列
     */
    initialize:    function ($super, options) {
      $super(options);
    },

    /**
     * @method setAuth
     * @param auth 用户auth
     * @description 设置head中的auth字段
     */
    setAuth: function (auth) {
      var userInfo = Common.UserStore.getInstance();
      userInfo.setAuth(auth);
      this.setAttr('auth', auth);
    }
  });

  //分销联盟Store
  Common.UnionStore = new cBase.Class(cLocalStore, {
    __propertys__: function () {
      this.key = 'UNION';
      this.lifeTime = '7D';
      this.store = cLocalStorage.localStorage;
    },
    /**
     * @method initialize
     * @param {Object} obj
     * @description 复写自顶层Class的initialize，赋值队列
     */
    initialize:    function ($super, options) {
      $super(options);
    },

    /**
     * @method get
     * @returns {*|data|s.data|_attributes.scroll.data|param.data|obj.data}
     * @description 返回分销联盟数据
     */
    get: function () {
      var data = this.store.oldGet(this.key);
      return data && data.data || null;
    },

    /**
     * @method set
     * @param {Object} data 数据值
     * @param {CDate} [optional] timeout 超时时间
     * @description 设置超时时间
     */
    set:  function (data, timeout) {
      //fix 分销联盟时间超时时间保持不准确的bug shbzhang 2014/1/7
      if (!timeout) {
        timeout = new cBase.Date(cUtility.getServerDate())
        timeout.addSeconds(this._getLifeTime());
      }
      //timeout = timeout ? new cBase.Date(timeout) : new cBase.Date(cUtility.getServerDate()).addDay(7);
      var json = {
        data:    data,
        timeout: timeout.format('Y/m/d H:i:s')
      };

      this.store.oldSet(this.key, JSON.stringify(json));
    }
  });

  /**
   * @class SalesStore
   * @description 保存渠道参数Store
   */
  Common.SalesStore = new cBase.Class(cLocalStore, {
    __propertys__: function () {
      this.key = 'SALES';
      this.lifeTime = '30D';
      this.store = cLocalStorage.localStorage;
    },
    initialize:    function ($super, options) {
      $super(options);
    },

    /**
     * @method get
     * @returns {Object|*|data|s.data|_attributes.scroll.data|param.data}
     * @description 返回Store中保存的数据
     */
    get: function () {
      var data = this.store.oldGet(this.key);
      return data && data.data || null;
    },

    /**
     * @method set
     * @param {Object} data 数据对象
     * @param timeout [optional] timeout 超时时间
     * @description 设置超时时间
     */
    set: function (data, timeout) {
      //fix 分销联盟时间超时时间保持不准确的bug shbzhang 2014/1/7
      if (!timeout) {
        timeout = new cBase.Date(cUtility.getServerDate())
        timeout.addSeconds(this._getLifeTime());
      }
      // timeout = timeout ? new cBase.Date(timeout) : new cBase.Date(cUtility.getServerDate()).addDay(3);
      var json = {
        data:    data,
        timeout: timeout.format('Y/m/d H:i:s')
      };
      this.store.oldSet(this.key, JSON.stringify(json));
    }
  });

  /**
   * @class SalesObjectStore
   * @description   渠道信息Store
   */
  Common.SalesObjectStore = new cBase.Class(cLocalStore, {
    __propertys__: function () {
      this.key = 'SALES_OBJECT';
      this.lifeTime = '30D';
    },
    initialize:    function ($super, options) {
      $super(options);
    }
  });
  Common.UnionStore.getInstance = Common.SalesStore.getInstance = cBase.getInstance;
  return Common;
});