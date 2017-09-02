// @flow

/*::
import type Box, {ElementSymbol} from './Box';
 */


const getByCirculatedIndex = (ary/*: any[]*/, index/*: number*/)/*: any*/ => {
  return ary[(ary.length + index) % ary.length];
};

const clearTopSide = (box/*: Box*/, width/*: number*/)/*: void*/ => {
  for (let y = 0; y < width; y += 1) {
    const row = box.getMatrix()[y];
    row.forEach(element => { element.symbol = null; });
  }
};

const clearBottomSide = (box/*: Box*/, width/*: number*/)/*: void*/ => {
  const maxY = box.getMaxY();
  for (let y = maxY; y > maxY - width; y -= 1) {
    const row = box.getMatrix()[y];
    row.forEach(element => { element.symbol = null; });
  }
};

const clearLeftSide = (box/*: Box*/, width/*: number*/)/*: void*/ => {
  box.getMatrix().forEach(row => {
    for (let x = 0; x < width; x += 1) {
      row[x].symbol = null;
    }
  });
};

const clearRightSide = (box/*: Box*/, width/*: number*/)/*: void*/ => {
  const maxX = box.getMaxX();
  box.getMatrix().forEach(row => {
    for (let x = maxX; x > maxX - width; x -= 1) {
      row[x].symbol = null;
    }
  });
};

const drawTopSide = (
  box/*: Box*/,
  borderWidth/*: number*/,
  symbols/*: ElementSymbol[]*/,
  fromX/*: number*/,
  toX/*: number*/
)/*: void*/ => {
  for (let x = fromX; x <= toX; x += 1) {
    for (let y = 0; y < borderWidth; y += 1) {
      const element = box.getElement({x, y});
      if (element) {
        element.symbol = getByCirculatedIndex(symbols, y);
      }
    }
  }
};

const drawBottomSide = (
  box/*: Box*/,
  borderWidth/*: number*/,
  symbols/*: ElementSymbol[]*/,
  fromX/*: number*/,
  toX/*: number*/
)/*: void*/ => {
  const maxY = box.getMaxY();
  for (let x = fromX; x <= toX; x += 1) {
    for (let deltaY = 0; deltaY < borderWidth; deltaY += 1) {
      const y = maxY - deltaY;
      const element = box.getElement({x, y});
      if (element) {
        element.symbol = getByCirculatedIndex(symbols, deltaY);
      }
    }
  }
};

const drawLeftSide = (
  box/*: Box*/,
  borderWidth/*: number*/,
  symbols/*: ElementSymbol[]*/,
  fromY/*: number*/,
  toY/*: number*/
)/*: void*/ => {
  for (let y = fromY; y <= toY; y += 1) {
    for (let x = 0; x < borderWidth; x += 1) {
      const element = box.getElement({x, y});
      if (element) {
        element.symbol = getByCirculatedIndex(symbols, x);
      }
    }
  }
};

const drawRightSide = (
  box/*: Box*/,
  borderWidth/*: number*/,
  symbols/*: ElementSymbol[]*/,
  fromY/*: number*/,
  toY/*: number*/
)/*: void*/ => {
  const maxX = box.getMaxX();
  for (let y = fromY; y <= toY; y += 1) {
    for (let deltaX = 0; deltaX < borderWidth; deltaX += 1) {
      const x = maxX - deltaX;
      const element = box.getElement({x, y});
      if (element) {
        element.symbol = getByCirculatedIndex(symbols, deltaX);
      }
    }
  }
};

module.exports = {
  clearBottomSide,
  clearLeftSide,
  clearRightSide,
  clearTopSide,
  drawBottomSide,
  drawLeftSide,
  drawRightSide,
  drawTopSide,
};
