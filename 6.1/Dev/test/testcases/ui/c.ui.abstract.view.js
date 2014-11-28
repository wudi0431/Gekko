describe('ui.abstract.view', function() {
  var AbstractView;

  beforeEach(function(done) {
    requirejs([
      'cUIAbstractView'
    ], function(mod) {
      AbstractView = mod;
      done();
    })
  });

  describe('#initialize(), #__propertys__()', function() {
    it('构造函数初始化', function() {
      var view = new AbstractView({
        classNames: 'cui-calendar'
      });

      expect(view.id).to.be.a('string');
      expect(view.isCreate).to.be.false;
      expect(view.allowEvents).to.be.an('object');
      expect(view.allowsPush).to.be.an('object');
      expect(view.allowsConfig).to.be.an('object');
      expect(view.classNames[1]).to.be.equal('cui-calendar');
    });

    it('初始化添加基本事件', function() {
      var status;
      var view = new AbstractView({
        onCreate: function() {
          status = 'created';
        },
        onShow: function() {
          status = 'show';
        },
        onHide: function() {
          status = 'hide';
        }
      });

      view.trigger('onCreate');
      expect(status).to.be.equal('created');

      view.trigger('onShow');
      expect(status).to.be.equal('show');

      view.trigger('onHide');
      expect(status).to.be.equal('hide');
    });

  });

  describe('#rootBox', function() {
    it('默认为body', function() {
      var view = new AbstractView({});

      expect(view.rootBox.is('body')).to.be.true;
    });

    it('设置rootBox', function() {
      var div = $('<div>');
      var view = new AbstractView({
        rootBox: div
      });

      expect(view.rootBox).to.be.equal(div);
    });
  });

  describe('#addEvent()', function() {
    it('直接增加事件无效', function() {
      var num = 0;
      var view = new AbstractView({
      });

      view.addEvent('onRemove', function() {
        num++;
      });
      view.trigger('onRemove');

      expect(num).to.be.equal(0);
    });

    it('先增加事件类型，然后添加事件', function() {
      var num = 0;
      var view = new AbstractView({
      });

      view.addEventType('onRemove');
      view.addEvent('onRemove', function() {
        num++;
      });
      view.trigger('onRemove');

      expect(num).to.be.equal(1);
    });
  });

  describe('#removeEvent()', function() {
    it('移除某个事件所有监听函数', function() {
      var num = 0;
      var view = new AbstractView({
        onCreate: function() {
          num++;
        }
      });

      function callback() {
        num++;
      }

      view.addEvent('onCreate', callback);
      view.removeEvent('onCreate');
      view.trigger('onCreate');
      expect(num).to.be.equal(0);
    });

    it('移除移除某个事件的一个函数', function() {
      var num = 0;
      var view = new AbstractView({
        onCreate: function() {
          num++;
        }
      });

      function callback() {
        num++;
      }

      view.addEvent('onCreate', callback);
      view.removeEvent('onCreate', callback);
      view.trigger('onCreate');
      expect(num).to.be.equal(1);
    });
  });

  describe('#trigger()', function() {
    it('带参数的触发函数', function() {
      var num;
      var view = new AbstractView({
        onCreate: function(arg) {
          num = arg;
        }
      });

      view.trigger('onCreate', 1);
      expect(num).to.be.equal(1);
    });
  });

  describe('#create()', function() {
    it('创建html', function() {
      var rootBox = $('<div>');
      var view = new AbstractView({
        rootBox: rootBox
      });

      view.createHtml = function() {
        return _.template('<h2><%= title %></h2>', {
          title: '标题'
        });
      }

      view.create();

      expect(view.isCreate).to.true;
      expect(view.root.html()).to.be.equal('<h2>标题</h2>');
    });

    it('触发onCreate, this指向实例化对象', function() {
      var rootBox = $('<div>');
      var status;
      var self;
      var view = new AbstractView({
        rootBox: rootBox,
        onCreate: function() {
          status = 'created';
          self = this;
        }
      });

      view.createHtml = function() {
        return 'html';
      }

      view.create();

      expect(status).to.be.equal('created');
      expect(self).to.be.equal(view);
    });
  });

  describe('#show()', function() {
    it('元素显示', function() {
      var rootBox = $('<div>');
      var view = new AbstractView({
        rootBox: rootBox
      });

      view.createHtml = function() {
        return 'html';
      }

      view.show();
      expect(view.root.html()).to.be.equal('html');
      expect(view.isShow()).to.be.true;
      expect(view.root.css('display')).to.not.equal('none');
    });

    it('onShow事件测试', function() {
      var rootBox = $('<div>');
      var num = 0;
      var view = new AbstractView({
        rootBox: rootBox,
        onShow: function() {
          num++;
        }
      });

      view.createHtml = function() {
        return 'html';
      }

      view.show();
      expect(num).to.be.equal(1);
      view.show();
      expect(num).to.be.equal(1);
    });
  });

  describe('#hide()', function() {
    it('元素隐藏', function() {
      var rootBox = $('<div>');
      var view = new AbstractView({
        rootBox: rootBox
      });

      view.createHtml = function() {
        return 'html';
      }
     
      view.hide();
      expect(view.isShow()).to.be.false;
      expect(view.isHide()).to.be.true;
      expect(view.root.css('display')).to.be.equal('none');
    });

    it('onHide事件测试', function() {
      var rootBox = $('<div>');
      var num = 0;
      var view = new AbstractView({
        rootBox: rootBox,
        onHide: function() {
          num++;
        }
      });

      view.createHtml = function() {
        return 'html';
      }

      view.hide();
      expect(num).to.be.equal(1);
      view.hide();
      expect(num).to.be.equal(1);
    });
  });

  describe('#remove', function() {
    it('root元素删除', function() {
      
    });

    it('事件销毁', function() {

    });
  });

  describe('view流程测试', function() {
    it('create->show->hide', function() {
      var rootBox = $('<div>');
      var status;
      var num = 0;
      var view = new AbstractView({
        rootBox: rootBox,
        onCreate: function() {
          status = 'create';
          num++;
        },
        onShow: function() {
          status = 'show';
          num++;
        },
        onHide: function() {
          status = 'hide';
          num++;
        }
      });

      view.createHtml = function() { }

      view.create();
      expect(status).to.be.equal('create');
      expect(num).to.be.equal(1);

      view.show();
      expect(status).to.be.equal('show');
      expect(num).to.be.equal(2);
      expect(view.root.css('display')).to.not.equal('none');

      view.hide();
      expect(status).to.be.equal('hide');
      expect(num).to.be.equal(3);
      expect(view.root.css('display')).to.be.equal('none');

      view.create();
      expect(num).to.be.equal(3);
      view.hide();
      expect(num).to.be.equal(3);
      view.show();
      expect(num).to.be.equal(4);
    });

    it('show->hide', function() {
      var rootBox = $('<div>');
      var status;
      var num = 0;
      var view = new AbstractView({
        rootBox: rootBox,
        onCreate: function() {
          status = 'create';
          num++;
        },
        onShow: function() {
          status = 'show';
          num++;
        },
        onHide: function() {
          status = 'hide';
          num++;
        }
      });

      view.createHtml = function() { };

      //跳过create, show会自动创建
      view.show();
      expect(status).to.be.equal('show');
      expect(num).to.be.equal(2);
      expect(view.root.css('display')).to.not.equal('none');

      view.hide();
      expect(status).to.be.equal('hide');
      expect(num).to.be.equal(3);
      expect(view.root.css('display')).to.be.equal('none');

      view.create();
      expect(num).to.be.equal(3);
      view.hide();
      expect(num).to.be.equal(3);
      view.show();
      expect(num).to.be.equal(4);
    });
  });

});