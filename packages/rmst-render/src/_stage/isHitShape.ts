import { isLine, isText } from '../utils'
import { Stage, Text, measureText } from '..'
import { IShape } from '../type'
import { applyToPoint, compose, inverse, scale, transform, translate } from 'transformation-matrix'

export function isHitShape(stage: Stage, elementItem: IShape, x: number, y: number) {
  const { ctx, camera } = stage

  ctx.save()

  const mt = elementItem.data.mt
  ctx.transform(mt.a, mt.b, mt.c, mt.d, mt.e, mt.f)

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

  ctx.restore()

  return isHit

  function isInPath() {
    return ctx.isPointInPath(elementItem.path2D, x, y)
  }

  function isInStroke() {
    return ctx.isPointInStroke(elementItem.path2D, x, y)
  }

  function isHitText(elementItem: Text): boolean {
    const { data } = elementItem
    let { textWidth, textHeight } = measureText(data.content, data.fontSize, stage.ctx)

    const data_x = data.x
    const data_y = data.y

    const stageMt = compose(translate(camera.tx, camera.ty), scale(camera.zoom, camera.zoom))

    const canvas_coord = applyToPoint(inverse(stageMt), { x, y })
    const local_coord = applyToPoint(inverse(elementItem.data.mt), canvas_coord)

    const halfWidth = textWidth / 2

    const textRect_x = (() => {
      return 0
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
      return 0
      if (data.textBaseline === 'middle') {
        return data_y - textHeight / 2
      }
      return data_y
    })()

    const is_x = textRect_x <= local_coord.x && local_coord.x <= textRect_x + textWidth
    const is_y = textRect_y <= local_coord.y && local_coord.y <= textRect_y + textHeight

    return is_x && is_y
  }
}
