import * as stripAnsi from 'strip-ansi';

import {
  Borders,
  placeBorders,
  validateMatrixWithBorders,
} from './border';
import {
  Element,
  ElementBody,
  ElementSymbol,
  Matrix,
  SymbolRuler,
  createElementBody,
  createMatrix,
  createMatrixFromText,
  cropMatrix,
  getHeight,
  getWidth,
  matrixToRectangle,
  overwriteMatrix,
  parseContent,
  pourContent,
  renderMatrix,
  validateMatrix,
} from './matrix';
import {
  Rectangle,
  moveRectangle,
  rectangleToCoordinate,
  rectangleToSize,
} from './rectangle';
import {
  placeScrollBar,
} from './scroll-bar';
import {
  Coordinate,
  Size,
  validateSize,
} from './utils';

const eaw = require('eastasianwidth');

export type Box = {
  borders: Borders;
  children: Box[];
  content: string,
  matrix: Matrix,
  scroll?: {
    thumbElement?: ElementBody,
    trackElement?: ElementBody,
    y: number,
  },
  symbolRuler: SymbolRuler,
  x: number,
  y: number,
  zIndex: number,
};

export function defaultSymbolRuler(symbol: ElementSymbol): 0 | 1 | 2 {
  const escapedSymbol = stripAnsi(symbol);
  return eaw.characterLength(escapedSymbol);
};

function createDefaultTrackElement(): ElementBody {
  return createElementBody('|');
};

function createDefaultThumbElement(): ElementBody {
  return createElementBody('#');
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

  const matrix = createMatrix(rectangleToSize(rectangle), settings.defaultSymbol);
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

function applyBoxSettingsToMatrix(box: Box): Matrix {
  const pourableElements = parseContent(box.content, box.symbolRuler);

  type FilterArguments = {
    matrix: Matrix,
    contentArea: Rectangle,
    contentAreaCoordinate: Coordinate,
    contentAreaSize: Size,
    contentAreaMatrix: Matrix,
  };
  type FilterResult = {
    matrix: Matrix,
    contentArea: Rectangle,
    errorOccured: boolean,
  };
  type Filter = (args: FilterArguments) => FilterResult;

  const filters: Filter[] = [];

  // Borders
  filters.push(
    ({matrix, contentAreaMatrix, contentArea, contentAreaCoordinate}) => {
      if (validateMatrixWithBorders(contentAreaMatrix, box.borders) === false) {
        return {
          matrix,
          contentArea,
          errorOccured: true,
        };
      }

      const placed = placeBorders(contentAreaMatrix, box.borders);

      return {
        matrix: overwriteMatrix(matrix, placed.matrix, contentAreaCoordinate, box.symbolRuler),
        contentArea: moveRectangle(placed.contentArea, contentAreaCoordinate),
        errorOccured: false,
      };
    }
  );

  // Scroll Bar
  if (box.scroll !== undefined) {
    const scrollSettings = box.scroll;  // To avoid TypeScript's undefined check

    filters.push(
      ({matrix, contentAreaMatrix, contentArea, contentAreaCoordinate, contentAreaSize}) => {
        if (validateSize(contentAreaSize) === false || contentAreaSize.width < 1) {
          return {
            matrix,
            contentArea,
            errorOccured: true,
          };
        }

        const placed = placeScrollBar(
          contentAreaMatrix,
          pourableElements,
          scrollSettings.y,
          scrollSettings.trackElement || createDefaultTrackElement(),
          scrollSettings.thumbElement || createDefaultThumbElement()
        );

        return {
          matrix: overwriteMatrix(matrix, placed.matrix, contentAreaCoordinate, box.symbolRuler),
          contentArea: moveRectangle(placed.contentArea, contentAreaCoordinate),
          errorOccured: false,
        };
      }
    );
  }

  // Content
  if (box.content !== '') {
    const scrollY = box.scroll ? box.scroll.y : 0;

    filters.push(
      ({matrix, contentAreaMatrix, contentArea, contentAreaCoordinate}) => {
        const placedMatrix = pourContent(contentAreaMatrix, pourableElements, scrollY);

        return {
          matrix: overwriteMatrix(matrix, placedMatrix, contentAreaCoordinate, box.symbolRuler),
          contentArea,
          errorOccured: false,
        };
      }
    );
  }

  // Children
  if (box.children.length > 0) {
    filters.push(
      ({matrix, contentAreaMatrix, contentArea, contentAreaCoordinate}) => {
        box.children
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .forEach(childBox => {
            const childMatrix = applyBoxSettingsToMatrix(childBox);
            contentAreaMatrix = overwriteMatrix(
              contentAreaMatrix,
              childMatrix,
              {
                x: childBox.x,
                y: childBox.y,
              },
              box.symbolRuler
            );
          })
        ;

        return {
          matrix: overwriteMatrix(matrix, contentAreaMatrix, contentAreaCoordinate, box.symbolRuler),
          contentArea,
          errorOccured: false,
        };
      }
    );
  }

  const filterResult = filters.reduce(
    (preFilterResult: FilterResult, filter: Filter) => {
      if (preFilterResult.errorOccured) {
        return preFilterResult;
      }
      return filter(
        Object.assign({
          matrix: preFilterResult.matrix,
          contentArea: preFilterResult.contentArea,
          contentAreaMatrix: cropMatrix(preFilterResult.matrix, preFilterResult.contentArea),
          contentAreaCoordinate: rectangleToCoordinate(preFilterResult.contentArea),
          contentAreaSize:  rectangleToSize(preFilterResult.contentArea),
        })
      );
    },
    {
      matrix: box.matrix,
      contentArea: matrixToRectangle(box.matrix),
      errorOccured: false,
    }
  );

  return overwriteMatrix(
    box.matrix,
    filterResult.matrix,
    {x: 0, y: 0},
    box.symbolRuler
  );
}

export function renderBox(
  box: Box,
  options: {
    backgroundSymbol?: ElementSymbol,
  } = {}
): string {
  const settings = Object.assign({
    backgroundSymbol: ' ',
  }, options);

  const matrix = applyBoxSettingsToMatrix(box);

  return renderMatrix(matrix, settings.backgroundSymbol);
}
