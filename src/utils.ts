/*
 * This file MUST NOT depend on any file in the project.
 */

// Only integers. Negative values are also valid.
export type Coordinate = {
  x: number,
  y: number,
};

// Only ingegers. Negative values can be included but are invalid.
export type Size = {
  width: number,
  height: number,
};

export function validateSize(size: Size): boolean {
  return size.width >= 0 &&
    size.height >= 0 &&
    size.width === Math.floor(size.width) &&
    size.height === Math.floor(size.height);
}

/**
 * Split a string considering surrogate-pairs.
 */
export function stringToArray(str: string): string[] {
  return str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}
