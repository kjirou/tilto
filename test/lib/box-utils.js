const assert = require('assert');
const chalk = require('chalk');

const boxUtils = require('../../src/lib/box-utils');


describe('lib/box-utils', function() {
  describe('createBox', function() {
    it('should not throw an error if arguments are valid', function() {
      assert.doesNotThrow(() => {
        boxUtils.createBox({width: 3, height: 4}, {symbol: 'x'});
      });
    });

    it('should throw an error if matrix has no height', function() {
      assert.throws(() => {
        boxUtils.createBox({width: 3, height: 0}, {symbol: 'x'});
      }, /size/);
    });

    it('should throw an error if matrix has no width', function() {
      assert.throws(() => {
        boxUtils.createBox({width: 0, height: 4}, {symbol: 'x'});
      }, /size/);
    });
  });

  describe('createBoxFromText', function() {
    it('works (case: 1)', function() {
      const box = boxUtils.createBoxFromText('AB');
      //assert.strictEqual(box.asString(), 'AB');
    });

    it('works (case: 2)', function() {
      const box = boxUtils.createBoxFromText('AB\nCD\nEF');
      //assert.strictEqual(box.asString(), 'AB\nCD\nEF');
    });

    it('should remove the last new line character', function() {
      const box = boxUtils.createBoxFromText('AB\nCD\nEF\n');
      //assert.strictEqual(box.asString(), 'AB\nCD\nEF');
    });
  });

  describe('_defaultSymbolRuler', function() {
    it('can measure single byte character', function() {
      assert.strictEqual(boxUtils._defaultSymbolRuler('a'), 1);
    });

    it('can measure multibyte character', function() {
      assert.strictEqual(boxUtils._defaultSymbolRuler('あ'), 2);
    });

    it('can measure ANSI string', function() {
      assert.strictEqual(
        boxUtils._defaultSymbolRuler(
          chalk.red('a')
        ),
        1
      );

      assert.strictEqual(
        boxUtils._defaultSymbolRuler(
          chalk.red.underline('a')
        ),
        1
      );

      assert.strictEqual(
        boxUtils._defaultSymbolRuler(
          chalk.red.underline.inverse('a')
        ),
        1
      );
    });
  });

  describe('toText', function() {
    describe('content pouring', function() {
      it('should overwrite the part of output where the content was poured', function() {
        const box = boxUtils.createBox({width: 5, height: 2});
        box.content = 'foo';
        assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
          'foo..',
          '.....',
        ].join('\n'));
      });

      it('can break lines by "\\n"', function() {
        const box = boxUtils.createBox({width: 5, height: 3});
        box.content = 'hello\n\nworld';
        assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
          'hello',
          '.....',
          'world',
        ].join('\n'));
      });

      it('can break lines automatically', function() {
        const box = boxUtils.createBox({width: 5, height: 3});
        box.content = 'helloworld!!';
        assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
          'hello',
          'world',
          '!!...',
        ].join('\n'));
      });

      it('should ignore overflowing content', function() {
        const box = boxUtils.createBox({width: 5, height: 2});
        box.content = 'helloworld!!';
        assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
          'hello',
          'world',
        ].join('\n'));
      });
    });

    describe('borders', function() {
      describe('each sides/corners of 1 width', function() {
        let box;

        beforeEach(function() {
          box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: '.'});
        });

        it('can set the top side border', function() {
          box = boxUtils.setBorders(box, {topWidth: 1, topSymbols:['*']});
          assert.strictEqual(boxUtils.toText(box), [
            '***',
            '...',
            '...',
            '...',
          ].join('\n'));
        });

        it('can set the bottom side border', function() {
          box = boxUtils.setBorders(box, {bottomWidth: 1, bottomSymbols:['*']});
          assert.strictEqual(boxUtils.toText(box), [
            '...',
            '...',
            '...',
            '***',
          ].join('\n'));
        });

        it('can set the left side border', function() {
          box = boxUtils.setBorders(box, {leftWidth: 1, leftSymbols:['*']});
          assert.strictEqual(boxUtils.toText(box), [
            '*..',
            '*..',
            '*..',
            '*..',
          ].join('\n'));
        });

        it('can set the right side border', function() {
          box = boxUtils.setBorders(box, {rightWidth: 1, rightSymbols:['*']});
          assert.strictEqual(boxUtils.toText(box), [
            '..*',
            '..*',
            '..*',
            '..*',
          ].join('\n'));
        });

        it('can set the top-left corner', function() {
          box = boxUtils.setBorders(box, {topWidth: 1, leftWidth: 1, topLeftSymbols:['*']});
          assert.strictEqual(boxUtils.toText(box), [
            '*  ',
            ' ..',
            ' ..',
            ' ..',
          ].join('\n'));
        });

        it('can set the top-right corner', function() {
          box = boxUtils.setBorders(box, {topWidth: 1, rightWidth: 1, topRightSymbols:['*']});
          assert.strictEqual(boxUtils.toText(box), [
            '  *',
            '.. ',
            '.. ',
            '.. ',
          ].join('\n'));
        });

        it('can set the bottom-left corner', function() {
          box = boxUtils.setBorders(box, {bottomWidth: 1, leftWidth: 1, bottomLeftSymbols:['*']});
          assert.strictEqual(boxUtils.toText(box), [
            ' ..',
            ' ..',
            ' ..',
            '*  ',
          ].join('\n'));
        });

        it('can set the bottom-right corner', function() {
          box = boxUtils.setBorders(box, {bottomWidth: 1, rightWidth: 1, bottomRightSymbols:['*']});
          assert.strictEqual(boxUtils.toText(box), [
            '.. ',
            '.. ',
            '.. ',
            '  *',
          ].join('\n'));
        });
      });

      describe('borders in all sides', function() {
        it('works (case: 1)', function() {
          let box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4});
          box = boxUtils.setBorders(box, {
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

          assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
            '+-+',
            '|.|',
            '|.|',
            '+-+',
          ].join('\n'));
        });

        it('works (case: 2)', function() {
          let box = boxUtils.createBox({x: 0, y: 0, width: 7, height: 6});
          box = boxUtils.setBorders(box, {
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

          assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
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
          let box = boxUtils.createBox({x: 0, y: 0, width: 7, height: 6});

          box = boxUtils.setBorders(box, {
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

          assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
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
        let box;
        let child;

        beforeEach(function() {
          box = boxUtils.createBox({x: 0, y: 0, width: 7, height: 4});
          child = boxUtils.createBox({x: 0, y: 0, width: 3, height: 2}, {defaultSymbol: 'c'});
          box.children.push(child);
        });

        it('can move the child', function() {
          child.x = 2;
          child.y = 1;

          assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
            '.......',
            '..ccc..',
            '..ccc..',
            '.......',
          ].join('\n'));
        });

        it('applies the content of the child', function() {
          child.content = '1234';

          assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
            '123....',
            '4cc....',
            '.......',
            '.......',
          ].join('\n'));
        });

        it('applies the multibyte content of the child', function() {
          child.content = 'あ\n1い';

          assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
            'あc....',
            '1い....',
            '.......',
            '.......',
          ].join('\n'));
        });

        it('should be overwrite with the content of the child', function() {
          box.content = '1234567\nabcdefg\nABCDEFG';
          child.x = 1;
          child.y = 1;

          assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
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

          assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
            '.cccう.',
            '1ccc.か',
            '.......',
            '.......',
          ].join('\n'));
        });
      });

      describe('the box that has two children', function() {
        let box;
        let child1;
        let child2;

        beforeEach(function() {
          box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 3});
          child1 = boxUtils.createBox({x: 0, y: 0, width: 2, height: 2}, {defaultSymbol: '1'});
          child2 = boxUtils.createBox({x: 0, y: 0, width: 1, height: 1}, {defaultSymbol: '2'});
          box.children.push(child1);
          box.children.push(child2);
        });

        describe('the children have same zIndex', function() {
          it('puts the box added later at a higher position', function() {
            assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
              '21.',
              '11.',
              '...',
            ].join('\n'));
          });
        });

        describe('the children have another zIndex', function() {
          it('puts the box of high zIndex at a higher position', function() {
            child1.zIndex = 1;

            assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: '.'}), [
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
