import { isLine, isText } from '../utils'
import { Stage, Text, measureText } from '..'
import { IShape } from '../type'
import { setCtxMatrix } from '../renderer/canvas'

export function isHitShape(stage: Stage, elementItem: IShape, x: number, y: number) {
  const { ctx, dpr, scale } = stage
  const hit_x = x * dpr
  const hit_y = y * dpr

  // setCtxMatrix(ctx, elementItem)

  ctx.lineWidth = elementItem.data.lineWidth + 5

  let isHit = false
  if (isText(elementItem)) {
    isHit = isHitText(elementItem)
  } else if (!elementItem.path2D) {
    //
  } else if (isLine(elementItem) && !elementItem.data.closed) {
    isHit = isInStroke()
  } else {
    isHit = isInPath() || isInStroke()
  }

  return isHit

  function isInPath() {
    return ctx.isPointInPath(elementItem.path2D, hit_x, hit_y)
  }

  function isInStroke() {
    return ctx.isPointInStroke(elementItem.path2D, hit_x, hit_y)
  }

  function isHitText(elementItem: Text): boolean {
    const { data } = elementItem
    let { textWidth, textHeight } = measureText(data.content, data.fontSize)

    const data_x = data.x * stage.scale + stage.offsetX
    const data_y = data.y * stage.scale + stage.offsetX
    textWidth = textWidth * stage.scale
    textHeight = textHeight * stage.scale

    const halfWidth = textWidth / 2

    const textRect_x = (() => {
      if (data.textAlign === 'left') {
        return data_x
      }
      if (data.textAlign === 'center') {
        return data_x - halfWidth
      }
      if (data.textAlign === 'right') {
        return data_x - textWidth
      }
    })()

    const textRect_y = (() => {
      if (data.textBaseline === 'middle') {
        return data_y - textHeight / 2
      }
      return data_y
    })()

    const is_x = textRect_x <= x && x <= textRect_x + textWidth
    const is_y = textRect_y <= y && y <= textRect_y + textHeight

    return is_x && is_y
  }
}
