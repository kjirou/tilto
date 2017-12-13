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

function createBox(
  rectangleLike/*: {
    x?: $PropertyType<Rectangle, 'x'>,
    y?: $PropertyType<Rectangle, 'y'>,
    width: $PropertyType<Rectangle, 'width'>,
    height: $PropertyType<Rectangle, 'height'>,
  }*/,
  options/*: {
    defaultSymbol?: ElementSymbol | null,
  }*/ = {}
)/*: Box*/ {
  const actualOptions = Object.assign({}, {
    defaultSymbol: null,
  }, options);

  const rectangle = Object.assign({}, {x: 0, y: 0}, rectangleLike);
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
    topSymbols: [],
    rightSymbols: [],
    bottomSymbols: [],
    leftSymbols: [],
    topRightSymbols: [],
    bottomRightSymbols: [],
    bottomLeftSymbols: [],
    topLeftSymbols: [],
  };

  box.matrix = matrixUtils.createMatrix(rectangleUtils.toSize(rectangle), actualOptions.defaultSymbol);
  if (!matrixUtils.validateMatrix(box.matrix)) {
    throw new Error('The matrix size is invalid');
  }

  box.children = [];

  return box;
}

function createBoxFromText(text/*: string*/)/*: Box*/ {
  const matrix = matrixUtils.createMatrixFromText(text);

  const box = createBox({
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
  const newBorders = Object.assign({}, box.borders, options);

  return Object.assign({}, box, {borders: newBorders});
}

function drawBorders(matrix/*: Matrix*/, borders/*: Borders*/)/*: Matrix*/ {
  const maxWidth = matrixUtils.getWidth(matrix);
  const maxHeight = matrixUtils.getHeight(matrix);

  let newMatrix = matrix;

  newMatrix = borderUtils.clearTopSide(newMatrix, borders.topWidth);
  newMatrix = borderUtils.clearBottomSide(newMatrix, borders.bottomWidth);
  newMatrix = borderUtils.clearLeftSide(newMatrix, borders.leftWidth);
  newMatrix = borderUtils.clearRightSide(newMatrix, borders.rightWidth);

  newMatrix = borderUtils.drawTopSide(
    newMatrix,
    borders.topWidth,
    borders.topSymbols,
    borders.leftWidth,
    maxWidth - borders.rightWidth
  );
  newMatrix = borderUtils.drawBottomSide(
    newMatrix,
    borders.bottomWidth,
    borders.bottomSymbols,
    borders.leftWidth,
    maxWidth - borders.rightWidth
  );
  newMatrix = borderUtils.drawLeftSide(
    newMatrix,
    borders.leftWidth,
    borders.leftSymbols,
    borders.topWidth,
    maxHeight - borders.bottomWidth
  );
  newMatrix = borderUtils.drawRightSide(
    newMatrix,
    borders.rightWidth,
    borders.rightSymbols,
    borders.topWidth,
    maxHeight - borders.bottomWidth
  );

  newMatrix = borderUtils.drawCorner(  // top-left
    newMatrix,
    {x: 0, y: 0,
      width: borders.leftWidth, height: borders.topWidth},
    borders.topLeftSymbols
  );
  newMatrix = borderUtils.drawCorner(  // top-right
    newMatrix,
    {x: maxWidth - borders.rightWidth, y: 0,
      width: borders.rightWidth, height: borders.topWidth},
    borders.topRightSymbols
  );
  newMatrix = borderUtils.drawCorner(  // bottom-left
    newMatrix,
    {x: 0, y: maxHeight - borders.bottomWidth,
      width: borders.leftWidth, height: borders.bottomWidth},
    borders.bottomLeftSymbols
  );
  newMatrix = borderUtils.drawCorner(  // bottom-right
    newMatrix,
    {x: maxWidth - borders.rightWidth, y: maxHeight - borders.bottomWidth,
      width: borders.rightWidth, height: borders.bottomWidth},
    borders.bottomRightSymbols
  );

  return newMatrix;
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

  let newMatrix = drawBorders(box.matrix, box.borders);

  let contentAreaMatrix = matrixUtils.cropMatrix(newMatrix, contentArea);
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
    newMatrix, contentAreaMatrix, rectangleUtils.toCoordinate(contentArea), box.symbolRuler);
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
  createBox,
  createBoxFromText,
  setBorders,
  toText,
};
