import {
  ElementSymbol,
  Matrix,
  getHeight,
  getMaxX,
  getMaxY,
  getWidth,
  matrixToRectangle,
} from './matrix';
import {
  Rectangle,
  rectangleToSize,
  shrinkRectangle,
} from './rectangle';
import {
  validateSize,
} from './utils';

export type Borders = {
  topWidth: number,
  rightWidth: number,
  bottomWidth: number,
  leftWidth: number,
  topSymbols: (ElementSymbol | null)[],
  rightSymbols: (ElementSymbol | null)[],
  bottomSymbols: (ElementSymbol | null)[],
  leftSymbols: (ElementSymbol | null)[],
  topRightSymbols: (ElementSymbol | null)[],
  bottomRightSymbols: (ElementSymbol | null)[],
  bottomLeftSymbols: (ElementSymbol | null)[],
  topLeftSymbols: (ElementSymbol | null)[],
};

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

function shrinkContentAreaByBorders(matrix: Matrix, borders: Borders): Rectangle {
  return shrinkRectangle(
    matrixToRectangle(matrix),
    {
      top: borders.topWidth,
      bottom: borders.bottomWidth,
      left: borders.leftWidth,
      right: borders.rightWidth,
    }
  );
}

export function validateMatrixWithBorders(matrix: Matrix, borders: Borders): boolean {
  const contentArea = shrinkContentAreaByBorders(matrix, borders);
  return validateSize(rectangleToSize(contentArea));
}

export function placeBorders(matrix: Matrix, borders: Borders): {
  matrix: Matrix,
  contentArea: Rectangle,
} {
  if (validateMatrixWithBorders(matrix, borders) === false) {
    throw new Error('Borders do not fit in the matrix');
  }

  const maxWidth = getWidth(matrix);
  const maxHeight = getHeight(matrix);
  let newMatrix = matrix;

  newMatrix = clearTopSide(newMatrix, borders.topWidth);
  newMatrix = clearBottomSide(newMatrix, borders.bottomWidth);
  newMatrix = clearLeftSide(newMatrix, borders.leftWidth);
  newMatrix = clearRightSide(newMatrix, borders.rightWidth);

  newMatrix = drawTopSide(
    newMatrix,
    borders.topWidth,
    borders.topSymbols,
    borders.leftWidth,
    maxWidth - borders.rightWidth
  );
  newMatrix = drawBottomSide(
    newMatrix,
    borders.bottomWidth,
    borders.bottomSymbols,
    borders.leftWidth,
    maxWidth - borders.rightWidth
  );
  newMatrix = drawLeftSide(
    newMatrix,
    borders.leftWidth,
    borders.leftSymbols,
    borders.topWidth,
    maxHeight - borders.bottomWidth
  );
  newMatrix = drawRightSide(
    newMatrix,
    borders.rightWidth,
    borders.rightSymbols,
    borders.topWidth,
    maxHeight - borders.bottomWidth
  );

  newMatrix = drawCorner(  // top-left
    newMatrix,
    {x: 0, y: 0,
      width: borders.leftWidth, height: borders.topWidth},
    borders.topLeftSymbols
  );
  newMatrix = drawCorner(  // top-right
    newMatrix,
    {x: maxWidth - borders.rightWidth, y: 0,
      width: borders.rightWidth, height: borders.topWidth},
    borders.topRightSymbols
  );
  newMatrix = drawCorner(  // bottom-left
    newMatrix,
    {x: 0, y: maxHeight - borders.bottomWidth,
      width: borders.leftWidth, height: borders.bottomWidth},
    borders.bottomLeftSymbols
  );
  newMatrix = drawCorner(  // bottom-right
    newMatrix,
    {x: maxWidth - borders.rightWidth, y: maxHeight - borders.bottomWidth,
      width: borders.rightWidth, height: borders.bottomWidth},
    borders.bottomRightSymbols
  );

  return {
    matrix: newMatrix,
    contentArea: shrinkContentAreaByBorders(matrix, borders),
  };
}
