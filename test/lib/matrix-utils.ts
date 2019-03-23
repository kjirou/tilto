import * as assert from 'assert';

import {
  createBoxFromText,
  defaultSymbolRuler,
} from '../../src/lib/box-utils';
import {
  Matrix,
  parseContentToSymbols,
  createMatrix,
  createMatrixFromText,
  cropMatrix,
  overwriteMatrix,
  pourContent,
  toText,
} from '../../src/lib/matrix-utils';

const chalk = require('chalk');


describe('lib/matrix-utils', function() {
  describe('toText', function() {
    it('works', function() {
      const matrix = createMatrix({width: 2, height: 3}, '.');
      assert.strictEqual(toText(matrix, 'x'), [
        '..',
        '..',
        '..',
      ].join('\n'));
    });

    it('replaces null symbols to the default symbol', function() {
      const matrix = createMatrix({width: 2, height: 3}, null);
      assert.strictEqual(toText(matrix, 'x'), [
        'xx',
        'xx',
        'xx',
      ].join('\n'));
    });

    it('replaces false symbols to blank', function() {
      const matrix = createMatrix({width: 2, height: 3}, null);
      matrix[0][0].symbol = false;
      matrix[2][1].symbol = false;
      assert.strictEqual(toText(matrix, '.'), [
        '.',
        '..',
        '.',
      ].join('\n'));
    });

    it('can render single byte ANSI characters', function() {
      const matrix = createMatrix({width: 2, height: 2}, null);
      matrix[0][0].symbol = chalk.red('a');
      matrix[1][1].symbol = chalk.red.underline.inverse('b');
      assert.strictEqual(toText(matrix, '.'), [
        chalk.red('a') + '.',
        '.' + chalk.red.underline.inverse('b'),
      ].join('\n'));
    });
  });

  describe('overwriteMatrix', function() {
    it('works', function() {
      let matrix = createMatrix({width: 5, height: 7}, '.');
      const replacer = createMatrix({width: 2, height: 3}, 'x');
      matrix = overwriteMatrix(matrix, replacer, {x: 1, y: 2}, (symbol) => 1);
      assert.strictEqual(toText(matrix, ''), [
        '.....',
        '.....',
        '.xx..',
        '.xx..',
        '.xx..',
        '.....',
        '.....',
      ].join('\n'));
    });

    it('does not overwrite if the replacer width is 0', function() {
      const matrix = createMatrix({width: 2, height: 2}, '.');
      const replacer = createMatrix({width: 0, height: 1}, 'x');
      const newMatrix = overwriteMatrix(matrix, replacer, {x: 0, y: 0}, (symbol) => 1);
      assert.deepStrictEqual(matrix, newMatrix);
    });

    it('does not overwrite if the replacer height is 0', function() {
      const matrix = createMatrix({width: 2, height: 2}, '.');
      const replacer = createMatrix({width: 1, height: 0}, 'x');
      const newMatrix = overwriteMatrix(matrix, replacer, {x: 0, y: 0}, (symbol) => 1);
      assert.deepStrictEqual(matrix, newMatrix);
    });

    describe('multibyte fragments deletion', function() {
      let matrix: Matrix;
      let replacer: Matrix;

      beforeEach(function() {
        matrix = createMatrixFromText([
          '....',
          '....',
          '....',
        ].join('\n'));
        replacer = createMatrixFromText([
          'xx',
          'xx',
        ].join('\n'));
      });

      it('1', function() {
        replacer[0][0].symbol = false;
        const newMatrix = overwriteMatrix(matrix, replacer, {x: 2, y: 1}, defaultSymbolRuler);

        assert.strictEqual(toText(newMatrix, '-'), [
          '....',
          '..-x',
          '..xx',
        ].join('\n'));
      });

      it('2', function() {
        replacer[1][1].symbol = 'あ';
        const newMatrix = overwriteMatrix(matrix, replacer, {x: 0, y: 0}, defaultSymbolRuler);

        assert.strictEqual(toText(newMatrix, '-'), [
          'xx..',
          'x-..',
          '....',
        ].join('\n'));
      });

      it('3', function() {
        matrix[1][0].symbol = 'あ';
        const newMatrix = overwriteMatrix(matrix, replacer, {x: 1, y: 1}, defaultSymbolRuler);

        assert.strictEqual(toText(newMatrix, '-'), [
          '....',
          '-xx.',
          '.xx.',
        ].join('\n'));
      });

      it('4', function() {
        matrix[2][2].symbol = false;
        const newMatrix = overwriteMatrix(matrix, replacer, {x: 0, y: 1}, defaultSymbolRuler);

        assert.strictEqual(toText(newMatrix, '-'), [
          '....',
          'xx..',
          'xx-.',
        ].join('\n'));
      });
    });
  });

  describe('cropMatrix', function() {
    const box = createBoxFromText([
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

  //describe('parseContentToSymbols', function() {
  //  it('works', function() {
  //    const content = 'a' + chalk.red('bc') + 'd';
  //    const symbols = parseContentToSymbols(content);
  //    assert.strictEqual(symbols[0], 'a');
  //    assert.strictEqual(symbols[1], chalk.red('b'));
  //    assert.strictEqual(symbols[2], chalk.red('c'));
  //    assert.strictEqual(symbols[3], 'd');
  //  });
  //});

  describe('pourContent', function() {
    let matrix: Matrix;

    beforeEach(function() {
      matrix = createMatrix({width: 4, height: 3}, null);
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
        matrix = pourContent(matrix, 'あ\n\nいうえ', defaultSymbolRuler);
        assert.strictEqual(toText(matrix, '.'), [
          'あ..',
          '....',
          'いう',
        ].join('\n'));
      });

      it('breaks the line automatically', function() {
        matrix = pourContent(matrix, 'あいうえおかき', defaultSymbolRuler);
        assert.strictEqual(toText(matrix, '.'), [
          'あい',
          'うえ',
          'おか',
        ].join('\n'));
      });

      it('breaks the line automatically even when the width is not enough', function() {
        matrix = pourContent(matrix, '1あい2う3え', defaultSymbolRuler);
        assert.strictEqual(toText(matrix, '.'), [
          '1あ.',
          'い2.',
          'う3.',
        ].join('\n'));
      });

      it('cuts the content if a multibyte character appear when the width is 1', function() {
        matrix = createMatrix({width: 1, height: 5}, null);
        matrix = pourContent(matrix, '12あ34', defaultSymbolRuler);
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
