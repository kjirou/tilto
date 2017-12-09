// @flow

const borderUtils = require('./border-utils');


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
export type Borders = {
  topWidth: number,
  bottomWidth: number,
  leftWidth: number,
  rightWidth: number,
};
export type BoxId = string | null;
export type ConstructorOptions = {
  id?: BoxId,
  symbol?: ElementSymbol,
};
 */


class Box {
  /**
   * Shrink rectangle with margins
   */
  static _shrinkRectangle(
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
    return content.split('');
  }

  // TODO: multibyte characters
  // TODO: consider word-wrap/word-break
  // TODO: consider intentional overflow:hidden;
  static _pourContent(
    matrix/*: Matrix*/,
    content/*: string*/
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
  _borders: Borders;
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

    this._borders = {
      topWidth: 0,
      bottomWidth: 0,
      leftWidth: 0,
      rightWidth: 0,
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
      const contentArea = Box._cropMatrix(outputBuffer, this._computeContentArea());
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

  toString() {
    return this.asString();
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

  getElementByAbsoluteCoordinate(coordinate/*: Coordinate*/)/*: Element | null*/ {
    return this.getElement({
      x: coordinate.x - this._x,
      y: coordinate.y - this._y,
    });
  }

  _computeContentArea()/*: Rectangle*/ {
    const maxHeight = this.getHeight();
    const maxWidth = this.getWidth();

    let contentArea = {
      x: 0,
      y: 0,
      width: maxWidth,
      height: maxHeight,
    };

    contentArea = Box._shrinkRectangle(contentArea, {
      top: this._borders.topWidth,
      bottom: this._borders.bottomWidth,
      left: this._borders.leftWidth,
      right: this._borders.rightWidth,
    });

    return contentArea;
  }

  setContent(value/*: string*/) {
    this._content = value;
  }

  setBorders(options/*: {
    topWidth?: number,
    rightWidth?: number,
    bottomWidth?: number,
    leftWidth?: number,
    topSymbols?: (ElementSymbol | null)[],
    rightSymbols?: (ElementSymbol | null)[],
    bottomSymbols?: (ElementSymbol | null)[],
    leftSymbols?: (ElementSymbol | null)[],
    topRightSymbols?: (ElementSymbol | null)[],
    bottomRightSymbols?: (ElementSymbol | null)[],
    bottomLeftSymbols?: (ElementSymbol | null)[],
    topLeftSymbols?: (ElementSymbol | null)[],
  }*/ = {})/*: void*/ {
    const fixedOptions = Object.assign({}, {
      topWidth: 0,
      rightWidth: 0,
      bottomWidth: 0,
      leftWidth: 0,
      topSymbols: [],
      rightSymbols: [],
      bottomSymbols: [],
      leftSymbols: [],
      topRightSymbols: [],
      bottomRightSymbols: [],
      bottomLeftSymbols: [],
      topLeftSymbols: [],
    }, options);

    const maxWidth = this.getWidth();
    const maxHeight = this.getHeight();

    borderUtils.clearTopSide(this, fixedOptions.topWidth);
    borderUtils.clearBottomSide(this, fixedOptions.bottomWidth);
    borderUtils.clearLeftSide(this, fixedOptions.leftWidth);
    borderUtils.clearRightSide(this, fixedOptions.rightWidth);

    borderUtils.drawTopSide(
      this,
      fixedOptions.topWidth,
      fixedOptions.topSymbols,
      fixedOptions.leftWidth,
      maxWidth - fixedOptions.rightWidth
    );
    borderUtils.drawBottomSide(
      this,
      fixedOptions.bottomWidth,
      fixedOptions.bottomSymbols,
      fixedOptions.leftWidth,
      maxWidth - fixedOptions.rightWidth
    );
    borderUtils.drawLeftSide(
      this,
      fixedOptions.leftWidth,
      fixedOptions.leftSymbols,
      fixedOptions.topWidth,
      maxHeight - fixedOptions.bottomWidth
    );
    borderUtils.drawRightSide(
      this,
      fixedOptions.rightWidth,
      fixedOptions.rightSymbols,
      fixedOptions.topWidth,
      maxHeight - fixedOptions.bottomWidth
    );

    borderUtils.drawCorner(  // top-left
      this,
      {x: 0, y: 0,
        width: fixedOptions.leftWidth, height: fixedOptions.topWidth},
      fixedOptions.topLeftSymbols
    );
    borderUtils.drawCorner(  // top-right
      this,
      {x: maxWidth - fixedOptions.rightWidth, y: 0,
        width: fixedOptions.rightWidth, height: fixedOptions.topWidth},
      fixedOptions.topRightSymbols
    );
    borderUtils.drawCorner(  // bottom-left
      this,
      {x: 0, y: maxHeight - fixedOptions.bottomWidth,
        width: fixedOptions.leftWidth, height: fixedOptions.bottomWidth},
      fixedOptions.bottomLeftSymbols
    );
    borderUtils.drawCorner(  // bottom-right
      this,
      {x: maxWidth - fixedOptions.rightWidth, y: maxHeight - fixedOptions.bottomWidth,
        width: fixedOptions.rightWidth, height: fixedOptions.bottomWidth},
      fixedOptions.bottomRightSymbols
    );

    this._borders = {
      topWidth: fixedOptions.topWidth,
      bottomWidth: fixedOptions.bottomWidth,
      leftWidth: fixedOptions.leftWidth,
      rightWidth: fixedOptions.rightWidth,
    };
  }
}

module.exports = Box;
