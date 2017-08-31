// @flow

const Layer = require('./Layer');


/*::
type ConstructorOptions = {
  symbol?: string,
};
 */


class TextSketchbook {
  /*::
  _layers: Layer[];
   */

  constructor(width/*: number*/, height/*: number*/, options/*: ConstructorOptions*/ = {}) {
    const fixedOptions = Object.assign({
      symbol: ' ',
    }, options);

    // TODO: Validate width > 0 and height > 0

    this._layers = [
      new Layer({
        x: 0,
        y: 0,
        width,
        height,
      }, fixedOptions.symbol),
    ];
  }

  _getBaseLayer() {
    return this._layers[0];
  }

  // TODO: Memoize
  // TODO: Compose layers
  toString()/*: string*/ {
    const baseLayer = this._getBaseLayer();

    return baseLayer.getMatrix().map(row => {
      return row.map(element => {
        for (let layerIndex = 0; layerIndex < this._layers.length; layerIndex += 1) {
          const layer = this._layers[layerIndex];
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
