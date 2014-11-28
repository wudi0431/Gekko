define(['cBase', 'cUIAbstractView'], function(cBase, AbstractView) {
	var options = {};

	// var _config = {
	// 	prefix: 'cui-'
	// };

	options.__propertys__ = function () {
		this.tpl = this.template(['<div class="tpl">template</div>'].join(''));
		
		$('.tpl').bind('click', function() {
			alert('123');
		});
	};

 /** 可以传入rootBox已经changed两个参数，一个是控件所处位置，一个是选项改变时候需要触发的事件 */
  options.initialize = function ($super, opts) {
    $super(opts);

    this.show();
    if(opts.click) this.clieked();

  };

 /**
  * @method createHtml
  * @description 重写抽象类结构dom
  */
  options.createHtml = function () {
	// $('.bbb').bind('click', $.proxy(this.clicked, this));
    return this.tpl();
  };

  options.clicked = function() {
  	console.log('123');
  }

    return new cBase.Class(AbstractView, options);
});