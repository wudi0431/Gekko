describe('inherit', function() {
  var Core;

  beforeEach(function(done) {
    requirejs([
      'cCoreInherit',
    ], function(mod) {
      Core = mod;
      done();
    });
  });

  describe('.Class()', function() {
    it('创建父类', function() {
      var Parent = Core.Class({
        initialize: function() {
        }
      });
      var parentInstance = new Parent; 
      expect(Parent).to.be.an('function');
      expect(parentInstance instanceof Parent).to.be.true;
      expect(parentInstance.constructor === Parent).to.be.true;
    });

    it('子类继承父类', function() {
      var Parent = Core.Class({
        initialize: function() {},
        getName: function() {},
        getAge: function() {}
      });

      Parent.staticMethod = function() {};

      var Child = Core.Class(Parent, {
        getName: function() {}
      });


      var instanceParent = new Parent();
      var instanceChild = new Child();
      //子类继承父类方法
      expect(instanceChild.getAge).to.be.equal(instanceParent.getAge);
      //子类覆盖父类方法
      expect(instanceChild.getName).to.not.equal(instanceParent.getName);
      //子类找父类
      expect(Child.superclass).to.be.equal(Parent);
      //子类继承父类静态方法
      expect(Child.staticMethod).to.be.equal(Parent.staticMethod);
      //子类的构造器执行子类
      expect(instanceChild.constructor).to.be.equal(Child);
    });

    describe('#initialize()', function() {
      it('初始化', function() {
        var Klass = Core.Class({
          initialize: function() {
            this.one = 1;
          }
        });

        var instance = new Klass();

        expect(instance.one).to.be.equal(1);
      });
    });

    describe('#__propertys__()', function() {
      it('属性赋值', function() {
        var Klass = Core.Class({
          __propertys__: function() {
            this.one = 1;
          }
        });

        var instance = new Klass();
        expect(instance.one).to.be.equal(1);
      });

      it('子类继承父类属性', function() {
        var Parent = Core.Class({
          __propertys__: function() {
            this.one = 1;
            this.two = 2;
          }
        });

        var Child = Core.Class(Parent, {
          __propertys__: function() {
            this.two = 22;
          }
        });

        var instanceChild = new Child();

        expect(instanceChild.one).to.be.equal(1);
        expect(instanceChild.two).to.be.equal(22);
      });
    });
    
  });

  describe('.Extend()', function() {
    it('静态属性扩展', function() {
      var Klass = function() {};

      Core.extend(Klass, {
        key: 'value'
      });

      expect(Klass.key).to.be.equal('value');
    });

    it('混合扩展,后面参数的权重大于前面', function() {
      var Klass = function() {};

      Core.extend(Klass, {
        key: 'value' 
      }, {
        key1: 'value1',
        key: 'valuevalue'
      });

      expect(Klass.key).to.be.equal('valuevalue');
      expect(Klass.key1).to.be.equal('value1');
    });
  });

  describe('.implement()', function() {
    it('对原型链的扩充', function() {
      var Klass = function() {};

      Core.implement(Klass, {
        key: 'value',
        key1: function() {}
      });

      expect(Klass.prototype.key).to.be.equal('value');
      expect(Klass.prototype.key1).to.be.an('function');
    });
  });
});