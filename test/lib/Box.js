const assert = require('assert');

const Box = require('../../lib/Box');


describe('lib/Box', function() {
  describe('constructor', function() {
    it('should not throw an error', function() {
      assert.doesNotThrow(() => {
        new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      });
    });

    it('should throw an error if matrix has no height', function() {
      assert.throws(() => {
        new Box({x: 0, y: 0, width: 3, height: 0}, {symbol: 'x'});
      }, /size/);
    });

    it('should throw an error if matrix has no width', function() {
      assert.throws(() => {
        new Box({x: 0, y: 0, width: 0, height: 4}, {symbol: 'x'});
      }, /size/);
    });
  });

  describe('fromText', function() {
    it('works (1)', function() {
      const box = Box.fromText('AB');
      assert.strictEqual(box.asString(), 'AB');
    });

    it('works (2)', function() {
      const box = Box.fromText('AB\nCD\nEF');
      assert.strictEqual(box.asString(), 'AB\nCD\nEF');
    });

    it('should remove the last new line character', function() {
      const box = Box.fromText('AB\nCD\nEF\n');
      assert.strictEqual(box.asString(), 'AB\nCD\nEF');
    });
  });
});
