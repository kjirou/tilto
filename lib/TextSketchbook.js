// @flow

const Box = require('./Box');


/*::
type ConstructorOptions = {
  symbol?: string,
};
 */


class TextSketchbook {
  /*::
  _boxes: Box[];
   */

  constructor(width/*: number*/, height/*: number*/, options/*: ConstructorOptions*/ = {}) {
    const fixedOptions = Object.assign({
      symbol: ' ',
    }, options);

    // TODO: Validate width > 0 and height > 0

    this._boxes = [
      new Box({
        x: 0,
        y: 0,
        width,
        height,
      }, fixedOptions.symbol),
    ];
  }

  _getBaseBox() {
    return this._boxes[0];
  }

  // TODO: Memoize
  // TODO: Compose layers
  toString()/*: string*/ {
    const baseBox = this._getBaseBox();

    return baseBox.getMatrix().map(row => {
      return row.map(element => {
        for (let boxIndex = 0; boxIndex < this._boxes.length; boxIndex += 1) {
          const layer = this._boxes[boxIndex];
          const el = layer.getElementByAbsoluteCoordinate({x: element.x, y: element.y});
          if (el) {
            return el.symbol;
          }
        }
        throw new Error('Unexpected situation');
      }).join('');
    }).join('\n');
  }

  //drawBox(rectangle/*: Rectangle*/) {
  //}
}

module.exports = TextSketchbook;
