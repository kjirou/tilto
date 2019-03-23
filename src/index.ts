import * as boxUtils from './lib/box-utils';
import * as matrixUtils from './lib/matrix-utils';
import * as rectangleUtils from './lib/rectangle-utils';

export type BorderType = 'default';
export type Box = boxUtils.Box;
// TODO:
//export type Coordinate;
export type Element = matrixUtils.Element;
export type Matrix = matrixUtils.Matrix;
export type Rectangle = rectangleUtils.Rectangle;
// TODO:
//export type Size;
export type SymbolRuler = matrixUtils.SymbolRuler;

export const createBox = boxUtils.createBox;
export const createBoxFromText = boxUtils.createBoxFromText;
export const createMatrix = matrixUtils.createMatrix;
export const createMatrixFromText = matrixUtils.createMatrixFromText;
export const setBorders = boxUtils.setBorders;
export const toText = boxUtils.toText;

export function getWidth(box: Box): number {
  return matrixUtils.getWidth(box.matrix);
}

export function getHeight(box: Box): number {
  return matrixUtils.getHeight(box.matrix);
}

export function getMaxX(box: Box): number {
  return matrixUtils.getMaxX(box.matrix);
}

export function getMaxY(box: Box): number {
  return matrixUtils.getMaxY(box.matrix);
}

export function setBorderType(box: Box, borderType: BorderType): Box {
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
