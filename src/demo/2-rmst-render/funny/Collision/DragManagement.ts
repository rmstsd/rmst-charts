import { Rect } from 'rmst-render'

export default class DragManagement {
  children: Rect[] = []

  add(rect: Rect) {
    this.children.push(rect)

    rect.ondrag = () => {
      checkShape(this.children)
    }
  }
}

export function checkShape(children: DragManagement['children']) {
  children.forEach(item => {
    const bool = children.filter(o => o !== item).some(otherItem => isRectShapeCollision(item, otherItem))

    if (bool) {
      item.attr({ strokeStyle: '#000' })
    } else {
      item.attr('strokeStyle', '')
    }
  })
}

// 左上角 和 右下角 的坐标
function isRectCollision(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
  const overlapWidth = Math.min(ax2, bx2) - Math.max(ax1, bx1)
  const overlapHeight = Math.min(ay2, by2) - Math.max(ay1, by1)

  return overlapWidth > 0 && overlapHeight > 0
}

export function isRectShapeCollision(rect_1: Rect, rect_2: Rect) {
  return isRectCollision(
    rect_1.data.x,
    rect_1.data.y,
    rect_1.data.x + rect_1.data.width,
    rect_1.data.y + rect_1.data.height,

    rect_2.data.x,
    rect_2.data.y,
    rect_2.data.x + rect_2.data.width,
    rect_2.data.y + rect_2.data.height
  )
}
