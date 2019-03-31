import * as utils from './utils';
import * as borderModule from './border';
import * as boxModule from './box';
import * as matrixModule from './matrix';
import * as rectangleModule from './rectangle';

export type BorderType = 'default';
export type Borders = borderModule.Borders;
export type Box = boxModule.Box;
export type Coordinate = utils.Coordinate;
export type ElementBody = matrixModule.ElementBody;
export type Matrix = matrixModule.Matrix;
export type Rectangle = rectangleModule.Rectangle;
export type Size = utils.Size;
export type SymbolRuler = matrixModule.SymbolRuler;

export const createBox = boxModule.createBox;
export const createElementBody = matrixModule.createElementBody;
export const createMatrix = matrixModule.createMatrix;
export const createMatrixFromText = matrixModule.createMatrixFromText;
export const render = boxModule.renderBox;
export const setBorders = boxModule.setBorders;

export function getWidth(box: Box): number {
  return matrixModule.getWidth(box.matrix);
}

export function getHeight(box: Box): number {
  return matrixModule.getHeight(box.matrix);
}

export function getMaxX(box: Box): number {
  return matrixModule.getMaxX(box.matrix);
}

export function getMaxY(box: Box): number {
  return matrixModule.getMaxY(box.matrix);
}

export function createBordersByType(borderType: BorderType): Borders {
  switch (borderType) {
  case 'default':
    return {
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
    };
  }
}
