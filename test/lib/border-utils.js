const assert = require('assert');

const {
  clearBottomSide,
  clearLeftSide,
  clearRightSide,
  clearTopSide,
  drawBottomSide,
  drawCorner,
  drawLeftSide,
  drawRightSide,
  drawTopSide,
} = require('../../lib/border-utils');
const boxUtils = require('../../lib/box-utils');


describe('lib/border-utils', function() {
  describe('clearTopSide', function() {
    it('works', function() {
      let box1 = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box1 = clearTopSide(box1, 1);
      assert.strictEqual(boxUtils.render(box1, {defaultSymbol: 'N'}), [
        'NNN',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));

      let box2 = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box2 = clearTopSide(box2, 2);
      assert.strictEqual(boxUtils.render(box2, {defaultSymbol: 'N'}), [
        'NNN',
        'NNN',
        'xxx',
        'xxx',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      const newBox = clearTopSide(box, 1);

      assert.strictEqual(boxUtils.render(box, {defaultSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.render(newBox, {defaultSymbol: 'N'}), [
        'NNN',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
    });
  });

  describe('clearBottomSide', function() {
    it('works', function() {
      let box1 = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box1 = clearBottomSide(box1, 1);
      assert.strictEqual(boxUtils.render(box1, {defaultSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'NNN',
      ].join('\n'));

      let box2 = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box2 = clearBottomSide(box2, 2);
      assert.strictEqual(boxUtils.render(box2, {defaultSymbol: 'N'}), [
        'xxx',
        'xxx',
        'NNN',
        'NNN',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      const newBox = clearBottomSide(box, 1);

      assert.strictEqual(boxUtils.render(box, {defaultSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.render(newBox, {defaultSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'NNN',
      ].join('\n'));
    });
  });

  describe('clearLeftSide', function() {
    it('works', function() {
      let box1 = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box1 = clearLeftSide(box1, 1);
      assert.strictEqual(boxUtils.render(box1, {defaultSymbol: 'N'}), [
        'Nxx',
        'Nxx',
        'Nxx',
        'Nxx',
      ].join('\n'));

      let box2 = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box2 = clearLeftSide(box2, 2);
      assert.strictEqual(boxUtils.render(box2, {defaultSymbol: 'N'}), [
        'NNx',
        'NNx',
        'NNx',
        'NNx',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      const newBox = clearLeftSide(box, 1);

      assert.strictEqual(boxUtils.render(box, {defaultSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.render(newBox, {defaultSymbol: 'N'}), [
        'Nxx',
        'Nxx',
        'Nxx',
        'Nxx',
      ].join('\n'));
    });
  });

  describe('clearRightSide', function() {
    it('works', function() {
      let box1 = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box1 = clearRightSide(box1, 1);
      assert.strictEqual(boxUtils.render(box1, {defaultSymbol: 'N'}), [
        'xxN',
        'xxN',
        'xxN',
        'xxN',
      ].join('\n'));

      let box2 = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box2 = clearRightSide(box2, 2);
      assert.strictEqual(boxUtils.render(box2, {defaultSymbol: 'N'}), [
        'xNN',
        'xNN',
        'xNN',
        'xNN',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      const newBox = clearRightSide(box, 1);

      assert.strictEqual(boxUtils.render(box, {defaultSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.render(newBox, {defaultSymbol: 'N'}), [
        'xxN',
        'xxN',
        'xxN',
        'xxN',
      ].join('\n'));
    });
  });

  describe('drawTopSide', function() {
    it('can draw a border of 1 width', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box = drawTopSide(box, 1, ['B'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        'BBB',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box = drawTopSide(box, 2, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        '111',
        '222',
        'xxx',
        'xxx',
      ].join('\n'));
    });

    it('can draw a border in the narrow x range', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 2}, {symbol: 'x'});
      box = drawTopSide(box, 1, ['B'], 1, 2);
      assert.strictEqual(boxUtils.render(box), [
        'xBBx',
        'xxxx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box = drawTopSide(box, 3, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        '111',
        '222',
        '111',
        'xxx',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      const newBox = drawTopSide(box, 1, ['B'], 0, 2);

      assert.strictEqual(boxUtils.render(box), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.render(newBox), [
        'BBB',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
    });
  });

  describe('drawBottomSide', function() {
    it('can draw a border of 1 width', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box = drawBottomSide(box, 1, ['B'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        'xxx',
        'xxx',
        'xxx',
        'BBB',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box = drawBottomSide(box, 2, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        'xxx',
        'xxx',
        '222',
        '111',
      ].join('\n'));
    });

    it('can draw a border in the narrow x range', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 2}, {symbol: 'x'});
      box = drawBottomSide(box, 1, ['B'], 1, 2);
      assert.strictEqual(boxUtils.render(box), [
        'xxxx',
        'xBBx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      box = drawBottomSide(box, 3, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        'xxx',
        '111',
        '222',
        '111',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.initializeBox({x: 0, y: 0, width: 3, height: 4}, {symbol: 'x'});
      const newBox = drawBottomSide(box, 1, ['B'], 0, 2);

      assert.strictEqual(boxUtils.render(box), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.render(newBox), [
        'xxx',
        'xxx',
        'xxx',
        'BBB',
      ].join('\n'));
    });
  });

  describe('drawLeftSide', function() {
    it('can draw a border of 1 width', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      box = drawLeftSide(box, 1, ['B'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        'Bxxx',
        'Bxxx',
        'Bxxx',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      box = drawLeftSide(box, 2, ['B'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        'BBxx',
        'BBxx',
        'BBxx',
      ].join('\n'));
    });

    it('can draw a border in the narrow y range', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 2, height: 4}, {symbol: 'x'});
      box = drawLeftSide(box, 1, ['B'], 1, 2);
      assert.strictEqual(boxUtils.render(box), [
        'xx',
        'Bx',
        'Bx',
        'xx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      box = drawLeftSide(box, 3, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        '121x',
        '121x',
        '121x',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      const newBox = drawLeftSide(box, 1, ['B'], 0, 2);

      assert.strictEqual(boxUtils.render(box), [
        'xxxx',
        'xxxx',
        'xxxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.render(newBox), [
        'Bxxx',
        'Bxxx',
        'Bxxx',
      ].join('\n'));
    });
  });

  describe('drawRightSide', function() {
    it('can draw a border of 1 width', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      box = drawRightSide(box, 1, ['B'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        'xxxB',
        'xxxB',
        'xxxB',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      box = drawRightSide(box, 2, ['B'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        'xxBB',
        'xxBB',
        'xxBB',
      ].join('\n'));
    });

    it('can draw a border in the narrow y range', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 2, height: 4}, {symbol: 'x'});
      box = drawRightSide(box, 1, ['B'], 1, 2);
      assert.strictEqual(boxUtils.render(box), [
        'xx',
        'xB',
        'xB',
        'xx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      box = drawRightSide(box, 3, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.render(box), [
        'x121',
        'x121',
        'x121',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      const newBox = drawRightSide(box, 1, ['B'], 0, 2);

      assert.strictEqual(boxUtils.render(box), [
        'xxxx',
        'xxxx',
        'xxxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.render(newBox), [
        'xxxB',
        'xxxB',
        'xxxB',
      ].join('\n'));
    });
  });

  describe('drawCorner', function() {
    it('can draw a cornar with a single symbol', function() {
      let box1 = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      box1 = drawCorner(box1, {x: 0, y: 0, width: 3, height: 2}, ['1']);
      assert.strictEqual(boxUtils.render(box1), [
        '111x',
        '111x',
        'xxxx',
      ].join('\n'));

      let box2 = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      box2 = drawCorner(box2, {x: 1, y: 1, width: 3, height: 2}, ['1']);
      assert.strictEqual(boxUtils.render(box2), [
        'xxxx',
        'x111',
        'x111',
      ].join('\n'));
    });

    it('can draw a cornar with multiple symbols', function() {
      let box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      box = drawCorner(box, {x: 0, y: 0, width: 3, height: 2}, ['1', '2', '3', '4']);
      assert.strictEqual(boxUtils.render(box), [
        '123x',
        '412x',
        'xxxx',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.initializeBox({x: 0, y: 0, width: 4, height: 3}, {symbol: 'x'});
      const newBox = drawCorner(box, {x: 0, y: 0, width: 1, height: 1}, ['1']);

      assert.strictEqual(boxUtils.render(box), [
        'xxxx',
        'xxxx',
        'xxxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.render(newBox), [
        '1xxx',
        'xxxx',
        'xxxx',
      ].join('\n'));
    });
  });
});
