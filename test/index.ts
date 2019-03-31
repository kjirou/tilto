/**
 * This test file is also used as a test of whether the public APIs are sufficient.
 * Therefore, the values to be tested MUST be created only with the public APIs.
 */

import * as assert from 'assert';

import {
  createBox,
  createElementBody,
  getHeight,
  getMaxX,
  getMaxY,
  getWidth,
  render,
  setBorderType,
} from '../src/index';

const ansiStyles = require('ansi-styles');

describe('index', function() {
  describe('render', function() {
    describe('content', function() {
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

    describe('borders', function() {
      describe('setBorderType', function() {
        it('can render the "default" type', function() {
          let box = createBox({width: 5, height: 4});
          box = setBorderType(box, 'default');

          assert.strictEqual(
            render(box),
            [
              '+---+',
              '|   |',
              '|   |',
              '+---+',
            ].join('\n')
          );
        });
      });
    });

    describe('scroll bar', function() {
      const box = createBox({width: 3, height: 2});

      it('can render the default scroll bar', function() {
        box.scroll = {y: 0};
        assert.strictEqual(
          render(box),
          [
            '  #',
            '  #',
          ].join('\n')
        );
      });

      it('should scroll the content in sync with the scroll bar', function() {
        box.content = '00112233';
        box.scroll = {y: 2};
        assert.strictEqual(
          render(box),
          [
            '22|',
            '33#',
          ].join('\n')
        );
      });

      it('can change the appearance of the scroll bar', function() {
        box.content = '\n\n\n';
        box.scroll = {
          y: 0,
          trackElement: createElementBody('a'),
          thumbElement: createElementBody('b'),
        };
        assert.strictEqual(
          render(box),
          [
            '  b',
            '  a',
          ].join('\n')
        );
      });
    });

    describe('children', function() {
      it('can have a child', function() {
        const box = createBox({width: 8, height: 5});
        const child = createBox({x: 3, y: 1, width: 4, height: 3}, {defaultSymbol: '.'});
        box.children.push(child);
        assert.strictEqual(
          render(box),
          [
            '        ',
            '   .... ',
            '   .... ',
            '   .... ',
            '        ',
          ].join('\n')
        );
      });

      it('should make the older brother is overwritten with the younger one', function() {
        const box = createBox({width: 8, height: 5});
        const child1 = createBox({x: 3, y: 1, width: 4, height: 3}, {defaultSymbol: '1'});
        const child2 = createBox({x: 2, width: 2, height: 5}, {defaultSymbol: '2'});
        box.children = [child1, child2];

        assert.strictEqual(
          render(box),
          [
            '  22    ',
            '  22111 ',
            '  22111 ',
            '  22111 ',
            '  22    ',
          ].join('\n')
        );
      });

      it('should make the winner by the higher "zIndex"', function() {
        const box = createBox({width: 2, height: 2});
        const child1 = createBox({width: 2, height: 1}, {defaultSymbol: '1'});
        child1.zIndex = 1;
        const child2 = createBox({width: 1, height: 2}, {defaultSymbol: '2'});
        box.children = [child1, child2];

        assert.strictEqual(
          render(box),
          [
            '11',
            '2 ',
          ].join('\n')
        );
      });

      it('can have children recursively', function() {
        const box = createBox({width: 3, height: 3});
        const child = createBox({width: 2, height: 2}, {defaultSymbol: '1'});
        const grandchild = createBox({width: 1, height: 1}, {defaultSymbol: '2'});
        child.children = [grandchild];
        box.children = [child];

        assert.strictEqual(
          render(box),
          [
            '21 ',
            '11 ',
            '   ',
          ].join('\n')
        );
      });
    });

    describe('complex cases', function() {
      it('should apply scroll bars after borders', function() {
        let box = createBox({width: 5, height: 4});
        box = setBorderType(box, 'default');
        box.content = 'abc';
        box.scroll = {y: 0};
        assert.strictEqual(
          render(box),
          [
            '+---+',
            '|ab#|',
            '|c #|',
            '+---+',
          ].join('\n')
        );
      });

      it('should ignore borders if there is no place', function() {
        let box1 = createBox({width: 1, height: 2});
        box1 = setBorderType(box1, 'default');
        assert.strictEqual(
          render(box1),
          [
            ' ',
            ' ',
          ].join('\n')
        );

        let box2 = createBox({width: 2, height: 1});
        box2 = setBorderType(box2, 'default');
        assert.strictEqual(
          render(box2),
          '  '
        );
      });

      it('should ignore scroll bars if there is no place', function() {
        let box = createBox({width: 2, height: 3});
        box = setBorderType(box, 'default');
        box.scroll = {y: 0};
        assert.strictEqual(
          render(box),
          [
            '++',
            '||',
            '++',
          ].join('\n')
        );
      });
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
