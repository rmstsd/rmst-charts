import { pointToFlatArray } from 'rmst-charts/utils/utils'
import { convertToNormalPoints } from './utils'

export default class Draggable {
  shape: IShape

  constructor(shape: IShape) {
    this.shape = shape

    this.shape.on('mousedown', this.dragStart.bind(this))
  }

  private dragStart({ target, x, y }) {
    if (!this.shape.data.draggable) {
      return
    }

    this.dndRecordMouseDownOffset(x, y)

    const onDocumentMousemove = (evt: MouseEvent) => {
      evt.preventDefault()

      const { shape } = this

      if (shape.data.draggable) {
        const { pageX, pageY } = evt

        const stage = shape.findStage()
        const canvasRect = stage.canvasElement.getBoundingClientRect()

        const offsetX = pageX - canvasRect.left
        const offsetY = pageY - canvasRect.top

        this.dndAttr(offsetX, offsetY)

        shape.onDragMove({ target: shape, x: offsetX, y: offsetY })
      }
    }
    const onDocumentMouseup = () => {
      document.removeEventListener('mousemove', onDocumentMousemove)
      document.removeEventListener('mouseup', onDocumentMouseup)
    }

    document.addEventListener('mousemove', onDocumentMousemove)
    document.addEventListener('mouseup', onDocumentMouseup)
  }

  dndRecordMouseDownOffset(offsetX: number, offsetY: number) {
    const { shape } = this

    if (shape.isGroup) {
      shape.elements.forEach(item => {
        item.draggingMgr.dndRecordMouseDownOffset(offsetX, offsetY)
      })
    } else {
      if (shape.isLine) {
        shape.mouseDownOffsetPoints = convertToNormalPoints(shape.data.points).map(item => ({
          x: offsetX - item.x,
          y: offsetY - item.y
        }))
      } else {
        shape.mouseDownOffset.x = offsetX - shape.data.x
        shape.mouseDownOffset.y = offsetY - shape.data.y
      }
    }
  }

  dndAttr(offsetX: number, offsetY: number) {
    const { shape } = this

    if (shape.isGroup) {
      shape.elements.forEach(item => {
        item.draggingMgr.dndAttr(offsetX, offsetY)
      })
    } else {
      const x = offsetX - shape.mouseDownOffset.x
      const y = offsetY - shape.mouseDownOffset.y

      const pos = shape.data.draggableControl
        ? shape.data.draggableControl({ mouseCoord: { offsetX, offsetY }, shapeCoord: { x, y } })
        : { x, y }

      if (shape.isLine) {
        const c = convertToNormalPoints(shape.data.points)
        c.forEach((item, index) => {
          const o = shape.mouseDownOffsetPoints[index]
          item.x = offsetX - o.x
          item.y = offsetY - o.y
        })

        shape.attr({ points: pointToFlatArray(c) })
      } else {
        shape.attr({ x: pos.x, y: pos.y })
      }
    }
  }
}
