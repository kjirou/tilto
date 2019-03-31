import {
  ElementBody,
  Matrix,
  PourableElement,
  SymbolRuler,
  matrixToRectangle,
  pourElementsVirtually,
} from './matrix';
import {
  Rectangle,
  rectangleToSize,
  shrinkRectangle,
} from './rectangle';
import {
  validateSize,
} from './utils';

export function placeScrollBar(
  matrix: Matrix,
  pourableElements: PourableElement[],
  contentAreaScrollY: number,
  trackElementBody: ElementBody,
  thumbElementBody: ElementBody
): {
  matrix: Matrix,
  contentArea: Rectangle,
} {
  const nextContentArea = shrinkRectangle(matrixToRectangle(matrix), {right: 1});
  if (!validateSize(rectangleToSize(nextContentArea))) {
    throw new Error('The matrix\'s width must be 1 or more.');
  }
  const matrixHeight = nextContentArea.height;
  const {contentHeight} = pourElementsVirtually(pourableElements, nextContentArea.width);

  let scrollBarHeight = matrixHeight;
  let scrollBarY = 0;
  if (contentHeight > 0) {
    scrollBarHeight = Math.ceil(Math.min(matrixHeight / contentHeight, 1.0) * matrixHeight)
    const scrollBarMaxY = matrixHeight - scrollBarHeight;
    const scrollableContentHeight = Math.max(contentHeight - matrixHeight, 0);
    if (scrollableContentHeight > 0) {
      //
      // NOTE:
      //
      // コンテンツ部分のスクロール可能な行数に対しての、現スクロール行数の比率で、
      // スクロールバーの現在位置を決めるロジック。
      //
      // 例えば、matrixHeight が 2 の場合に、スクロールしてない場合は、この位置になり、
      // ====
      // abc #
      // def |
      // hij
      // kml
      // ====
      //
      // 最後までスクロールしている場合は、この位置になる。
      // ====
      // abc
      // def
      // hij |
      // kml #
      // ====
      //
      // ただし、この位置になった場合にどちらに倒れるかというのは、常に自然に見せるのは CLI の都合上難しく、
      // ある程度は諦める必要がある。
      // ====
      // abc
      // def |
      // hij |
      // kml
      // ====
      //
      // 現在は、こうなる。
      // ====
      // abc
      // def #
      // hij |
      // kml
      // ====
      //
      scrollBarY = Math.floor(
        //
        // NOTE:
        //
        // scrollBarY に +1 しているのは、行自体が 1 文字分の太さを持つため。
        // 例えば、以下の状況だと、scrollBarMaxY は 2 だが、スクロールバーの可動域は 3 行分ある。
        // ====
        // #
        // |
        // |
        // ====
        //
        // ただし、そのせいか最終行までコンテンツをスクロールされたときに、scrollBarMaxY をオーバーフローする。
        // そのため最後に、Math.min() で調整している。
        //
        // この辺、なぜこういう不整合が出るのかは正しく理解してなく、テストで抑える方に倒している。
        //
        Math.min(contentAreaScrollY / scrollableContentHeight, 1.0) * (scrollBarMaxY + 1)
      );
      scrollBarY = Math.min(scrollBarY, scrollBarMaxY);
    }
  }

  const newMatrix = matrix.map((row, rowIndex) => {
    const rightEdgeIndex = row.length - 1;
    const rightEdgeElement = row[rightEdgeIndex];
    const copied = row.slice();

    const elementBody = rowIndex >= scrollBarY && rowIndex < scrollBarY + scrollBarHeight
      ? thumbElementBody
      : trackElementBody;
    copied[rightEdgeIndex] = Object.assign({}, rightEdgeElement, elementBody);

    return copied;
  });

  return {
    matrix: newMatrix,
    contentArea: nextContentArea,
  };
}
