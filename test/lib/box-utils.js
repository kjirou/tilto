const assert = require('assert');

const boxUtils = require('../../lib/box-utils');


describe('lib/box-utils', function() {
  describe('initializeBox', function() {
    it('should not throw an error if arguments are valid', function() {
      assert.doesNotThrow(() => {
        boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      });
    });

    it('should throw an error if matrix has no height', function() {
      assert.throws(() => {
        boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 0}, {symbol: 'x'});
      }, /size/);
    });

    it('should throw an error if matrix has no width', function() {
      assert.throws(() => {
        boxUtils.initializeBox({x: 0, y: 0, width: 0, height: 4}, {symbol: 'x'});
      }, /size/);
    });
  });

  describe('initializeBoxFromText', function() {
    it('works (case: 1)', function() {
      const box = boxUtils.initializeBoxFromText('AB');
      //assert.strictEqual(box.asString(), 'AB');
    });

    it('works (case: 2)', function() {
      const box = boxUtils.initializeBoxFromText('AB\nCD\nEF');
      //assert.strictEqual(box.asString(), 'AB\nCD\nEF');
    });

    it('should remove the last new line character', function() {
      const box = boxUtils.initializeBoxFromText('AB\nCD\nEF\n');
      //assert.strictEqual(box.asString(), 'AB\nCD\nEF');
    });
  });

  describe('render', function() {
    describe('content pouring', function() {
      it('should overwrite the part of output where the content was poured', function() {
        const box = boxUtils.initializeBox({x: 0, y: 0, width: 5, height: 2}, {symbol: '.'});
        box.content = 'foo';
        assert.strictEqual(boxUtils.render(box), [
          'foo..',
          '.....',
        ].join('\n'));
      });

      it('can break lines by "\\n"', function() {
        const box = boxUtils.initializeBox({x: 0, y: 0, width: 5, height: 3}, {symbol: '.'});
        box.content = 'hello\n\nworld';
        assert.strictEqual(boxUtils.render(box), [
          'hello',
          '.....',
          'world',
        ].join('\n'));
      });

      it('can break lines automatically', function() {
        const box = boxUtils.initializeBox({x: 0, y: 0, width: 5, height: 3}, {symbol: '.'});
        box.content = 'helloworld!!';
        assert.strictEqual(boxUtils.render(box), [
          'hello',
          'world',
          '!!...',
        ].join('\n'));
      });

      it('should ignore overflowing content', function() {
        const box = boxUtils.initializeBox({x: 0, y: 0, width: 5, height: 2}, {symbol: '.'});
        box.content = 'helloworld!!';
        assert.strictEqual(boxUtils.render(box), [
          'hello',
          'world',
        ].join('\n'));
      });
    });

    describe('borders', function() {
      describe('each sides/corners of 1 width', function() {
        let box;

        beforeEach(function() {
          box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: '.'});
        });

        it('can set the top side border', function() {
          box = boxUtils.setBorders(box, {topWidth: 1, topSymbols:['*']});
          assert.strictEqual(boxUtils.render(box), [
            '***',
            '...',
            '...',
            '...',
          ].join('\n'));
        });

        it('can set the bottom side border', function() {
          box = boxUtils.setBorders(box, {bottomWidth: 1, bottomSymbols:['*']});
          assert.strictEqual(boxUtils.render(box), [
            '...',
            '...',
            '...',
            '***',
          ].join('\n'));
        });

        it('can set the left side border', function() {
          box = boxUtils.setBorders(box, {leftWidth: 1, leftSymbols:['*']});
          assert.strictEqual(boxUtils.render(box), [
            '*..',
            '*..',
            '*..',
            '*..',
          ].join('\n'));
        });

        it('can set the right side border', function() {
          box = boxUtils.setBorders(box, {rightWidth: 1, rightSymbols:['*']});
          assert.strictEqual(boxUtils.render(box), [
            '..*',
            '..*',
            '..*',
            '..*',
          ].join('\n'));
        });

        it('can set the top-left corner', function() {
          box = boxUtils.setBorders(box, {topWidth: 1, leftWidth: 1, topLeftSymbols:['*']});
          assert.strictEqual(boxUtils.render(box), [
            '*  ',
            ' ..',
            ' ..',
            ' ..',
          ].join('\n'));
        });

        it('can set the top-right corner', function() {
          box = boxUtils.setBorders(box, {topWidth: 1, rightWidth: 1, topRightSymbols:['*']});
          assert.strictEqual(boxUtils.render(box), [
            '  *',
            '.. ',
            '.. ',
            '.. ',
          ].join('\n'));
        });

        it('can set the bottom-left corner', function() {
          box = boxUtils.setBorders(box, {bottomWidth: 1, leftWidth: 1, bottomLeftSymbols:['*']});
          assert.strictEqual(boxUtils.render(box), [
            ' ..',
            ' ..',
            ' ..',
            '*  ',
          ].join('\n'));
        });

        it('can set the bottom-right corner', function() {
          box = boxUtils.setBorders(box, {bottomWidth: 1, rightWidth: 1, bottomRightSymbols:['*']});
          assert.strictEqual(boxUtils.render(box), [
            '.. ',
            '.. ',
            '.. ',
            '  *',
          ].join('\n'));
        });
      });

      describe('borders in all sides', function() {
        it('works (case: 1)', function() {
          let box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: '.'});
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

          assert.strictEqual(boxUtils.render(box), [
            '+-+',
            '|.|',
            '|.|',
            '+-+',
          ].join('\n'));
        });

        it('works (case: 2)', function() {
          let box = boxUtils.initializeBox({x: 0, y: 0, width: 7, height: 6}, {symbol: '.'});
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

          assert.strictEqual(boxUtils.render(box), [
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
          let box = boxUtils.initializeBox({x: 0, y: 0, width: 7, height: 6}, {symbol: '.'});

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

          box.content = 'helloworld!\nfoo\nbar';

          assert.strictEqual(boxUtils.render(box), [
            '+-----+',
            '|hello|',
            '|world|',
            '|!....|',
            '|foo..|',
            '+-----+',
          ].join('\n'));
        });
      });
    });
  });
});
