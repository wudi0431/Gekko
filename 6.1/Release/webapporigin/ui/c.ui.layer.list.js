/**
* @author l_wang王磊 <l_wang@Ctrip.com>
*/
define(['cBase', 'cUIAbstractView', 'cUIMask'], function (cBase, cUIAbstractView, cUIMask) {

  return cBase.Class(cUIAbstractView, {
    __propertys__: function () {

      this.template = [
		    '<ul class="list">',
			  '<%for(var i = 0, len = list.length; i < len; i++) {%>',
                '<li data-index="<%=i%>" <%if(i == index) { %>class="current"<% } %> ><%=((typeof itemFn == "function" && itemFn(list[i])) || list[i].name)%></li>',
              '<%}%>',
		    '</ul>',
		    '<ul>',
			  '<li class="cancel"><%=cancelText%></li>',
		    '</ul>'
      ].join('');

      this.viewdata = {
        list: [],
        cancelText: '取消',
        className: 'popup-operate',
        index: -1
      };

      this.eventArr = {
        'click .cancel': 'cancelAction',
        'click .list li': 'itemAction'
      };

      this.mask = new cUIMask();

    },

    setIndex: function (i) {
      if (i < 0 || i > this.viewdata.length) return;
      this.viewdata.index = i;
      this.root.find('li').removeClass('current');
      this.root.find('li[data-index="' + i + '"]').addClass("current");
    },

    cancelAction: function (e) {
      this.hide();
    },

    onItemAction: function (data, index, e) {
    },

    itemAction: function (e) {
      var el = $(e.currentTarget);
      var index = el.attr('data-index');
      var data = this.viewdata.list[index];
      this.setIndex(index);
      this.onItemAction.call(this, data, index, e);

    },

    createHtml: function () {
      return _.template(this.template)(this.viewdata);
    },

    bindEvent: function () {
      this.addEvent('onShow', function () {
        this.mask.show();
        this.mask.root.on('click', $.proxy(function () {
          this.mask.root.off('click');
          this.hide();
        }, this));

        this.setzIndexTop();

      }, this);

      this.addEvent('onHide', function () {
        this.mask.hide();
      }, this);

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
      this.addClass('popup-operate');
      this.bindEvent();
    }

  });
});