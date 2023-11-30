import { pointToFlatArray } from 'rmst-charts/utils/utils'
import { convertToNormalPoints } from './utils'
import Group from './shape/Group'
import { EventParameter } from './constant'

export default class Draggable {
  shape: IShape

  constructor(shape: IShape) {
    this.shape = shape

    this.shape.on('mousedown', this.dragStart.bind(this))
  }

  dragStart({ target, x, y }: EventParameter) {
    const onDocumentMousemove = (evt: MouseEvent) => {
      evt.preventDefault()

      const { shape } = this

      if (shape.data.draggable) {
        const { movementX, movementY } = evt

        this.dndAttr(movementX, movementY)

        shape.ondrag({ target: shape, x: evt.offsetX, y: evt.offsetY })
      }
    }

    const onDocumentMouseup = () => {
      document.removeEventListener('mousemove', onDocumentMousemove)
      document.removeEventListener('mouseup', onDocumentMouseup)
    }

    document.addEventListener('mousemove', onDocumentMousemove)
    document.addEventListener('mouseup', onDocumentMouseup)
  }

  dndAttr(dx: number, dy: number) {
    const { shape } = this

    const { draggable } = shape.data

    switch (draggable) {
      case 'horizontal':
        dy = 0
        break
      case 'vertical':
        dx = 0
    }

    if (shape.isGroup) {
      ;(shape as Group).elements.forEach(item => {
        item.draggingMgr.dndAttr(dx, dy)
      })
    } else {
      const oldShapeData = shape.data

      if (shape.isLine) {
        const c = convertToNormalPoints(shape.data.points)
        c.forEach(item => {
          item.x += dx
          item.y += dy
        })

        shape.attr({ points: pointToFlatArray(c) })
      } else {
        shape.attr({ x: oldShapeData.x + dx, y: oldShapeData.y + dy })
      }
    }
  }
}
