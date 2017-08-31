const assert = require('assert');

const Box = require('../../lib/Box');
const TextSketchbook = require('../../lib/TextSketchbook');


describe('lib/TextSketchbook', function() {
  describe('addBox', function() {
    it('should throw an error when boxId is duplicated', function() {
      const book = new TextSketchbook(1, 2);
      const box1 = new Box({x: 0, y: 0, width: 1, height: 1}, {id: 'a'});
      const box2 = new Box({x: 0, y: 0, width: 1, height: 1}, {id: 'b'});
      const box3 = new Box({x: 0, y: 0, width: 1, height: 1}, {id: 'a'});

      book.addBox(box1);
      book.addBox(box2);
      assert.throws(() => {
        book.addBox(box3);
      }, /duplicated/);
    });
  });

  describe('drawBox', function() {
    it('works', function() {
      const book = new TextSketchbook(3, 4, {symbol: 'A'});

      book.drawBox({x: 1, y: 2, width: 2, height: 3}, {symbol: 'B'});
      assert.strictEqual(book.toString(), [
        'AAA',
        'AAA',
        'ABB',
        'ABB',
      ].join('\n'));

      book.drawBox({x: 1, y: 2, width: 1, height: 1}, {symbol: 'C'});
      assert.strictEqual(book.toString(), [
        'AAA',
        'AAA',
        'ACB',
        'ABB',
      ].join('\n'));
    });
  });
});
