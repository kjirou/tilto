const assert = require('assert');

const TextSketchbook = require('../../lib/TextSketchbook');


describe('lib/TextSketchbook', function() {
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
