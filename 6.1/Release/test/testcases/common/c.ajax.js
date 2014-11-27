describe('ajax', function() {
  var ajax;

  beforeEach(function(done) {
    requirejs([
      'cAjax',
    ], function(mod) {
      ajax = mod;
      done();
    });
  });

  describe('.get()', function() {
    var server;

    beforeEach(function() {
      server = sinon.fakeServer.create();
      //伪造服务器
      server.respondWith('GET', '/get/list?num=2', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify([
          { id: 1, title: '北京酒店' },
          { id: 2, title: '上海酒店' }
        ])
      ]);
    });

    afterEach(function() {
      server.restore();
    });

    it('正确请求', function() {
      var spy = sinon.spy($, 'ajax');

      ajax.get('/list', {
        key: 'value'
      });

      expect(spy.getCall(0).args[0].url).to.equal('/list');
      expect(spy.getCall(0).args[0].data).to.deep.equal({
        key: 'value'
      });

      $.ajax.restore();
    });

    it('成功函数触发', function() {
      var data;
      ajax.get('/get/list', {
        num: 2
      }, function(res) {
        data = res;
      });

      //服务器响应
      server.respond();
     
      expect(data).to.be.an('array');
      expect(data.length).to.equal(2);
    });

    it('失败函数触发', function () {
      var success;
      var error;

      ajax.get('/get/2', { }, function() {
        success = true;
      }, function() {
        error = true;
      });

      //服务器响应
      server.respond();

      expect(success).to.not.true;
      expect(error).to.be.true;
    });
   
  });

  describe('.post()', function() {
    var server;

    beforeEach(function() {
      server = sinon.fakeServer.create();
      //伪造服务器
      server.respondWith('POST', '/order', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          status: 1
        })
      ]);
    });

    afterEach(function() {
      server.restore();
    });

    it('正确请求', function() {
      var spy = sinon.spy($, 'ajax');
      var data = { key: 'value' };

      ajax.post('/order', data);

      expect(spy.calledOnce).to.be.true;
      expect(spy.getCall(0).args[0].url).to.equal('/order');
      expect(spy.getCall(0).args[0].data).to.equal(JSON.stringify(data));
      expect(spy.getCall(0).args[0].type).to.equal('POST');

      $.ajax.restore();
    });

    it('成功函数触发', function() {
      var num;
      ajax.post('/order', {}, function(res) {
        num = res;
      });

      //服务器响应
      server.respond();

      expect(num).to.deep.equal({ status: 1 }); 
    });

    it('失败函数触发', function() {
      var num;
      ajax.post('/error', {}, function(res) {
        num = res;
      }, function(err) {
        num = err;
      });

      //服务器响应
      server.respond();

      expect(num).to.be.an('object');
      expect(num.status).to.equal(404);
    });
  });

  describe('.jsonp()', function() {
    var server;

    beforeEach(function() {
      server = sinon.fakeServer.create();
      //伪造服务器
      server.respondWith('GET', 'http://www.baidu.com/', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          status: 1
        })
      ]);
    });

    afterEach(function() {
      server.restore();
    });

    it('正确请求', function() {
      var spy = sinon.spy($, 'ajax');
      var data = { key: 'value' };

      ajax.jsonp('http://www.baidu.com/', data);

      expect(spy.calledOnce).to.be.true;
      expect(spy.getCall(0).args[0].url).to.equal('http://www.baidu.com/');
      expect(spy.getCall(0).args[0].data).to.equal(JSON.stringify(data));
      expect(spy.getCall(0).args[0].type).to.equal('POST');

      console.log(spy);

      $.ajax.restore();
    });

  });
});