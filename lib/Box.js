// @flow


/*::
export type ElementSymbol = string;
export type Element = {
  x: number,
  y: number,
  // null  .. シンボルがないことを示す
  // false .. コンテンツ流し込み時に詰めることを表現するために使う内部用の値。
  //          Matrix に対して OutputBufferMatrix というここだけ変えた型を定義して分離しようとしたが、
  //          Flow が Comment Types で Generic Types が定義できないという問題が有り、
  //          似たような複数の型に対して処理を書くのが難しいので一旦止めた。
  symbol: ElementSymbol | null | false,
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
  static _getWidth(matrix/*: Matrix*/)/*: number*/ {
    return matrix[0].length;
  }

  static _getHeight(matrix/*: Matrix*/)/*: number*/ {
    return matrix.length;
  }

  static _getElement(matrix/*: Matrix*/, coordinate/*: Coordinate*/)/*: Element | null*/ {
    const row = matrix[coordinate.y];
    if (!row) {
      return null;
    }
    return row[coordinate.x] || null;
  }

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

  static _cropMatrix(matrix/*: Matrix*/, rectangle/*: Rectangle*/)/*: Matrix | null*/ {
    const newMatrix = [];

    for (let y = rectangle.y; y < rectangle.y + rectangle.height; y += 1) {
      const row = [];
      for (let x = rectangle.x; x < rectangle.x + rectangle.width; x += 1) {
        const element = Box._getElement(matrix, {x, y});
        if (element) {
          row.push(element);
        }
      }
      if (row.length > 0) {
        newMatrix.push(row);
      }
    }

    if (!Box._validateMatrix(newMatrix)) {
      return null;
    }

    return newMatrix;
  }

  // TODO: ANSI characters
  //       Ref) https://github.com/chalk/slice-ansi
  // TODO: Surrogate pairs
  static _parseContentToSymbols(content/*: string*/)/*: (ElementSymbol | '\n')[]*/ {
    const trimmed = content.replace(/\n+$/, '');
    return trimmed.split('');
  }

  // TODO: multibyte characters
  // TODO: consider word-wrap/word-break
  // TODO: consider intentional overflow:hidden;
  static _pourContent(
    matrix/*: Matrix*/,
    content/*: string*/,
    options = {}
  )/*: void*/ {
    const maxWidth = matrix[0].length;
    const maxHeight = matrix.length;

    let yPointer = 0;
    let xPointer = 0;

    Box._parseContentToSymbols(content).forEach(symbol => {
      if (symbol === '\n') {
        yPointer += 1;
        xPointer = 0;
      } else {
        if (xPointer === maxWidth) {
          yPointer += 1;
          xPointer = 0;
        }

        const element = Box._getElement(matrix, {x: xPointer, y: yPointer});
        if (element) {
          element.symbol = symbol;
        }

        xPointer += 1;
      }
    });
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
  _contentArea: Rectangle;
  // Now neither ANSI characters nor surrogate-pairs is considered.
  _content: string;
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

    this._contentArea = {
      x: 0,
      y: 0,
      width: Box._getWidth(this._matrix),
      height: Box._getHeight(this._matrix),
    };
    this._content = '';
  }

  // TODO: child boxes
  // TODO: cache
  asString(defaultSymbol/*: ElementSymbol*/ = ' ')/*: string*/ {
    const outputBuffer/*: Matrix*/ = this._matrix.map(row => {
      return row.map(element => {
        return Object.assign({}, element, {
          symbol: element.symbol === null ? defaultSymbol : element.symbol,
        });
      });
    });

    if (this._content !== '') {
      const contentArea = Box._cropMatrix(outputBuffer, this._contentArea);
      if (contentArea) {
        Box._pourContent(contentArea, this._content);
      }
    }

    return outputBuffer
      .map(row => {
        return row.map(element => {
          return element.symbol === false ? '' : element.symbol;
        }).join('');
      })
      .join('\n');
  }

  getMatrix() {
    return this._matrix;
  }

  getId() {
    return this._id;
  }

  getWidth() {
    return Box._getWidth(this._matrix);
  }

  getHeight() {
    return Box._getHeight(this._matrix);
  }

  getMaxX() {
    return this.getWidth() - 1;
  }

  getMaxY() {
    return this.getHeight() - 1;
  }

  getElement(coordinate/*: Coordinate*/)/*: Element | null*/ {
    return Box._getElement(this._matrix, coordinate);
  }

  setContent(value/*: string*/) {
    this._content = value;
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
