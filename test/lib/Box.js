const assert = require('assert');

const Box = require('../../lib/Box');


describe('lib/Box', function() {
  describe('constructor', function() {
    it('should not throw an error', function() {
      assert.doesNotThrow(() => {
        new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      });
    });

    it('should throw an error if matrix has no height', function() {
      assert.throws(() => {
        new Box({x: 0, y: 0, width: 3, height: 0}, {symbol: 'x'});
      }, /size/);
    });

    it('should throw an error if matrix has no width', function() {
      assert.throws(() => {
        new Box({x: 0, y: 0, width: 0, height: 4}, {symbol: 'x'});
      }, /size/);
    });
  });

  describe('fromText', function() {
    it('works (1)', function() {
      const box = Box.fromText('AB');
      assert.strictEqual(box.asString(), 'AB');
    });

    it('works (2)', function() {
      const box = Box.fromText('AB\nCD\nEF');
      assert.strictEqual(box.asString(), 'AB\nCD\nEF');
    });

    it('should remove the last new line character', function() {
      const box = Box.fromText('AB\nCD\nEF\n');
      assert.strictEqual(box.asString(), 'AB\nCD\nEF');
    });
  });

  describe('_cropMatrix', function() {
    const box = Box.fromText([
      '123',
      '456',
      '789',
      'abc',
    ].join('\n'));
    const baseMatrix = box.getMatrix();

    it('can crop the inside', function() {
      const matrix1 = Box._cropMatrix(baseMatrix, {x: 0, y: 0, width: 2, height: 3});
      assert.strictEqual(matrix1[0][0].symbol, '1');
      assert.strictEqual(matrix1[0][1].symbol, '2');
      assert.strictEqual(matrix1[1][0].symbol, '4');
      assert.strictEqual(matrix1[1][1].symbol, '5');
      assert.strictEqual(matrix1[2][0].symbol, '7');
      assert.strictEqual(matrix1[2][1].symbol, '8');

      const matrix2 = Box._cropMatrix(baseMatrix, {x: 1, y: 2, width: 2, height: 2});
      assert.strictEqual(matrix2[0][0].symbol, '8');
      assert.strictEqual(matrix2[0][1].symbol, '9');
      assert.strictEqual(matrix2[1][0].symbol, 'b');
      assert.strictEqual(matrix2[1][1].symbol, 'c');
    });

    it('should ignore the outside part', function() {
      const matrix1 = Box._cropMatrix(baseMatrix, {x: 2, y: 0, width: 2, height: 2});
      assert.strictEqual(matrix1[0][0].symbol, '3');
      assert.strictEqual(matrix1[1][0].symbol, '6');

      const matrix2 = Box._cropMatrix(baseMatrix, {x: 0, y: 3, width: 2, height: 2});
      assert.strictEqual(matrix2[0][0].symbol, 'a');
      assert.strictEqual(matrix2[0][1].symbol, 'b');
    });

    it('should return null if it can not crop at all', function() {
      const matrix = Box._cropMatrix(baseMatrix, {x: 3, y: 0, width: 2, height: 3});
      assert.strictEqual(matrix, null);
    });
  });

  describe('_shrinkRectangle', function() {
    const rect = {x: 1, y: 2, width: 3, height: 4};

    it('can apply no paddings', function() {
      assert.deepStrictEqual(Box._shrinkRectangle(rect), {x: 1, y: 2, width: 3, height: 4});
    });

    it('can pad to the top', function() {
      assert.deepStrictEqual(Box._shrinkRectangle(rect, {top: 2}), {x: 1, y: 4, width: 3, height: 2});
    });

    it('can set to the bottom', function() {
      assert.deepStrictEqual(Box._shrinkRectangle(rect, {bottom: 2}), {x: 1, y: 2, width: 3, height: 2});
    });

    it('can pad to the left', function() {
      assert.deepStrictEqual(Box._shrinkRectangle(rect, {left: 2}), {x: 3, y: 2, width: 1, height: 4});
    });

    it('can pad to the right', function() {
      assert.deepStrictEqual(Box._shrinkRectangle(rect, {right: 2}), {x: 1, y: 2, width: 1, height: 4});
    });

    it('can set to all sides', function() {
      assert.deepStrictEqual(
        Box._shrinkRectangle(rect, {top: 1, bottom: 1, left: 1, right: 1}),
        {x: 2, y: 3, width: 1, height: 2}
      );
    });

    it('can be set the size to 0', function() {
      assert.deepStrictEqual(
        Box._shrinkRectangle(rect, {top: 1, bottom: 3, left: 1, right: 2}),
        {x: 2, y: 3, width: 0, height: 0}
      );
    });
  });

  describe('instance methods', function() {
    describe('asString', function() {
      describe('content pouring', function() {
        it('should overwrite the part of output where the content was poured', function() {
          const box = new Box({x: 0, y: 0, width: 5, height: 2}, {symbol: '.'});
          box.setContent('foo');
          assert.strictEqual(box.asString(), [
            'foo..',
            '.....',
          ].join('\n'));
        });

        it('can break lines by "\\n"', function() {
          const box = new Box({x: 0, y: 0, width: 5, height: 3}, {symbol: '.'});
          box.setContent('hello\n\nworld');
          assert.strictEqual(box.asString(), [
            'hello',
            '.....',
            'world',
          ].join('\n'));
        });

        it('can break lines automatically', function() {
          const box = new Box({x: 0, y: 0, width: 5, height: 3}, {symbol: '.'});
          box.setContent('helloworld!!');
          assert.strictEqual(box.asString(), [
            'hello',
            'world',
            '!!...',
          ].join('\n'));
        });

        it('should ignore overflowing content', function() {
          const box = new Box({x: 0, y: 0, width: 5, height: 2}, {symbol: '.'});
          box.setContent('helloworld!!');
          assert.strictEqual(box.asString(), [
            'hello',
            'world',
          ].join('\n'));
        });
      });
    });
  });
});
