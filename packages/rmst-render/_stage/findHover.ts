import { dpr } from 'rmst-render/constant'
import { isBoxHidden, isGroup, isLine, isText } from 'rmst-render/utils'
import { IShape, Text, measureText } from 'rmst-render'

export function findHover(ctx: CanvasRenderingContext2D, children: IShape[], x: number, y: number): IShape {
  const _elements = children.toReversed()

  for (const elementItem of _elements) {
    if (elementItem.data.pointerEvents === 'none') {
      continue
    }

    if (isGroup(elementItem) || isBoxHidden(elementItem)) {
      if (isBoxHidden(elementItem)) {
        if (!isShapeInner(ctx, elementItem, x, y)) {
          continue
        } else {
          return elementItem // 解决后代 dataZoom 的 enter 事件bug (需重新思考)
        }
      }

      const hovered = findHover(ctx, elementItem.children, x, y)
      if (hovered) {
        return hovered
      }
    } else {
      const isInner = isShapeInner(ctx, elementItem, x, y)
      if (isInner) {
        return elementItem
      }
    }
  }

  return null
}

function isShapeInner(ctx: CanvasRenderingContext2D, elementItem: IShape, offsetX: number, offsetY: number) {
  if (!elementItem.path2D) {
    return false
  }

  ctx.lineWidth = elementItem.data.lineWidth + 5
  const hit_x = offsetX * dpr
  const hit_y = offsetY * dpr

  if (isText(elementItem)) {
    return isTextShapeInner(elementItem)
  }

  const isInPath = () => ctx.isPointInPath(elementItem.path2D, hit_x, hit_y)
  const isInStroke = () => ctx.isPointInStroke(elementItem.path2D, hit_x, hit_y)

  if (isLine(elementItem) && !elementItem.data.closed) {
    return isInStroke()
  }

  return isInPath() || isInStroke()

  function isTextShapeInner(elementItem: Text): boolean {
    const { x, y, content, fontSize, textAlign } = elementItem.data
    const { textWidth, textHeight } = measureText(content, fontSize)
    const halfWidth = textWidth / 2

    const textRect_x = (() => {
      if (textAlign === 'left') {
        return x
      }
      if (textAlign === 'center') {
        return x - halfWidth
      }
      if (textAlign === 'right') {
        return x - textWidth
      }
    })()

    const textRect_y = (() => {
      return y
    })()

    const is_x = textRect_x <= hit_x && hit_x <= textRect_x + textWidth
    const is_y = textRect_y <= hit_y && hit_y <= textRect_y + textHeight

    return is_x && is_y
  }
}
