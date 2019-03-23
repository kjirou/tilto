import {
  Element,
  ElementSymbol,
  Matrix,
  getMaxX,
  getMaxY,
} from './matrix-utils';
import {Rectangle} from './rectangle-utils';


function getByCirculatedIndex<ArrayElement>(ary: ArrayElement[], index: number): ArrayElement {
  const found = ary[(ary.length + index) % ary.length];
  if (found === undefined) {
    throw new Error('Can not find an element');
  }
  return found;
};

export function clearTopSide(matrix: Matrix, width: number): Matrix {
  return matrix.map((row, y) => {
    if (y < width) {
      return row.map(element => Object.assign({}, element, {symbol: null}));
    }
    return row;
  });
};

export function clearBottomSide(matrix: Matrix, width: number): Matrix {
  const maxY = getMaxY(matrix);

  return matrix.map((row, y) => {
    if (y > maxY - width) {
      return row.map(element => Object.assign({}, element, {symbol: null}));
    }
    return row;
  });
};

export function clearLeftSide(matrix: Matrix, width: number): Matrix {
  return matrix.map(row => {
    const newRow = row.slice();
    for (let x = 0; x < width; x += 1) {
      newRow[x] = Object.assign({}, newRow[x], {symbol: null});
    }
    return newRow;
  });
};

export function clearRightSide(matrix: Matrix, width: number): Matrix {
  const maxX = getMaxX(matrix);

  return matrix.map(row => {
    const newRow = row.slice();
    for (let x = maxX; x > maxX - width; x -= 1) {
      newRow[x] = Object.assign({}, newRow[x], {symbol: null});
    }
    return newRow;
  });
};

export function drawTopSide(
  matrix: Matrix,
  borderWidth: number,
  symbols: (ElementSymbol | null)[],
  fromX: number,
  toX: number
): Matrix {
  return matrix.map((row, y) => {
    if (y < borderWidth) {
      return row.map((element, x) => {
        if (x >= fromX && x <= toX && symbols.length > 0) {
          return Object.assign({}, element, {
            symbol: getByCirculatedIndex<ElementSymbol | null>(symbols, y),
          });
        }
        return element;
      });
    }
    return row;
  });
};

export function drawBottomSide(
  matrix: Matrix,
  borderWidth: number,
  symbols: (ElementSymbol | null)[],
  fromX: number,
  toX: number
): Matrix {
  const maxY = getMaxY(matrix);

  return matrix.map((row, y) => {
    if (y > maxY - borderWidth) {
      return row.map((element, x) => {
        if (x >= fromX && x <= toX && symbols.length > 0) {
          return Object.assign({}, element, {
            symbol: getByCirculatedIndex<ElementSymbol | null>(symbols, maxY - y),
          });
        }
        return element;
      });
    }
    return row;
  });
};

export function drawLeftSide(
  matrix: Matrix,
  borderWidth: number,
  symbols: (ElementSymbol | null)[],
  fromY: number,
  toY: number
): Matrix {
  return matrix.map((row, y) => {
    if (y >= fromY && y <= toY) {
      return row.map((element, x) => {
        if (x < borderWidth && symbols.length > 0) {
          return Object.assign({}, element, {
            symbol: getByCirculatedIndex<ElementSymbol | null>(symbols, x),
          });
        }
        return element;
      });
    }
    return row;
  });
};

export function drawRightSide(
  matrix: Matrix,
  borderWidth: number,
  symbols: (ElementSymbol | null)[],
  fromY: number,
  toY: number
): Matrix {
  const maxX = getMaxX(matrix);

  return matrix.map((row, y) => {
    if (y >= fromY && y <= toY) {
      return row.map((element, x) => {
        if (x > maxX - borderWidth && symbols.length > 0) {
          return Object.assign({}, element, {
            symbol: getByCirculatedIndex<ElementSymbol | null>(symbols, maxX - x),
          });
        }
        return element;
      });
    }
    return row;
  });
};

export function drawCorner(
  matrix: Matrix,
  rectangle: Rectangle,
  symbols: (ElementSymbol | null)[]
): Matrix {
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
