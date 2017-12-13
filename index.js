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

export type {
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

module.exports = {
  getMaxX,
  getMaxY,
  getHeight,
  getWidth,
  initializeBox: boxUtils.initializeBox,
  initializeBoxFromText: boxUtils.initializeBoxFromText,
  initializeMatrix: matrixUtils.initializeMatrix,
  initializeMatrixFromText: matrixUtils.initializeMatrixFromText,
  render: boxUtils.toText,
  setBorders: boxUtils.setBorders,
};
