describe('base', function() {
  var cBase;

  beforeEach(function(done) {
    requirejs([
      'cBase',
    ], function(mod) {
      cBase = mod;
      done();
    });
  });
describe('.getinstance()', function() {
    it('得到实例', function() {
      var baseinstance = new cBase;
      baseinstance.Base.
      var parentInstance = new Parent; 
      expect(Parent).to.be.an('function');
      expect(parentInstance instanceof Parent).to.be.true;
      expect(parentInstance.constructor === Parent).to.be.true;
    });

});

});