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
  rectangleToCoordinate,
  rectangleToSize,
} from './rectangle';
import {
  placeScrollBar,
} from './scroll-bar';
import {
  validateSize,
} from './utils';

const eaw = require('eastasianwidth');

export type Box = {
  borders: Borders;
  children: Box[];
  // Now neither ANSI characters nor surrogate-pairs is considered.
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

function applyBoxSettingsToMatrix(box: Box): Matrix {
  const pourableElements = parseContent(box.content, box.symbolRuler);

  type FilterResult = {
    matrix: Matrix,
    contentArea: Rectangle,
    errorOccured: boolean,
  };
  const filters: ((preResult: FilterResult) => FilterResult)[] = [];

  // Borders
  filters.push(
    ({matrix, contentArea}) => {
      if (validateMatrixWithBorders(matrix, box.borders) === false) {
        return {
          matrix,
          contentArea,
          errorOccured: true,
        };
      }

      const result = placeBorders(matrix, box.borders);

      return {
        matrix: result.matrix,
        contentArea: result.contentArea,
        errorOccured: false,
      };
    }
  );

  // A scroll bar
  if (box.scroll !== undefined) {
    const scrollSettings = box.scroll;  // To avoid TypeScript's undefined check

    filters.push(
      ({matrix, contentArea}) => {
        const size = rectangleToSize(contentArea);

        if (validateSize(size) === false || size.width < 1) {
          return {
            matrix,
            contentArea,
            errorOccured: true,
          };
        }

        const placed = placeScrollBar(
          matrix,
          pourableElements,
          scrollSettings.y,
          scrollSettings.trackElement || createDefaultTrackElement(),
          scrollSettings.thumbElement || createDefaultThumbElement()
        );

        return {
          matrix: placed.matrix,
          contentArea: placed.contentArea,
          errorOccured: false,
        };
      }
    );
  }

  const filtered = filters.reduce(
    (result, filter) => {
      if (result.errorOccured) {
        return result;
      }
      return filter(result);
    },
    {
      matrix: box.matrix,
      contentArea: matrixToRectangle(box.matrix),
      errorOccured: false,
    }
  );

  let contentAreaMatrix = cropMatrix(filtered.matrix, filtered.contentArea);
  if (box.content !== '') {
    const scrollY = box.scroll ? box.scroll.y : 0;
    contentAreaMatrix = pourContent(contentAreaMatrix, box.content, box.symbolRuler, scrollY);
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
    filtered.matrix,
    contentAreaMatrix,
    rectangleToCoordinate(filtered.contentArea),
    box.symbolRuler
  );
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
