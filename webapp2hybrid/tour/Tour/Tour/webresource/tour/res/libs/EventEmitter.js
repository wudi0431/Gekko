/*
* 说明，Lizard 有一个 EventListener：http://git.dev.sh.ctripcorp.com/ctrip-mobile-web-union/ctrip-wireless-h5-lizard/blob/H5V2.2S6/src/ui/c.ui.event.listener.js
* 但是是一个有专门用途的单例，如果在业务中大规模使用，容易名字冲突，要么就是太过于啰嗦冗长的事件名
*/

/*
@Author peic@Ctrip.com
@Create 2013/11/19
@Update 2014/01/16

介绍：http://www.peichao01.com/static_content/doc/html/introduce-EventEmitter.html

Api参考：http://nodejs.org/api/events.html
	多了一个类方法：EventEmitter.mixTo()  给构造函数或实例对象增加事件功能
	增加两个事件：”removeAllListeners”, “maxListeners”
	maxListeners数量，默认为不限制，而不是10.

可以监听 all 事件，参见 backbone

Instance methods:
	emitter.addListener(event, listener)
	emitter.on(event, listener)
	emitter.once(event, listener)
	emitter.removeListener(event, listener)
	emitter.removeAllListeners([event])
	emitter.setMaxListeners(number)
	emitter.listeners(event)
	emitter.emit(event, [arg1], [arg2], [...])
Class Methods:
	EventEmitter.listenerCount(emitter, event)
	EventEmitter.mixTo(instanceOrConstructor)
Event:
	'newListener'(event, listener)
	'removeListener'(event, listener)
	'removeAllListeners'(event)
	'maxListeners'(event, listener)
*/
define([],function () {

    var indexOf = function (arr, obj) {
        if (Array.prototype.indexOf) return arr.indexOf(obj);
        for (var i = 0, len = arr; i < len; i++) if (arr[i] === obj) return i;
        return -1;
    };
    var log = function (msg) { try { console.log(msg) } catch (e) { } };
    var notice = function (msg) { log('[NOTICE] ' + msg) };

    function EventEmitter() { }

    var listenersName = '__cacheListeners__',
		maxName = '__maxListener__',
		innerEvent = ['newListener', 'maxListeners', 'removeListener', 'removeAllListeners'];

    var methods = {
        addListener: function (event, listener) {
            var caches = this[listenersName] || (this[listenersName] = {}),
				cache = caches[event] || (caches[event] = []);
            if (!this[maxName] || cache.length < this[maxName]) {
                cache.push(listener);
                this.emit('newListener', event, listener);
            } else {
                this.emit('maxListeners', event, listener);
            }
            return this;
        },
        once: function (event, listener) {
            this.addListener(event, cb);
            var self = this;
            function cb(args) {
                listener.apply(null, [].slice.call(arguments, 0));
                self.removeListener(event, cb);
            }
            return this;
        },
        removeListener: function (event, listener) {
            var caches, cache, index;
            if ((caches = this[listenersName]) && (cache = caches[event]) && (index = indexOf(cache, listener)) >= 0) {
                cache.splice(index, 1);
                this.emit('removeListener', event, listener);
            }
            return this;
        },
        removeAllListeners: function (event) {
            //emit first, or the listeners on this event will be removed too.
            this.emit('removeAllListeners', event);
            if (event) this[listenersName] && (this[listenersName][event] = []);
            else this[listenersName] = {};
            return this;
        },
        setMaxListeners: function (n) {
            if (typeof n === 'number') this[maxName] = n;
            return this;
        },
        listeners: function (event) {
            return (this[listenersName] && this[listenersName][event]) || [];
        },
        emit: function (event, arg1, arg2__) {
            var caches, cache, allCache, args, i, ii, isInnerEvent;
            args = [].slice.call(arguments, 1);
            if (event == 'all') notice('Are you sure you want to emit("all")?');
            if ((caches = this[listenersName]) && (cache = caches[event]) && (ii = cache.length)) {
                for (i = 0; i < ii; i++) cache[i].apply(this, args);
            }
            if (caches && (allCache = caches.all) && (ii = allCache.length)) {
                if (!(isInnerEvent = indexOf(innerEvent, event) >= 0)) {
                    args.unshift(event);
                    for (i = 0; i < ii; i++) allCache[i].apply(this, args);
                }
            }
            return this;
        }
    };
    methods.on = methods.addListener;

    var classMethods = {
        listenerCount: function (emitter, event) {
            return emitter.listeners(event).length;
        },
        mixTo: function (insOrCons) {
            var isFunc = typeof insOrCons === 'function',
				reiver = isFunc ? insOrCons.prototype : insOrCons;
            if (isFunc)
                for (var key in classMethods)
                    if (classMethods.hasOwnProperty(key)) insOrCons[key] = classMethods[key];
            for (var key in methods)
                if (methods.hasOwnProperty(key)) reiver[key] = methods[key];
            return insOrCons;
        }
    };
    classMethods.mixTo(EventEmitter);
	
    return EventEmitter;
});
