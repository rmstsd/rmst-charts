import { pointToFlatArray } from 'rmst-charts/utils/utils'
import { EventParameter } from './constant'
import { isGroup, isStage } from './utils/isShape'
import { convertToNormalPoints } from './utils'

export default class Draggable {
  dragStart(eventParameter: EventParameter, canvasElementRect: DOMRect) {
    let draggedTarget = eventParameter.target

    while (draggedTarget && !draggedTarget.data.draggable) {
      const parent = draggedTarget.parent as unknown as IShape
      if (isStage(parent)) {
        break
      }

      draggedTarget = parent
    }

    draggedTarget.ondragstart({ target: draggedTarget, x: eventParameter.x, y: eventParameter.y })

    const onDocumentMousemove = (evt: MouseEvent) => {
      evt.preventDefault()

      const x = evt.clientX - canvasElementRect.left
      const y = evt.clientY - canvasElementRect.top

      draggedTarget.ondrag({ target: draggedTarget, x, y })

      if (!draggedTarget.data.draggable) {
        return
      }

      const { movementX, movementY } = evt
      dndAttr(draggedTarget, movementX, movementY)
    }

    const onDocumentMouseup = () => {
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
    if (target.type === 'Line') {
      const c = convertToNormalPoints(target.data.points)
      c.forEach(item => {
        item.x += dx
        item.y += dy
      })

      target.attr({ points: pointToFlatArray(c) })
    } else {
      target.attr({ x: target.data.x + dx, y: target.data.y + dy })
    }
  }
}
