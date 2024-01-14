import { Rect } from 'rmst-render'

import { isRectShapeCollision } from './DragManagement'

// 假如是: a.subscribe(b): 则 selfDragRect 是 a , otherDragRect 是 b
interface SubscribeOther {
  isCollisionPrev?: boolean
  otherDragRect: DragRect
  onCollision: (selfDragRect: DragRect, otherDragRect: DragRect) => void
  offCollision: (selfDragRect: DragRect, otherDragRect: DragRect) => void
}

export class DragRect {
  constructor(x: number, y: number, fillStyle: string) {
    this.element = new Rect({ x, y, width: 100, height: 100, lineWidth: 3, fillStyle: fillStyle, draggable: true })

    this.element.ondrag = () => {
      this.SubscribeOthers.forEach(item => {
        // 如果俩个矩形产生了碰撞
        const bool = isRectShapeCollision(this.element, item.otherDragRect.element)

        if (bool) {
          if (!item.isCollisionPrev) {
            item.isCollisionPrev = true

            item.onCollision(this, item.otherDragRect)
          }
        } else {
          if (item.isCollisionPrev) {
            item.isCollisionPrev = false

            item.offCollision(this, item.otherDragRect)
          }
        }
      })
    }
  }

  element: Rect

  marks = 0

  select() {
    this.marks++

    if (this.marks === 1) {
      this.element.attr('strokeStyle', 'red')
    }
  }

  cancelSelect() {
    this.marks--
    if (this.marks === 0) {
      this.element.attr('strokeStyle', '')
    }
  }

  SubscribeOthers: SubscribeOther[] = []

  subscribe(
    otherDragRect: DragRect,
    onCollision: SubscribeOther['onCollision'],
    offCollision: SubscribeOther['onCollision'],
    option = {
      isEachOther: false // 是否互相订阅
    }
  ) {
    this.SubscribeOthers.push({ otherDragRect, onCollision, offCollision })

    if (option.isEachOther) {
      otherDragRect.subscribe(this, onCollision, offCollision)
    }
  }
}
