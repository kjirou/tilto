// @flow

/*::
export type Rectangle = {
  x: number,
  y: number,
  width: number,
  height: number,
};
 */


/**
 * Shrink a rectangle with margins
 */
function shrinkRectangle(
  rectangle/*: Rectangle*/,
  margins/*: {top?: number, bottom?: number, left?: number, right?: number}*/ = {}
)/*: Rectangle*/ {
  const {
    top, bottom, left, right
  } = Object.assign({}, {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }, margins);

  const maxY = rectangle.y + rectangle.height;
  const maxX = rectangle.x + rectangle.width;
  const maxHeight = rectangle.height;
  const maxWidth = rectangle.width;

  const y = rectangle.y + top;
  const height = maxHeight - top - bottom;
  const x = rectangle.x + left;
  const width = maxWidth - left - right;

  if (
    (y < 0 || y > maxY) ||
    (x < 0 || x > maxX) ||
    (height < 0 || height > maxHeight) ||
    (width < 0 || width > maxWidth)
  ) {
    throw new Error('Invalid margin sizes');
  }

  return {x, y, width, height};
}

module.exports = {
  shrinkRectangle,
};
