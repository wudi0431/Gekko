

/*
* c.store module,
* File:c.store.js
* Project: Ctrip H5
* Author: shbzhang@ctrip.com
* Date: 2013年6月23日
*/
define(['cBase', 'cUIScroll'],
function (cBase, Scroll) {

  var ScrollList = function (opts) {
    opts = opts || {};

    this._setDisItemNum(opts);

    this._setSelectedIndex(opts);

    this._initBaseDom(opts);

    this._addItem();

    this._setBaseParam(opts);

    this.init();

  };

  ScrollList.prototype = {
    constructor: ScrollList,
    //基本参数设置
    _setBaseParam: function (opts) {
      if (this.data.constructor != Array || this.data.length == 0) return false;
      var offset = this.dragEl.offset();
      var li = this.dragEl.find('li').eq(0);
      var itemOffset = li.offset();
      //暂时不考虑边框与外边距问题
      this.itemHeight = itemOffset.height;
      this.setHeight = this.itemHeight * this.disItemNum;
      this.dragHeight = this.itemHeight * this.size;

      this.body.css('height', this.setHeight);
      this.dragEl.css('height', this.dragHeight);

      //绑定用户事件
      this._changed = opts.changed || null;
    },

    //初始化最初dom结构
    _initBaseDom: function (opts) {
      //容器元素
      this.wrapper = opts.wrapper || $(document);
      this.id = opts.id || 'id_' + new Date().getTime();
      this.className = opts.className || 'cui-roller-bd';

      this.scrollClass = opts.scrollClass || 'ul-list';

      this.body = $(['<div class="' + this.className + '" style="overflow: hidden; position: relative; " id="' + this.id + '" >', '</div>'].join(''));

      //真正拖动的元素（现在是ul）
      this.dragEl = $(['<ul class="' + this.scrollClass + '" style="position: absolute; width: 100%;">', '</ul>'].join(''));

      this.wrapper.append(this.body);

    },

    //设置控件会显示几项
    _setDisItemNum: function (opts) {
      this.data = opts.data || [];
      this.dataK = {}; //以id作为检索键值
      this.size = this.data.length; //当前容量
      this.disItemNum = 5;
      //获取用户设置的值，但是必须是奇数
      this.disItemNum = opts.disItemNum || this.disItemNum;
      this.disItemNum = this.disItemNum % 2 == 0 ? this.disItemNum + 1 : this.disItemNum;

      if (this.data.length < this.disItemNum) {
        for (var i = 0,
                len = this.disItemNum - this.data.length; i < len; i++) {
          this.data.push({
            key: '',
            val: '',
            disabled: false
          });
        }
        this.size = this.disItemNum;
      }
    },

    //设置初始时候的选项索引
    _setSelectedIndex: function (opts) {
      this.selectedIndex = parseInt(this.disItemNum / 2);
      //如果用户设置了索引值，便使用
      this.selectedIndex = opts.index != undefined ? opts.index : this.selectedIndex;
      //如果数组长度有问题的话
      this.selectedIndex = this.selectedIndex > this.data.length ? 0 : this.selectedIndex;
      //检测选项是否可选
      this._checkSelected();
    },

    //检测设置的选项是否可选，不行的话需要重置选项，这里需要处理用户向上或者向下的情况
    _checkSelected: function (dir) {
      //检测时需要根据参数先向上搜索或者先向下搜索
      dir = dir || 'down'; //默认向下搜索
      var isFind = false, index = this.selectedIndex;
      //首先检测当前项目是否不可选
      if (this.data[index] && (typeof this.data[index].disabled == 'undefined' || this.data[index].disabled == false)) {
        //向下的情况
        if (dir == 'down') {
          this.selectedIndex = this._checkSelectedDown(index);
          if (typeof this.selectedIndex != 'number') this.selectedIndex = this._checkSelectedUp(index);
        } else {
          this.selectedIndex = this._checkSelectedUp(index);
          if (typeof this.selectedIndex != 'number') this.selectedIndex = this._checkSelectedDown(index);
        }
      }
      if (typeof this.selectedIndex != 'number') this.selectedIndex = index;

    },
    _checkSelectedUp: function (index) {
      var isFind = false;
      for (var i = index; i != -1; i--) {
        if (typeof this.data[i].disabled == 'undefined' || this.data[i].disabled == true) {
          index = i;
          isFind = true;
          break;
        }
      }
      return isFind ? index : null;
    },
    _checkSelectedDown: function (index) {
      var isFind = false;
      for (var i = index, len = this.data.length; i < len; i++) {
        if (typeof this.data[i].disabled == 'undefined' || this.data[i].disabled == true) {
          index = i;
          isFind = true;
          break;
        }
      }
      return isFind ? index : null
    },

    init: function () {
      var scope = this;

      this.scroll = new Scroll({
        scrollbars: false,
        wrapper: this.body,
        scroller: this.dragEl,
        adjustXY: function (x, y) {

          var itemHeight = scope.itemHeight;
          var y = Math.abs(y);
          var mod = y % itemHeight;
          var dif = itemHeight - mod;
          if (mod != 0) {
            if (mod > itemHeight / 2) {
              y = y + dif;
            } else {
              y = y - mod;
            }
          }

          y = y > 0 ? y * (-1) : y;

          return { x: x, y: y };

        }

      });

      this.scroll.on('scrollEnd', function () {
        var pos = this.getComputedPosition();
        var y = Math.abs(pos.y);
        this.selectedIndex = y / scope.itemHeight;

        scope._checkSelected();

        scope.setIndex(scope.selectedIndex);

        var s = '';
      })


    },

    //增加数据
    _addItem: function () {
      var _tmp, _data, i, k, val;
      for (var i in this.data) {
        _data = this.data[i];
        _data.index = i;
        if (typeof _data.key == 'undefined') _data.key = _data.id;
        if (typeof _data.val == 'undefined') _data.val = _data.name;
        val = _data.val || _data.key;
        this.dataK[_data.key] = _data;
        _tmp = $('<li>' + val + '</li>');
        _tmp.attr('data-index', i);
        if (typeof _data.disabled != 'undefined' && _data.disabled == false) {
          _tmp.css('color', 'gray');
        }
        this.dragEl.append(_tmp);
      }
      this.body.append(this.dragEl);
    },
    setIndex: function (i) {

      this.scroll.scrollTo(0, i * this.itemHeight * (-1), 0)

    },
    setKey: function (k) { }
  };

  return ScrollList;
});