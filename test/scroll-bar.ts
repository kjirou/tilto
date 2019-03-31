import * as assert from 'assert';

import {
  createDefaultElementStyle,
  createElementBody,
  createMatrix,
  parseContent,
  renderMatrix,
} from '../src/matrix';
import {
  placeScrollBar,
} from '../src/scroll-bar';

const ansiStyles = require('ansi-styles');

describe('scroll-bar', function() {
  const trackElementBody = createElementBody('|');
  const thumbElementBody = createElementBody('#');

  describe('placeScrollBar', function() {
    it('should draw a scroll bar the same as the height of the matrix if there is no content', function() {
      const matrix = createMatrix({width: 3, height: 2});
      const result = placeScrollBar(matrix, parseContent('', c => 1), 0, trackElementBody, thumbElementBody);
      assert.strictEqual(
        renderMatrix(result.matrix, '.'),
        [
          '..#',
          '..#',
        ].join('\n')
      );
    });

    it('should draw a scroll bar the same as the height of the matrix if the content fits', function() {
      const matrix = createMatrix({width: 3, height: 2});
      const result = placeScrollBar(matrix, parseContent('a', c => 1), 0, trackElementBody, thumbElementBody);
      assert.strictEqual(
        renderMatrix(result.matrix, '.'),
        [
          '..#',
          '..#',
        ].join('\n')
      );
    });

    it('can change the style of the scroll bar', function() {
      const {bgWhite, bgYellow, reset} = ansiStyles;
      const matrix = createMatrix({width: 1, height: 2});
      const ansiTrackElementBody = {
        symbol: ' ',
        style: Object.assign(createDefaultElementStyle(), {
          backgroundColor: 'bgWhite',
        }),
      };
      const ansiThumbElementBody = {
        symbol: ' ',
        style: Object.assign(createDefaultElementStyle(), {
          backgroundColor: 'bgYellow',
        }),
      };
      const result = placeScrollBar(
        matrix, parseContent('\n\n\n', c => 1), 0, ansiTrackElementBody, ansiThumbElementBody);
      assert.strictEqual(
        renderMatrix(result.matrix, '.'),
        [
          bgYellow.open + ' ' + reset.close,
          bgWhite.open + ' ' + reset.close,
        ].join('\n')
      );
    });

    describe('scroll bar movement', function() {
      describe('when the height of scroll bar is 1', function() {
        const matrix = createMatrix({width: 1, height: 5});
        const content = '\n'.repeat(54);  // 55 rows
        const elements = parseContent(content, c => 1);

        [
          {scrollY:  0, expected: ['#', '|', '|', '|', '|'].join('\n')},
          {scrollY:  9, expected: ['#', '|', '|', '|', '|'].join('\n')},
          {scrollY: 10, expected: ['|', '#', '|', '|', '|'].join('\n')},
          {scrollY: 19, expected: ['|', '#', '|', '|', '|'].join('\n')},
          {scrollY: 20, expected: ['|', '|', '#', '|', '|'].join('\n')},
          {scrollY: 29, expected: ['|', '|', '#', '|', '|'].join('\n')},
          {scrollY: 30, expected: ['|', '|', '|', '#', '|'].join('\n')},
          {scrollY: 39, expected: ['|', '|', '|', '#', '|'].join('\n')},
          {scrollY: 40, expected: ['|', '|', '|', '|', '#'].join('\n')},
          {scrollY: 49, expected: ['|', '|', '|', '|', '#'].join('\n')},
          {scrollY: 50, expected: ['|', '|', '|', '|', '#'].join('\n')},
          {scrollY: 99, expected: ['|', '|', '|', '|', '#'].join('\n')},
        ].forEach(function({scrollY, expected}) {
          it(`scrollY=${scrollY}`, function() {
            const result = placeScrollBar(matrix, elements, scrollY, trackElementBody, thumbElementBody);
            assert.strictEqual(
              renderMatrix(result.matrix, '.'),
              expected
            );
          });
        });
      });

      describe('when the height of scroll bar is not 1', function() {
        const matrix = createMatrix({width: 1, height: 5});
        const content = '\n'.repeat(7);  // 8 rows
        const elements = parseContent(content, c => 1);

        [
          {scrollY:  0, expected: ['#', '#', '#', '#', '|'].join('\n')},
          {scrollY:  1, expected: ['#', '#', '#', '#', '|'].join('\n')},
          {scrollY:  2, expected: ['|', '#', '#', '#', '#'].join('\n')},
          {scrollY:  3, expected: ['|', '#', '#', '#', '#'].join('\n')},
          {scrollY:  4, expected: ['|', '#', '#', '#', '#'].join('\n')},
        ].forEach(function({scrollY, expected}) {
          it(`scrollY=${scrollY}`, function() {
            const result = placeScrollBar(matrix, elements, scrollY, trackElementBody, thumbElementBody);
            assert.strictEqual(
              renderMatrix(result.matrix, '.'),
              expected
            );
          });
        });
      });
    });
  });
});
