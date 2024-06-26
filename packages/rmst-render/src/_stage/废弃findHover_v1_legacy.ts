// 废弃
function findHover_v1_legacy(ctx: CanvasRenderingContext2D, children: IShape[], x: number, y: number) {
  const _elements = children.toReversed()

  for (const elementItem of _elements) {
    if (elementItem.data.pointerEvents === 'none') {
      continue
    }

    if (isGroup(elementItem) || isBoxHidden(elementItem)) {
      if (isBoxHidden(elementItem)) {
        if (isHitShape(ctx, elementItem, x, y)) {
          const hovered = findHover_v1_legacy(ctx, elementItem.children, x, y)
          if (hovered) {
            return hovered
          }

          return elementItem
        } else {
          continue
        }
      }

      const hovered = findHover_v1_legacy(ctx, elementItem.children, x, y)
      if (hovered) {
        return hovered
      }
    } else {
      const isInner = findHover_v1_legacy(ctx, elementItem, x, y)
      if (isInner) {
        return elementItem
      }
    }
  }

  return null
}
