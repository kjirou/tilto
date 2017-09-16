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

  describe('_cropMatrix', function() {
    const box = Box.fromText([
      '123',
      '456',
      '789',
      'abc',
    ].join('\n'));
    const baseMatrix = box.getMatrix();

    it('can crop the inside', function() {
      const matrix1 = Box._cropMatrix(baseMatrix, {x: 0, y: 0, width: 2, height: 3});
      assert.strictEqual(matrix1[0][0].symbol, '1');
      assert.strictEqual(matrix1[0][1].symbol, '2');
      assert.strictEqual(matrix1[1][0].symbol, '4');
      assert.strictEqual(matrix1[1][1].symbol, '5');
      assert.strictEqual(matrix1[2][0].symbol, '7');
      assert.strictEqual(matrix1[2][1].symbol, '8');

      const matrix2 = Box._cropMatrix(baseMatrix, {x: 1, y: 2, width: 2, height: 2});
      assert.strictEqual(matrix2[0][0].symbol, '8');
      assert.strictEqual(matrix2[0][1].symbol, '9');
      assert.strictEqual(matrix2[1][0].symbol, 'b');
      assert.strictEqual(matrix2[1][1].symbol, 'c');
    });

    it('should ignore the outside part', function() {
      const matrix1 = Box._cropMatrix(baseMatrix, {x: 2, y: 0, width: 2, height: 2});
      assert.strictEqual(matrix1[0][0].symbol, '3');
      assert.strictEqual(matrix1[1][0].symbol, '6');

      const matrix2 = Box._cropMatrix(baseMatrix, {x: 0, y: 3, width: 2, height: 2});
      assert.strictEqual(matrix2[0][0].symbol, 'a');
      assert.strictEqual(matrix2[0][1].symbol, 'b');
    });

    it('should return null if it can not crop at all', function() {
      const matrix = Box._cropMatrix(baseMatrix, {x: 3, y: 0, width: 2, height: 3});
      assert.strictEqual(matrix, null);
    });
  });
});
