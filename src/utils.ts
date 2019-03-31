/*
 * This file MUST NOT depend on any file in the project.
 */

import * as stripAnsi from 'strip-ansi';

const ansiStyles = require('ansi-styles');

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

/**
 * Split a string considering surrogate-pairs.
 */
export function stringToArray(str: string): string[] {
  return str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}
