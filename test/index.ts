import * as assert from 'assert';

import {
  createBox,
  getHeight,
  getMaxX,
  getMaxY,
  getWidth,
  render,
} from '../src/index';

const ansiStyles = require('ansi-styles');

describe('index', function() {
  describe('render', function() {
    it('can render content that mixes multiple special characters', function() {
      const {red, reset} = ansiStyles;
      const surrogatePair = '\ud867\ude3d';
      const box = createBox({width: 7, height: 2});
      box.content = `${surrogatePair}cdefあ${red.open}いう${red.close}e`;
      assert.strictEqual(
        render(box),
        [
          `${surrogatePair}cdef `,
          `あ${red.open}い${reset.close}${red.open}う${reset.close}e`,
        ].join('\n')
      );
    });
  });

  describe('getWidth, getHeight, getMaxX, getMaxY', function() {
    const box = createBox({width: 7, height: 5});

    it('getWidth', function() {
      assert.strictEqual(getWidth(box), 7);
    });

    it('getHeight', function() {
      assert.strictEqual(getHeight(box), 5);
    });

    it('getMaxX', function() {
      assert.strictEqual(getMaxX(box), 6);
    });

    it('getMaxY', function() {
      assert.strictEqual(getMaxY(box), 4);
    });
  });
});
