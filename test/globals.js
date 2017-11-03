// make sure the String.prototype override stuff works okay

const assert = require('assert');

var _cleanRequire = function() {
  delete String.prototype.format;
  Object.keys(require.cache).forEach(function(name){
    if (name.match(/^.*\/format-spec.js$/)) { 
      console.log('found module:', name);
      delete require.cache[name];
    }
  });
};
describe('global exports', function(){
  before(_cleanRequire);
  afterEach(_cleanRequire);
  it('should replace String.prototype.format', function(){
    assert.equal(String.prototype.format, undefined);
    var fs = require('../format-spec');
    assert.equal(String.prototype.format, fs._format);
  });
  it('should bind and unbind arbitrary names to String.prototype', function(){
    var fs = require('../format-spec');
    assert.equal(String.prototype.glumper, undefined);
    fs.bindGlobal('glumper');
    assert.equal(String.prototype.glumper, fs._format);
    fs.unbindGlobal('glumper');
    assert.equal(String.prototype.glumper, undefined);
  });
  it("should remember what was bound before the module loaded if unbinding is requested", function() {
    String.prototype.format = 'glumper';
    var fs = require('../format-spec');
    assert.equal(String.prototype.format, fs._format);
    fs.unbindGlobal();
    assert.equal(String.prototype.format, 'glumper');
  });
  it('(and the tests should have cleaned up as well)', function() {
    assert.equal(String.prototype.format, undefined);
  })
});