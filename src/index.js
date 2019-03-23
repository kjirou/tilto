// @flow

const boxUtils = require('./lib/box-utils');
const matrixUtils = require('./lib/matrix-utils');

/*::
import type {Box} from './lib/box-utils';
import type {Coordinate} from './lib/coordinate-utils';
import type {
  Element,
  Matrix,
  SymbolRuler,
} from './lib/matrix-utils';
import type {Rectangle} from './lib/rectangle-utils';
import type {Size} from './lib/size-utils';

type BorderType = 'default';

export type {
  BorderType,
  Box,
  Coordinate,
  Element,
  Matrix,
  Rectangle,
  Size,
  SymbolRuler,
};
 */


function getWidth(box/*: Box*/)/*: number*/ {
  return matrixUtils.getWidth(box.matrix);
}

function getHeight(box/*: Box*/)/*: number*/ {
  return matrixUtils.getHeight(box.matrix);
}

function getMaxX(box/*: Box*/)/*: number*/ {
  return matrixUtils.getMaxX(box.matrix);
}

function getMaxY(box/*: Box*/)/*: number*/ {
  return matrixUtils.getMaxY(box.matrix);
}

function setBorderType(box/*: Box*/, borderType/*: BorderType*/)/*: Box*/ {
  switch (borderType) {
  case 'default':
    return Object.assign({}, box, {
      borders: {
        topWidth: 1,
        bottomWidth: 1,
        leftWidth: 1,
        rightWidth: 1,
        topSymbols: ['-'],
        bottomSymbols: ['-'],
        leftSymbols: ['|'],
        rightSymbols: ['|'],
        topLeftSymbols: ['+'],
        topRightSymbols: ['+'],
        bottomLeftSymbols: ['+'],
        bottomRightSymbols: ['+'],
      },
    });
  }
  return box;
}

module.exports = {
  createBox: boxUtils.createBox,
  createBoxFromText: boxUtils.createBoxFromText,
  createMatrix: matrixUtils.createMatrix,
  createMatrixFromText: matrixUtils.createMatrixFromText,
  getHeight,
  getMaxX,
  getMaxY,
  getWidth,
  render: boxUtils.toText,
  setBorders: boxUtils.setBorders,
  setBorderType,
};
