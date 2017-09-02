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

  _getWidth() {
    return this._matrix[0].length;
  }

  _getHeight() {
    return this._matrix.length;
  }

  _getElement(coordinate/*: Coordinate*/)/*: Element | null*/ {
    const row = this._matrix[coordinate.y];
    if (!row) {
      return null;
    }
    return row[coordinate.x] || null;
  }

  getElementByAbsoluteCoordinate(coordinate/*: Coordinate*/)/*: Element | null*/ {
    return this._getElement({
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
//    // Clear top
//    for (let delta = 0; delta < fixedOptions.topWidth; delta += 1) {
//      const row = this._matrix[delta];
//      row.forEach(element => element.symbol = null);
//    }
//
//    // Clear bottom
//    for (let delta = 0; delta < fixedOptions.bottomWidth; delta += 1) {
//      const row = this._matrix[this._getHeight() - 1 - delta];
//      row.forEach(element => element.symbol = null);
//    }
//
//    // Clear left
//    for (let delta = 0; delta < fixedOptions.leftWidth; delta += 1) {
//      this._matrix.forEach(row => {
//        const element = row[delta];
//        element.symbol = null;
//      });
//    }
//
//    // Clear right
//    for (let delta = 0; delta < fixedOptions.rightWidth; delta += 1) {
//      this._matrix.forEach(row => {
//        const element = row[this._getWidth() - 1 - delta];
//        element.symbol = null;
//      });
//    }
//
//    const getByRotatedIndex = (ary, index) => {
//      return ary[(ary.length + index) % ary.length];
//    };
//
//    // Draw top
//    if (fixedOptions.topWidth > 0 && fixedOptions.topPattern.length > 0) {
//      for (let x = fixedOptions.rightWidth; x < this._getWidth() - fixedOptions.leftWidth; x += 1) {
//        for (let y = 0; y < fixedOptions.topWidth; y += 1) {
//          const element = this._getElement({x, y});
//          if (element) {
//            element.symbol = getByRotatedIndex(fixedOptions.topPattern, y);
//          }
//        }
//      }
//    }
//
//    // Draw bottom
//    if (fixedOptions.bottomWidth > 0 && fixedOptions.bottomPattern.length > 0) {
//      for (let x = fixedOptions.rightWidth; x < this._getWidth() - fixedOptions.leftWidth; x += 1) {
//        for (let deltaY = 0; deltaY < fixedOptions.bottomWidth; deltaY += 1) {
//          const y = this._getHeight() - 1 - deltaY;
//          const element = this._getElement({x, y});
//          if (element) {
//            element.symbol = getByRotatedIndex(fixedOptions.bottomPattern, deltaY);
//          }
//        }
//      }
//    }
//
//    // Draw left
//    if (fixedOptions.leftWidth > 0 && fixedOptions.leftPattern.length > 0) {
//      for (let y = fixedOptions.topWidth; y < this._getHeight() - fixedOptions.bottomWidth; y += 1) {
//        for (let x = 0; x < fixedOptions.leftWidth; x += 1) {
//          const element = this._getElement({x, y});
//          if (element) {
//            element.symbol = getByRotatedIndex(fixedOptions.leftPattern, x);
//          }
//        }
//      }
//    }
//
//    // Draw right
//    if (fixedOptions.rightWidth > 0 && fixedOptions.rightPattern.length > 0) {
//      for (let y = fixedOptions.topWidth; y < this._getHeight() - fixedOptions.bottomWidth; y += 1) {
//        for (let deltaX = 0; deltaX < fixedOptions.rightWidth; deltaX += 1) {
//          const x = this._getWidth() - 1 - deltaX;
//          const element = this._getElement({x, y});
//          if (element) {
//            element.symbol = getByRotatedIndex(fixedOptions.rightPattern, deltaX);
//          }
//        }
//      }
//    }
//
//    // TODO: Set content area
//  }
}

module.exports = Box;
