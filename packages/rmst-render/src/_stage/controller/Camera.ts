import { Stage } from '../..'
import { setCursor } from '../hoveredElementHandler'

const minScale = 0.1
const maxScale = 5

export default class Camera {
  constructor(private stage: Stage, public enable: boolean) {}

  tx = 0
  ty = 0
  scale = 1

  isMousedown = false
  isSpaceKeyDown = false

  prev = { x: 0, y: 0 }

  mousedown(evt) {
    if (!this.enable) {
      return
    }
    if (!this.isSpaceKeyDown) {
      return
    }

    evt.preventDefault()
    this.prev.x = evt.clientX
    this.prev.y = evt.clientY
    this.isMousedown = true
    setCursor(this.stage, 'grabbing')
  }

  mousemove(evt) {
    if (this.isSpaceKeyDown && this.isMousedown) {
      const dx = evt.clientX - this.prev.x
      const dy = evt.clientY - this.prev.y

      this.prev.x = evt.clientX
      this.prev.y = evt.clientY

      this.tx += dx
      this.ty += dy

      this.stage.renderStage()
    }
  }

  mouseup(evt) {
    this.isMousedown = false
    if (this.isSpaceKeyDown) {
      setCursor(this.stage, 'grab')
    }
  }

  keydown(evt) {
    if (!this.enable) {
      return
    }
    if (this.stage.draggingMgr.dragging) {
      return
    }
    if (evt.code === 'Space') {
      if (this.isMousedown) {
        return
      }
      if (!this.isSpaceKeyDown) {
        this.isSpaceKeyDown = true
        this.stage.draggingMgr.disabledDragElement = true

        setCursor(this.stage, 'grab')
      }
    }
  }
  keyup(evt) {
    if (evt.code === 'Space') {
      this.isSpaceKeyDown = false
      this.stage.draggingMgr.disabledDragElement = false
      setCursor(this.stage, 'default')
    }
  }
  wheel(evt) {
    if (!this.enable) {
      return
    }

    evt.preventDefault()

    const prevScale = this.scale
    const { x: canvasCoordX, y: canvasCoordY } = offsetToCanvas(evt.offsetX, evt.offsetY, {
      tx: this.tx,
      ty: this.ty,
      scaleX: prevScale,
      scaleY: prevScale
    })

    if (evt.deltaY < 0) {
      this.scale = Math.min(this.scale * 1.1, maxScale)
    } else {
      this.scale = Math.max(this.scale * 0.9, minScale)
    }

    const dx = -canvasCoordX * (this.scale - prevScale)
    const dy = -canvasCoordY * (this.scale - prevScale)

    this.tx += dx
    this.ty += dy

    this.stage.renderStage()
  }
}

type Matrix = { tx: number; ty: number; scaleX: number; scaleY: number }
function offsetToCanvas(ox: number, oy: number, matrix: Matrix) {
  const x = (ox - matrix.tx) / matrix.scaleX
  const y = (oy - matrix.ty) / matrix.scaleY

  return { x, y }
}
