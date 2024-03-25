import { dpr } from '../constant'
import { isBoxHidden, isGroup, isLine, isText } from '../utils'
import { Text, measureText } from '..'
import { IShape } from '../type'

// 需要通过 四叉树算法 优化图形的拾取

export function findHover(ctx: CanvasRenderingContext2D, children: IShape[], x: number, y: number): IShape {
  const _elements = children.toReversed()

  for (const elementItem of _elements) {
    if (elementItem.data.pointerEvents === 'none') {
      continue
    }

    if (isGroup(elementItem) || isBoxHidden(elementItem)) {
      if (isBoxHidden(elementItem)) {
        if (isShapeInner(ctx, elementItem, x, y)) {
          const hovered = findHover(ctx, elementItem.children, x, y)
          if (hovered) {
            return hovered
          }

          return elementItem
        } else {
          continue
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
  ctx.lineWidth = elementItem.data.lineWidth + 5

  const hit_x = offsetX * dpr
  const hit_y = offsetY * dpr

  if (isText(elementItem)) {
    return isTextShapeInner(elementItem)
  }

  const isInPath = () => {
    if (!elementItem.path2D) {
      return false
    }

    return ctx.isPointInPath(elementItem.path2D, hit_x, hit_y)
  }
  const isInStroke = () => {
    if (!elementItem.path2D) {
      return false
    }

    return ctx.isPointInStroke(elementItem.path2D, hit_x, hit_y)
  }

  if (isLine(elementItem) && !elementItem.data.closed) {
    return isInStroke()
  }

  return isInPath() || isInStroke()

  function isTextShapeInner(elementItem: Text): boolean {
    const { x, y, content, fontSize, textAlign, textBaseline } = elementItem.data
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
      if (textBaseline === 'middle') {
        return y - textHeight / 2
      }
      return y
    })()

    const is_x = textRect_x <= offsetX && offsetX <= textRect_x + textWidth
    const is_y = textRect_y <= offsetY && offsetY <= textRect_y + textHeight

    return is_x && is_y
  }
}
