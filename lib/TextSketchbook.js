// @flow


/*::
type Element = {
  x: number,
  y: number,
  symbol: string,
};
type Matrix = Element[][];
type Rectangle = {
  x: number,
  y: number,
  width: number,
  height: number,
};
type ConstructorOptions = {
  symbol?: string,
};
 */


class TextSketchbook {
  /*::
  _matrix: Matrix;
   */
  constructor(width/*: number*/, height/*: number*/, optionas/*: ConstructorOptions*/ = {}) {
    const fixedOptions = Object.assign({
      symbol: ' ',
    }, optionas);

    // TODO: Validate width > 0 and height > 0

    const matrix = [];
    for (let y = 0; y < height; y += 1) {
      matrix.push([]);
      for (let x = 0; x < width; x += 1) {
        matrix[y].push({
          y,
          x,
          symbol: fixedOptions.symbol,
        });
      }
    }
    this._matrix = matrix;
  }

  // TODO: Memoize
  toString() {
    return this._matrix
      .map(row => {
        return row.map(({symbol}) => symbol).join('');
      })
      .join('\n');
  }

  drawBox(rectangle/*: Rectangle*/) {
  }
}

module.exports = TextSketchbook;
