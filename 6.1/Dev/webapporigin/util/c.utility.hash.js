/**
 * @author vlcm李淳敏 <cmli@Ctrip.com> / oxz欧新志 <ouxz@Ctrip.com> / vzyq张有泉 <yq.zhang@Ctrip.com>
 * @class Hash
 * @comment 如果使用的很少直接移动到cUtility去
 */
define(['cCoreInherit'], function (cCoreInherit) {

  /**
  * @method indexOf
  * @param {string|object|int} value 查询的目标值
  * @param {array|object} target 查询队列或对象
  * @description 为Object提供indexOf方法
  */
  var indexOf = function (value, target) {
    if (!target) return -1;

    if (target.indexOf) return target.indexOf(value);

    for (var i = 0; i < target.length; i++) {
      if (target[i] === value) return i;
    }

    return -1;
  };

  var Base = {};

  var options = {};

  /**
  * @method __propertys__
  * @description 复写自顶层Class的__propertys__，初始化队列
  */
  options.__propertys__ = function () {
    /** 申明数组 */
    this.keys = [];
    this.values = [];
  };

  /**
  * @method initialize
  * @param {object} obj
  * @description 复写自顶层Class的initialize，赋值队列
  */
  options.initialize = function (obj) {

    /**
    * @author : yq.zhang (Air) / cmli
    * @description : 修正初始化逻辑，将逻辑与 替换为 逻辑或
    */
    if (typeof obj !== 'object') {
      obj = {};
    }

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        this.keys.push(i);
        this.values.push(obj[i]);
      }
    }

    var s = '';
  };

  /**
  * @method length
  * @description 获取对象长度
  * @return {int}
  */
  options.length = function () {
    return this.keys.length;
  };

  /**
  * @method getItem
  * @param {string} key 键值名
  * @description 通过键值名获取对象
  * @return {string|int|object}
  */
  options.getItem = function (key) {
    var index = indexOf(key, this.keys);

    if (index < 0) return null;
    else return this.values[index];
  };

  /**
  * @method getKey
  * @param {int} index 序列值
  * @description 通过序列值获取键值名
  */
  options.getKey = function (index) {
    return this.keys[index];
  };

  /**
  * @method index
  * @param {int} index 序列值
  * @description 根据序列值获取对象值
  */
  options.index = function (index) {
    return this.values[index];
  };

  /**
  * @method push
  * @param {string} key 键值名
  * @param {string|int|object} value 键值对应的值
  * @description 向栈顶压入键值对
  */
  options.push = function (key, value, order) {
    if (typeof key === 'object' && !value) {
      for (var i in key) {
        if (key.hasOwnProperty(i)) that.push(i, key[i], order);
      }
    } else {
      var index = indexOf(key, this.keys);

      if (index < 0 || order) {

        if (order) this.del(k);
        this.keys.push(key);
        this.values.push(value);

      } else {

        this.values[index] = value;
      }
    }

    return this;
  };

  /**
  * @method add
  * @param {string} key 键值名
  * @param {string|int|object} value 键值对应的值
  * @description 向栈顶压入键值对
  */
  options.add = function (key, value) {
    return this.push(key, value);
  };

  /**
  * @method del
  * @param {string} key 键值名
  * @description 根据key来删除hash
  */
  options.del = function (key) {
    var index = indexOf(key, this.keys);

    if (index < 0) return this;

    this.keys.splice(index, 1);
    this.values.splice(index, 1);

    return this;
  };

  /**
  * @method delByIndex
  * @param {int} index 序列值
  * @description 根据index来删除hash
  */
  options.delByIndex = function (index) {
    if (index < 0) return this;

    this.keys.splice(index, 1);
    this.values.splice(index, 1);

    return this;
  };

  /**
  * @method pop
  * @description 移除栈顶的hash，并返回此hash
  */
  options.pop = function () {
    if (!this.keys.length)
      return null;

    /** 移除键值对队列顶部的数据 */
    this.keys.pop();

    return this.values.pop();
  };

  /**
  * @method indexOf
  * @description 查找hash表，返回index
  */
  options.indexOf = function (value) {
    var index = indexOf(value, this.values);

    if (index >= 0)
      return this.keys[index];

    return -1;
  };

  /**
  * @method shift
  * @description 移除栈底的hash，返回此hash
  */
  options.shift = function () {
    if (!this.keys.length) return null;

    this.keys.shift();

    return this.values.shift();
  };

  /**
  * @method unshift
  * @param {int} key 键值
  * @param {string|object|int} value 查询的目标值
  * @param {int} order 位置
  * @description 往队列头部插入hash
  */
  options.unshift = function (key, value, order) {
    if (typeof key === 'object' && !value) {
      for (var i in key)
        if (key.hasOwnProperty(i)) this.unshift(i, key[i]);
    } else {
      var index = indexOf(key, this.keys);

      if (index < 0 || order) {
        if (order) this.del(key);
        this.keys.unshift(key);
        this.values.unshift(value);
      } else {
        this.values[index] = value;
      }
    }
    return this;
  };

  /**
  * @method slice
  * @param {int} start 开始位置
  * @param {int} end 结束位置
  * @description 返回一个hash表的一段
  */
  options.slice = function (start, end) {

    var keys = this.keys.slice(start, end || null);
    var values = this.values.slice(start, end || null);
    var obj = {};

    for (var i = 0; i < keys.length; i++) {
      obj[keys[i]] = values[i];
    }

    return obj;
  };

  /**
  * @method splice
  * @param {int} start 开始位置
  * @param {int} count 从开始位置向后的数量
  * @description 从一个hash中移除一个或多个元素，如果必要，在所移除元素的位置上插入新元素，返回所移除的元素。
  */
  options.splice = function (start, count) {
    var keys = this.keys.splice(start, count || null);
    var values = this.values.splice(start, count || null);
    var obj = {};

    for (var i = 0, l = keys.length; i < l; i++) {
      obj[keys[i]] = values[i];
    }

    return obj;
  };

  /**
  * @method filter
  * @param {function} handler
  */
  options.filter = function (handler) {
    var list = {};

    if (typeof handler !== 'function')
      return null;

    for (var i = 0; i < this.keys.length; i++) {
      if (handler.call(this.values[i], this.values[i], this.keys[i]))
        list[this.keys[i]] = this.values[i];
    }

    return list;
  };

  /**
  * @method each
  * @param {function} handler
  */
  options.each = function (handler) {
    var list = {};

    if (typeof handler !== 'function') return null;

    for (var i = 0; i < this.keys.length; i++) {
      handler.call(this.values[i], this.values[i], this.keys[i], i);
    }
  };

  /**
  * @method valueOf
  * @description
  * @return {object}
  */
  options.valueOf = function () {
    var obj = {};

    for (var i = 0; i < this.keys.length; i++) {
      obj[this.keys[i]] = this.values[i];
    }

    return obj;
  };

  /**
  * @method sortBy
  * @param {function} handler
  * @description 根据回调做排序
  */
  options.sortBy = function (handler) {
    var tempValueList = _.sortBy(this.values, handler);
    var templKeyList = [];

    for (var i = 0; i < tempValueList.length; i++) {
      var key = this.indexOf(tempValueList[i]);
      templKeyList[i] = key;
    }

    this.values = tempValueList;
    this.keys = templKeyList;
  };

  /**
  * @method toString
  * @description
  * @return {string}
  */
  options.toString = function () {
    if (typeof JSON != 'undefined' && JSON.stringify) {
      return JSON.stringify(this.valueOf());
    }

    return typeof this.values;
  };

  Base.Hash = new cCoreInherit.Class(options);

  return Base;
});