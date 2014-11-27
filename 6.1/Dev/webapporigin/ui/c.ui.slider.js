/**
* @author l_wang王磊 <l_wang@Ctrip.com>
*/
define(['cBase', 'cUIAbstractView', 'cUIMask'], function (cBase, cUIAbstractView, cUIMask) {

  return cBase.Class(cUIAbstractView, {
    __propertys__: function () {

      this.template = [
        '<ul class="ul-list horizontal" style="position: absolute; top: 0; left: 0;">',
          '<%for(var i = 0, len = data.length; i < len; i++) { %>',
          '<li style="float: left;" data-key="<%=data[i].id %>" data-index="<%=i%>" <%if(data[i].disabled){ %> class="disabled" <%} %> >',
              '<%=((typeof itemFn == \'function\' && itemFn(data[i])) || data[i].name) %>',
          '</li>',
          '<%} %>',
        '</ul>'
      ].join('');

      this.viewdata = {
        curClass: 'current',
        data: [],
        index: 0
      };

      this.addClass('cui-roller');

      this.itemNum = 0;
      this.displayNum = 2;

      //该组件一定要设置宽高
      this.itemWidth = 0;
      this.itemHeight = 0;

      this.scrollWidth = 0;
      //最外层宽度需要固定
      this.wrapperWidth = 0;
      this.wrapperHeight = 0;
      //选择时候的偏移量
      this.scrollOffset = 0;

      this.time = 100;

    },

    changed: function (item) {
      console.log(item)
    },

    resetPropery: function () {
      this._resetNum();
      this._resetIndex();
    },

    //这里差一个index值判断**************************
    _resetIndex: function () {
      if (!this.viewdata.id) return;
      for (var i = 0, len = this.viewdata.data.length; i < len; i++) {
        if (this.viewdata.id == this.viewdata.data[i].id) {
          this.viewdata.index = i;
          break;
        }
      }
    },

    _resetNum: function () {
      this.itemNum = this.viewdata.data.length;
      if (this.displayNum > this.itemNum) this.displayNum = this.itemNum;
      //      this.displayNum = this.displayNum % 2 == 0 ? this.displayNum + 1 : this.displayNum;

    },

    createHtml: function () {
      return _.template(this.template)(this.viewdata);
    },

    //初始化尺寸
    initSize: function () {
      this.root.width('100%').height('100%');

      this.scroller = this.root.find('.ul-list');
      this.items = this.scroller.find('li');

      this.wrapperWidth = this.rootBox.width();
      this.wrapperHeight = this.rootBox.height();
      this.itemWidth = parseInt(this.wrapperWidth / this.displayNum);
      this.scroller.width(this.itemWidth * this.itemNum);

      this.items.width(this.itemWidth);
      this.items.height(this.wrapperHeight);

      this.scrollOffset = ((this.displayNum - 1) / 2) * (this.itemWidth);
      //      this.scrollOffset = this.itemWidth / 2;

    },

    _bindEvent: function () {
      this._unbindEvent();

      $.flip(this.scroller, 'left', $.proxy(function () {
        this.setIndex(this.viewdata.index + 1);
      }, this));

      $.flip(this.scroller, 'right', $.proxy(function () {
        this.setIndex(this.viewdata.index - 1);
      }, this));

      $(window).on('resize.silder' + this.id, $.proxy(function () {
        this.refresh();
      }, this));

    },

    _unbindEvent: function () {
      $.flipDestroy(this.scroller);
      $(window).off('.silder' + this.id);
    },

    //根据index调整当前位置
    adjustPosition: function (hasAnimat) {
      var index = this.viewdata.index, _dis = 0;
      _dis = (this.itemWidth * index) * (-1) + this.scrollOffset;

      if (hasAnimat)
        this.scrollTo(_dis);
      else {
        this.scroller.css('left', _dis);
        this.resetCss();
      }
    },

    scrollTo: function (x) {
      this.scroller.animate({ left: x }, this.time, 'ease-in-out', $.proxy(function () {
        this.resetCss();
      }, this));
    },

    bindEvent: function () {

      this.addEvent('onShow', function () {

        //操作前先将尺寸固定
        this.initSize();
        //每次显示会根据index不同重置位置
        this.adjustPosition();
        this.resetCss();
        this._bindEvent();

      }, this);

      this.addEvent('onHide', function () {
        this._unbindEvent();

      }, this);

    },

    resetCss: function () {
      this.root.find('li').removeClass('current');
      this.root.find('li[data-index="' + this.viewdata.index + '"]').addClass('current');
    },

    //根据index设置当前选项
    setIndex: function (i) {
      if (i < 0 || i > this.itemNum - 1) return;
      var isChange = this.viewdata.index != i;

      this.viewdata.index = i;

      if (isChange) {
        this.adjustPosition(true);
        this.changed && this.changed.call(this, this.getSelected());
      }



    },

    //根据id设置当前选项
    setId: function (id) {

    },

    //获取当前选项
    getSelected: function () {
      return this.viewdata.data[this.viewdata.index];
    },

    //当窗口变化或者数据变化时候调用的方法
    refresh: function () {
      this.resetPropery();
      this.initSize();
      this.adjustPosition();

    },

    initialize: function ($super, opts) {
      for (var k in opts) {
        if (k == 'viewdata') {
          _.extend(this.viewdata, opts[k]);
          continue;
        }
        this[k] = opts[k];
      }
      $super(opts);
      this.resetPropery();
      this.bindEvent();
    }

  });
});