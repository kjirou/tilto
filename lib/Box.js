// @flow


/*::
export type ElementSymbol = string;
export type Element = {
  x: number,
  y: number,
  symbol: ElementSymbol,
};
export type Matrix = Element[][];
export type Coordinate = {
  x: number,
  y: number,
};
export type Rectangle = {
  x: number,
  y: number,
  width: number,
  height: number,
};
 */


class Box {
  /*::
  _x: number;
  _y: number;
  _matrix: Matrix;
   */
  constructor(rectangle/*: Rectangle*/, symbol/*: ElementSymbol*/) {

    // TODO: Validate width > 0 and height > 0

    this._x = rectangle.x;
    this._y = rectangle.y;

    const matrix = [];
    for (let y = 0; y < rectangle.height; y += 1) {
      matrix.push([]);
      for (let x = 0; x < rectangle.width; x += 1) {
        matrix[y].push({
          y,
          x,
          symbol,
        });
      }
    }
    this._matrix = matrix;
  }

  getMatrix() {
    return this._matrix;
  }

  getElementByAbsoluteCoordinate(coordinate/*: Coordinate*/)/*: Element | null*/ {
    const row = this._matrix[this._y + coordinate.y];
    if (!row) {
      return null;
    }
    return row[this._x + coordinate.x] || null;
  }
}

module.exports = Box;
