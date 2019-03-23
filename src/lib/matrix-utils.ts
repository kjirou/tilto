import {
  Coordinate,
  Size,
} from '../utils';
import {
  Rectangle,
  shrinkRectangle,
  toCoordinate,
  toSize,
} from './rectangle-utils';

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

export function createMatrix(size: Size, defaultSymbol: ElementSymbol | null = null): Matrix {
  const matrix = [];
  for (let y = 0; y < size.height; y += 1) {
    const row = [];
    for (let x = 0; x < size.width; x += 1) {
      row.push({
        y,
        x,
        symbol: defaultSymbol,
      });
    }
    matrix.push(row);
  }
  return matrix;
}

export function getElement(matrix: Matrix, coordinate: Coordinate): Element | null {
  const row = matrix[coordinate.y];
  if (!row) {
    return null;
  }
  return row[coordinate.x] || null;
}

function parseTextToSymbols(text: string): ElementSymbol[][] {
  return text
    .replace(/\n+$/, '')
    .split('\n')
    .map(row => row.split(''));
}

// TODO: multibytes
export function createMatrixFromText(text: string): Matrix {
  const symbols = parseTextToSymbols(text);

  const matrix = createMatrix({
    width: symbols[0].length,
    height: symbols.length,
  });

  for (let y = 0; y < symbols.length; y += 1) {
    for (let x = 0; x < symbols[0].length; x += 1) {
      const element = getElement(matrix, {x, y});
      if (element) {
        element.symbol = symbols[y][x];
      } else {
        throw new Error('It is a branch only for "flow", so it does not pass here at run-time.');
      }
    }
  }

  return matrix;
}

export function toText(matrix: Matrix, backgroundSymbol: ElementSymbol): string {
  return matrix
    .map(row => {
      return row.map(element => {
        if (element.symbol === false) {
          return '';
        } else if (element.symbol === null) {
          return backgroundSymbol;
        }
        return element.symbol;
      }).join('');
    })
    .join('\n');
};

export function getWidth(matrix: Matrix): number {
  if (matrix.length === 0) {
    return 0;
  }
  return matrix[0].length;
}

export function getHeight(matrix: Matrix): number {
  return matrix.length;
}

export function getMaxX(matrix: Matrix): number {
  return getWidth(matrix) - 1;
}

export function getMaxY(matrix: Matrix): number {
  return getHeight(matrix) - 1;
}

export function validateMatrix(matrix: Matrix): boolean {
  return (
    Array.isArray(matrix) &&
    matrix.length > 0 &&
    Array.isArray(matrix[0]) &&
    matrix[0].length > 0 &&
    matrix.every(row => row.length === matrix[0].length)
  );
}

// TODO: Negative coordinates
export function overwriteMatrix(
  matrix: Matrix,
  replacer: Matrix,
  coordinate: Coordinate,
  symbolRuler: SymbolRuler
): Matrix {
  if (getWidth(replacer) === 0 || getHeight(replacer) === 0) {
    return matrix;
  }

  let newMatrix = matrix.map((row, y) => {
    return row.map((element, x) => {
      if (
        y >= coordinate.y && y < coordinate.y + getHeight(replacer) &&
        x >= coordinate.x && x < coordinate.x + getWidth(replacer)
      ) {
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
  });

  // Delete separated multibyte fragments in this order
  //
  // M = Multibyte symbol
  // f = false symbol
  //
  // 1)
  //    |(overwrited)|
  //    |f           |
  // 2)
  //    |(overwrited)|
  //    |           M|
  // 3)
  //    |(overwrited)|
  //   M|            |
  // 4)
  //    |(overwrited)|
  //    |            |f
  newMatrix = newMatrix.map((row, y) => {
    return row.map((element, x) => {
      // 1)
      if (
        x === coordinate.x &&
        element.symbol === false
      ) {
        return Object.assign({}, element, {symbol: null});
      // 2)
      } else if (
        x === coordinate.x + getWidth(replacer) - 1 &&
        typeof element.symbol === 'string' &&
        symbolRuler(element.symbol) === 2
      ) {
        return Object.assign({}, element, {symbol: null});
      // 3)
      } else if (
        x === coordinate.x - 1 &&
        typeof element.symbol === 'string' &&
        symbolRuler(element.symbol) === 2
      ) {
        return Object.assign({}, element, {symbol: null});
      // 4)
      } else if (
        x === coordinate.x + getWidth(replacer) &&
        element.symbol === false
      ) {
        return Object.assign({}, element, {symbol: null});
      }
      return element;
    });
  });

  return newMatrix;
}

export function cropMatrix(matrix: Matrix, rectangle: Rectangle): Matrix {
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

  return newMatrix;
}

// TODO: Surrogate pairs
export function parseContentToSymbols(content: string): (ElementSymbol | '\n')[] {
  return content.split('');
  // TODO: ANSI string
  //       slice-ansi の挙動がバグなのか仕様を勘違いしているのか解析できなかった
  //const symbols = [];
  //let pointer = 0;
  //let symbol;
  //
  //while (true) {
  //  symbol = sliceAnsi(content, pointer, pointer + 1);
  //  // "slice-ansi" returns "" if fullWidth string is sliced with `sliceAnsi('あ', 0, 1)`
  //  if (symbol === '') {
  //    const fullWidthSymbol = sliceAnsi(content, pointer, pointer + 2);
  //    if (fullWidthSymbol === '') {
  //      break;
  //    }
  //    symbols.push(fullWidthSymbol);
  //    pointer += 2;
  //  } else {
  //    symbols.push(symbol);
  //    pointer += 1;
  //  }
  //}
  //
  //return symbols;
}

// TODO: consider word-wrap/word-break
export function pourContent(
  matrix: Matrix,
  content: string,
  symbolRuler: SymbolRuler
): Matrix {
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
