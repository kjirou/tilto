// @flow

const rectangleUtils = require('./rectangle-utils');

/*::
import type {Coordinate} from './coordinate-utils';
import type {Rectangle} from './rectangle-utils';
import type {Size} from './size-utils';

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
export type SymbolRuler = (symbol: ElementSymbol) => 0 | 1 | 2;
 */


function initializeMatrix(size/*: Size*/, defaultSymbol/*: (ElementSymbol | null)*/)/*: Matrix*/ {
  const matrix = [];
  for (let y = 0; y < size.height; y += 1) {
    matrix.push([]);
    for (let x = 0; x < size.width; x += 1) {
      matrix[y].push({
        y,
        x,
        symbol: defaultSymbol,
      });
    }
  }
  return matrix;
}

function toText(matrix/*: Matrix*/, defaultSymbol/*: ElementSymbol*/)/*: string*/ {
  return matrix
    .map(row => {
      return row.map(element => {
        if (element.symbol === false) {
          return '';
        } else if (element.symbol === null) {
          return defaultSymbol;
        }
        return element.symbol;
      }).join('');
    })
    .join('\n');
};

function getElement(matrix/*: Matrix*/, coordinate/*: Coordinate*/)/*: Element | null*/ {
  const row = matrix[coordinate.y];
  if (!row) {
    return null;
  }
  return row[coordinate.x] || null;
}

function getWidth(matrix/*: Matrix*/)/*: number*/ {
  return matrix[0].length;
}

function getHeight(matrix/*: Matrix*/)/*: number*/ {
  return matrix.length;
}

function getMaxX(matrix/*: Matrix*/)/*: number*/ {
  return getWidth(matrix) - 1;
}

function getMaxY(matrix/*: Matrix*/)/*: number*/ {
  return getHeight(matrix) - 1;
}

function validateMatrix(matrix/*: Matrix*/)/*: boolean*/ {
  return (
    Array.isArray(matrix) &&
    matrix.length > 0 &&
    Array.isArray(matrix[0]) &&
    matrix[0].length > 0 &&
    matrix.every(row => row.length === matrix[0].length)
  );
}

function overwriteMatrix(matrix/*: Matrix*/, replacer/*: Matrix*/, coordinate/*: Coordinate*/)/*: Matrix*/ {
  return matrix.map((row, y) => {
    if (y >= coordinate.y && y < coordinate.y + getHeight(replacer)) {
      return row.map((element, x) => {
        if (x >= coordinate.x && x < coordinate.x + getWidth(replacer)) {
          const newElement = getElement(replacer, {
            y: y - coordinate.y,
            x: x - coordinate.x,
          });
          if (newElement) {
            return newElement;
          } else {
            throw new Error('It is a branch only for "flow", so it does not pass here at run-time.');
          }
        }
        return element;
      });
    }
    return row;
  });
}

function cropMatrix(matrix/*: Matrix*/, rectangle/*: Rectangle*/)/*: Matrix | null*/ {
  const newMatrix = [];

  for (let y = rectangle.y; y < rectangle.y + rectangle.height; y += 1) {
    const row = [];
    for (let x = rectangle.x; x < rectangle.x + rectangle.width; x += 1) {
      const element = getElement(matrix, {x, y});
      if (element) {
        row.push(element);
      }
    }
    if (row.length > 0) {
      newMatrix.push(row);
    }
  }

  if (!validateMatrix(newMatrix)) {
    return null;
  }

  return newMatrix;
}

// TODO: ANSI characters
//       Ref) https://github.com/chalk/slice-ansi
// TODO: Surrogate pairs
function parseContentToSymbols(content/*: string*/)/*: (ElementSymbol | '\n')[]*/ {
  return content.split('');
}

// TODO: consider word-wrap/word-break
function pourContent(
  matrix/*: Matrix*/,
  content/*: string*/,
  symbolRuler/*: SymbolRuler*/
)/*: Matrix*/ {
  const maxWidth = getWidth(matrix);
  const maxHeight = getHeight(matrix);

  let newMatrix = matrix.map(row => row.slice());
  let yPointer = 0;
  let xPointer = 0;

  parseContentToSymbols(content).forEach(symbol => {
    const symbolWidth = symbolRuler(symbol);

    if (symbol === '\n') {
      yPointer += 1;
      xPointer = 0;
    } else if (symbolWidth === 2 && maxWidth === 1) {
      yPointer += maxHeight;  // It intentionally overflows
    } else {
      if (symbolWidth === 2) {
        if (
          // |abcd|P => |abcd|
          // |....|     |P...|
          // (P = pointer)
          xPointer === maxWidth ||
          // |abcP| => |abcd|
          // |....|    |P...|
          // (P = pointer)
          xPointer + 1 === maxWidth
        ) {
          yPointer += 1;
          xPointer = 0;
        }

        const element1 = getElement(newMatrix, {x: xPointer, y: yPointer});
        if (element1) {
          newMatrix[yPointer][xPointer] = Object.assign({}, element1, {symbol});
        }
        xPointer += 1

        const element2 = getElement(newMatrix, {x: xPointer, y: yPointer});
        if (element2) {
          newMatrix[yPointer][xPointer] = Object.assign({}, element2, {symbol: false});
        }
        xPointer += 1
      } else if (symbolWidth === 1) {
        if (xPointer === maxWidth) {
          yPointer += 1;
          xPointer = 0;
        }

        const element = getElement(newMatrix, {x: xPointer, y: yPointer});
        if (element) {
          newMatrix[yPointer][xPointer] = Object.assign({}, element, {symbol});
        }

        xPointer += 1;
      }
    }
  });

  return newMatrix;
}

module.exports = {
  cropMatrix,
  getElement,
  getHeight,
  getMaxX,
  getMaxY,
  getWidth,
  initializeMatrix,
  overwriteMatrix,
  pourContent,
  toText,
  validateMatrix,
};
