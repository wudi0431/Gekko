//1.1 & 5.9
/**********************************
 * @author:   cmli@Ctrip.com
 * @description:  组件Geolocation
 *
 * 从cUtility中分离出来的定位组件
 */
define(['cBase', 'cUtility', 'cWidgetFactory', 'cStore', 'cHybridFacade', 'cGeoHelper', 'cLog', 'cModel'], function (cBase, Util, WidgetFactory, cStore, Facade, CtripGeoHelper, cLog, cModel) {
  "use strict";

  var WIDGET_NAME = 'Geolocation';

  var KEY = '0b895f63ca21c9e82eb158f46fe7f502';

  // 如果WidgetFactory已经注册了HeaderView，就无需重复注册
  if (WidgetFactory.hasWidget(WIDGET_NAME)) {
    return;
  }

  var Geolocation = Geolocation || {};
  
  var cityModel = cBase.Class(cModel, {
    __propertys__: function() {
      this.url = '/soa2/10398/json/LBSLocateCity';
      this.param = {};
    }
  }).getInstance();
  cityModel.buildurl = function () {
    if (window.location.host == "m.uat.qa.nt.ctripcorp.com")
	  return "http://gateway.m.uat.qa.ctripcorp.com/restapi/soa2/10398/json/LBSLocateCity";
	return "http://m.ctrip.com/restapi/soa2/10398/json/LBSLocateCity";
  }
  //add by byl 记录当前设备所处位置，默认是在国内
  Geolocation.isInOverseas = false;
  /**
   * 获得设备经纬度
   * @param callback {Function} 获得经纬度的回调
   * @param error {Function} 发生错误时的回调
   *
   * update caofu 更新提示语 2013-09-06
   */
  Geolocation.requestGeographic = function (callback, error) {
    var sTime = new Date().getTime();

    //add by byl 异步添加js，内部重写document.write，仅为下载google api使用
    var loadScript = function (url, inCallback, isWrite) {
      var script = document.createElement("script"),
      dw = document.write;
      script.type = "text/javascript";
      if (script.readyState) {
        script.onreadystatechange = function () {
          if (script.readyState == "loaded" ||
            script.readyState == "complete") {
            script.onreadystatechange = null;
            document.write = dw;
            if (isWrite) {
              inCallback && inCallback();
            }
          }
        };
      } else {
        script.onload = function () {
          document.write = dw;
          if (isWrite) {
            inCallback && inCallback();
          }
        };
          script.onerror = function(){
              //下载失败，需要还原document.write
              document.write = dw;
          }
      }
      script.src = url;
      document.write = function (ad) {
        var src = ad.match(/http(s)?:\/\/[A-Za-z0-9]+[\.\/=\?%\-&_~`@[\]\:+!]*([^<>])*(\.js)/);
        if (src) {
          loadScript(src[0], function () {
            document.write = dw;
          }, true);
        }
      }
      document.body.appendChild(script);
    }

    var successCallback = function (position) {
      cLog.geoRequest('Google service', sTime);
      if (callback) {
        callback(position);
      }
      //add by byl 在定位海外地址时，尝试下载google地图
      var lng = position.coords.longitude;
      var lat = position.coords.latitude;
      var isDomestic = CtripGeoHelper.getCountry(lng, lat);
      //add by byl  仅仅定位成功，并且在国外时，才为true,其余都是false
      if (isDomestic == 2) {
        Geolocation.isInOverseas = true;
          if(typeof google === 'undefined'){
              loadScript('https://maps.googleapis.com/maps/api/js?v=3&region=zh-CN');
          }
      } else {
        Geolocation.isInOverseas = false;
      }
    };

    var errorCallback = function (err) {
      cLog.geoRequest('Google service', sTime);
      var err_msg = '未能获取到您当前位置，请重试或选择城市'; // '获取经纬度失败!';
      switch (err.code) {
      case err.TIMEOUT:
        err_msg = "获取您当前位置超时，请重试或选择城市！";
        break;
      case err.PERMISSION_DENIED:
        err_msg = "您拒绝了使用位置共享服务，查询已取消，请开启位置共享或选择城市！";
        break;
      case err.POSITION_UNAVAILABLE:
        err_msg = "获取您当前位置信息失败，请重试或选择城市！";
        break;
      }

      if (error) {
        error(err, err_msg);
      }
    };
        //此处应该添加浏览器是否支持navigator的判断，并且enableHighAccuracy参数需要考虑，pc端不需要使用精确定位
      if(window.navigator && window.navigator.geolocation){
          window.navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
              enableHighAccuracy : true,
              maximumAge : 5000,
              timeout : 20000
          });
      }else{
          if (error) {
              error("", "获取您当前位置信息失败，浏览器不支持定位！");
          }
      }
  };

  /**
   * 高德api经纬度获得详细地址信息
   * @param lng {Number} 经度
   * @param lat {Number} 纬度
   * @param callback {Function} 完成时回调,回传参数为高德下发城市数据
   * @param error {Function} 超时回调
   * @param timeout {Number} 超时的时间长度，默认为8秒
   * @author ouxingzhi
   */
  Geolocation.requestAMapAddress = function (lng, lat, callback, error, timeout) {
    var sTime = new Date().getTime();
    var region = '121.473704,31.230393';
    var ret = 1; //默认的region地址是国内的，所以默认使用高德地图
    if (lng && lat) {
      region = lng + ',' + lat;
      //判断是否是国内的经纬度
      ret = CtripGeoHelper.getCountry(lng, lat);
    }

    timeout = timeout || 8000;

    var url = (ret == 1) ? ('http://restapi.amap.com/v3/geocode/regeo?' + $.param({
        'location' : region,
        'key' : KEY,
        'radius' : 0,
        'extensions' : 'all'
      })) : ('https://maps.googleapis.com/maps/api/geocode/json?' + $.param({
        latlng : lat + ',' + lng,
        sensor : false
      }));

    $.ajax({
      url : url,
      dataType : (ret == 1) ? 'jsonp' : 'json',
      success : function (data) {
        cLog.geoRequest(url, sTime);
        var info = translateGeoResult(data, ret);
        if (_.isObject(info)) {
          callback && callback(translateGeoResult(data, ret));
        } else {
          error && error(data)
        }
      },
      error : function (e) {
        cLog.geoRequest(url, sTime);
        error && error(e);
      },
      timeout : timeout
    });

    //modified by byl  增加国家名称的缩写，用于国家匹配
    function translateGeoResult(data, type) {
      if (type == 1) {
        var addrs = (data && data.regeocode) || '',
        citys = addrs.addressComponent.city,
        province = addrs.addressComponent.province,
        district = addrs.addressComponent.district,
        city = '';
        if (_.isString(citys)) {
          city = citys;
        } else if (_.isString(province)) {
          city = province;
        }
        return {
          'address' : _.isString(addrs.formatted_address) ? addrs.formatted_address : '',
          'location' : region,
          'info' : addrs && addrs.addressComponent,
          'city' : city,
          'province' : province,
          'district' : district,
          'lng' : lng,
          'lat' : lat,
          'country' : '中国', //国内的固定传中国
          'countryShortName' : 'CHN'
        };
      } else {
        if (data && data.status === 'OK') {
          var district = '',
          city = '',
          country = '',
          province = '',
          countryShortName = '';
          if (!data.results) {
            return false;
          }
          //从第一个详细地址中获取国家省市区信息
          var detailAdress = data.results[0] || {};
          _.find(detailAdress.address_components, function (item) {
            var politicalName = item && item.long_name;
            if (item.types) {
              //国家
              if (item.types[0] == 'country' && item.types[1] == 'political') {
                country = politicalName;
                countryShortName = item.short_name;
              }
              //省级、州级
              if (item.types[0] === 'administrative_area_level_1' && item.types[1] === 'political') {
                province = politicalName;
              }
              //城市
              if (item.types[0] === 'locality' && item.types[1] === 'political') {
                city = politicalName;
              }
              //县级
              if (item.types[0] === 'administrative_area_level_2' && item.types[1] === 'political') {
                district = politicalName;
              }
              //区（此级别和上面的县级只能取一个，暂定取sublocality）
              if (item.types[0] === 'sublocality_level_1' && item.types[1] === 'sublocality') {
                district = politicalName;
              }
            }
          });
          if (country == '' && province == '' && city == '' && district == '') {
            return false;
          }
          return {
            'address' : _.isString(data.results[0].formatted_address) ? data.results[0].formatted_address : '',
            'location' : region,
            'info' : data.results[0].address_components,
            'lng' : lng,
            'lat' : lat,
            'country' : country,
            'province' : province,
            'city' : city,
            'district' : district,
            'countryShortName' : countryShortName
          };
        } else {
          return false;
        }
      }
    }
  };

  /**
   * 高德api经纬度获得周边信息
   * @param lng {Number} 经度
   * @param lat {Number} 纬度
   * @param callback {Function} 完成时回调,回传参数为高德下发城市数据
   * @param error {Function} 超时回调
   * @param timeout {Number} 超时的时间长度，默认为8秒
   */
  Geolocation.requestAMapAround = function (lng, lat, callback, error, timeout) {
    var sTime = new Date().getTime();
    var region = '121.473704,31.230393';
    if (lng && lat) {
      region = lng + ',' + lat;
    }
    var param = $.param({
        'location' : region,
        'key' : KEY,
        'radius' : 500,
        'offset' : 4,
        'page' : 1
      });

    timeout = timeout || 8000;

    $.ajax({
      url : "http://restapi.amap.com/v3/place/around?" + param,
      dataType : 'jsonp',
      success : function (data) {
        cLog.geoRequest("http://restapi.amap.com/v3/place/around?" + param, sTime);
        var pois = (data && data.pois) || [];
        callback && callback(pois);
      },
      error : function (e) {
        cLog.geoRequest("http://restapi.amap.com/v3/place/around?" + param, sTime);
        error && error(e);
      },
      timeout : timeout
    });
  };

  /**
   * 高德api关键字查询
   * @param lng {Number} 经度
   * @param lat {Number} 纬度
   * @param callback {Function} 完成时回调,回传参数为高德下发城市数据
   * @param error {Function} 超时回调
   * @param timeout {Number} 超时的时间长度，默认为8秒
   */
  Geolocation.requestAMapKeyword = function (keywords, city, callback, error, timeout) {
    //var region = '121.473704,31.230393';
    //if (lng && lat) {
    //    //region = lng + ',' + lat;
    //}
    var sTime = new Date().getTime();
    var param = $.param({
        'keywords' : keywords,
        'city' : city,
        'key' : KEY,
        'offset' : 10,
        'page' : 1,
        'extensions' : 'all'
      });

    timeout = timeout || 8000;

    $.ajax({
      url : "http://restapi.amap.com/v3/place/text?" + param,
      dataType : 'jsonp',
      success : function (data) {
        cLog.geoRequest("http://restapi.amap.com/v3/place/text?" + param, sTime);
        var pois = (data && data.pois) || [];
        callback && callback(pois);
      },
      error : function (e) {
        cLog.geoRequest("http://restapi.amap.com/v3/place/text?" + param, sTime);
        error && error(e);
      },
      timeout : timeout
    });
  };

  /**
   * @description: 获取转换过的经纬度
   * @param lng {Number} 经度
   * @param lat {Number} 维度
   * @param callback {Function} 成功回调
   * @param error {Function} 错误回调
   * @author: ouxz
   */
  Geolocation.tansformLongitude = function (lng, lat, callback, error, timeout) {
    //add by byl  国外的地址 不需要进行详细定位
    var sTime = new Date().getTime();
    var isDomestic = CtripGeoHelper.getCountry(lng, lat);
    if (isDomestic != 1) {
      callback(lng, lat);
      return;
    }
    var param = $.param({
        locations : lng + ',' + lat,
        key : KEY,
        coordsys : 'gps'
      });

    timeout = timeout || 8000;

    $.ajax({
      url : "http://restapi.amap.com/v3/assistant/coordinate/convert?" + param,
      dataType : 'jsonp',
      success : function (data) {
        cLog.geoRequest("http://restapi.amap.com/v3/assistant/coordinate/convert?" + param, sTime);
        if (data && data.status === '1') {
          var l = data.locations.split(',');
          callback && callback(l[0], l[1]);
        } else {
          error && error();
        }
      },
      error : function (e) {
        cLog.geoRequest("http://restapi.amap.com/v3/assistant/coordinate/convert?" + param, sTime);
        error && error(e);
      },
      timeout : timeout
    });
  }

  /*******************************************
   * 获得城市信息
   * @param callback {Function} 成功时的回调
   * @param erro {Function} 失败时的回调
   * @param posCallback {Function} 获取经纬度成功的回调
   * @param posError {Function} 获取经纬度失败的回调
   * @param isAccurate {Boolean} 是否通过高精度查询 (如果使用高精度定位会发起两次请求，定位会需要更多时间，如只需定位城市，不需开启此开关，此开关在app中无效)
   */
  Geolocation.requestCityInfo = function (callback, error, posCallback, posError, isAccurate, cityCallBack, cityErrorCallBack) {
    var sTime = new Date().getTime();
    var _HybridLocate = function () {
      //-…2014-08-27……JIANGJing
      // var successCallback = function (info) {
      //   cLog.geoRequest("Native function", sTime);
      //   if (!info || !info.value) {
      //     errorCallback('网络不通，当前无法定位', 1);
      //     return;
      //   }
      //   if (info) {
      //     if (info.locateStatus) {
      //       if (info.locateStatus == -1) {
      //         errorCallback('网络不通，当前无法定位', 1);
      //         return;
      //       } else if (info.locateStatus == -2) {
      //         errorCallback('定位没有开启', 2);
      //         return;
      //       }
      //     }
      //     if (info.value && _.isObject(info.value)) {
      //       if (_.size(info.value) == 2) {
      //         posCallback && posCallback(info.value.lng, info.value.lat)
      //       } else {
      //         callback && callback({
      //           lng : info.value.lng,
      //           lat : info.value.lat,
      //           city : info.value.ctyName || info.value.province,
      //           address : info.value.addrs
      //         });
      //       }
      //     }
      //   }
      // };

      //+…2014-09-03……JIANGJing
      // 简单判断 Native 返回的定位信息的合法性
      var matchLocateInfo = function (info) {
        return (info.type == 'geo' || info.type == 'address' || info.type == 'CtripCity');
      };

      //+…2014-09-03……JIANGJing
      // 根据是否使用缓存数据的情形，Native 提供的 API 会回调一次（使用缓存）或两次（不使用缓存，第一次返回经纬度，第二次返回完整信息）。
      var firstCalled = true;

      //+…2014-09-03……JIANGJing
      var successCallback = function (info, error_code) {
        var ERR_INFOs = {
          1 : '网络不通，当前无法定位',
          2 : '定位没有开启'
        };
        // 定义当获取的定位信息不合规时的错误代码
        var DEFAULT_ERR_NUM = 1,
        errNum = 0;
        if (!matchLocateInfo(info)) {
          errNum = DEFAULT_ERR_NUM;
        } else if (info.locateStatus > 0) {
          errNum = window.Math.abs(info.locateStatus);
        }

        if (errNum) {
            //~1…2014-09-11……JIANGJing……响应异常时附带错误编码
          cLog.geoRequest('Native function error 10' + errNum, sTime);
          if (typeof errorCallback == 'function') {
            errorCallback(info, error_code);
          }
        } else {
          var v = info.value,
          detailed = (typeof v.addrs != 'undefined');
          if (detailed) {
            cLog.geoRequest('Native function detail', sTime);
          }

          if (firstCalled) {
            cLog.geoRequest('Native function number', sTime);
          }
          
          if ('CityEntities' in v) {
            cLog.geoRequest('Native function cityInfo', sTime);
            if (_.isFunction(cityCallBack)) {
              cityCallBack(v);
            }
          }
          
          if (firstCalled && typeof posCallback == 'function') {
            posCallback(v.lng, v.lat);
          }

          if (detailed && typeof callback == 'function') {
            callback({
              lng : v.lng,
              lat : v.lat,
              city : v.city || v.ctyName || v.province,
              province : v.province,
              district : v.district,
              //+2……2014-09-04……JIANGJing
              country : v.country,
              countryShortName : v.countryShortName,
              address : v.addrs
            });
          }
        }
        firstCalled = false;
      };

      var errorCallback = function (err, error_code) {
        //~……2014-10-10……JIANGJing……补充错误代码 10
        //CtripUtil.app_log('-------------------------\n errorCallback' + error_code);
        cLog.geoRequest("Native function error 10", sTime);
        var errCode = (err && err.error_code) || error_code;
        if (errCode)
        {
          if (errCode.indexOf('201') > -1)
            posError(errCode);
          else if (errCode.indexOf('202') > -1)
            posError(errCode);
          else if (errCode.indexOf('203') > -1)
            posError(errCode);
          else if (errCode.indexOf('204') > -1)
            error(errCode);
          else if (errCode.indexOf('205') > -1)
            cityErrorCallBack && cityErrorCallBack(errCode);
        } else {
          console.log("(-201)定位未开启");
          posError("(-201)定位未开启");
        }
      };

      Facade.request({
        name : Facade.METHOD_LOCATE,
        success : successCallback,
        error : errorCallback
      });
    };

    var _WebLocate = function () {
      var successCallback = function (pos) {
        //-1……2014-09-04……JIANGJing
        // cLog.geoRequest("Web function", sTime);

        //+1……2014-09-04……JIANGJing
        cLog.geoRequest("Web function number", sTime);

        var lng = pos.coords.longitude;
        var lat = pos.coords.latitude;
        posCallback && posCallback(lng, lat);
        var locateSuccessCallback = function (data) {
          //+1……2014-09-04……JIANGJing
          cLog.geoRequest("Web function detail", sTime);
          if (callback) {
            callback(data);
          }
          if (_.isFunction(cityCallBack))
          {          
            cityModel.setParam({Longitude: lng, Latitude: lat, CountryName: data.country, ProvinceName: data.province, L1CityName: data.city, L2CityName: data.district, TownName: '', Language: 'CN'});
            cityModel.excute(function(data){
              cLog.geoRequest("Web function cityInfo", sTime);
              cityCallBack(data);
            }, function(err){
              cLog.geoRequest('Web function error 23');
              if (cityErrorCallBack) {
                cityErrorCallBack();
              }
            });
          }
        };

        var locateErrorCallback = function (err, msg) {
          //~……2014-09-11……JIANGJing……重新定义错误响应
          //+1……2014-09-04……JIANGJing
          cLog.geoRequest("Web function error 21", sTime);
          if (error) {
            error();
          }
        };
        if (!isAccurate) {
          Geolocation.requestAMapAddress(lng, lat, locateSuccessCallback, locateErrorCallback);
        } else {
          Geolocation.tansformLongitude(lng, lat, function (lng, lat) {
            Geolocation.requestAMapAddress(lng, lat, locateSuccessCallback, locateErrorCallback);            
          }, function (err) {
            //-1……2014-09-11……JIANGJing……区分错误
            //locateErrorCallback(err);
            //+1……2014-09-11……JIANGJing……重新定义错误响应
            cLog.geoRequest('Web function error 22'); if (error) { error(); }
          });
        } 
      };

      var errorCallback = function (err, msg) {
        //-1……2014-09-04……JIANGJing
        // cLog.geoRequest("Web function", sTime);

        //~1……2014-09-11……JIANGJing……添加错误代码
        //+1……2014-09-04……JIANGJing
        cLog.geoRequest("Web function error 20", sTime);

        if (typeof posError === 'function') {
          posError(msg, err);
          return;
        }
        if (error) {
          error(msg);
        }
      };

      Geolocation.requestGeographic(successCallback, errorCallback);
    };

    var Locate = Util.isInApp() ? _HybridLocate : _WebLocate;
    Locate();
  };

  /**
   * 获得周边信息
   * @param callback {Function} 成功时的回调
   * @param erro {Function} 失败时的回调
   */
  Geolocation.requestAroundInfo = function (pos, callback, error) {
    var lng = pos.split(',')[0];
    var lat = pos.split(',')[1];

    var locateSuccessCallback = function (data) {
      if (callback) {
        callback(data);
      }
    };

    var locateErrorCallback = function () {
      if (error) {
        error();
      }
    };

    Geolocation.requestAMapAround(lng, lat, locateSuccessCallback, locateErrorCallback);
  };

  /**
   * 获得关键字查询信息
   * @param callback {Function} 成功时的回调
   * @param erro {Function} 失败时的回调
   */
  Geolocation.requestKeywordInfo = function (keywords, city, callback, error) {
    var locateSuccessCallback = function (data) {
      if (callback) {
        callback(data);
      }
    };

    var locateErrorCallback = function () {
      if (error) {
        error();
      }
    };

    Geolocation.requestAMapKeyword(keywords, city, locateSuccessCallback, locateErrorCallback);
  };

  /*******************************************
   * 保存定位城市的城市名
   * @author ouxz@ctrip.com
   */
  var PositionStore = Geolocation.PositionStore = cBase.Class(cStore, {
      __propertys__ : function () {
        this.key = 'POSITION_CITY';
        this.lifeTime = '10M';
      },
      initialize : function ($super, options) {
        $super(options);
      }
    });
  /**
   * 获取经过缓存的城市信息
   * @param callback 完成时的回调
   * @param error  报错时的回调
   * @param scope  回调函数执行的上下文环境
   * @author ouxz@ctrip.com
   */
  Geolocation.requestCacheCityInfo = function (callback, error, scope) {
    var posStore = PositionStore.getInstance(),
    posinfo = posStore.get();
    if (posinfo) {
      callback && callback.call(scope, posinfo);
    } else {
      Geolocation.requestCityInfo(function (posinfo) {
	    if(!Util.isInApp()){
		   posStore.set(posinfo);
	    }
        callback && callback.call(scope, posinfo);
      }, function (msg, e) {
        error && error.call(scope, msg, e);
      });
    }
  };

  /**
   * @author cmli@ctrip.com
   * @description 加入地图功能
   * @param options.lat 定位点的维度
   * @param options.lng 定位点的精度
   * @param options.id  地图容器的id，某个标签的id名称
   * @param options.content 定位点信息
   * @param options.level 地图显示等级[optional]
   * @param options.forceAmap 强制使用高德[optional]
   * @instance
   *  需要引入的代码
   * <script language="javascript" src="http://webapi.amap.com/maps?v=1.2&key=0b895f63ca21c9e82eb158f46fe7f502"></script>
   * <script src="https://maps.googleapis.com/maps/api/js?v=3"></script>*
   */
  Geolocation.requestMap = function (options) {
    //自定义Google view
    function NameOverlay(point, name, map, div) {

      // 初始化参数：坐标、文字、地图
      this.point_ = point;
      this.name_ = name;
      this.map_ = map;

      // 到onAdd时才需要创建div
      this.div_ = div;
      // 加入map
      this.setMap && this.setMap(map);
    }
    //此处WebMap 和 WebMapOverseas 需要合并，都包含了多个marker节点以及marker节点的点击回调事件
    var WebMap = function (config) {
      if (!config || !config.lat || !config.lng || !config.id) {
        config.error && config.error();
        return false;
      }
      var marekrViews = {
        marekrs : [],
        overlays : []
      },
      markers,
      isOverseasAndGoogle = false,
      google = window.google;
      var isDomestic = CtripGeoHelper.getCountry(config.lng, config.lat);
      // @description 在web环境中，如果缺少AMap对象和定位点信息，直接返回false，标记错误，无法加载地图,在谷歌地图api加载不完全的情况，需要处理
      //14/09/04 添加是否在海外的判断，如果在海外，也需要判断google是否存在
      if ((isDomestic != 1 || Geolocation.isInOverseas) && google && google.maps && google.maps.LatLng) {
        isOverseasAndGoogle = true;
        if (google.maps.OverlayView) {
          //在此处自定义一个Google View 用于展示和高德地图一样的view
          NameOverlay.prototype = new google.maps.OverlayView();
          // NameOverlay定义
          NameOverlay.prototype.onAdd = function () {
            var panes = this.getPanes();
            panes.overlayImage.appendChild(this.div_);
          }

          NameOverlay.prototype.draw = function () {
            // 利用projection获得当前视图的坐标
            var overlayProjection = this.getProjection();
            var center = overlayProjection.fromLatLngToDivPixel(this.point_);
            // 为简单，长宽是固定的，实际应该根据文字改变
            var div = this.div_;
            if (div) {
              div.style.left = center.x + 20 + 'px';
              div.style.top = center.y - 50 + 'px';
              div.style.position = 'absolute';
              var children = div.children[0];
              if (children) {
                children.style.bottom = '0px';
                children.style.left = '0px';
              }
            } else {
              return;
            }
          }
          NameOverlay.prototype.onRemove = function () {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
          }

        }
      } else {
        if (!AMap) {
          config.error && config.error();
          return false;
        }
      }
      var DEFAULT_LEVEL = 13;
      // @description 初始化地图信息
      var mapContainer;

      if (isOverseasAndGoogle) {
        mapContainer = new google.maps.Map(document.getElementById(config.id), {
            // @description 地图中心点
            center : new google.maps.LatLng(config.lat, config.lng),
            zoom : config.level || DEFAULT_LEVEL, // @description 地图显示的比例尺级别
            zoomControl : true
          });
      } else {
        mapContainer = new AMap.Map(config.id, {
            // @description 地图中心点
            center : new AMap.LngLat(config.lng, config.lat),
            level : config.level || DEFAULT_LEVEL // @description 地图显示的比例尺级别
          });
        //增加Google的支持
        var googleGD = null;
        var addGoogle = function (mapObj) {
          googleGD = new AMap.TileLayer({
              tileUrl : "http://mt{1,2,3,0}.google.cn/vt/lyrs=m@142&hl=zh-CN&gl=cn&x=[x]&y=[y]&z=[z]&s=Galil" //图块取图地址
            });
          googleGD.setMap(mapObj);
        }
          //使用高德地图，如果定位的地址是国外，或者目前设备在国外，均要添加google地图支持
          if (isDomestic != 1|| Geolocation.isInOverseas) {
              addGoogle(mapContainer);
          }
      }

      //绑定zoom事件
      if (config.zoomCallBack) {
        (!isOverseasAndGoogle) ? AMap.event.addListener(mapContainer, 'zoomchange', function () {
          var newMarkers = config.zoomCallBack && config.zoomCallBack(this.getZoom());
          if (newMarkers) {
            this.clearMap();
            createMarker(newMarkers, this, isOverseasAndGoogle);
          }
        }) : google.maps.event.addListener(mapContainer, 'zoom_changed', function () {
          var newMarkers = config.zoomCallBack && config.zoomCallBack(this.getZoom());
          if (newMarkers) {
            //删除原有的markers
            if (marekrViews.marekrs && marekrViews.marekrs.length > 0) {
              for (var i = 0; i < marekrViews.marekrs.length; i++) {
                marekrViews.overlays[i].setMap && marekrViews.overlays[i].setMap(null);
                marekrViews.marekrs[i].setMap && marekrViews.marekrs[i].setMap(null);
              }
              marekrViews = {
                marekrs : [],
                overlays : []
              };
            }
            createMarker(newMarkers, this, isOverseasAndGoogle);
          }
        });
      }
      if ((config.markers instanceof Array) && config.markers.length > 0) {
        markers = config.markers;
      } else {
        markers = config;
      }
      // @description 地图中心点
      createMarker(markers, mapContainer, isOverseasAndGoogle);
        return mapContainer;
      //创建标记点
      function createMarker(params, mapObj, isDomestic) {
        if ((params instanceof Array) && params.length > 0) {
          for (var i = 0; i < params.length; i++) {
            var tempConfig = params[i];
            if (!tempConfig || !tempConfig.lat || !tempConfig.lng) {
              break;
            }
            createSingleMarekr(tempConfig, mapObj, isDomestic);
          }
        } else {
          createSingleMarekr(params, mapObj, isDomestic);
        }
        function createSingleMarekr(params, mapObj, isDomestic) {
          var markerContent = $('<DIV/>').addClass('map-content');
          if (!isDomestic) {
            $('<IMG/>').attr({
              src : 'http://res.m.ctrip.com/html5/Content/images/map_address.png'
            }).appendTo(markerContent);
          }
          if (params.content) {
            $('<SPAN/>').html(params.content).appendTo(markerContent);
          }
          var marker;
          // @description 生成标记点，并且设置position
          if (!isDomestic) {
            marker = new AMap.Marker({
                position : new AMap.LngLat(params.lng, params.lat),
                map : mapObj,
                id : params.markerId
              });
            //如果id存在设置为中心点
            if (params.id && params.id != "") {
              mapObj.setCenter(new AMap.LngLat(params.lng, params.lat));
            }
            marker.setContent(markerContent[0]);
            if (params.callBack) {
                AMap.event.addListener(marker,'click',function(){
                    params.callBack(params.markerId);
                });
//              mapObj.bind(marker, 'click',
//                function () {
//                params.callBack(params.markerId);
//              });
            }
          } else {
            marker = new google.maps.Marker({
                position : new google.maps.LatLng(params.lat, params.lng),
                map : mapObj,
                icon : "http://res.m.ctrip.com/html5/Content/images/map_address.png",
                id : params.markerId
              });
            //如果id存在设置为中心点
            if (params.id && params.id != "") {
              mapObj.setCenter(new google.maps.LatLng(params.lat, params.lng));
            }
            //此处 地图标记点说明用infowindow显示
            var name1View = new NameOverlay(new google.maps.LatLng(params.lat, params.lng), params.content, mapObj, markerContent[0]);
            marekrViews.marekrs.push(marker);
            marekrViews.overlays.push(name1View);
            if (params.callBack) {
              //google marker的点击事件
              google.maps.event.addListener(marker, 'click',
                function () {
                params.callBack(params.markerId);
              });
            }
          }
        };
      }
    }

    //add by byl 09/04 增加hybird的支持
    var HybridMap = function (config) {
      // @description 留下在Hybrid中调用的接口
      if (!options) {
        throw new Error('function show_map error is "param is null"');
      }
      //判断参数，有poiList和无poiList区分
      if (config && config.poiList) {
        Facade.request({
          name : Facade.METHOD_APP_SHOW_MAP_WITH_POI_LIST,
          poiList : config.poiList
        });
      } else {
        config.name = Facade.METHOD_SHOW_MAP;
        Facade.request(config);
      }
    }

    // @description 通过Util判断当前环境是App还是Hybrid
    var Map = (options.forceAmap || Util.isInApp()) ? HybridMap : WebMap;

    // @description 调用Map显示地图
    return Map(options);
  };

  /**
   * @description 写内容到文件
   * @param {double} options.latitude, 纬度2567.
   * @param {double} options.longitude, 经度2568.
   * @param {String} options.title, 在地图上显示的点的主标题2569.
   * @param {String} options.subtitle, 在地图上显示点的附标题
   */
  Geolocation.show_map = function (options) {
    if (!options) {
      throw new Error('function show_map error is "param is null"');
    }
    options.name = Facade.METHOD_SHOW_MAP;
    Facade.request(options);
  };

  /**
   * @description 在地图上显示多个POI位置点
   */
  Geolocation.app_show_map_with_POI_list = function (options) {
    Facade.request({
      name : Facade.METHOD_APP_SHOW_MAP_WITH_POI_LIST,
      poiList : options.poiList
    });
  }

  WidgetFactory.register({
    name : WIDGET_NAME,
    fn : Geolocation
  });
});
