import { dpr } from '../constant'
import { isBoxHidden, isGroup, isLine, isStage, isText } from '../utils'
import { Text, measureText } from '..'
import { IShape } from '../type'
import { setCtxMatrix } from '../renderer/canvas'

export function isHitShape(ctx: CanvasRenderingContext2D, elementItem: IShape, x: number, y: number) {
  const hit_x = x * dpr
  const hit_y = y * dpr

  ctx.save()

  setCtxMatrix(ctx, elementItem)

  if (isText(elementItem)) {
    const isHit = isHitText(elementItem)
    ctx.restore()
    return isHit
  }

  if (!elementItem.path2D) {
    ctx.restore()
    return false
  }

  ctx.lineWidth = elementItem.data.lineWidth + 5

  if (isLine(elementItem) && !elementItem.data.closed) {
    const isHit = isInStroke()
    ctx.restore()
    return isHit
  }

  const isHit = isInPath() || isInStroke()
  ctx.restore()
  return isHit

  function isInPath() {
    return ctx.isPointInPath(elementItem.path2D, hit_x, hit_y)
  }

  function isInStroke() {
    return ctx.isPointInStroke(elementItem.path2D, hit_x, hit_y)
  }

  function isHitText(elementItem: Text): boolean {
    const { data } = elementItem
    const { textWidth, textHeight } = measureText(data.content, data.fontSize)

    const halfWidth = textWidth / 2

    const textRect_x = (() => {
      if (data.textAlign === 'left') {
        return data.x
      }
      if (data.textAlign === 'center') {
        return data.x - halfWidth
      }
      if (data.textAlign === 'right') {
        return data.x - textWidth
      }
    })()

    const textRect_y = (() => {
      if (data.textBaseline === 'middle') {
        return data.y - textHeight / 2
      }
      return data.y
    })()

    const is_x = textRect_x <= x && x <= textRect_x + textWidth
    const is_y = textRect_y <= y && y <= textRect_y + textHeight

    return is_x && is_y
  }
}
