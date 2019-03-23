// @flow

const matrixUtils = require('./matrix-utils');

/*::
import type {
  Element,
  ElementSymbol,
  Matrix,
} from './matrix-utils';
import type {Rectangle} from './rectangle-utils';
 */


const getByCirculatedIndex = (ary/*: any[]*/, index/*: number*/)/*: any*/ => {
  return ary[(ary.length + index) % ary.length];
};

const clearTopSide = (matrix/*: Matrix*/, width/*: number*/)/*: Matrix*/ => {
  return matrix.map((row, y) => {
    if (y < width) {
      return row.map(element => Object.assign({}, element, {symbol: null}));
    }
    return row;
  });
};

const clearBottomSide = (matrix/*: Matrix*/, width/*: number*/)/*: Matrix*/ => {
  const maxY = matrixUtils.getMaxY(matrix);

  return matrix.map((row, y) => {
    if (y > maxY - width) {
      return row.map(element => Object.assign({}, element, {symbol: null}));
    }
    return row;
  });
};

const clearLeftSide = (matrix/*: Matrix*/, width/*: number*/)/*: Matrix*/ => {
  return matrix.map(row => {
    const newRow = row.slice();
    for (let x = 0; x < width; x += 1) {
      newRow[x] = Object.assign({}, newRow[x], {symbol: null});
    }
    return newRow;
  });
};

const clearRightSide = (matrix/*: Matrix*/, width/*: number*/)/*: Matrix*/ => {
  const maxX = matrixUtils.getMaxX(matrix);

  return matrix.map(row => {
    const newRow = row.slice();
    for (let x = maxX; x > maxX - width; x -= 1) {
      newRow[x] = Object.assign({}, newRow[x], {symbol: null});
    }
    return newRow;
  });
};

const drawTopSide = (
  matrix/*: Matrix*/,
  borderWidth/*: number*/,
  symbols/*: (ElementSymbol | null)[]*/,
  fromX/*: number*/,
  toX/*: number*/
)/*: Matrix*/ => {
  return matrix.map((row, y) => {
    if (y < borderWidth) {
      return row.map((element, x) => {
        if (x >= fromX && x <= toX && symbols.length > 0) {
          return Object.assign({}, element, {
            symbol: getByCirculatedIndex(symbols, y),
          });
        }
        return element;
      });
    }
    return row;
  });
};

const drawBottomSide = (
  matrix/*: Matrix*/,
  borderWidth/*: number*/,
  symbols/*: (ElementSymbol | null)[]*/,
  fromX/*: number*/,
  toX/*: number*/
)/*: Matrix*/ => {
  const maxY = matrixUtils.getMaxY(matrix);

  return matrix.map((row, y) => {
    if (y > maxY - borderWidth) {
      return row.map((element, x) => {
        if (x >= fromX && x <= toX && symbols.length > 0) {
          return Object.assign({}, element, {
            symbol: getByCirculatedIndex(symbols, maxY - y),
          });
        }
        return element;
      });
    }
    return row;
  });
};

const drawLeftSide = (
  matrix/*: Matrix*/,
  borderWidth/*: number*/,
  symbols/*: (ElementSymbol | null)[]*/,
  fromY/*: number*/,
  toY/*: number*/
)/*: Matrix*/ => {
  return matrix.map((row, y) => {
    if (y >= fromY && y <= toY) {
      return row.map((element, x) => {
        if (x < borderWidth && symbols.length > 0) {
          return Object.assign({}, element, {
            symbol: getByCirculatedIndex(symbols, x),
          });
        }
        return element;
      });
    }
    return row;
  });
};

const drawRightSide = (
  matrix/*: Matrix*/,
  borderWidth/*: number*/,
  symbols/*: (ElementSymbol | null)[]*/,
  fromY/*: number*/,
  toY/*: number*/
)/*: Matrix*/ => {
  const maxX = matrixUtils.getMaxX(matrix);

  return matrix.map((row, y) => {
    if (y >= fromY && y <= toY) {
      return row.map((element, x) => {
        if (x > maxX - borderWidth && symbols.length > 0) {
          return Object.assign({}, element, {
            symbol: getByCirculatedIndex(symbols, maxX - x),
          });
        }
        return element;
      });
    }
    return row;
  });
};

const drawCorner = (
  matrix/*: Matrix*/,
  rectangle/*: Rectangle*/,
  symbols/*: (ElementSymbol | null)[]*/
)/*: Matrix*/ => {
  let counter = 0;

  return matrix.map((row, y) => {
    if (y >= rectangle.y && y < rectangle.y + rectangle.height) {
      return row.map((element, x) => {
        if (x >= rectangle.x && x < rectangle.x + rectangle.width) {
          const newRow = Object.assign({}, element, {
            symbol: getByCirculatedIndex(symbols, counter),
          });
          counter += 1;
          return newRow;
        }
        return element;
      });
    }
    return row;
  });
};

module.exports = {
  clearBottomSide,
  clearLeftSide,
  clearRightSide,
  clearTopSide,
  drawBottomSide,
  drawCorner,
  drawLeftSide,
  drawRightSide,
  drawTopSide,
};
