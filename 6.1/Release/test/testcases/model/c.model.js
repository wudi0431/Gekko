describe('model', function () {
    var Model;
    var Base;
    
    beforeEach(function (done) {
        requirejs([
      'cModel',
      'cBase'
    ], function (cModel, cBase) {
        Model = cModel;
        Base = cBase;
        done();
    });
    });



    describe('#excute()', function () {
        var server;

        beforeEach(function () {
            server = sinon.fakeServer.create();
            //伪造服务器
            server.respondWith('POST', 'http://m.ctrip.com/restapi/get/list', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
            head: { auth: '', errcode: 0 }
        })
      ]);
        });

        afterEach(function () {
            server.restore();
        });


        it('触发error函数', function () {
            var ModelCase = new Base.Class(Model, {
                __propertys__: function () {
                    this.url = '/get/list';
                    this.param = {};
                },
                initialize: function ($super, options) {
                    $super(options);
                }
            });

            var book = ModelCase.getInstance();
            var result;
            book.excute(function () {
                result = 'sucess';
            }, function () {
                result = 'error'
            });

            //服务器响应
            server.respond();

            expect(result).to.be.an('error');


        });

    });


    describe('#getTag()', function () {
        var server;

        beforeEach(function () {
            server = sinon.fakeServer.create();
            //伪造服务器
            server.respondWith('POST', 'http://m.ctrip.com/restapi/get/list', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
            head: { auth: '', errcode: 0 }
        })
      ]);
        });

        afterEach(function () {
            server.restore();
        });


        it('得到的Tag是否正确', function () {
            var ModelCase = new Base.Class(Model, {
                __propertys__: function () {
                    this.url = 'http://m.ctrip.com/restapi/get/list';
                    this.param = { "num": "2" };
                },
                initialize: function ($super, options) {
                    $super(options);
                }
            });

            var book = ModelCase.getInstance();

            book.isUserData = true;
            var tpjson = book.getTag();

            expect(JSON.parse(tpjson).num).to.equal('2');
            expect(JSON.parse(tpjson)).to.have.property('cid');
        });

    });




    describe('#setParam(),#getParam()', function () {
        var server;

        beforeEach(function () {
            server = sinon.fakeServer.create();
            //伪造服务器
            server.respondWith('POST', 'http://m.ctrip.com/restapi/get/list', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
            head: { auth: '', errcode: 0 }
        })
      ]);
        });

        afterEach(function () {
            server.restore();
        });


        it('设置参数是否正确', function () {
            var ModelCase = new Base.Class(Model, {
                __propertys__: function () {
                    this.url = 'http://m.ctrip.com/restapi/get/list';
                    this.param = { "num": "2", "UserID": "2222" };
                },
                initialize: function ($super, options) {
                    $super(options);
                }
            });

            var book = ModelCase.getInstance();

            book.setParam("num", "3");
            var tpjson = book.getParam();
            expect(tpjson.num).to.equal('3');

        });

    });




});