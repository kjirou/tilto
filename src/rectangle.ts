import {
  Coordinate,
  Size,
} from './utils';
export type Rectangle = {
  x: Coordinate['x'],
  y: Coordinate['y'],
  width: Size['width'],
  height: Size['height'],
}

export function toCoordinate(rectangle: Rectangle): Coordinate {
  return {
    x: rectangle.x,
    y: rectangle.y,
  };
}

export function toSize(rectangle: Rectangle): Size {
  return {
    width: rectangle.width,
    height: rectangle.height,
  };
}

/**
 * Shrink a rectangle with margins
 */
export function shrinkRectangle(
  rectangle: Rectangle,
  margins: {top?: number, bottom?: number, left?: number, right?: number} = {}
): Rectangle {
  const {
    top, bottom, left, right
  } = Object.assign({}, {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }, margins);

  if (top < 0 || bottom < 0 || left < 0 || right < 0) {
    throw new Error('Can not receive negative margins');
  }

  const y = rectangle.y + top;
  const height = rectangle.height - top - bottom;
  const x = rectangle.x + left;
  const width = rectangle.width - left - right;

  if (
    y < 0 ||
    x < 0 ||
    height < 0 ||
    width < 0
  ) {
    throw new Error('Invalid margin sizes');
  }

  return {x, y, width, height};
}
