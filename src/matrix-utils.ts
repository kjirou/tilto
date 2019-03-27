import * as ansiRegex from 'ansi-regex';

import {
  Coordinate,
  Size,
  stringToArray,
} from './utils';
import {
  Rectangle,
  shrinkRectangle,
  toCoordinate,
  toSize,
} from './rectangle-utils';

const ansiStyles = require('ansi-styles');
const sliceAnsiString = require('slice-ansi-string');
const stripAnsi = require('strip-ansi');

export type ElementSymbol = string;
export type ElementStyle = {
  foregroundColor: string,
  backgroundColor: string,
};
export type Element = {
  x: number,
  y: number,
  // null  .. シンボルがないことを示す。一文字分の背景が表示される。
  // false .. マルチバイト文字が左elementに存在することを示す。レンダリング時に無視されて詰められる。
  symbol: ElementSymbol | null | false,
  style: ElementStyle,
};
export type Matrix = Element[][];
export type SymbolRuler = (symbol: ElementSymbol) => 0 | 1 | 2;

function createDefaultElementStyle(): ElementStyle {
  return {
    foregroundColor: 'default',
    backgroundColor: 'default',
  };
}

export function createMatrix(size: Size, defaultSymbol: ElementSymbol | null = null): Matrix {
  const matrix = [];
  for (let y = 0; y < size.height; y += 1) {
    const row = [];
    for (let x = 0; x < size.width; x += 1) {
      row.push({
        y,
        x,
        symbol: defaultSymbol,
        style: createDefaultElementStyle(),
      });
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Validate that the matrix is not empty and is rectangular
 */
export function validateMatrix(matrix: Matrix): boolean {
  return (
    Array.isArray(matrix) &&
    matrix.length > 0 &&
    Array.isArray(matrix[0]) &&
    matrix[0].length > 0 &&
    matrix.every(row => row.length === matrix[0].length)
  );
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
        throw new Error('The `element` must exist.');
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
          throw new Error('The `newElement` must exist.');
        }
      }
      return element;
    });
  });

  //
  // Delete separated multibyte fragments in following cases.
  //
  // 1) A case that a multibyte fragment exist on the left edge of the replacer.
  //
  //     (e.g.)  | first x - 1 | first x | <- replacer's position
  //    ---------+-------------+---------+
  //    original |     "a"     |   "b"   |
  //    replacer |    (None)   |  false  |
  //    current  |     "a"     |  false  |
  //    fix      |     "a"     |   null  |
  //
  // 2) A case that a multibyte fragment exist on the right edge of the replacer.
  //
  //     (e.g.)  |   last x   | last.x + 1 | <- replacer's position
  //    ---------+------------+------------+
  //    original |     "a"    |     "b"    |
  //    replacer |  multibyte |   (None)   |
  //    current  |  multibyte |     "b"    |
  //    fix      |     null   |     "b"    |
  //
  // 3) A case that a multibyte fragment exist on the left side of the replacer.
  //
  //     (e.g.)  | first x - 1 | first x | <- replacer's position
  //    ---------+-------------+---------+
  //    original |  multibyte  |  false  |
  //    replacer |    (None)   |   "a"   |
  //    current  |  multibyte  |   "a"   |
  //    fix      |     null    |   "a"   |
  //
  // 4) A case that a multibyte fragment exist on the right side of the replacer.
  //
  //     (e.g.)  |   last x   | last.x + 1 | <- replacer's position
  //    ---------+------------+------------+
  //    original |  multibyte |   false    |
  //    replacer |     "a"    |   (None)   |
  //    current  |     "a"    |   false    |
  //    fix      |     "a"    |    null    |
  //
  // Complex cases)
  //
  //     (e.g.)  | first x - 1 | first x | <- replacer's position
  //    ---------+-------------+---------+
  //    original |  multibyte  |  false  |
  //    replacer |    (None)   |  false  |
  //    current  |  multibyte  |  false  |
  //    fix in 1 |  multibyte  |   null  |
  //    fix in 3 |     null    |   null  |
  //
  //     (e.g.)  |   last x   | last.x + 1 | <- replacer's position
  //    ---------+------------+------------+
  //    original |  multibyte |   false    |
  //    replacer |  multibyte |   (None)   |
  //    current  |  multibyte |   false    |
  //    fix in 2 |     null   |   false    |
  //    fix in 4 |     null   |   false    |
  //
  //    These cases are somewhat unnatural because they eliminate multibyte characters that need not be erased.
  //    However, these situations are edge cases because basically the `replacer` often has borders.
  //
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

/**
 * @param character A single character with or without ANSI escape codes.
 *                  It is mainly assumed to pass the return value of "slice-ansi-string".
 */
export function decodeAnsiStyles(character: string): {
  foregroundColor: string | void,
  backgroundColor: string | void,
  bold: boolean,
  dim: boolean,
  italic: boolean,
  underline: boolean,
  inverse: boolean,
  hidden: boolean,
  strikethrough: boolean,
} {
  const characterWithoutAnsi = stripAnsi(character);
  if (stringToArray(characterWithoutAnsi).length !== 1) {
    throw new Error('It should be used for single characters.');
  }

  const ansiEscapeCodes = character.match(ansiRegex()) || [];

  // From https://github.com/chalk/ansi-styles#colors
  const foregroundColorNames = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    // NOTE: "blackBright" will be added in the following commit.
    //       https://github.com/chalk/ansi-styles/commit/fb5b656d9fce745881c36deb8ff800b5080d9f89
    'grey',
    //'blackBright',
    'redBright',
    'greenBright',
    'yellowBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
    'whiteBright',
  ];
  let foregroundColor = undefined;
  ansiEscapeCodes.some(code => {
    const foundName = foregroundColorNames.find(name => {
      return code === (ansiStyles.color[name] && ansiStyles.color[name].open);
    });
    if (foundName) {
      foregroundColor = foundName;
      return true;
    }
    return false;
  });

  // From https://github.com/chalk/ansi-styles#background-colors
  const backgroundColorNames = [
    'bgBlack',
    'bgRed',
    'bgGreen',
    'bgYellow',
    'bgBlue',
    'bgMagenta',
    'bgCyan',
    'bgWhite',
    'bgBlackBright',
    'bgRedBright',
    'bgGreenBright',
    'bgYellowBright',
    'bgBlueBright',
    'bgMagentaBright',
    'bgCyanBright',
    'bgWhiteBright',
  ];
  let backgroundColor = undefined;
  ansiEscapeCodes.some(code => {
    const foundName = backgroundColorNames.find(name => {
      return code === (ansiStyles.bgColor[name] && ansiStyles.bgColor[name].open);
    });
    if (foundName) {
      backgroundColor = foundName;
      return true;
    }
    return false;
  });

  // From) https://github.com/chalk/ansi-styles#modifiers
  const modifiers = {
    bold: false,
    dim: false,
    italic: false,
    underline: false,
    inverse: false,
    hidden: false,
    strikethrough: false,
  };
  ansiEscapeCodes.forEach(code => {
    if (code === ansiStyles.bold.open) {
      modifiers.bold = true;
    } else if (code === ansiStyles.dim.open) {
      modifiers.dim = true;
    } else if (code === ansiStyles.italic.open) {
      modifiers.italic = true;
    } else if (code === ansiStyles.underline.open) {
      modifiers.underline = true;
    } else if (code === ansiStyles.inverse.open) {
      modifiers.inverse = true;
    } else if (code === ansiStyles.hidden.open) {
      modifiers.hidden = true;
    } else if (code === ansiStyles.strikethrough.open) {
      modifiers.strikethrough = true;
    }
  });

  return Object.assign(
    {
      foregroundColor,
      backgroundColor,
      bold: false,
      dim: false,
      italic: false,
      underline: false,
      inverse: false,
      hidden: false,
      strikethrough: false,
    },
    modifiers
  );
}

export function parseContent(content: string): {
  isLineBreaking: boolean,
  symbol: ElementSymbol,
  style: ElementStyle,
}[] {
  const pourableElements = [];

  // This pointer is considering ANSI escape code.
  // Therefore, it can not be used with `str.slice()` and so on.
  let pointer = 0;

  while (true) {
    const symbolWithAnsi = sliceAnsiString(content, pointer, pointer + 1) as ElementSymbol;
    if (symbolWithAnsi === '') {
      break;
    }

    const symbol = stripAnsi(symbolWithAnsi) as string;
    if (symbol === '\n') {
      pourableElements.push({
        isLineBreaking: true,
        symbol: ' ',  // Anything is fine
        style: createDefaultElementStyle(),  // Anything is fine
      });
    } else {
      // TODO: ここで symbolWithAnsi からカラーコードを抽出する

      pourableElements.push({
        isLineBreaking: false,
        symbol: symbol,
        style: createDefaultElementStyle(),
      });
    }

    pointer += 1;
  }

  return pourableElements;
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

  parseContent(content).forEach(pourableElement => {
    const symbolWidth = symbolRuler(pourableElement.symbol);

    if (pourableElement.isLineBreaking) {
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
          newMatrix[yPointer][xPointer] = Object.assign({}, element1, {symbol: pourableElement.symbol});
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
          newMatrix[yPointer][xPointer] = Object.assign({}, element, {symbol: pourableElement.symbol});
        }

        xPointer += 1;
      }
    }
  });

  return newMatrix;
}
