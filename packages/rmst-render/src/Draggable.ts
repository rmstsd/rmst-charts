import { EventParameter } from './constant'
import { isGroup, isLine, isStage } from './utils/isShape'
import { convertToNormalPoints, pointToFlatArray } from './utils'
import { IShape } from './type'

export default class Draggable {
  private prevClientX = 0
  private prevClientY = 0

  dragging = false

  dragStart(eventParameter: EventParameter, canvasElementRect: DOMRect) {
    let draggedTarget = eventParameter.target

    while (draggedTarget && !draggedTarget.data.draggable) {
      const parent = draggedTarget.parent as unknown as IShape
      if (isStage(parent)) {
        break
      }

      draggedTarget = parent
    }

    this.prevClientX = eventParameter.nativeEvent.clientX
    this.prevClientY = eventParameter.nativeEvent.clientY

    draggedTarget.ondragstart({ target: draggedTarget, x: eventParameter.x, y: eventParameter.y })

    const onDocumentMousemove = (evt: MouseEvent) => {
      evt.preventDefault()

      this.dragging = true

      const x = evt.clientX - canvasElementRect.left
      const y = evt.clientY - canvasElementRect.top

      if (!draggedTarget.data.draggable) {
        return
      }

      const dx = evt.clientX - this.prevClientX
      const dy = evt.clientY - this.prevClientY

      this.prevClientX = evt.clientX
      this.prevClientY = evt.clientY

      dndAttr(draggedTarget, dx, dy)

      draggedTarget.ondrag({ target: draggedTarget, x, y, dx, dy })
    }

    const onDocumentMouseup = () => {
      this.dragging = false

      draggedTarget.ondragend({ target: draggedTarget, x: null, y: null })

      document.removeEventListener('mousemove', onDocumentMousemove)
      document.removeEventListener('mouseup', onDocumentMouseup)
    }

    document.addEventListener('mousemove', onDocumentMousemove)
    document.addEventListener('mouseup', onDocumentMouseup)
  }
}

function dndAttr(draggedTarget: IShape, dx: number, dy: number) {
  const target = draggedTarget

  switch (target.data.draggable) {
    case 'horizontal':
      dy = 0
      break
    case 'vertical':
      dx = 0
  }

  setShapeCoord(target, dx, dy)
}

function setShapeCoord(target: IShape, dx: number, dy: number) {
  if (isGroup(target)) {
    target.children.forEach(item => {
      setShapeCoord(item, dx, dy)
    })
  } else {
    if (isLine(target)) {
      const c = convertToNormalPoints(target.data.points)
      c.forEach(item => {
        item.x += dx
        item.y += dy
      })

      target.attr({ points: pointToFlatArray(c) })
    } else {
      // @ts-ignore
      target.attr({ x: target.data.x + dx, y: target.data.y + dy })
    }
  }
}
