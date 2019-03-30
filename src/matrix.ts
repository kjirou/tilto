import * as ansiRegex from 'ansi-regex';
import * as stripAnsi from 'strip-ansi';

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
} from './rectangle';

const ansiStyles = require('ansi-styles');
const sliceAnsiString = require('slice-ansi-string');

export type ElementSymbol = string;
export type ElementStyle = {
  foregroundColor: string,  // '' は設定なしを示す
  backgroundColor: string,  // '' は設定なしを示す
  bold: boolean,
  dim: boolean,
  italic: boolean,
  underline: boolean,
  inverse: boolean,
  hidden: boolean,
  strikethrough: boolean,
};
export type Element = {
  x: number,
  y: number,
  // string (=ElementSymbol) .. 1文字の文字列。制御文字を含まない。
  // null  .. シンボルがないことを示す。一文字分の背景が表示される。
  // false .. マルチバイト文字が左elementに存在することを示す。レンダリング時に無視されて詰められる。
  symbol: ElementSymbol | null | false,
  style: ElementStyle,
};
export type Matrix = Element[][];
export type SymbolRuler = (symbol: ElementSymbol) => 0 | 1 | 2;
export type PourableElement = {
  isLineBreaking: boolean,
  symbol: ElementSymbol,
  symbolWidth: number,
  style: ElementStyle,
  x?: number,
  y?: number,
};

export function createDefaultElementStyle(): ElementStyle {
  return {
    foregroundColor: '',
    backgroundColor: '',
    bold: false,
    dim: false,
    italic: false,
    underline: false,
    inverse: false,
    hidden: false,
    strikethrough: false,
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

/**
 * A function that makes it easy to create a matrix from text mainly for testing.
 *
 * @param text Text consisting only of ASCII characters.
 *             It also needs to be rectangular.
 */
export function createMatrixFromText(text: string): Matrix {
  function parseTextToSymbols(text: string): ElementSymbol[][] {
    return text
      .replace(/\n+$/, '')
      .split('\n')
      .map(row => row.split(''));
  }

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

export function matrixToRectangle(matrix: Matrix): Rectangle {
  return {
    x: 0,
    y: 0,
    width: getWidth(matrix),
    height: getHeight(matrix),
  };
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
  //    fix in 4 |     null   |    null    |
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
export function decodeAnsiStyles(character: string): Partial<ElementStyle> {
  const characterWithoutAnsi = stripAnsi(character);
  if (stringToArray(characterWithoutAnsi).length !== 1) {
    throw new Error('It should be used for single characters.');
  }

  const ansiEscapeCodes = character.match(ansiRegex()) || [];
  const styleData: Partial<ElementStyle> = {};

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
  ansiEscapeCodes.some(code => {
    const foundName = foregroundColorNames.find(name => {
      return code === (ansiStyles.color[name] && ansiStyles.color[name].open);
    });
    if (foundName) {
      styleData.foregroundColor = foundName;
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
  ansiEscapeCodes.some(code => {
    const foundName = backgroundColorNames.find(name => {
      return code === (ansiStyles.bgColor[name] && ansiStyles.bgColor[name].open);
    });
    if (foundName) {
      styleData.backgroundColor = foundName;
      return true;
    }
    return false;
  });

  // From) https://github.com/chalk/ansi-styles#modifiers
  ansiEscapeCodes.forEach(code => {
    if (code === ansiStyles.bold.open) {
      styleData.bold = true;
    } else if (code === ansiStyles.dim.open) {
      styleData.dim = true;
    } else if (code === ansiStyles.italic.open) {
      styleData.italic = true;
    } else if (code === ansiStyles.underline.open) {
      styleData.underline = true;
    } else if (code === ansiStyles.inverse.open) {
      styleData.inverse = true;
    } else if (code === ansiStyles.hidden.open) {
      styleData.hidden = true;
    } else if (code === ansiStyles.strikethrough.open) {
      styleData.strikethrough = true;
    }
  });

  return styleData;
}

export function parseContent(content: string, symbolRuler: SymbolRuler): PourableElement[] {
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
    const symbolWidth = symbolRuler(symbol);
    if (symbol === '\n') {
      pourableElements.push({
        isLineBreaking: true,
        symbol: '',  // Anything is fine
        symbolWidth,
        style: createDefaultElementStyle(),  // Anything is fine
      });
    } else {
      pourableElements.push({
        isLineBreaking: false,
        symbol: symbol,
        symbolWidth,
        style: Object.assign(
          createDefaultElementStyle(),
          decodeAnsiStyles(symbolWithAnsi)
        ),
      });
    }

    pointer += 1;
  }

  return pourableElements;
}

/**
 * Try to pour elements to a certain width
 */
export function pourElementsVirtually(
  pourableElements: PourableElement[],
  matrixWidth: number
): PourableElement[] {
  const newPourableElements: PourableElement[] = [];

  let isFinished = false;
  let yPointer = 0;
  let xPointer = 0;

  pourableElements.forEach(pourableElement => {
    if (isFinished) {
      return;
    }

    if (pourableElement.isLineBreaking) {
      yPointer += 1;
      xPointer = 0;
    } else if (pourableElement.symbolWidth === 2 && matrixWidth === 1) {
      // The content can not pour anymore.
      isFinished = true;
    } else {
      if (pourableElement.symbolWidth === 2) {
        if (
          // |abcd|P => |abcd|
          // |....|     |P...|
          // (P = pointer)
          xPointer === matrixWidth ||
          // |abcP| => |abcd|
          // |....|    |P...|
          // (P = pointer)
          xPointer + 1 === matrixWidth
        ) {
          yPointer += 1;
          xPointer = 0;
        }

        newPourableElements.push(
          Object.assign({}, pourableElement, {
            x: xPointer,
            y: yPointer,
          })
        );

        xPointer += 1

        newPourableElements.push(
          Object.assign({}, pourableElement, {
            symbol: false,
            x: xPointer,
            y: yPointer,
          })
        );

        xPointer += 1
      } else if (pourableElement.symbolWidth === 1) {
        if (xPointer === matrixWidth) {
          yPointer += 1;
          xPointer = 0;
        }

        newPourableElements.push(
          Object.assign({}, pourableElement, {
            x: xPointer,
            y: yPointer,
          })
        );

        xPointer += 1;
      }
    }
  });

  return newPourableElements;
}

// TODO: consider word-wrap/word-break
export function pourContent(
  matrix: Matrix,
  content: string,
  symbolRuler: SymbolRuler
): Matrix {
  const width = getWidth(matrix);
  const height = getHeight(matrix);
  const maxY = getMaxY(matrix);

  // Reset the matrix to background only.
  const newMatrix = createMatrix({width, height}, null);

  const pourableElements = pourElementsVirtually(
    parseContent(content, symbolRuler),
    width
  );

  pourableElements.forEach(pourableElement => {
    if (pourableElement.y === undefined || pourableElement.x === undefined) {
      throw new Error('The "x" and "y" should be set by an other process.');
    }

    if (pourableElement.y > maxY) {
      return;
    }

    Object.assign(newMatrix[pourableElement.y][pourableElement.x], {
      symbol: pourableElement.symbol,
      style: pourableElement.style,
    });
  });

  return newMatrix;
}

function renderElement(element: Element): string {
  const {symbol, style} = element;

  const modifiers = [];
  if (style.foregroundColor) {
    modifiers.push(ansiStyles.color[style.foregroundColor].open);
  }
  if (style.backgroundColor) {
    modifiers.push(ansiStyles.color[style.backgroundColor].open);
  }
  if (style.bold) {
    modifiers.push(ansiStyles.bold.open);
  }
  if (style.dim) {
    modifiers.push(ansiStyles.dim.open);
  }
  if (style.italic) {
    modifiers.push(ansiStyles.italic.open);
  }
  if (style.underline) {
    modifiers.push(ansiStyles.underline.open);
  }
  if (style.inverse) {
    modifiers.push(ansiStyles.inverse.open);
  }
  if (style.hidden) {
    modifiers.push(ansiStyles.hidden.open);
  }
  if (style.strikethrough) {
    modifiers.push(ansiStyles.strikethrough.open);
  }

  return modifiers.join('') + symbol + (modifiers.length > 0 ? ansiStyles.reset.close : '');
}

export function renderMatrix(matrix: Matrix, backgroundSymbol: ElementSymbol): string {
  return matrix
    .map(row => {
      return row.map(element => {
        if (element.symbol === false) {
          return '';
        } else if (element.symbol === null) {
          return backgroundSymbol;
        }
        return renderElement(element);
      }).join('');
    })
    .join('\n');
};
