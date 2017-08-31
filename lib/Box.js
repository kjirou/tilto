// @flow


/*::
export type ElementSymbol = string | null;
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
export type BoxId = string | null;
export type ConstructorOptions = {
  id?: BoxId,
  symbol?: ElementSymbol,
};
 */


class Box {
  /*::
  _x: number;
  _y: number;
  _matrix: Matrix;
  _id: BoxId;
   */
  constructor(rectangle/*: Rectangle*/, options/*: ConstructorOptions*/ = {}) {
    const fixedOptions = Object.assign({}, {
      id: null,
      symbol: null,
    }, options);

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
          symbol: fixedOptions.symbol,
        });
      }
    }
    this._matrix = matrix;

    this._id = fixedOptions.id;
  }

  getMatrix() {
    return this._matrix;
  }

  getId() {
    return this._id;
  }

  getElementByAbsoluteCoordinate(coordinate/*: Coordinate*/)/*: Element | null*/ {
    const row = this._matrix[coordinate.y - this._y];
    if (!row) {
      return null;
    }
    return row[coordinate.x - this._x] || null;
  }
}

module.exports = Box;
