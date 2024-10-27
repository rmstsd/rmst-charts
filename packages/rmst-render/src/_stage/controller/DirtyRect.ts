import colorAlpha from 'color-alpha'
import { BoundingRect, clipRect, Rect, Stage } from '../..'
import { createRectPath2D, setCirclePath2D, setCtxStyleProp } from '../../renderer/canvas'

// 未完全实现
class DirtyRect {
  constructor(private stage: Stage) {}

  private dirtyRectUi: Rect
  private timer

  renderDirtyRectUi(sb: BoundingRect) {
    const { stage } = this
    if (!this.dirtyRectUi) {
      this.dirtyRectUi = new Rect({
        ...sb,
        fillStyle: colorAlpha('red', 0.2),
        strokeStyle: 'red',
        opacity: 0,
        pointerEvents: 'none'
      })
      stage.append(this.dirtyRectUi)
    }

    clearTimeout(this.timer)

    this.dirtyRectUi.attr(sb)
    this.dirtyRectUi.animateCartoon({ opacity: 1 }, { duration: 300 })

    this.timer = setTimeout(() => {
      this.dirtyRectUi.animateCartoon({ opacity: 0 }, { duration: 300 })
    }, 800)
  }
}

export default DirtyRect

// 左上角 和 右下角 的坐标
function isRectCollision(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
  const overlapWidth = Math.min(ax2, bx2) - Math.max(ax1, bx1)
  const overlapHeight = Math.min(ay2, by2) - Math.max(ay1, by1)

  return overlapWidth > 0 && overlapHeight > 0
}

function isRectShapeCollision(rect_1: BoundingRect, rect_2: BoundingRect) {
  return isRectCollision(
    rect_1.x,
    rect_1.y,
    rect_1.x + rect_1.width,
    rect_1.y + rect_1.height,

    rect_2.x,
    rect_2.y,
    rect_2.x + rect_2.width,
    rect_2.y + rect_2.height
  )
}

export function attrDirty(shape, data) {
  const oldSb = shape.getBoundingRect()
  shape.data = { ...shape.data, ...data }
  const nSb = shape.getBoundingRect()
  const x = Math.min(oldSb.x, nSb.x)
  const y = Math.min(oldSb.y, nSb.y)
  const sb: BoundingRect = {
    x,
    y,
    width: Math.max(oldSb.x + oldSb.width, nSb.x + nSb.width) - x,
    height: Math.max(oldSb.y + oldSb.height, nSb.y + nSb.height) - y
  }
  shape.stage.dirtyRect.renderDirtyRectUi(sb)
  const { ctx } = shape.stage
  ctx.clearRect(sb.x, sb.y, sb.width, sb.height)
  const overlapShapes = shape.stage.children
    .filter(item => item.type === 'Circle')
    .filter(item => item !== shape)
    .filter(item => isRectShapeCollision(sb, item.getBoundingRect()))
  clipRect(ctx, createRectPath2D(sb), () => {
    const neededUpdatedShapes = overlapShapes.concat(shape)
    const correctSortedShapes = shape.stage.children.filter(item => neededUpdatedShapes.includes(item))

    correctSortedShapes.forEach(item => {
      setCtxStyleProp(ctx, item)
      setCirclePath2D(item)
    })
  })
}
