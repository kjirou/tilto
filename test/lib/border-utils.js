const assert = require('assert');

const Box = require('../../lib/Box');
const {
  clearBottomSide,
  clearLeftSide,
  clearRightSide,
  clearTopSide,
  drawBottomSide,
  drawLeftSide,
  drawRightSide,
  drawTopSide,
} = require('../../lib/border-utils');


describe('lib/border-utils', function() {
  const borderOptions1 = {
    topWidth: 1,
    rightWidth: 1,
    bottomWidth: 1,
    leftWidth: 1,
    topPattern: ['-'],
    rightPattern: ['|'],
    bottomPattern: ['-'],
    leftPattern: ['|'],
    topRightPattern: ['+'],
    bottomRightPattern: ['+'],
    bottomLeftPattern: ['+'],
    topLeftPattern: ['+'],
  };

  describe('clearTopSide', function() {
    it('works', function() {
      const box1 = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      clearTopSide(box1, 1);
      assert.strictEqual(box1.asString('N'), [
        'NNN',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));

      const box2 = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      clearTopSide(box2, 2);
      assert.strictEqual(box2.asString('N'), [
        'NNN',
        'NNN',
        'xxx',
        'xxx',
      ].join('\n'));
    });
  });

  describe('clearBottomSide', function() {
    it('works', function() {
      const box1 = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      clearBottomSide(box1, 1);
      assert.strictEqual(box1.asString('N'), [
        'xxx',
        'xxx',
        'xxx',
        'NNN',
      ].join('\n'));

      const box2 = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      clearBottomSide(box2, 2);
      assert.strictEqual(box2.asString('N'), [
        'xxx',
        'xxx',
        'NNN',
        'NNN',
      ].join('\n'));
    });
  });

  describe('clearLeftSide', function() {
    it('works', function() {
      const box1 = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      clearLeftSide(box1, 1);
      assert.strictEqual(box1.asString('N'), [
        'Nxx',
        'Nxx',
        'Nxx',
        'Nxx',
      ].join('\n'));

      const box2 = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      clearLeftSide(box2, 2);
      assert.strictEqual(box2.asString('N'), [
        'NNx',
        'NNx',
        'NNx',
        'NNx',
      ].join('\n'));
    });
  });

  describe('clearRightSide', function() {
    it('works', function() {
      const box1 = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      clearRightSide(box1, 1);
      assert.strictEqual(box1.asString('N'), [
        'xxN',
        'xxN',
        'xxN',
        'xxN',
      ].join('\n'));

      const box2 = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      clearRightSide(box2, 2);
      assert.strictEqual(box2.asString('N'), [
        'xNN',
        'xNN',
        'xNN',
        'xNN',
      ].join('\n'));
    });
  });

  describe('drawTopSide', function() {
    it('can draw a border of 1 width', function() {
      const box = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      drawTopSide(box, 1, ['B'], 0, 2);
      assert.strictEqual(box.asString(), [
        'BBB',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      const box = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      drawTopSide(box, 2, ['1', '2'], 0, 2);
      assert.strictEqual(box.asString(), [
        '111',
        '222',
        'xxx',
        'xxx',
      ].join('\n'));
    });

    it('can draw a border in the narrow x range', function() {
      const box = new Box({x: 0, y: 0, width: 4, height: 2}, {symbol: 'x'});
      drawTopSide(box, 1, ['B'], 1, 2);
      assert.strictEqual(box.asString(), [
        'xBBx',
        'xxxx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      const box = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      drawTopSide(box, 3, ['1', '2'], 0, 2);
      assert.strictEqual(box.asString(), [
        '111',
        '222',
        '111',
        'xxx',
      ].join('\n'));
    });
  });

  describe('drawBottomSide', function() {
    it('can draw a border of 1 width', function() {
      const box = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      drawBottomSide(box, 1, ['B'], 0, 2);
      assert.strictEqual(box.asString(), [
        'xxx',
        'xxx',
        'xxx',
        'BBB',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      const box = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      drawBottomSide(box, 2, ['1', '2'], 0, 2);
      assert.strictEqual(box.asString(), [
        'xxx',
        'xxx',
        '222',
        '111',
      ].join('\n'));
    });

    it('can draw a border in the narrow x range', function() {
      const box = new Box({x: 0, y: 0, width: 4, height: 2}, {symbol: 'x'});
      drawBottomSide(box, 1, ['B'], 1, 2);
      assert.strictEqual(box.asString(), [
        'xxxx',
        'xBBx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      const box = new Box({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      drawBottomSide(box, 3, ['1', '2'], 0, 2);
      assert.strictEqual(box.asString(), [
        'xxx',
        '111',
        '222',
        '111',
      ].join('\n'));
    });
  });

  describe('drawLeftSide', function() {
    it('can draw a border of 1 width', function() {
      const box = new Box({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      drawLeftSide(box, 1, ['B'], 0, 2);
      assert.strictEqual(box.asString(), [
        'Bxxx',
        'Bxxx',
        'Bxxx',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      const box = new Box({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      drawLeftSide(box, 2, ['B'], 0, 2);
      assert.strictEqual(box.asString(), [
        'BBxx',
        'BBxx',
        'BBxx',
      ].join('\n'));
    });

    it('can draw a border in the narrow y range', function() {
      const box = new Box({x: 0, y: 0, width: 2, height: 4}, {symbol: 'x'});
      drawLeftSide(box, 1, ['B'], 1, 2);
      assert.strictEqual(box.asString(), [
        'xx',
        'Bx',
        'Bx',
        'xx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      const box = new Box({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      drawLeftSide(box, 3, ['1', '2'], 0, 2);
      assert.strictEqual(box.asString(), [
        '121x',
        '121x',
        '121x',
      ].join('\n'));
    });
  });

  describe('drawRightSide', function() {
    it('can draw a border of 1 width', function() {
      const box = new Box({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      drawRightSide(box, 1, ['B'], 0, 2);
      assert.strictEqual(box.asString(), [
        'xxxB',
        'xxxB',
        'xxxB',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      const box = new Box({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      drawRightSide(box, 2, ['B'], 0, 2);
      assert.strictEqual(box.asString(), [
        'xxBB',
        'xxBB',
        'xxBB',
      ].join('\n'));
    });

    it('can draw a border in the narrow y range', function() {
      const box = new Box({x: 0, y: 0, width: 2, height: 4}, {symbol: 'x'});
      drawRightSide(box, 1, ['B'], 1, 2);
      assert.strictEqual(box.asString(), [
        'xx',
        'xB',
        'xB',
        'xx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      const box = new Box({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      drawRightSide(box, 3, ['1', '2'], 0, 2);
      assert.strictEqual(box.asString(), [
        'x121',
        'x121',
        'x121',
      ].join('\n'));
    });
  });
});
