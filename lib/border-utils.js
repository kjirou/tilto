// @flow

const matrixUtils = require('./matrix-utils');

/*::
import type {
  Element,
  ElementSymbol,
  Matrix,
} from './matrix-utils';
import type {Rectangle} from './rectangle-utils';

import type {
  Box,
} from './box-utils';
 */


const getByCirculatedIndex = (ary/*: any[]*/, index/*: number*/)/*: any*/ => {
  return ary[(ary.length + index) % ary.length];
};

const clearTopSide = (box/*: Box*/, width/*: number*/)/*: Box*/ => {
  const newMatrix = box.matrix.map((row, y) => {
    if (y < width) {
      return row.map(element => Object.assign({}, element, {symbol: null}));
    }
    return row;
  });

  return Object.assign({}, box, {matrix: newMatrix});
};

const clearBottomSide = (box/*: Box*/, width/*: number*/)/*: Box*/ => {
  const maxY = matrixUtils.getMaxY(box.matrix);

  const newMatrix = box.matrix.map((row, y) => {
    if (y > maxY - width) {
      return row.map(element => Object.assign({}, element, {symbol: null}));
    }
    return row;
  });

  return Object.assign({}, box, {matrix: newMatrix});
};

const clearLeftSide = (box/*: Box*/, width/*: number*/)/*: Box*/ => {
  const newMatrix = box.matrix.map(row => {
    const newRow = row.slice();
    for (let x = 0; x < width; x += 1) {
      newRow[x] = Object.assign({}, newRow[x], {symbol: null});
    }
    return newRow;
  });

  return Object.assign({}, box, {matrix: newMatrix});
};

const clearRightSide = (box/*: Box*/, width/*: number*/)/*: Box*/ => {
  const maxX = matrixUtils.getMaxX(box.matrix);

  const newMatrix = box.matrix.map(row => {
    const newRow = row.slice();
    for (let x = maxX; x > maxX - width; x -= 1) {
      newRow[x] = Object.assign({}, newRow[x], {symbol: null});
    }
    return newRow;
  });

  return Object.assign({}, box, {matrix: newMatrix});
};

const drawTopSide = (
  box/*: Box*/,
  borderWidth/*: number*/,
  symbols/*: (ElementSymbol | null)[]*/,
  fromX/*: number*/,
  toX/*: number*/
)/*: Box*/ => {
  const newMatrix = box.matrix.map((row, y) => {
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

  return Object.assign({}, box, {matrix: newMatrix});
};

const drawBottomSide = (
  box/*: Box*/,
  borderWidth/*: number*/,
  symbols/*: (ElementSymbol | null)[]*/,
  fromX/*: number*/,
  toX/*: number*/
)/*: Box*/ => {
  const maxY = matrixUtils.getMaxY(box.matrix);

  const newMatrix = box.matrix.map((row, y) => {
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

  return Object.assign({}, box, {matrix: newMatrix});
};

const drawLeftSide = (
  box/*: Box*/,
  borderWidth/*: number*/,
  symbols/*: (ElementSymbol | null)[]*/,
  fromY/*: number*/,
  toY/*: number*/
)/*: Box*/ => {
  const newMatrix = box.matrix.map((row, y) => {
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

  return Object.assign({}, box, {matrix: newMatrix});
};

const drawRightSide = (
  box/*: Box*/,
  borderWidth/*: number*/,
  symbols/*: (ElementSymbol | null)[]*/,
  fromY/*: number*/,
  toY/*: number*/
)/*: Box*/ => {
  const maxX = matrixUtils.getMaxX(box.matrix);

  const newMatrix = box.matrix.map((row, y) => {
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

  return Object.assign({}, box, {matrix: newMatrix});
};

const drawCorner = (
  box/*: Box*/,
  rectangle/*: Rectangle*/,
  symbols/*: (ElementSymbol | null)[]*/
)/*: Box*/ => {
  let counter = 0;

  const newMatrix = box.matrix.map((row, y) => {
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

  return Object.assign({}, box, {matrix: newMatrix});
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
