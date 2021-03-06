﻿/**
* @author l_wang王磊 <l_wang@Ctrip.com>
* @class cUIWarning
* @description 警告框
*/
define(['libs', 'cBase', 'cUILayer', 'cUIMask'], function (libs, cBase, Layer, Mask) {

	var options = {};

	var _config = {
		prefix: 'cui-'
	};

	var _mask = new Mask({
		classNames: [_config.prefix + 'warning-mask']
	});

	var _calback = function () { };

	var _attributes = {};
	_attributes['class'] = _config.prefix + 'warning';

	_attributes.onCreate = function () {
		this.contentDom.html(
			'<div class="' + _config.prefix +
			'warning"><div class="blank"></div><p class="blanktxt">' +
			this.warningtitle +
			'</p></div>'
		);

		this.warningDom = this.contentDom.find('.blanktxt');


		this.root.bind('click', $.proxy(function () {
			this.callback && this.callback();
		}, this));

		_mask.create();

		_mask.root.bind('click', $.proxy(function () {
			this.callback && this.callback();
		}, this));
	};

	_attributes.onShow = function () {
		//this.mask.show();
		_mask.show();
	};

	_attributes.onHide = function () {
		//this.mask.hide();
		_mask.hide();
	};

	_attributes.setTitle = function (title, callback) {
		if (title) {
			this.create();
			this.warningDom.html(title);
			this.warningtitle = title;
		}

		if (callback) {
			this.callback = callback;
		} else {
			this.callback = function () { };
		}
	};

	_attributes.getTitle = function () {
		return this.warningtitle;
	};

	options.__propertys__ = function () {
		this.warningDom;
		this.warningtitle = '';
		this.callback = function () { };
		//this.mask;
	};

	options.initialize = function ($super, opts) {
		this.setOption(function (k, v) {
			switch (k) {
				case 'title':
					this.warningtitle = v;
					break;
			}
		});
		$super($.extend(_attributes, opts));
	};

	return new cBase.Class(Layer, options);

});