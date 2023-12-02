import { pointToFlatArray } from 'rmst-charts/utils/utils'
import { convertToNormalPoints } from './utils'
import Group from './shape/Group'
import { EventParameter } from './constant'
import Stage from './Stage'

export default class Draggable {
  dragStart(eventParameter: EventParameter) {
    let draggedTarget = eventParameter.target

    while (draggedTarget && !draggedTarget.data.draggable) {
      const parent = draggedTarget.parent as unknown as IShape
      if ((parent as unknown as Stage).isStage) {
        break
      }

      draggedTarget = parent
    }

    if (!draggedTarget.data.draggable) {
      return
    }

    const onDocumentMousemove = (evt: MouseEvent) => {
      evt.preventDefault()
      const { movementX, movementY } = evt
      const dx = movementX
      const dy = movementY

      if (draggedTarget.data.cusSetCoord) {
        draggedTarget.data.cusSetCoord({ target: draggedTarget, x: evt.offsetX, y: evt.offsetY, dx, dy })
      } else {
        dndAttr(draggedTarget, dx, dy)
      }

      draggedTarget.ondrag({ target: draggedTarget, x: evt.offsetX, y: evt.offsetY })
    }

    const onDocumentMouseup = () => {
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
  if (target.isGroup) {
    ;(target as Group).elements.forEach(item => {
      setShapeCoord(item, dx, dy)
    })
  } else {
    if (target.isLine) {
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
