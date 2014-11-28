/**
 * @fileoverview [iscroll]{@link https://github.com/cubiq/iscroll}改写成异步模块 
 */
define(['cBase'], function (cBase) {

  var utils = (function () {
    var me = {};
    var _elementStyle = document.createElement('div').style;

    //获得需要兼容CSS3前缀
    var _vendor = (function () {
      var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
      var transform;
      var i = 0;
      var l = vendors.length;

      for (; i < l; i++) {
        transform = vendors[i] + 'ransform';
        if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
      }
      return false;
    })();

    //获取样式（CSS3兼容）
    function _prefixStyle(style) {
      if (_vendor === false) return false;
      if (_vendor === '') return style;
      return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }

    me.getTime = Date.now || function getTime() { return new Date().getTime(); };

    me.addEvent = function (el, type, fn, capture) {
      if (el[0] && el != window.top) el = el[0];
      el.addEventListener(type, fn, !!capture);
    };

    me.removeEvent = function (el, type, fn, capture) {
      if (el[0] && el != window.top) el = el[0];
      el.removeEventListener(type, fn, !!capture);
    };

    /*
    current：当前鼠标位置
    start：touchStart时候记录的Y（可能是X）的开始位置，但是在touchmove时候可能被重写
    time： touchstart到手指离开时候经历的时间，同样可能被touchmove重写
    lowerMargin：y可移动的最大距离，这个一般为计算得出 this.wrapperHeight - this.scrollerHeight
    wrapperSize：如果有边界距离的话就是可拖动，不然碰到0的时候便停止
    */
    me.momentum = function (current, start, time, lowerMargin, wrapperSize) {
      var distance = current - start,
    speed = Math.abs(distance) / time,
    destination,
    duration,
    deceleration = 0.0006;

      destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
      duration = speed / deceleration;

      if (destination < lowerMargin) {
        destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
        distance = Math.abs(destination - current);
        duration = distance / speed;
      } else if (destination > 0) {
        destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
        distance = Math.abs(current) + destination;
        duration = distance / speed;
      }

      return {
        destination: Math.round(destination),
        duration: duration
      };

    };

    $.extend(me, {
      hasTouch: 'ontouchstart' in window
    });

    // This should find all Android browsers lower than build 535.19 (both stock browser and webview)
    me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));


    //我们暂时只判断touch 和 mouse即可
    $.extend(me.style = {}, {
      transform: _prefixStyle('transform'),
      transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
      transitionDuration: _prefixStyle('transitionDuration'),
      transitionDelay: _prefixStyle('transitionDelay'),
      transformOrigin: _prefixStyle('transformOrigin')
    });

    $.extend(me.eventType = {}, {
      touchstart: 1,
      touchmove: 1,
      touchend: 1,

      mousedown: 2,
      mousemove: 2,
      mouseup: 2
    });

    $.extend(me.ease = {}, {
      quadratic: {
        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fn: function (k) {
          return k * (2 - k);
        }
      },
      circular: {
        style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
        fn: function (k) {
          return Math.sqrt(1 - (--k * k));
        }
      },
      back: {
        style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fn: function (k) {
          var b = 4;
          return (k = k - 1) * k * ((b + 1) * k + b) + 1;
        }
      },
      bounce: {
        style: '',
        fn: function (k) {
          if ((k /= 1) < (1 / 2.75)) {
            return 7.5625 * k * k;
          } else if (k < (2 / 2.75)) {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
          } else if (k < (2.5 / 2.75)) {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
          } else {
            return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
          }
        }
      },
      elastic: {
        style: '',
        fn: function (k) {
          var f = 0.22,
    e = 0.4;

          if (k === 0) { return 0; }
          if (k == 1) { return 1; }

          return (e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1);
        }
      }
    });
    return me;
  })();

  function IScroll(opts) {
    this.$wrapper = typeof opts.wrapper == 'string' ? $(opts.wrapper) : opts.wrapper;
    if (opts.scroller) {
      this.scroller = typeof opts.scroller == 'string' ? $(opts.scroller) : opts.scroller;
    } else {
      this.scroller = this.$wrapper.children().eq(0);
    }

    this.wrapper = this.$wrapper[0];
    this.scroller = this.scroller[0];

    var instance = this.wrapper.iscrollInstance;
    //防止多次实例化bug
    if (instance) {
      return instance;
    }

    //这个属性会被动态改变的，如果这里
    this.scrollerStyle = this.scroller.style;

    this.options = {
      //是否具有滚动条
      scrollbars: true,
      //初始坐标
      startX: 0,
      startY: 0,
      //超出边界还原时间点
      bounceTime: 600,
      //超出边界返回的动画
      bounceEasing: utils.ease.circular,
      //解决input框不能获取焦点的bug
      preventDefaultException: /^(input|textarea|button|select)$/i,
      //超出边界时候是否还能拖动
      bounce: true,
      //竖直滚动
      scrollY: true,
      //横向滚动
      scrollX: false,
      bindToWrapper: true,

      //当window触发resize事件60ms后还原
      resizePolling: 60
    };

    this._events = {};

    for (var i in opts) {
      this.options[i] = opts[i];

      if (i == 'scrollStart' || i == 'scrollEnd') {
        this.on(i, _.bind(opts[i], this));
      }
    }

    this.translateZ = ' translateZ(0)';
    this.x = 0;
    this.y = 0;
    this._init();

    //更新滚动条位置
    this.refresh();

    //更新本身位置
    this.scrollTo(this.options.startX, this.options.startY);

    this.enable();

    this.wrapper.iscrollInstance = this;
  };

  IScroll.prototype = {
    _init: function () {
      this._initEvents();
      if (this.options.scrollbars) {
        this._initIndicator();
      }
    },
    refresh: function () {
      var rf = this.wrapper.offsetHeight;   // Force reflow
      var options = this.options;
      // 如果元素隐藏
      if (rf == 0) return;

      this.wrapperWidth = this.wrapper.clientWidth;
      this.scrollerWidth = this.scroller.offsetWidth;
      this.maxScrollX = this.wrapperWidth - this.scrollerWidth;

      this.wrapperHeight = this.wrapper.clientHeight;
      this.scrollerHeight = this.scroller.offsetHeight;
      this.maxScrollY = this.wrapperHeight - this.scrollerHeight;

      //判断滚动条是否显示
      if (this.indicator) {
        if (options.scrollY && this.maxScrollY >= 0) {
          this.indicator.wrapperStyle.display = 'none';
        }

        if (options.scrollX && this.maxScrollX >= 0) {
          this.indicator.wrapperStyle.display = 'none';
        }
      }

      if (options.scrollX || this.maxScrollY > 0) {
        this.maxScrollY = 0;
      }

      if (options.scrllY || this.maxScrollX > 0) {
        this.maxScrollX = 0;
      }

      this.endTime = 0;

      this._execEvent('refresh');

      this.resetPosition();

      
    },
    _initEvents: function (remove) {
      var eventType = remove ? utils.removeEvent : utils.addEvent;
      var target = this.options.bindToWrapper ? this.wrapper : window;

      eventType(window, 'orientationchange', this);
      eventType(window, 'resize', this);

      if (utils.hasTouch) {
        eventType(this.wrapper, 'touchstart', this);
        eventType(target, 'touchmove', this);
        eventType(target, 'touchcancel', this);
        eventType(target, 'touchend', this);
      } else {
        eventType(this.wrapper, 'mousedown', this);
        eventType(target, 'mousemove', this);
        eventType(target, 'mousecancel', this);
        eventType(target, 'mouseup', this);
      }

      eventType(this.scroller, 'transitionend', this);
      eventType(this.scroller, 'webkitTransitionEnd', this);
      eventType(this.scroller, 'oTransitionEnd', this);
      eventType(this.scroller, 'MSTransitionEnd', this);
    },
    _start: function (e) {
      var options = this.options;

      if (options.scrollX) {
        this._isMovedChecked = false;
        this.enabled = true;
      }

      if (!this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated)) {
        return;
      }


      if (!utils.isBadAndroid && options.preventDefaultException.test(e.target.tagName)) {
        e.preventDefault();
      }

      var point = e.touches ? e.touches[0] : e, pos;
      this.initiated = utils.eventType[e.type];

      this.moved = false;
      
      this.distY = 0;
      this.distX = 0;

      //开启动画时间，如果之前有动画的话，便要停止动画，这里因为没有传时间，所以动画便直接停止了
      this._transitionTime();

      this.startTime = utils.getTime();

      //如果正在进行动画，需要停止，并且触发滑动结束事件
      if (this.isInTransition) {
        this.isInTransition = false;
        pos = this.getComputedPosition();
        var _x = Math.round(pos.x);
        var _y = Math.round(pos.y);

        if (_y < 0 && _y > this.maxScrollY && options.adjustXY) {
          _y = options.adjustXY.call(this, _x, _y).y;
        }

        //移动过去
        this._translate(_x, _y);
        this._execEvent('scrollEnd');
      }

      this.startX = this.x;
      this.startY = this.y;
      this.absStartX = this.x;
      this.absStartY = this.y;
      this.pointX = point.pageX;
      this.pointY = point.pageY;

      this._execEvent('beforeScrollStart');

    },
    // 检测屏幕上下滑动时，不要阻止页面滑动
    _moveCheck: function(e) {
      var options = this.options;

      if (options.scrollX) {
        if (!this._isMovedChecked) {
          var point = e.touches ? e.touches[0] : e;
          var deltaX = Math.abs(point.pageX - this.pointX);
          var deltaY = Math.abs(point.pageY - this.pointY);
          if (deltaY > deltaX) {
            this.disable();
          }
        }
      }

      this._isMovedChecked = true;
    },
    _move: function (e) {
      if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
        return;
      }
      e.preventDefault();
      var options = this.options;
      var point = e.touches ? e.touches[0] : e,
      deltaX = point.pageX - this.pointX,
      deltaY = point.pageY - this.pointY,
      timestamp = utils.getTime(),
      newX, newY,
      absDistX, absDistY;

      this.pointX = point.pageX;
      this.pointY = point.pageY;

      this.distX += deltaX;
      this.distY += deltaY;
      absDistX = Math.abs(this.distX);
      absDistY = Math.abs(this.distY);

      // 如果一直按着没反应的话这里就直接返回了
      if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
        return;
      }

      if (options.scrollX) {
        deltaY = 0;
      }

      if (options.scrollY) {
        deltaX = 0;
      }

      newX = this.x + deltaX;
      newY = this.y + deltaY;

      if ( newX > 0 || newX < this.maxScrollX ) {
        newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
      }

      if (newY > 0 || newY < this.maxScrollY) {
        newY = options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
      }

      if (!this.moved) {
        this._execEvent('scrollStart');
      }

      this.moved = true;

      this._translate(newX, newY);

      if (timestamp - this.startTime > 300) {
        this.startTime = timestamp;
        this.startX = this.x;
        this.startY = this.y;
      }

    },
    _end: function (e) {
      if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
        return;
      }

      var options = this.options;
      var point = e.changedTouches ? e.changedTouches[0] : e,
      momentumY,
      duration = utils.getTime() - this.startTime,
      newX = Math.round(this.x),
      newY = Math.round(this.y),
      distanceX = Math.abs(newX - this.startX),
      distanceY = Math.abs(newY - this.startY),
      time = 0,
      easing = '';

      this.isInTransition = 0;
      this.initiated = 0;
      this.endTime = utils.getTime();

      if (this.resetPosition(options.bounceTime)) {
        return;
      }

      this.scrollTo(newX, newY);

      if (!this.moved) {
        //click 的情况
        this._execEvent('scrollCancel');
        return;
      }

      if (duration < 300) {
        momentumX = utils.momentum(this.x, this.startX, duration, this.maxScrollX, options.bounce ? this.wrapperWidth : 0);
        momentumY = utils.momentum(this.y, this.startY, duration, this.maxScrollY, options.bounce ? this.wrapperHeight : 0);
        newX = momentumX.destination;
        newY = momentumY.destination;
        time = Math.max(momentumX.duration, momentumY.duration);
        this.isInTransition = 1;
      }

      if ( newX != this.x || newY != this.y ) {
        // change easing function when scroller goes out of the boundaries
        if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
          easing = utils.ease.quadratic;
        }

        this.scrollTo(newX, newY, time, easing);
        return;
      }

      this._execEvent('scrollEnd');
    },

    _resize: function () {
      var that = this;

      clearTimeout(this.resizeTimeout);

      this.resizeTimeout = setTimeout(function () {
        that.refresh();
      }, this.options.resizePolling);
    },

    _transitionTimingFunction: function (easing) {
      this.scrollerStyle[utils.style.transitionTimingFunction] = easing;

      this.indicator && this.indicator.transitionTimingFunction(easing);
    },

    //开始或者停止动画
    _transitionTime: function (time) {
      time = time || 0;
      this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

      /*if ( !time && utils.isBadAndroid ) {
        this.scrollerStyle[utils.style.transitionDuration] = '0.00167s';
      }*/

      //滚动条，我们这里只会出现一个滚动条就不搞那么复杂了
      this.indicator && this.indicator.transitionTime(time);

    },

    getComputedPosition: function () {
      var matrix = window.getComputedStyle(this.scroller, null), x, y;

      matrix = matrix[utils.style.transform].split(')')[0].split(', ');
      x = +(matrix[12] || matrix[4]);
      y = +(matrix[13] || matrix[5]);

      return { x: x, y: y };
    },

    _initIndicator: function () {
      //滚动条
      var el;
      var scrollX = this.options.scrollX

      if (scrollX) {
        el = createDefaultScrollbar('h');
      } else {
        el = createDefaultScrollbar();
      }

      this.wrapper.appendChild(el);
      this.indicator = new Indicator(this, { el: el, scrollX: scrollX });
      this.$wrapper.css('position', 'relative');

      this.on('scrollEnd', function () {
        this.indicator.fade();
      });

      var scope = this;
      this.on('scrollCancel', function () {
        scope.indicator.fade();
      });

      this.on('scrollStart', function () {
        scope.indicator.fade(1);
      });

      this.on('beforeScrollStart', function () {
        scope.indicator.fade(1, true);
      });

      this.on('refresh', function () {
        scope.indicator.refresh();
      });

    },
    _translate: function (x, y) {
      this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

      this.x = x;
      this.y = y;

      if (this.options.scrollbars) {
        this.indicator.updatePosition();
      }

    },

    resetPosition: function (time) {
      var x = this.x;
      var y = this.y;
      var options = this.options;

      time = time || 0;

      if ( !options.scrollX || this.x > 0 ) {
        x = 0;
      } else if ( this.x < this.maxScrollX ) {
        x = this.maxScrollX;
      }

      if ( !options.scrollY || this.y > 0 ) {
        y = 0;
      } else if ( this.y < this.maxScrollY ) {
        y = this.maxScrollY;
      }

      if ( x == this.x && y == this.y ) {
        return false;
      }

      this.scrollTo(x, y, time, this.options.bounceEasing);

      return true;
    },

    //移动
    scrollTo: function (x, y, time, easing) {
      easing = easing || utils.ease.circular;

      this.isInTransition = time > 0;

      if (!time || easing.style) {
        this._transitionTimingFunction(easing.style);
        this._transitionTime(time);
        this._translate(x, y);
      }
    },

    //统一的关闭接口
    disable: function () {
      this.enabled = false;
    },
    //统一的open接口
    enable: function () {
      this.enabled = true;
    },

    on: function (type, fn) {
      if (!this._events[type]) {
        this._events[type] = [];
      }

      this._events[type].push(fn);
    },

    _execEvent: function (type) {
      if (!this._events[type]) {
        return;
      }

      var i = 0,
      l = this._events[type].length;

      if (!l) {
        return;
      }

      for (; i < l; i++) {
        this._events[type][i].call(this);
      }
    },
    destroy: function () {
      this._initEvents(true);
      this._execEvent('destroy');
      this.indicator && this.indicator.destroy();
    },

    _transitionEnd: function (e) {
      if (e.target != this.scroller || !this.isInTransition) {
        return;
      }

      this._transitionTime();
      if (!this.resetPosition(this.options.bounceTime)) {
        this.isInTransition = false;
        this._execEvent('scrollEnd');
      }
    },

    //事件具体触发点
    handleEvent: function (e) {
      $('#log').html(e.type);
      switch (e.type) {
        case 'touchstart':
        case 'mousedown':
          this._start(e);
          break;
        case 'touchmove':
        case 'mousemove':
          this._moveCheck(e);
          this._move(e);
          break;
        case 'touchend':
        case 'mouseup':
        case 'touchcancel':
        case 'mousecancel':
          this._end(e);
          break;
        case 'orientationchange':
        case 'resize':
          this._resize();
          break;
        case 'transitionend':
        case 'webkitTransitionEnd':
        case 'oTransitionEnd':
        case 'MSTransitionEnd':
          this._transitionEnd(e);
          break;
      }
    }

  };

  function createDefaultScrollbar(dir) {
    var scrollbar = $('<div>');
    var indicator = $('<div>');
    var scrollbarStyle = {
      position: 'absolute',
      overflow: 'hidden'
    };
    var indicatorStyle = {
      boxSizing: 'border-box',
      position: 'absolute',
      background: 'rgba(0, 0, 0, .5)',
      border: '1px solid rgba(255, 255, 255, .9)'
    };
   
    if (dir === 'h') {
      _.extend(scrollbarStyle, {
        height: 7,
        left: 2,
        right: 2,
        bottom:0
      });
      _.extend(indicatorStyle, {
        height: '100%'
      });
    } else {
      _.extend(scrollbarStyle, {
        width: 7,
        bottom: 2,
        top: 2,
        right: 1
      });
      _.extend(indicatorStyle, {
        width: '100%'
      });
    }
    scrollbar.css(scrollbarStyle);
    indicator.css(indicatorStyle);

    scrollbar.append(indicator);

    return scrollbar[0];
  }

  function Indicator(scroller, opts) {
    this.wrapper = typeof opts.el == 'string' ? document.querySelector(opts.el) : opts.el;
    this.indicator = this.wrapper.children[0];

    this.wrapperStyle = this.wrapper.style;
    this.indicatorStyle = this.indicator.style;
    this.scroller = scroller;

    this.sizeRatioX = 1;
    this.sizeRatioY = 1;
    this.maxPosX = 0;
    this.maxPosY = 0;

    this.options = {
      scrollX: false
    };

    _.extend(this.options, opts);

    this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
    this.wrapperStyle[utils.style.transitionDuration] = '0ms';
  }

  Indicator.prototype = {
    transitionTime: function (time) {
      time = time || 0;
      this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';
    },
    transitionTimingFunction: function (easing) {
      this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
    },
    refresh: function () {
      this.transitionTime();
      var r = this.wrapper.offsetHeight; // force refresh
      var wrapperHeight = this.wrapper.clientHeight;
      var wrapperWidth = this.wrapper.clientWidth;
      var indicatorHeight, indicatorWidth;

      if (this.options.scrollX) {
        indicatorWidth = Math.max(Math.round(wrapperWidth * wrapperWidth / (this.scroller.scrollerWidth || wrapperWidth || 1)), 8);
        this.indicatorStyle.width = indicatorWidth + 'px';
        this.maxPosX = wrapperWidth - indicatorWidth;
        this.sizeRatioX = (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));
      } else {
        indicatorHeight = Math.max(Math.round(wrapperHeight * wrapperHeight / (this.scroller.scrollerHeight || wrapperHeight || 1)), 8);
        this.indicatorStyle.height = indicatorHeight + 'px';
        this.maxPosY = wrapperHeight - indicatorHeight;
        this.sizeRatioY = (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
      }
      
      this.updatePosition();
    },
    destroy: function () {
      //remove bug
      $(this.wrapper).remove();
    },
    updatePosition: function () {
      var y = Math.round(this.sizeRatioY * this.scroller.y) || 0;
      var x = Math.round(this.sizeRatioX * this.scroller.x) || 0;
      var translate;

      this.y = y;
      this.x = x;
      if (this.options.scrollX) {
        translate = 'translate(' + x +'px, 0)';
      } else {
        translate = 'translate(0,' + y + 'px)';
      }
      this.indicatorStyle[utils.style.transform] = translate + this.scroller.translateZ;
    },
    fade: function (val, hold) {
      if (hold && !this.visible) {
        return;
      }

      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;

      var time = val ? 250 : 500,
      delay = val ? 0 : 300;

      val = val ? '1' : '0';

      this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

      this.fadeTimeout = setTimeout($.proxy(function (val) {
        this.wrapperStyle.opacity = val;
        this.visible = +val;
      }, this), delay);
    }
  };

  IScroll.utils = utils;

  return IScroll;

});