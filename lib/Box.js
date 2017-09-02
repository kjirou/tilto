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

  asString(nullSymbol/*: string*/ = ' ')/*: string*/ {
    return this._matrix.map(row => {
      return row.map(element => element.symbol || nullSymbol).join('');
    }).join('\n');
  }

  getMatrix() {
    return this._matrix;
  }

  getId() {
    return this._id;
  }

  getWidth() {
    return this._matrix[0].length;
  }

  getHeight() {
    return this._matrix.length;
  }

  getMaxX() {
    return this.getWidth() - 1;
  }

  getMaxY() {
    return this.getHeight() - 1;
  }

  getElement(coordinate/*: Coordinate*/)/*: Element | null*/ {
    const row = this._matrix[coordinate.y];
    if (!row) {
      return null;
    }
    return row[coordinate.x] || null;
  }

  getElementByAbsoluteCoordinate(coordinate/*: Coordinate*/)/*: Element | null*/ {
    return this.getElement({
      x: coordinate.x - this._x,
      y: coordinate.y - this._y,
    });
  }

//  setBorder(options/*: {
//    topWidth?: number,
//    rightWidth?: number,
//    bottomWidth?: number,
//    leftWidth?: number,
//    topPattern?: string[],
//    rightPattern?: string[],
//    bottomPattern?: string[],
//    leftPattern?: string[],
//    topRightPattern?: string[],
//    bottomRightPattern?: string[],
//    bottomLeftPattern?: string[],
//    topLeftPattern?: string[],
//  }*/ = {})/*: void*/ {
//    const fixedOptions = Object.assign({}, {
//      topWidth: 0,
//      rightWidth: 0,
//      bottomWidth: 0,
//      leftWidth: 0,
//      topPattern: [],
//      rightPattern: [],
//      bottomPattern: [],
//      leftPattern: [],
//      topRightPattern: [],
//      bottomRightPattern: [],
//      bottomLeftPattern: [],
//      topLeftPattern: [],
//    }, options);
//
//    if (
//      (fixedOptions.topWidth + fixedOptions.bottomWidth) > this._getHeight() ||
//      (fixedOptions.leftWidth + fixedOptions.rightWidth) > this._getWidth()
//    ) {
//      throw new Error('Border lines do not fit in the box');
//    }
//
//    // TODO: Set content area
//  }
}

module.exports = Box;
