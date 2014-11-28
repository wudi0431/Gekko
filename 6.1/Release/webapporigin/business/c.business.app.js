define(['libs', 'cBase', 'AbstractAPP', 'cStorage', 'cWidgetFactory', 'cWidgetGuider'], function (libs, cBase, AbstractAPP, cStorage, WidgetFactory) {

  //l_wang flip手势工具
  (function () {

    //偏移步长
    var step = 20;

    var touch = {};
    var down = 'touchstart';
    var move = 'touchmove';
    var up = 'touchend';
    if (!('ontouchstart' in window)) {
      down = 'mousedown';
      move = 'mousemove';
      up = 'mouseup';
    }

    //简单借鉴ccd思维做简要处理
    function swipeDirection(x1, x2, y1, y2, sensibility) {

      //x移动的步长
      var _x = Math.abs(x1 - x2);
      //y移动步长
      var _y = Math.abs(y1 - y2);
      var dir = _x >= _y ? (x1 - x2 > 0 ? 'left' : 'right') : (y1 - y2 > 0 ? 'up' : 'down');

      //设置灵敏度限制
      if (sensibility) {
        if (dir == 'left' || dir == 'right') {
          if ((_y / _x) > sensibility) dir = '';
        } else if (dir == 'up' || dir == 'down') {
          if ((_x / _y) > sensibility) dir = '';
        }
      }
      return dir;
    }

    //sensibility设置灵敏度，值为0-1
    function flip(el, dir, fn, noDefault, sensibility, stepSet) {
      if (!el || !el[0]) return;
      var _dir = '', _step = stepSet || step;

      /*
      这里原来的逻辑是绑定几次flip便会执行几次，这里做一次优化
      */
      el[0]['__flip_' + dir] = fn;
      if (el[0].__hasFlipEvent) {
        return;
      }
      el[0].__hasFlipEvent = true;

      //var _step = sensibility || step;
      el.on(down, function (e) {
        var pos = (e.touches && e.touches[0]) || e;
        touch.x1 = pos.pageX;
        touch.y1 = pos.pageY;

      }).on(move, function (e) {

        var pos = (e.touches && e.touches[0]) || e;
        touch.x2 = pos.pageX;
        touch.y2 = pos.pageY;

        //如果view过长滑不动是有问题的
        //if (!noDefault) { e.preventDefault(); }
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > _step) ||
          (touch.y2 && Math.abs(touch.y1 - touch.y2) > _step)) {
          _dir = swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2, sensibility);
        }
        var preventDefultFlag = typeof noDefault == 'function' ? noDefault(_dir) : noDefault;
        if (!preventDefultFlag) {
          e.preventDefault();
        }
      }).on(up, function (e) {
        var pos = (e.changedTouches && e.changedTouches[0]) || e;
        touch.x2 = pos.pageX;
        touch.y2 = pos.pageY;

        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > _step) ||
        (touch.y2 && Math.abs(touch.y1 - touch.y2) > _step)) {
          var _dir = swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2, sensibility);

          if (_.isFunction(el[0]['__flip_' + _dir])) {
            el[0]['__flip_' + _dir]();
          }

        } else {

          if (_.isFunction(el[0]['__flip_tap'])) {
            el[0]['__flip_tap']();
          }
        }
        //l_wang 每次up后皆重置
        touch = {};
      });
    }

    function flipDestroy(el) {
      if (!el || !el[0]) return;

      el.off(down).off(move).off(up);
      if (el[0].__hasFlipEvent) delete el[0].__hasFlipEvent;
      if (el[0].__flip_left) delete el[0].__flip_left;
      if (el[0].__flip_right) delete el[0].__flip_right;


    }

    $.flip = flip;
    $.flipDestroy = flipDestroy;

  })();

  //解决三星 小米手机stringfy失效问题
  // stringify 影响比较大
  /*(function () {
  if (navigator.userAgent.indexOf('Android') > 0) {
  var stringifyFunc = JSON.stringify
  JSON.stringify = function () {
  if (arguments.length == 1) {
  return stringifyFunc.call(this, arguments[0], function (k, v) {
  if (_.isNumber(v)) return v + '';
  else return v;
  })
  }
  else {
  stringifyFunc.apply(this, arguments);
  }
  }
  }
  })();*/

  //解决三星 小米手机stringfy失效问题
  (function () {
    if (navigator.userAgent.indexOf('Android') > 0) {
      JSON.stringify = {}
    } (function () {
      'use strict';
      function f(n) {
        return n < 10 ? '0' + n : n
      }
      if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function () {
          return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
          return this.valueOf()
        }
      }
      var cx, escapable, gap, indent, meta, rep;
      function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable,
    function (a) {
      var c = meta[a];
      return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
    }) + '"' : '"' + string + '"'
      }
      function str(key, holder) {
        var i, k, v, length, mind = gap,
    partial, value = holder[key];
        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
          value = value.toJSON(key)
        }
        if (typeof rep === 'function') {
          value = rep.call(holder, key, value)
        }
        switch (typeof value) {
          case 'string':
            return quote(value);
          case 'number':
            return isFinite(value) ? String(value) : 'null';
          case 'boolean':
          case 'null':
            return String(value);
          case 'object':
            if (!value) {
              return 'null'
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
              length = value.length;
              for (i = 0; i < length; i += 1) {
                partial[i] = str(i, value) || 'null'
              }
              v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
              gap = mind;
              return v
            }
            if (rep && typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                if (typeof rep[i] === 'string') {
                  k = rep[i];
                  v = str(k, value);
                  if (v) {
                    partial.push(quote(k) + (gap ? ': ' : ':') + v)
                  }
                }
              }
            } else {
              for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                  v = str(k, value);
                  if (v) {
                    partial.push(quote(k) + (gap ? ': ' : ':') + v)
                  }
                }
              }
            }
            v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v
        }
      }
      if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"': '\\"',
          '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {
          var i;
          gap = '';
          indent = '';
          if (typeof space === 'number') {
            for (i = 0; i < space; i += 1) {
              indent += ' '
            }
          } else if (typeof space === 'string') {
            indent = space
          }
          rep = replacer;
          if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
            throw new Error('JSON.stringify');
          }
          return str('', {
            '': value
          })
        }
      }
    } ());

  })();


  var Appliction = new cBase.Class(AbstractAPP, {
    __propertys__: function () {

    },

    cleanCache: function () {

      var DEPRECATED_FLIGHT_MAP = [
      // ----------------------------------
      // CLEAR DEPRECATED INFO
        "FLIGHT_SEARCH",
        "FLIGHT_SEARCH_SUBJOIN",
        "FLTINTL_SEARCH",
        "FLIGHT_LIST",
        "FLIGHT_INTER_CITY_LIST",
        "FLIGHT_CITY_LIST",
        "zqInCityInfo",
        "zqInCityDateStore",
        "LastInCitySelectDateTime",
        "LastzqInAirportSelectDateTime",
        "zqInAirportInfo",
        "zqInAirportDateStore",
        "zqInAirportDateAndAddressStore",
        "zqInCityDateAndAddressStore",
        "zqInCitySelectStore",
        "zqInAirportSelectStore",
        "FLIGHT_DETAILS",
        "FLIGHT_DETAILS_PARAM",
        "FLIGHT_ORDERINFO",
        "USER_FLIGHT_ORDERLIST",
        "USER_FLIGHT_ORDERDETAIL",
        "USER_FLIGHT_ORDERPARAM",
        "FLIGHT_RETURNPAGE",
        "FLIGHT_SELECTED_INFO",
        "FLIGHT_PICK_TICKET_SELECT",
        "FLIGHT_AIRLINE",
        "FLIGHT_AIRCTRAFT",
        "FLIGHT_ENUM_TAKETIME",
        "FLIGHT_ENUM_CABINS",
        "FLIGHT_LIST_FILTER",
        "FLIGHT_PICK_TICKET",
        "FLIGHT_PICK_TICKET_PARAM",
        "FLIGHT_AD_TIMEOUT",
      // ----------------------------------
      // CLEAR LIST INFO AND USER INFO
        "P_FLIGHT_TicketList",
        "U_FLIGHT_ORDERLIST",
        "U_FLIGHT_ORDERDETAIL"
      ];

      var map = {
        "flight": DEPRECATED_FLIGHT_MAP
      }

      var array = map[this.channel];

      if (Array.isArray(array)) {
        for (var value in array) {
          window.localStorage.removeItem(value);
        }
      };
    },

    initialize: function ($super, options) {

      $super(options);

      //适配app 张爸爸
      var Guider = WidgetFactory.create('Guider');
      Guider.create();

      $.bindFastClick && $.bindFastClick();

      //l_wang提升响应速度，android低版本直接忽略
      if (navigator.userAgent.indexOf('Android 2') > 0) {
        $.unbindFastClick && $.unbindFastClick();
      }

      //清除过期数据 shbzhang
      try {
        cStorage.getInstance().removeOverdueCathch();
        //cStorage.getInstance().gc();
      } catch (e) {
      }
      this.cleanCache();

    }

  });
  return Appliction;
});

//每次进入页面前,清一下堡垒标志位 shbzhang 2014/5/19
(function(){
  var ls = window.localStorage;
  if(ls){
    ls.removeItem('isPreProduction');
  }
})();
