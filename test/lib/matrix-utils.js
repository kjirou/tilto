const assert = require('assert');

const boxUtils = require('../../lib/box-utils');
const {
  cropMatrix,
  initializeMatrix,
  overwriteMatrix,
  toText,
} = require('../../lib/matrix-utils');


describe('lib/matrix-utils', function() {
  describe('toText', function() {
    it('works', function() {
      const matrix = initializeMatrix({width: 2, height: 3}, '.');
      assert.strictEqual(toText(matrix), [
        '..',
        '..',
        '..',
      ].join('\n'));
    });
  });

  describe('overwriteMatrix', function() {
    it('works', function() {
      let matrix = initializeMatrix({width: 5, height: 7}, '.');
      const replacer = initializeMatrix({width: 2, height: 3}, 'x');
      matrix = overwriteMatrix(matrix, replacer, {x: 1, y: 2});
      assert.strictEqual(toText(matrix), [
        '.....',
        '.....',
        '.xx..',
        '.xx..',
        '.xx..',
        '.....',
        '.....',
      ].join('\n'));
    });
  });

  describe('cropMatrix', function() {
    const box = boxUtils.initializeBoxFromText([
      '123',
      '456',
      '789',
      'abc',
    ].join('\n'));
    const baseMatrix = box.matrix;

    it('can crop the inside', function() {
      const matrix1 = cropMatrix(baseMatrix, {x: 0, y: 0, width: 2, height: 3});
      assert.strictEqual(matrix1[0][0].symbol, '1');
      assert.strictEqual(matrix1[0][1].symbol, '2');
      assert.strictEqual(matrix1[1][0].symbol, '4');
      assert.strictEqual(matrix1[1][1].symbol, '5');
      assert.strictEqual(matrix1[2][0].symbol, '7');
      assert.strictEqual(matrix1[2][1].symbol, '8');

      const matrix2 = cropMatrix(baseMatrix, {x: 1, y: 2, width: 2, height: 2});
      assert.strictEqual(matrix2[0][0].symbol, '8');
      assert.strictEqual(matrix2[0][1].symbol, '9');
      assert.strictEqual(matrix2[1][0].symbol, 'b');
      assert.strictEqual(matrix2[1][1].symbol, 'c');
    });

    it('should ignore the outside part', function() {
      const matrix1 = cropMatrix(baseMatrix, {x: 2, y: 0, width: 2, height: 2});
      assert.strictEqual(matrix1[0][0].symbol, '3');
      assert.strictEqual(matrix1[1][0].symbol, '6');

      const matrix2 = cropMatrix(baseMatrix, {x: 0, y: 3, width: 2, height: 2});
      assert.strictEqual(matrix2[0][0].symbol, 'a');
      assert.strictEqual(matrix2[0][1].symbol, 'b');
    });

    it('should return null if it can not crop at all', function() {
      const matrix = cropMatrix(baseMatrix, {x: 3, y: 0, width: 2, height: 3});
      assert.strictEqual(matrix, null);
    });
  });
});
