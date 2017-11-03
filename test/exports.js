const expect = require('expect.js');

var _cleanRequire = function() {
  delete String.prototype.format;
  Object.keys(require.cache).forEach(function(name){
    if (name.match(/^.*\/format-spec.js$/)) { 
      delete require.cache[name];
    }
  });
};
describe('exports', function(){
  before(_cleanRequire);
  afterEach(_cleanRequire);
  it('exports a function with the correct API', function(){
    var format_spec = require('../format-spec');
    expect(format_spec).to.be.a(Function);
    expect(format_spec._format).to.be.a(Function);
    expect(format_spec.bindGlobal).to.be.a(Function);
    expect(format_spec.unbindGlobal).to.be.a(Function);

  })
  it('replaces String.prototype.format', function(){
    expect(String.prototype.format).to.be(undefined);
    var format_spec = require('../format-spec');
    expect(String.prototype.format).to.be(format_spec._format);
  });
  it('binds and unbinds arbitrary names to String.prototype', function(){
    var format_spec = require('../format-spec');
    expect(String.prototype.glumper).to.be(undefined);
    format_spec.bindGlobal('glumper');
    expect(String.prototype.glumper).to.be(format_spec._format);
    format_spec.unbindGlobal('glumper');
    expect(String.prototype.glumper).to.be(undefined);
  });
  it("remembers what was bound before the module loaded if unbinding is requested", function() {
    String.prototype.format = 'glumper';
    var format_spec = require('../format-spec');
    expect(String.prototype.format).to.be(format_spec._format);
    format_spec.unbindGlobal();
    expect(String.prototype.format).to.be('glumper');
  });
  it('(and the tests should have cleaned up as well)', function() {
    expect(String.prototype.format).to.be(undefined);
  })
});