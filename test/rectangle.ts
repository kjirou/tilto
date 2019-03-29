import * as assert from 'assert';

import {shrinkRectangle} from '../src/rectangle';


describe('rectangle', function() {
  describe('shrinkRectangle', function() {
    const rect = {x: 1, y: 2, width: 3, height: 4};

    it('can apply no paddings', function() {
      assert.deepStrictEqual(shrinkRectangle(rect), {x: 1, y: 2, width: 3, height: 4});
    });

    it('can pad to the top', function() {
      assert.deepStrictEqual(shrinkRectangle(rect, {top: 2}), {x: 1, y: 4, width: 3, height: 2});
    });

    it('can set to the bottom', function() {
      assert.deepStrictEqual(shrinkRectangle(rect, {bottom: 2}), {x: 1, y: 2, width: 3, height: 2});
    });

    it('can pad to the left', function() {
      assert.deepStrictEqual(shrinkRectangle(rect, {left: 2}), {x: 3, y: 2, width: 1, height: 4});
    });

    it('can pad to the right', function() {
      assert.deepStrictEqual(shrinkRectangle(rect, {right: 2}), {x: 1, y: 2, width: 1, height: 4});
    });

    it('can set to all sides', function() {
      assert.deepStrictEqual(
        shrinkRectangle(rect, {top: 1, bottom: 1, left: 1, right: 1}),
        {x: 2, y: 3, width: 1, height: 2}
      );
    });

    it('can be set the size to 0', function() {
      assert.deepStrictEqual(
        shrinkRectangle(rect, {top: 1, bottom: 3, left: 1, right: 2}),
        {x: 2, y: 3, width: 0, height: 0}
      );
    });
  });
});
