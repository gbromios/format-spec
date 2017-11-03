const format = require('../format-spec');
const expect = require('expect.js');

var _case = function(result, ...args) {
  return function() {
    expect(format.apply(undefined, args)).to.equal(result);
  };
};

describe('format_spec', function() {
  it('renders an empty string as empty', _case('', ''));
  it('renders an empty string as empty, even with args', _case('', '', 1, 2, 3));
  it('renders a string with no interpolations', _case('test', 'test'));
  it('renders a string with no interpolations, even with args', _case('test', 'test', 1, 2, 3));
  it('interpolates a whole string', _case('TEST', '{}', 'TEST'));
  it('interpolates at the beginning of a string', _case('TEST test test', '{} test test', 'TEST'));
  it('interpolates in the middle of a string', _case('test TEST test', 'test {} test', 'TEST'));
  it('interpolates at the end of a string', _case('test test TEST', 'test test {}', 'TEST'));
});