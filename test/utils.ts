import * as assert from 'assert';

const ansiStyles = require('ansi-styles');

import {
  decodeAnsiStyles,
} from '../src/utils';

describe('utils', function() {
  describe('decodeAnsiStyles', function() {
    it('can decode a non-ansi string', function() {
      assert.deepStrictEqual(decodeAnsiStyles('a'), {
        foregroundColor: undefined,
        backgroundColor: undefined,
        bold: false,
        dim: false,
        italic: false,
        underline: false,
        inverse: false,
        hidden: false,
        strikethrough: false,
      });
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
});
