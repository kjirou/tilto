// @flow


/*::
export type ElementSymbol = string;
export type Element = {
  x: number,
  y: number,
  symbol: ElementSymbol | null,
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
  static _validateMatrix(matrix/*: Matrix*/)/*: boolean*/ {
    return (
      Array.isArray(matrix) &&
      matrix.length > 0 &&
      Array.isArray(matrix[0]) &&
      matrix[0].length > 0 &&
      matrix.every(row => row.length === matrix[0].length)
    );
  }

  static _textToSymbolMatrix(text/*: string*/)/*: ElementSymbol[][]*/ {
    return text
      .replace(/\n+$/, '')
      .split('\n')
      .map(row => row.split(''));
  }

  static fromText(text/*: string*/)/*: Box*/ {
    const symbolMatrix = Box._textToSymbolMatrix(text);

    const box = new Box({
      x: 0,
      y: 0,
      width: symbolMatrix[0].length,
      height: symbolMatrix.length,
    });

    for (let y = 0; y < symbolMatrix.length; y += 1) {
      for (let x = 0; x < symbolMatrix[0].length; x += 1) {
        const element = box.getElement({x, y});
        if (element) {
          element.symbol = symbolMatrix[y][x];
        } else {
          throw new Error('A situation not expected');
        }
      }
    }

    return box;
  }

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

    if (!Box._validateMatrix(this._matrix)) {
      throw new Error('The matrix size is invalid');
    }

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

  _cropMatrix(rectangle/*: Rectangle*/)/*: Matrix | null*/ {
    const matrix = [];

    for (let y = rectangle.y; y < rectangle.y + rectangle.height; y += 1) {
      const row = [];
      for (let x = rectangle.x; x < rectangle.x + rectangle.width; x += 1) {
        const element = this.getElement({x, y});
        if (element) {
          row.push(element);
        }
      }
      if (row.length > 0) {
        matrix.push(row);
      }
    }

    if (!Box._validateMatrix(matrix)) {
      return null;
    }

    return matrix;
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
