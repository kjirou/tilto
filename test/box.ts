import * as assert from 'assert';

import {
  Box,
  createBox,
  defaultSymbolRuler,
  renderBox,
} from '../src/box';

const ansiStyles = require('ansi-styles');


describe('box', function() {
  describe('createBox', function() {
    it('should not throw an error if arguments are valid', function() {
      assert.doesNotThrow(() => {
        createBox({width: 3, height: 4}, {defaultSymbol: 'x'});
      });
    });

    it('should throw an error if matrix has no height', function() {
      assert.throws(() => {
        createBox({width: 3, height: 0}, {defaultSymbol: 'x'});
      }, /size/);
    });

    it('should throw an error if matrix has no width', function() {
      assert.throws(() => {
        createBox({width: 0, height: 4}, {defaultSymbol: 'x'});
      }, /size/);
    });
  });

  describe('defaultSymbolRuler', function() {
    it('can measure single byte character', function() {
      assert.strictEqual(defaultSymbolRuler('a'), 1);
    });

    it('can measure multibyte character', function() {
      assert.strictEqual(defaultSymbolRuler('あ'), 2);
    });

    it('can measure ANSI string', function() {
      const {red, underline} = ansiStyles;

      assert.strictEqual(
        defaultSymbolRuler(
          red.open + 'a' + red.close
        ),
        1
      );

      assert.strictEqual(
        defaultSymbolRuler(
          underline.open + 'a' + underline.close
        ),
        1
      );
    });
  });

  describe('renderBox', function() {
    describe('content pouring', function() {
      it('should overwrite the part of output where the content was poured', function() {
        const box = createBox({width: 5, height: 2});
        box.content = 'foo';
        assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
          'foo..',
          '.....',
        ].join('\n'));
      });

      it('can break lines by "\\n"', function() {
        const box = createBox({width: 5, height: 3});
        box.content = 'hello\n\nworld';
        assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
          'hello',
          '.....',
          'world',
        ].join('\n'));
      });

      it('can break lines automatically', function() {
        const box = createBox({width: 5, height: 3});
        box.content = 'helloworld!!';
        assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
          'hello',
          'world',
          '!!...',
        ].join('\n'));
      });

      it('should ignore overflowing content', function() {
        const box = createBox({width: 5, height: 2});
        box.content = 'helloworld!!';
        assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
          'hello',
          'world',
        ].join('\n'));
      });
    });

    describe('borders', function() {
      describe('each sides/corners of 1 width', function() {
        let box: Box;

        beforeEach(function() {
          box = createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: '.'});
        });

        it('can set the top side border', function() {
          box.borders.topWidth = 1;
          box.borders.topSymbols = ['*'];
          assert.strictEqual(renderBox(box), [
            '***',
            '...',
            '...',
            '...',
          ].join('\n'));
        });

        it('can set the bottom side border', function() {
          box.borders.bottomWidth = 1;
          box.borders.bottomSymbols = ['*'];
          assert.strictEqual(renderBox(box), [
            '...',
            '...',
            '...',
            '***',
          ].join('\n'));
        });

        it('can set the left side border', function() {
          box.borders.leftWidth = 1;
          box.borders.leftSymbols = ['*'];
          assert.strictEqual(renderBox(box), [
            '*..',
            '*..',
            '*..',
            '*..',
          ].join('\n'));
        });

        it('can set the right side border', function() {
          box.borders.rightWidth = 1;
          box.borders.rightSymbols = ['*'];
          assert.strictEqual(renderBox(box), [
            '..*',
            '..*',
            '..*',
            '..*',
          ].join('\n'));
        });

        it('can set the top-left corner', function() {
          box.borders.topWidth = 1;
          box.borders.leftWidth = 1;
          box.borders.topLeftSymbols = ['*'];
          assert.strictEqual(renderBox(box), [
            '*  ',
            ' ..',
            ' ..',
            ' ..',
          ].join('\n'));
        });

        it('can set the top-right corner', function() {
          box.borders.topWidth = 1;
          box.borders.rightWidth = 1;
          box.borders.topRightSymbols = ['*'];
          assert.strictEqual(renderBox(box), [
            '  *',
            '.. ',
            '.. ',
            '.. ',
          ].join('\n'));
        });

        it('can set the bottom-left corner', function() {
          box.borders.bottomWidth = 1;
          box.borders.leftWidth = 1;
          box.borders.bottomLeftSymbols = ['*'];
          assert.strictEqual(renderBox(box), [
            ' ..',
            ' ..',
            ' ..',
            '*  ',
          ].join('\n'));
        });

        it('can set the bottom-right corner', function() {
          box.borders.bottomWidth = 1;
          box.borders.rightWidth = 1;
          box.borders.bottomRightSymbols = ['*'];
          assert.strictEqual(renderBox(box), [
            '.. ',
            '.. ',
            '.. ',
            '  *',
          ].join('\n'));
        });
      });

      describe('borders in all sides', function() {
        it('works (case: 1)', function() {
          let box = createBox({x: 0, y: 0, width: 3, height: 4});
          Object.assign(box.borders, {
            topWidth: 1,
            bottomWidth: 1,
            leftWidth: 1,
            rightWidth: 1,
            topSymbols: ['-'],
            bottomSymbols: ['-'],
            leftSymbols: ['|'],
            rightSymbols: ['|'],
            topLeftSymbols: ['+'],
            topRightSymbols: ['+'],
            bottomLeftSymbols: ['+'],
            bottomRightSymbols: ['+'],
          });

          assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
            '+-+',
            '|.|',
            '|.|',
            '+-+',
          ].join('\n'));
        });

        it('works (case: 2)', function() {
          let box = createBox({x: 0, y: 0, width: 7, height: 6});
          Object.assign(box.borders, {
            topWidth: 1,
            bottomWidth: 4,
            leftWidth: 2,
            rightWidth: 3,
            topSymbols: ['T'],
            bottomSymbols: ['B'],
            leftSymbols: ['L'],
            rightSymbols: ['R'],
            topLeftSymbols: ['1'],
            topRightSymbols: ['2'],
            bottomLeftSymbols: ['3'],
            bottomRightSymbols: ['4'],
          });

          assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
            '11TT222',
            'LL..RRR',
            '33BB444',
            '33BB444',
            '33BB444',
            '33BB444',
          ].join('\n'));
        });
      });

      describe('content pouring inside of borders', function() {
        it('works', function() {
          let box = createBox({x: 0, y: 0, width: 7, height: 6});

          Object.assign(box.borders, {
            topWidth: 1,
            bottomWidth: 1,
            leftWidth: 1,
            rightWidth: 1,
            topSymbols: ['-'],
            bottomSymbols: ['-'],
            leftSymbols: ['|'],
            rightSymbols: ['|'],
            topLeftSymbols: ['+'],
            topRightSymbols: ['+'],
            bottomLeftSymbols: ['+'],
            bottomRightSymbols: ['+'],
          });

          box.content = 'へlloworlど\nふー\nbar';

          assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
            '+-----+',
            '|へllo|',
            '|worl.|',
            '|ど...|',
            '|ふー.|',
            '+-----+',
          ].join('\n'));
        });
      });
    });

    describe('children', function() {
      describe('the box that has a child', function() {
        let box: Box;
        let child: Box;

        beforeEach(function() {
          box = createBox({x: 0, y: 0, width: 7, height: 4});
          child = createBox({x: 0, y: 0, width: 3, height: 2}, {defaultSymbol: 'c'});
          box.children.push(child);
        });

        it('can move the child', function() {
          child.x = 2;
          child.y = 1;

          assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
            '.......',
            '..ccc..',
            '..ccc..',
            '.......',
          ].join('\n'));
        });

        it('applies the content of the child', function() {
          child.content = '1234';

          assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
            '123....',
            '4......',
            '.......',
            '.......',
          ].join('\n'));
        });

        it('applies the multibyte content of the child', function() {
          child.content = 'あ\n1い';

          assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
            'あ.....',
            '1い....',
            '.......',
            '.......',
          ].join('\n'));
        });

        it('should be overwrite with the content of the child', function() {
          box.content = '1234567\nabcdefg\nABCDEFG';
          child.x = 1;
          child.y = 1;

          assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
            '1234567',
            'acccefg',
            'AcccEFG',
            '.......',
          ].join('\n'));
        });

        it('should be overwrite with the content of the child even when the box contains multibytes', function() {
          box.content = 'あいう\n1えおか';
          child.x = 1;
          child.y = 0;

          assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
            '.cccう.',
            '1ccc.か',
            '.......',
            '.......',
          ].join('\n'));
        });
      });

      describe('the box that has two children', function() {
        let box: Box;
        let child1: Box;
        let child2: Box;

        beforeEach(function() {
          box = createBox({x: 0, y: 0, width: 3, height: 3});
          child1 = createBox({x: 0, y: 0, width: 2, height: 2}, {defaultSymbol: '1'});
          child2 = createBox({x: 0, y: 0, width: 1, height: 1}, {defaultSymbol: '2'});
          box.children.push(child1);
          box.children.push(child2);
        });

        describe('the children have same zIndex', function() {
          it('puts the box added later at a higher position', function() {
            assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
              '21.',
              '11.',
              '...',
            ].join('\n'));
          });
        });

        describe('the children have another zIndex', function() {
          it('puts the box of high zIndex at a higher position', function() {
            child1.zIndex = 1;

            assert.strictEqual(renderBox(box, {backgroundSymbol: '.'}), [
              '11.',
              '11.',
              '...',
            ].join('\n'));
          });
        });
      });
    });
  });
});
