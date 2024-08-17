import { EventParameter } from './constant'
import { isGroup, isLine, isStage } from './utils/isShape'
import { convertToNormalPoints, pointToFlatArray } from './utils'
import { IShape } from './type'
import { Stage } from '.'
import { findHover_v2 } from './_stage/findHover'

export default class Draggable {
  constructor(stage: Stage) {
    this.stage = stage

    stage.canvasElement.addEventListener('mousedown', evt => {
      if (this.disabledDragElement) {
        return
      }
      const x = evt.offsetX
      const y = evt.offsetY
      const hovered = findHover_v2(stage, x, y)

      if (hovered) {
        const eventParameter: EventParameter = { target: hovered, x, y, nativeEvent: evt }
        this.dragStart(eventParameter)
      }
    })
  }
  private prevClientX = 0
  private prevClientY = 0

  stage: Stage

  dragging = false

  disabledDragElement = false

  dragStart(eventParameter: EventParameter) {
    const canvasElementRect = this.stage.canvasElement.getBoundingClientRect()

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

      dndAttr(draggedTarget, dx / this.stage.camera.scale, dy / this.stage.camera.scale)

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
