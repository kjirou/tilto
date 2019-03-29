import * as assert from 'assert';

const ansiStyles = require('ansi-styles');

import {
  createBoxFromText,
  defaultSymbolRuler,
} from '../src/box';
import {
  Matrix,
  PourableElement,
  createDefaultElementStyle,
  createMatrix,
  createMatrixFromText,
  cropMatrix,
  decodeAnsiStyles,
  overwriteMatrix,
  parseContent,
  pourContent,
  renderMatrix,
} from '../src/matrix';


describe('matrix', function() {
  describe('overwriteMatrix', function() {
    it('works', function() {
      let matrix = createMatrix({width: 5, height: 7}, '.');
      const replacer = createMatrix({width: 2, height: 3}, 'x');
      matrix = overwriteMatrix(matrix, replacer, {x: 1, y: 2}, (symbol) => 1);
      assert.strictEqual(renderMatrix(matrix, ''), [
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

        assert.strictEqual(renderMatrix(newMatrix, '-'), [
          '....',
          '..-x',
          '..xx',
        ].join('\n'));
      });

      it('2', function() {
        replacer[1][1].symbol = 'あ';
        const newMatrix = overwriteMatrix(matrix, replacer, {x: 0, y: 0}, defaultSymbolRuler);

        assert.strictEqual(renderMatrix(newMatrix, '-'), [
          'xx..',
          'x-..',
          '....',
        ].join('\n'));
      });

      it('3', function() {
        matrix[1][0].symbol = 'あ';
        const newMatrix = overwriteMatrix(matrix, replacer, {x: 1, y: 1}, defaultSymbolRuler);

        assert.strictEqual(renderMatrix(newMatrix, '-'), [
          '....',
          '-xx.',
          '.xx.',
        ].join('\n'));
      });

      it('4', function() {
        matrix[2][2].symbol = false;
        const newMatrix = overwriteMatrix(matrix, replacer, {x: 0, y: 1}, defaultSymbolRuler);

        assert.strictEqual(renderMatrix(newMatrix, '-'), [
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

  describe('decodeAnsiStyles', function() {
    it('can decode a non-ansi string', function() {
      assert.deepStrictEqual(decodeAnsiStyles('a'), {});
    });

    it('should throw an error when it receives a not single character string', function() {
      assert.throws(function() {
        decodeAnsiStyles('ab');
      }, /single character/);
      assert.throws(function() {
        decodeAnsiStyles(`${ansiStyles.red.open}ab${ansiStyles.red.close}`);
      }, /single character/);
    });

    describe('foregroundColor', function() {
      [
        'black',
        'red',
        'green',
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white',
        // NOTE: "blackBright" will be added in the following commit.
        //       https://github.com/chalk/ansi-styles/commit/fb5b656d9fce745881c36deb8ff800b5080d9f89
        'grey',
        //'blackBright',
        'redBright',
        'greenBright',
        'yellowBright',
        'blueBright',
        'magentaBright',
        'cyanBright',
        'whiteBright',
      ].forEach(name => {
        it(name, function() {
          const styles = decodeAnsiStyles(`${ansiStyles.color[name].open}a${ansiStyles.color[name].close}`);
          assert.strictEqual(styles.foregroundColor, name);
        });
      });
    });

    describe('backgroundColor', function() {
      [
        'bgBlack',
        'bgRed',
        'bgGreen',
        'bgYellow',
        'bgBlue',
        'bgMagenta',
        'bgCyan',
        'bgWhite',
        'bgBlackBright',
        'bgRedBright',
        'bgGreenBright',
        'bgYellowBright',
        'bgBlueBright',
        'bgMagentaBright',
        'bgCyanBright',
        'bgWhiteBright',
      ].forEach(name => {
        it(name, function() {
          const styles = decodeAnsiStyles(`${ansiStyles.bgColor[name].open}a${ansiStyles.bgColor[name].close}`);
          assert.strictEqual(styles.backgroundColor, name);
        });
      });
    });

    describe('modifiers', function() {
      [
        'bold',
        'dim',
        'italic',
        'underline',
        'inverse',
        'hidden',
        'strikethrough',
      ].forEach(name => {
        it(name, function() {
          const styles = decodeAnsiStyles(`${ansiStyles[name].open}a${ansiStyles.reset.close}`) as any;
          assert.strictEqual(styles[name], true);
        });
      });
    });

    describe('Complex cases', function() {
      it('can decode both "foregroundColor" and "backgroundColor" together', function() {
        const {red, bgRed} = ansiStyles;
        const styles = decodeAnsiStyles(`${red.open}${bgRed.open}a${bgRed.close}${red.close}`);
        assert.strictEqual(styles.foregroundColor, 'red');
        assert.strictEqual(styles.backgroundColor, 'bgRed');
      });
    });
  });

  describe('parseContent', function() {
    function createPourableElement(): PourableElement {
      return {
        isLineBreaking: false,
        symbol: '',
        style: createDefaultElementStyle(),
      };
    };

    it('can parse non-ansi ascii strings', function() {
      assert.deepStrictEqual(
        parseContent('abc'),
        [
          Object.assign(createPourableElement(), {symbol: 'a'}),
          Object.assign(createPourableElement(), {symbol: 'b'}),
          Object.assign(createPourableElement(), {symbol: 'c'}),
        ]
      );
    });

    it('can parse ansi strings included some newline characters', function() {
      assert.deepStrictEqual(
        parseContent('\na\n\nbc\n'),
        [
          Object.assign(createPourableElement(), {isLineBreaking: true}),
          Object.assign(createPourableElement(), {symbol: 'a'}),
          Object.assign(createPourableElement(), {isLineBreaking: true}),
          Object.assign(createPourableElement(), {isLineBreaking: true}),
          Object.assign(createPourableElement(), {symbol: 'b'}),
          Object.assign(createPourableElement(), {symbol: 'c'}),
          Object.assign(createPourableElement(), {isLineBreaking: true}),
        ]
      );
    });

    it('can parse non-ansi multibyte strings', function() {
      assert.deepStrictEqual(
        parseContent('あいう'),
        [
          Object.assign(createPourableElement(), {symbol: 'あ'}),
          Object.assign(createPourableElement(), {symbol: 'い'}),
          Object.assign(createPourableElement(), {symbol: 'う'}),
        ]
      );
      assert.deepStrictEqual(
        parseContent('あiうeお'),
        [
          Object.assign(createPourableElement(), {symbol: 'あ'}),
          Object.assign(createPourableElement(), {symbol: 'i'}),
          Object.assign(createPourableElement(), {symbol: 'う'}),
          Object.assign(createPourableElement(), {symbol: 'e'}),
          Object.assign(createPourableElement(), {symbol: 'お'}),
        ]
      );
    });

    it('can parse non-ansi surrogate pairs', function() {
      const surrogatePair = '\ud867\ude3d';
      assert.deepStrictEqual(
        parseContent(`${surrogatePair}${surrogatePair}`),
        [
          Object.assign(createPourableElement(), {symbol: surrogatePair}),
          Object.assign(createPourableElement(), {symbol: surrogatePair}),
        ]
      );
      assert.deepStrictEqual(
        parseContent(`a${surrogatePair}あ${surrogatePair}`),
        [
          Object.assign(createPourableElement(), {symbol: 'a'}),
          Object.assign(createPourableElement(), {symbol: surrogatePair}),
          Object.assign(createPourableElement(), {symbol: 'あ'}),
          Object.assign(createPourableElement(), {symbol: surrogatePair}),
        ]
      );
    });

    it('can parse ansi multibyte strings', function() {
      const {red, bgBlue} = ansiStyles;

      assert.deepStrictEqual(
        parseContent(`a${red.open}bc${red.close}d`),
        [
          Object.assign(createPourableElement(), {symbol: 'a'}),
          Object.assign(createPourableElement(), {
            symbol: 'b',
            style: Object.assign(createDefaultElementStyle(), {foregroundColor: 'red'}),
          }),
          Object.assign(createPourableElement(), {
            symbol: 'c',
            style: Object.assign(createDefaultElementStyle(), {foregroundColor: 'red'}),
          }),
          Object.assign(createPourableElement(), {symbol: 'd'}),
        ]
      );
      assert.deepStrictEqual(
        parseContent(`あ${red.open}いc${red.close}`),
        [
          Object.assign(createPourableElement(), {symbol: 'あ'}),
          Object.assign(createPourableElement(), {
            symbol: 'い',
            style: Object.assign(createDefaultElementStyle(), {foregroundColor: 'red'}),
          }),
          Object.assign(createPourableElement(), {
            symbol: 'c',
            style: Object.assign(createDefaultElementStyle(), {foregroundColor: 'red'}),
          }),
        ]
      );
      assert.deepStrictEqual(
        parseContent(`a${red.open}b${bgBlue.open}c${bgBlue.close}${red.close}d`),
        [
          Object.assign(createPourableElement(), {symbol: 'a'}),
          Object.assign(createPourableElement(), {
            symbol: 'b',
            style: Object.assign(createDefaultElementStyle(), {foregroundColor: 'red'}),
          }),
          Object.assign(createPourableElement(), {
            symbol: 'c',
            style: Object.assign(createDefaultElementStyle(), {foregroundColor: 'red', backgroundColor: 'bgBlue'}),
          }),
          Object.assign(createPourableElement(), {symbol: 'd'}),
        ]
      );
    });
  });

  describe('pourContent', function() {
    let matrix: Matrix;

    beforeEach(function() {
      matrix = createMatrix({width: 4, height: 3}, null);
    });

    it('works', function() {
      matrix = pourContent(matrix, '12345\nabc', () => 1);
      assert.strictEqual(renderMatrix(matrix, '.'), [
        '1234',
        '5...',
        'abc.',
      ].join('\n'));
    });

    it('ignores zero-width symbols', function() {
      matrix = pourContent(matrix, '1234aaa567aaa8aaa9', function(symbol) {
        return symbol === 'a' ? 0 : 1;
      });
      assert.strictEqual(renderMatrix(matrix, '.'), [
        '1234',
        '5678',
        '9...',
      ].join('\n'));
    });

    describe('multibytes characters', function() {
      it('reduces space considering the width of multibytes', function() {
        matrix = pourContent(matrix, 'あ\n\nいうえ', defaultSymbolRuler);
        assert.strictEqual(renderMatrix(matrix, '.'), [
          'あ..',
          '....',
          'いう',
        ].join('\n'));
      });

      it('breaks the line automatically', function() {
        matrix = pourContent(matrix, 'あいうえおかき', defaultSymbolRuler);
        assert.strictEqual(renderMatrix(matrix, '.'), [
          'あい',
          'うえ',
          'おか',
        ].join('\n'));
      });

      it('breaks the line automatically even when the width is not enough', function() {
        matrix = pourContent(matrix, '1あい2う3え', defaultSymbolRuler);
        assert.strictEqual(renderMatrix(matrix, '.'), [
          '1あ.',
          'い2.',
          'う3.',
        ].join('\n'));
      });

      it('cuts the content if a multibyte character appear when the width is 1', function() {
        matrix = createMatrix({width: 1, height: 5}, null);
        matrix = pourContent(matrix, '12あ34', defaultSymbolRuler);
        assert.strictEqual(renderMatrix(matrix, '.'), [
          '1',
          '2',
          '.',
          '.',
          '.',
        ].join('\n'));
      });
    });
  });

  describe('renderMatrix', function() {
    it('works', function() {
      const matrix = createMatrix({width: 2, height: 3}, '.');
      assert.strictEqual(renderMatrix(matrix, 'x'), [
        '..',
        '..',
        '..',
      ].join('\n'));
    });

    it('replaces null symbols to the default symbol', function() {
      const matrix = createMatrix({width: 2, height: 3}, null);
      assert.strictEqual(renderMatrix(matrix, 'x'), [
        'xx',
        'xx',
        'xx',
      ].join('\n'));
    });

    it('replaces false symbols to blank', function() {
      const matrix = createMatrix({width: 2, height: 3}, null);
      matrix[0][0].symbol = false;
      matrix[2][1].symbol = false;
      assert.strictEqual(renderMatrix(matrix, '.'), [
        '.',
        '..',
        '.',
      ].join('\n'));
    });

    it('can render single byte ANSI characters', function() {
      const {blue, reset, underline} = ansiStyles;
      let matrix = createMatrix({width: 2, height: 2}, null);
      matrix = pourContent(matrix, `a${blue.open}${underline.open}bc${reset.close}d`, defaultSymbolRuler);
      assert.strictEqual(renderMatrix(matrix, '.'), [
        `a${blue.open}${underline.open}b${reset.close}`,
        `${blue.open}${underline.open}c${reset.close}d`,
      ].join('\n'));
    });
  });
});
