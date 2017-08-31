// @flow

const Box = require('./Box');


/*::
import type {BoxId, ElementSymbol, Rectangle} from './Box';
 */

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
      }, fixedOptions.symbol, null),
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
        for (let boxIndex = this._boxes.length - 1; boxIndex >= 0; boxIndex -= 1) {
          const box = this._boxes[boxIndex];
          const el = box.getElementByAbsoluteCoordinate({x: element.x, y: element.y});
          if (el && typeof el.symbol === 'string') {
            return el.symbol;
          }
        }
        throw new Error('Unexpected situation');
      }).join('');
    }).join('\n');
  }

  addBox(box/*: Box*/)/*: void*/ {
    const boxId = box.getId();

    if (boxId !== null) {
      this._boxes.forEach(box => {
        if (boxId === box.getId()) {
          throw new Error(`"${boxId}" is duplicated`);
        }
      });
    }

    this._boxes.push(box);
  }

  drawBox(
    rectangle/*: Rectangle*/,
    options/*: {id?: BoxId, symbol?: ElementSymbol}*/ = {}
  )/*: void*/ {
    const fixedOptions = Object.assign({}, {
      id: null,
      symbol: null,
    }, options);

    const box = new Box(rectangle, fixedOptions.symbol, fixedOptions.id);

    this.addBox(box);
  }
}

module.exports = TextSketchbook;
