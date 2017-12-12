// @flow

const eaw = require('eastasianwidth');

const borderUtils = require('./border-utils');
const matrixUtils = require('./matrix-utils');
const rectangleUtils = require('./rectangle-utils');

/*::
import type {Coordinate} from './coordinate-utils';
import type {
  ElementSymbol,
  Element,
  Matrix,
  SymbolRuler,
} from './matrix-utils';
import type {Rectangle} from './rectangle-utils';

export type Borders = {
  topWidth: number,
  bottomWidth: number,
  leftWidth: number,
  rightWidth: number,
};
export type BoxId = string;
export type Box = {
  borders: Borders;
  children?: Box[];
  // Now neither ANSI characters nor surrogate-pairs is considered.
  content: string,
  id: BoxId | null,
  matrix: Matrix,
  symbolRuler: SymbolRuler,
  x: number,
  y: number,
};
 */


const defaultSymbolRuler/*: SymbolRuler*/ = (symbol) => {
  return eaw.characterLength(symbol);
};

function initializeBox(
  rectangle/*: Rectangle*/,
  options/*: {
    id?: BoxId | null,
    symbol?: ElementSymbol | null,
    symbolRuler?: SymbolRuler,
  }*/ = {}
)/*: Box*/ {
  const actualOptions = Object.assign({}, {
    id: null,
    symbol: null,
    symbolRuler: defaultSymbolRuler,
  }, options);

  const box = {};

  box.id = actualOptions.id;
  box.symbolRuler = actualOptions.symbolRuler,
  box.x = rectangle.x;
  box.y = rectangle.y;
  box.content = '';
  box.borders = {
    topWidth: 0,
    bottomWidth: 0,
    leftWidth: 0,
    rightWidth: 0,
  };

  box.matrix = matrixUtils.initializeMatrix(rectangleUtils.toSize(rectangle), actualOptions.symbol);
  if (!matrixUtils.validateMatrix(box.matrix)) {
    throw new Error('The matrix size is invalid');
  }

  return box;
}

function textToSymbolMatrix(text/*: string*/)/*: ElementSymbol[][]*/ {
  return text
    .replace(/\n+$/, '')
    .split('\n')
    .map(row => row.split(''));
}

function initializeBoxFromText(text/*: string*/)/*: Box*/ {
  const symbolMatrix = textToSymbolMatrix(text);

  const box = initializeBox({
    x: 0,
    y: 0,
    width: symbolMatrix[0].length,
    height: symbolMatrix.length,
  });

  for (let y = 0; y < symbolMatrix.length; y += 1) {
    for (let x = 0; x < symbolMatrix[0].length; x += 1) {
      const element = matrixUtils.getElement(box.matrix, {x, y});
      if (element) {
        element.symbol = symbolMatrix[y][x];
      } else {
        throw new Error('It is a branch only for "flow", so it does not pass here at run-time.');
      }
    }
  }

  return box;
}

function getElementByAbsoluteCoordinate(box/*: Box*/, coordinate/*: Coordinate*/)/*: Element | null*/ {
  return matrixUtils.getElement(box.matrix, {
    x: coordinate.x - box.x,
    y: coordinate.y - box.y,
  });
}

function setBorders(
  box/*: Box*/,
  options/*: {
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
  }*/ = {}
)/*: Box*/ {
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

  const maxWidth = matrixUtils.getWidth(box.matrix);
  const maxHeight = matrixUtils.getHeight(box.matrix);

  let newMatrix = box.matrix;

  newMatrix = borderUtils.clearTopSide(newMatrix, fixedOptions.topWidth);
  newMatrix = borderUtils.clearBottomSide(newMatrix, fixedOptions.bottomWidth);
  newMatrix = borderUtils.clearLeftSide(newMatrix, fixedOptions.leftWidth);
  newMatrix = borderUtils.clearRightSide(newMatrix, fixedOptions.rightWidth);

  newMatrix = borderUtils.drawTopSide(
    newMatrix,
    fixedOptions.topWidth,
    fixedOptions.topSymbols,
    fixedOptions.leftWidth,
    maxWidth - fixedOptions.rightWidth
  );
  newMatrix = borderUtils.drawBottomSide(
    newMatrix,
    fixedOptions.bottomWidth,
    fixedOptions.bottomSymbols,
    fixedOptions.leftWidth,
    maxWidth - fixedOptions.rightWidth
  );
  newMatrix = borderUtils.drawLeftSide(
    newMatrix,
    fixedOptions.leftWidth,
    fixedOptions.leftSymbols,
    fixedOptions.topWidth,
    maxHeight - fixedOptions.bottomWidth
  );
  newMatrix = borderUtils.drawRightSide(
    newMatrix,
    fixedOptions.rightWidth,
    fixedOptions.rightSymbols,
    fixedOptions.topWidth,
    maxHeight - fixedOptions.bottomWidth
  );

  newMatrix = borderUtils.drawCorner(  // top-left
    newMatrix,
    {x: 0, y: 0,
      width: fixedOptions.leftWidth, height: fixedOptions.topWidth},
    fixedOptions.topLeftSymbols
  );
  newMatrix = borderUtils.drawCorner(  // top-right
    newMatrix,
    {x: maxWidth - fixedOptions.rightWidth, y: 0,
      width: fixedOptions.rightWidth, height: fixedOptions.topWidth},
    fixedOptions.topRightSymbols
  );
  newMatrix = borderUtils.drawCorner(  // bottom-left
    newMatrix,
    {x: 0, y: maxHeight - fixedOptions.bottomWidth,
      width: fixedOptions.leftWidth, height: fixedOptions.bottomWidth},
    fixedOptions.bottomLeftSymbols
  );
  newMatrix = borderUtils.drawCorner(  // bottom-right
    newMatrix,
    {x: maxWidth - fixedOptions.rightWidth, y: maxHeight - fixedOptions.bottomWidth,
      width: fixedOptions.rightWidth, height: fixedOptions.bottomWidth},
    fixedOptions.bottomRightSymbols
  );

  return Object.assign({}, box, {
    matrix: newMatrix,
    borders: {
      topWidth: fixedOptions.topWidth,
      bottomWidth: fixedOptions.bottomWidth,
      leftWidth: fixedOptions.leftWidth,
      rightWidth: fixedOptions.rightWidth,
    },
  });
}

function computeContentArea(box/*: Box*/)/*: Rectangle*/ {
  const maxHeight = matrixUtils.getHeight(box.matrix);
  const maxWidth = matrixUtils.getWidth(box.matrix);

  let contentArea = {
    x: 0,
    y: 0,
    width: maxWidth,
    height: maxHeight,
  };

  contentArea = rectangleUtils.shrinkRectangle(contentArea, {
    top: box.borders.topWidth,
    bottom: box.borders.bottomWidth,
    left: box.borders.leftWidth,
    right: box.borders.rightWidth,
  });

  return contentArea;
}

// TODO: child boxes
// TODO: cache
function toText(
  box/*: Box*/,
  options/*: {
    defaultSymbol?: ElementSymbol,
  }*/ = {}
)/*: string*/ {
  const actualOptions = Object.assign({
    defaultSymbol: ' ',
  }, options);

  let outputBuffer/*: Matrix*/ = box.matrix.map(row => row.slice());

  if (box.content !== '') {
    const contentArea = computeContentArea(box);
    const contentAreaMatrix = matrixUtils.cropMatrix(outputBuffer, contentArea);
    if (contentAreaMatrix) {
      const newContentAreaMatrix = matrixUtils.pourContent(contentAreaMatrix, box.content, box.symbolRuler);
      outputBuffer = matrixUtils.overwriteMatrix(
        outputBuffer, newContentAreaMatrix, rectangleUtils.toCoordinate(contentArea));
    }
  }

  return matrixUtils.toText(outputBuffer, actualOptions.defaultSymbol);
}

module.exports = {
  _defaultSymbolRuler: defaultSymbolRuler,
  initializeBox,
  initializeBoxFromText,
  setBorders,
  toText,
};
