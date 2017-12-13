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
export type Box = {
  borders: Borders;
  children: Box[];
  // Now neither ANSI characters nor surrogate-pairs is considered.
  content: string,
  matrix: Matrix,
  symbolRuler: SymbolRuler,
  x: number,
  y: number,
  zIndex: number,
};
 */


const defaultSymbolRuler/*: SymbolRuler*/ = (symbol) => {
  return eaw.characterLength(symbol);
};

function initializeBox(
  rectangle/*: Rectangle*/,
  options/*: {
    defaultSymbol?: ElementSymbol | null,
  }*/ = {}
)/*: Box*/ {
  const actualOptions = Object.assign({}, {
    defaultSymbol: null,
  }, options);

  const box = {};

  box.symbolRuler = defaultSymbolRuler,
  box.x = rectangle.x;
  box.y = rectangle.y;
  box.zIndex = 0;
  box.content = '';
  box.borders = {
    topWidth: 0,
    bottomWidth: 0,
    leftWidth: 0,
    rightWidth: 0,
  };

  box.matrix = matrixUtils.initializeMatrix(rectangleUtils.toSize(rectangle), actualOptions.defaultSymbol);
  if (!matrixUtils.validateMatrix(box.matrix)) {
    throw new Error('The matrix size is invalid');
  }

  box.children = [];

  return box;
}

function initializeBoxFromText(text/*: string*/)/*: Box*/ {
  const matrix = matrixUtils.initializeMatrixFromText(text);

  const box = initializeBox({
    x: 0,
    y: 0,
    width: matrixUtils.getWidth(matrix),
    height: matrixUtils.getHeight(matrix),
  });

  box.matrix = matrix;

  return box;
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

// TODO: cache
function applyBoxSettingsToMatrix(box/*: Box*/)/*: Matrix*/ {
  const contentArea = computeContentArea(box);

  // TODO: Move border drawing here

  let contentAreaMatrix = matrixUtils.cropMatrix(box.matrix, contentArea);
  if (!contentAreaMatrix) {
    return box.matrix;
  }

  if (box.content !== '') {
    contentAreaMatrix = matrixUtils.pourContent(contentAreaMatrix, box.content, box.symbolRuler);
  }

  (box.children || [])
    .slice()
    .sort((a, b) => a.zIndex - b.zIndex)
    .forEach(childBox => {
      const preparedChildMatrix = applyBoxSettingsToMatrix(childBox);
      contentAreaMatrix = matrixUtils.overwriteMatrix(
        contentAreaMatrix,
        preparedChildMatrix,
        {
          x: childBox.x,
          y: childBox.y,
        },
        box.symbolRuler
      );
    });

  return matrixUtils.overwriteMatrix(
    box.matrix, contentAreaMatrix, rectangleUtils.toCoordinate(contentArea), box.symbolRuler);
}

function toText(
  box/*: Box*/,
  options/*: {
    backgroundSymbol?: ElementSymbol,
  }*/ = {}
)/*: string*/ {
  const actualOptions = Object.assign({
    backgroundSymbol: ' ',
  }, options);

  const preparedMatrix = applyBoxSettingsToMatrix(box);

  return matrixUtils.toText(preparedMatrix, actualOptions.backgroundSymbol);
}

module.exports = {
  _defaultSymbolRuler: defaultSymbolRuler,
  initializeBox,
  initializeBoxFromText,
  setBorders,
  toText,
};
