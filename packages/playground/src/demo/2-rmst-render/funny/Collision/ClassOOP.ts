import { Rect } from 'rmst-render'

import { isRectShapeCollision } from './DragManagement'

// 假如是: a.subscribe(b): 则 selfDragRect 是 a , otherDragRect 是 b
interface SubscribeOther {
  otherDragRect: DragRect
  onCollision: (selfDragRect: DragRect, otherDragRect: DragRect) => void
  offCollision: (selfDragRect: DragRect, otherDragRect: DragRect) => void
}

export class DragRect {
  constructor(x: number, y: number, fillStyle: string) {
    this.element = new Rect({ x, y, width: 100, height: 100, lineWidth: 3, fillStyle: fillStyle, draggable: true })

    this.element.ondrag = () => {
      const hovered = this.subscribeOthers.filter(otherItem =>
        isRectShapeCollision(this.element, otherItem.otherDragRect.element)
      )

      hovered.forEach(item => {
        if (!this.prevHovered.has(item)) {
          item.onCollision(this, item.otherDragRect)

          const other = item.otherDragRect.subscribeOthers.find(item => item.otherDragRect === this)
          if (other) {
            item.otherDragRect.prevHovered.add(other)
          }
        }

        // console.log('move', item.otherDragRect.element.data.fillStyle)
      })

      this.prevHovered.forEach(item => {
        if (!hovered.includes(item)) {
          item.offCollision(this, item.otherDragRect)

          item.otherDragRect.prevHovered.delete(
            item.otherDragRect.subscribeOthers.find(item => item.otherDragRect === this)
          )
        }
      })

      this.prevHovered = new Set(hovered)
    }
  }

  element: Rect

  marks = 0

  prevHovered = new Set<SubscribeOther>()

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

  subscribeOthers: SubscribeOther[] = []

  subscribe(
    otherDragRect: DragRect,
    onCollision: SubscribeOther['onCollision'],
    offCollision: SubscribeOther['onCollision'],
    option = {
      isEachOther: false // 是否互相订阅
    }
  ) {
    this.subscribeOthers.push({ otherDragRect, onCollision, offCollision })

    if (option.isEachOther) {
      otherDragRect.subscribe(this, onCollision, offCollision)
    }
  }
}
