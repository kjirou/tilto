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
} = require('../../src/lib/border-utils');
const boxUtils = require('../../src/lib/box-utils');


describe('lib/border-utils', function() {
  describe('clearTopSide', function() {
    it('works', function() {
      let box1 = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box1.matrix = clearTopSide(box1.matrix, 1);
      assert.strictEqual(boxUtils.toText(box1, {backgroundSymbol: 'N'}), [
        'NNN',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));

      let box2 = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box2.matrix = clearTopSide(box2.matrix, 2);
      assert.strictEqual(boxUtils.toText(box2, {backgroundSymbol: 'N'}), [
        'NNN',
        'NNN',
        'xxx',
        'xxx',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      const newBox = Object.assign({}, box, {
        matrix: clearTopSide(box.matrix, 1),
      });

      assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.toText(newBox, {backgroundSymbol: 'N'}), [
        'NNN',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
    });
  });

  describe('clearBottomSide', function() {
    it('works', function() {
      let box1 = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box1.matrix = clearBottomSide(box1.matrix, 1);
      assert.strictEqual(boxUtils.toText(box1, {backgroundSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'NNN',
      ].join('\n'));

      let box2 = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box2.matrix = clearBottomSide(box2.matrix, 2);
      assert.strictEqual(boxUtils.toText(box2, {backgroundSymbol: 'N'}), [
        'xxx',
        'xxx',
        'NNN',
        'NNN',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      const newBox = Object.assign({}, box, {
        matrix: clearBottomSide(box.matrix, 1),
      });

      assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.toText(newBox, {backgroundSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'NNN',
      ].join('\n'));
    });
  });

  describe('clearLeftSide', function() {
    it('works', function() {
      let box1 = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box1.matrix = clearLeftSide(box1.matrix, 1);
      assert.strictEqual(boxUtils.toText(box1, {backgroundSymbol: 'N'}), [
        'Nxx',
        'Nxx',
        'Nxx',
        'Nxx',
      ].join('\n'));

      let box2 = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box2.matrix = clearLeftSide(box2.matrix, 2);
      assert.strictEqual(boxUtils.toText(box2, {backgroundSymbol: 'N'}), [
        'NNx',
        'NNx',
        'NNx',
        'NNx',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      const newBox = Object.assign({}, box, {
        matrix: clearLeftSide(box.matrix, 1),
      });

      assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.toText(newBox, {backgroundSymbol: 'N'}), [
        'Nxx',
        'Nxx',
        'Nxx',
        'Nxx',
      ].join('\n'));
    });
  });

  describe('clearRightSide', function() {
    it('works', function() {
      let box1 = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box1.matrix = clearRightSide(box1.matrix, 1);
      assert.strictEqual(boxUtils.toText(box1, {backgroundSymbol: 'N'}), [
        'xxN',
        'xxN',
        'xxN',
        'xxN',
      ].join('\n'));

      let box2 = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box2.matrix = clearRightSide(box2.matrix, 2);
      assert.strictEqual(boxUtils.toText(box2, {backgroundSymbol: 'N'}), [
        'xNN',
        'xNN',
        'xNN',
        'xNN',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      const newBox = Object.assign({}, box, {
        matrix: clearRightSide(box.matrix, 1),
      });

      assert.strictEqual(boxUtils.toText(box, {backgroundSymbol: 'N'}), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.toText(newBox, {backgroundSymbol: 'N'}), [
        'xxN',
        'xxN',
        'xxN',
        'xxN',
      ].join('\n'));
    });
  });

  describe('drawTopSide', function() {
    it('can draw a border of 1 width', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box.matrix = drawTopSide(box.matrix, 1, ['B'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'BBB',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box.matrix = drawTopSide(box.matrix, 2, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        '111',
        '222',
        'xxx',
        'xxx',
      ].join('\n'));
    });

    it('can draw a border in the narrow x range', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 2}, {defaultSymbol: 'x'});
      box.matrix = drawTopSide(box.matrix, 1, ['B'], 1, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'xBBx',
        'xxxx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box.matrix = drawTopSide(box.matrix, 3, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        '111',
        '222',
        '111',
        'xxx',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      const newBox = Object.assign({}, box, {
        matrix: drawTopSide(box.matrix, 1, ['B'], 0, 2),
      });

      assert.strictEqual(boxUtils.toText(box), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.toText(newBox), [
        'BBB',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
    });
  });

  describe('drawBottomSide', function() {
    it('can draw a border of 1 width', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box.matrix = drawBottomSide(box.matrix, 1, ['B'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'xxx',
        'xxx',
        'xxx',
        'BBB',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box.matrix = drawBottomSide(box.matrix, 2, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'xxx',
        'xxx',
        '222',
        '111',
      ].join('\n'));
    });

    it('can draw a border in the narrow x range', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 2}, {defaultSymbol: 'x'});
      box.matrix = drawBottomSide(box.matrix, 1, ['B'], 1, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'xxxx',
        'xBBx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      box.matrix = drawBottomSide(box.matrix, 3, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'xxx',
        '111',
        '222',
        '111',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.createBox({x: 0, y: 0, width: 3, height: 4}, {defaultSymbol: 'x'});
      const newBox = Object.assign({}, box, {
        matrix: drawBottomSide(box.matrix, 1, ['B'], 0, 2),
      });

      assert.strictEqual(boxUtils.toText(box), [
        'xxx',
        'xxx',
        'xxx',
        'xxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.toText(newBox), [
        'xxx',
        'xxx',
        'xxx',
        'BBB',
      ].join('\n'));
    });
  });

  describe('drawLeftSide', function() {
    it('can draw a border of 1 width', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      box.matrix = drawLeftSide(box.matrix, 1, ['B'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'Bxxx',
        'Bxxx',
        'Bxxx',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      box.matrix = drawLeftSide(box.matrix, 2, ['B'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'BBxx',
        'BBxx',
        'BBxx',
      ].join('\n'));
    });

    it('can draw a border in the narrow y range', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 2, height: 4}, {defaultSymbol: 'x'});
      box.matrix = drawLeftSide(box.matrix, 1, ['B'], 1, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'xx',
        'Bx',
        'Bx',
        'xx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      box.matrix = drawLeftSide(box.matrix, 3, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        '121x',
        '121x',
        '121x',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      const newBox = Object.assign({}, box, {
        matrix: drawLeftSide(box.matrix, 1, ['B'], 0, 2),
      });

      assert.strictEqual(boxUtils.toText(box), [
        'xxxx',
        'xxxx',
        'xxxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.toText(newBox), [
        'Bxxx',
        'Bxxx',
        'Bxxx',
      ].join('\n'));
    });
  });

  describe('drawRightSide', function() {
    it('can draw a border of 1 width', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      box.matrix = drawRightSide(box.matrix, 1, ['B'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'xxxB',
        'xxxB',
        'xxxB',
      ].join('\n'));
    });

    it('can draw a border of 2 width', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      box.matrix = drawRightSide(box.matrix, 2, ['B'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'xxBB',
        'xxBB',
        'xxBB',
      ].join('\n'));
    });

    it('can draw a border in the narrow y range', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 2, height: 4}, {defaultSymbol: 'x'});
      box.matrix = drawRightSide(box.matrix, 1, ['B'], 1, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'xx',
        'xB',
        'xB',
        'xx',
      ].join('\n'));
    });

    it('should circulate short symbols', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      box.matrix = drawRightSide(box.matrix, 3, ['1', '2'], 0, 2);
      assert.strictEqual(boxUtils.toText(box), [
        'x121',
        'x121',
        'x121',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      const newBox = Object.assign({}, box, {
        matrix: drawRightSide(box.matrix, 1, ['B'], 0, 2),
      });

      assert.strictEqual(boxUtils.toText(box), [
        'xxxx',
        'xxxx',
        'xxxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.toText(newBox), [
        'xxxB',
        'xxxB',
        'xxxB',
      ].join('\n'));
    });
  });

  describe('drawCorner', function() {
    it('can draw a cornar with a single symbol', function() {
      let box1 = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      box1.matrix = drawCorner(box1.matrix, {x: 0, y: 0, width: 3, height: 2}, ['1']);
      assert.strictEqual(boxUtils.toText(box1), [
        '111x',
        '111x',
        'xxxx',
      ].join('\n'));

      let box2 = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      box2.matrix = drawCorner(box2.matrix, {x: 1, y: 1, width: 3, height: 2}, ['1']);
      assert.strictEqual(boxUtils.toText(box2), [
        'xxxx',
        'x111',
        'x111',
      ].join('\n'));
    });

    it('can draw a cornar with multiple symbols', function() {
      let box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      box.matrix = drawCorner(box.matrix, {x: 0, y: 0, width: 3, height: 2}, ['1', '2', '3', '4']);
      assert.strictEqual(boxUtils.toText(box), [
        '123x',
        '412x',
        'xxxx',
      ].join('\n'));
    });

    it('should not break original box', function() {
      const box = boxUtils.createBox({x: 0, y: 0, width: 4, height: 3}, {defaultSymbol: 'x'});
      const newBox = Object.assign({}, box, {
        matrix: drawCorner(box.matrix, {x: 0, y: 0, width: 1, height: 1}, ['1']),
      });

      assert.strictEqual(boxUtils.toText(box), [
        'xxxx',
        'xxxx',
        'xxxx',
      ].join('\n'));
      assert.strictEqual(boxUtils.toText(newBox), [
        '1xxx',
        'xxxx',
        'xxxx',
      ].join('\n'));
    });
  });
});
