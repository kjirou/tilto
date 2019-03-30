import {
  clearBottomSide,
  clearTopSide,
  clearLeftSide,
  clearRightSide,
  drawBottomSide,
  drawCorner,
  drawLeftSide,
  drawRightSide,
  drawTopSide,
} from './border';
import {
  Element,
  ElementSymbol,
  Matrix,
  SymbolRuler,
  createMatrix,
  createMatrixFromText,
  cropMatrix,
  getHeight,
  getWidth,
  matrixToRectangle,
  overwriteMatrix,
  pourContent,
  renderMatrix,
  validateMatrix,
} from './matrix';
import {
  Rectangle,
  shrinkRectangle,
  toCoordinate,
  toSize,
} from './rectangle';

const eaw = require('eastasianwidth');
const stripAnsi = require('strip-ansi');

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

export function defaultSymbolRuler(symbol: ElementSymbol): 0 | 1 | 2 {
  const escapedSymbol = stripAnsi(symbol);
  return eaw.characterLength(escapedSymbol);
};

export function createBox(
  rectangleLike: {
    x?: Rectangle['x'],
    y?: Rectangle['y'],
    width: Rectangle['width'],
    height: Rectangle['height'],
  },
  options: {
    defaultSymbol?: ElementSymbol | null,
  } = {}
): Box {
  const settings = Object.assign({}, {
    defaultSymbol: null,
  }, options);

  const rectangle = Object.assign({}, {x: 0, y: 0}, rectangleLike);

  const matrix = createMatrix(toSize(rectangle), settings.defaultSymbol);
  if (!validateMatrix(matrix)) {
    throw new Error('The matrix size is invalid');
  }

  return {
    symbolRuler: defaultSymbolRuler,
    x: rectangle.x,
    y: rectangle.y,
    zIndex: 0,
    content: '',
    borders: {
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
    },
    matrix,
    children: [],
  };
}

export function createBoxFromText(text: string): Box {
  const matrix = createMatrixFromText(text);

  const box = createBox({
    x: 0,
    y: 0,
    width: getWidth(matrix),
    height: getHeight(matrix),
  });

  box.matrix = matrix;

  return box;
}

export function setBorders(box: Box, options: Partial<Borders>): Box {
  const newBorders = Object.assign({}, box.borders, options);

  return Object.assign({}, box, {borders: newBorders});
}

function drawBorders(matrix: Matrix, borders: Borders): Matrix {
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

  return newMatrix;
}

function computeContentArea(box: Box): Rectangle {
  let contentArea = matrixToRectangle(box.matrix);

  contentArea = shrinkRectangle(contentArea, {
    top: box.borders.topWidth,
    bottom: box.borders.bottomWidth,
    left: box.borders.leftWidth,
    right: box.borders.rightWidth,
  });

  return contentArea;
}

// TODO: cache
function applyBoxSettingsToMatrix(box: Box): Matrix {
  const contentArea = computeContentArea(box);

  let newMatrix = drawBorders(box.matrix, box.borders);

  let contentAreaMatrix = cropMatrix(newMatrix, contentArea);
  if (!contentAreaMatrix) {
    return box.matrix;
  }

  if (box.content !== '') {
    contentAreaMatrix = pourContent(contentAreaMatrix, box.content, box.symbolRuler);
  }

  (box.children || [])
    .slice()
    .sort((a, b) => a.zIndex - b.zIndex)
    .forEach(childBox => {
      const preparedChildMatrix = applyBoxSettingsToMatrix(childBox);
      contentAreaMatrix = overwriteMatrix(
        contentAreaMatrix,
        preparedChildMatrix,
        {
          x: childBox.x,
          y: childBox.y,
        },
        box.symbolRuler
      );
    });

  return overwriteMatrix(
    newMatrix, contentAreaMatrix, toCoordinate(contentArea), box.symbolRuler);
}

export function renderBox(
  box: Box,
  options: {
    backgroundSymbol?: ElementSymbol,
  } = {}
): string {
  const actualOptions = Object.assign({
    backgroundSymbol: ' ',
  }, options);

  const preparedMatrix = applyBoxSettingsToMatrix(box);

  return renderMatrix(preparedMatrix, actualOptions.backgroundSymbol);
}
