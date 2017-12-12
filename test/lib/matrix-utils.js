const assert = require('assert');

const boxUtils = require('../../lib/box-utils');
const {
  cropMatrix,
  initializeMatrix,
  overwriteMatrix,
  pourContent,
  toText,
} = require('../../lib/matrix-utils');


describe('lib/matrix-utils', function() {
  describe('toText', function() {
    it('works', function() {
      const matrix = initializeMatrix({width: 2, height: 3}, '.');
      assert.strictEqual(toText(matrix, 'x'), [
        '..',
        '..',
        '..',
      ].join('\n'));
    });

    it('replaces null symbols to the default symbol', function() {
      const matrix = initializeMatrix({width: 2, height: 3}, null);
      assert.strictEqual(toText(matrix, 'x'), [
        'xx',
        'xx',
        'xx',
      ].join('\n'));
    });

    it('replaces false symbols to blank', function() {
      const matrix = initializeMatrix({width: 2, height: 3}, null);
      matrix[0][0].symbol = false;
      matrix[2][1].symbol = false;
      assert.strictEqual(toText(matrix, '.'), [
        '.',
        '..',
        '.',
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

    it('should return [] if it can not crop at all', function() {
      const matrix = cropMatrix(baseMatrix, {x: 3, y: 0, width: 2, height: 3});
      assert.deepStrictEqual(matrix, []);
    });
  });

  describe('pourContent', function() {
    let matrix;

    beforeEach(function() {
      matrix = initializeMatrix({width: 4, height: 3}, null);
    });

    it('works', function() {
      matrix = pourContent(matrix, '12345\nabc', () => 1);
      assert.strictEqual(toText(matrix, '.'), [
        '1234',
        '5...',
        'abc.',
      ].join('\n'));
    });

    it('ignores zero-width symbols', function() {
      matrix = pourContent(matrix, '1234aaa567aaa8aaa9', function(symbol) {
        return symbol === 'a' ? 0 : 1;
      });
      assert.strictEqual(toText(matrix, '.'), [
        '1234',
        '5678',
        '9...',
      ].join('\n'));
    });

    describe('multibytes characters', function() {
      it('reduces space considering the width of multibytes', function() {
        matrix = pourContent(matrix, 'あ\n\nいうえ', boxUtils._defaultSymbolRuler);
        assert.strictEqual(toText(matrix, '.'), [
          'あ..',
          '....',
          'いう',
        ].join('\n'));
      });

      it('breaks the line automatically', function() {
        matrix = pourContent(matrix, 'あいうえおかき', boxUtils._defaultSymbolRuler);
        assert.strictEqual(toText(matrix, '.'), [
          'あい',
          'うえ',
          'おか',
        ].join('\n'));
      });

      it('breaks the line automatically even when the width is not enough', function() {
        matrix = pourContent(matrix, '1あい2う3え', boxUtils._defaultSymbolRuler);
        assert.strictEqual(toText(matrix, '.'), [
          '1あ.',
          'い2.',
          'う3.',
        ].join('\n'));
      });

      it('cuts the content if a multibyte character appear when the width is 1', function() {
        matrix = initializeMatrix({width: 1, height: 5}, null);
        matrix = pourContent(matrix, '12あ34', boxUtils._defaultSymbolRuler);
        assert.strictEqual(toText(matrix, '.'), [
          '1',
          '2',
          '.',
          '.',
          '.',
        ].join('\n'));
      });
    });
  });
});
