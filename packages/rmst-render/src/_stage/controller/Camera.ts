import { ICoord, Stage } from '../..'
import { setCursor } from '../hoveredElementHandler'

const minScale = 0.1
const maxScale = 5

export default class Camera {
  constructor(private stage: Stage, private enable: boolean) {}

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

      this.stage.render()
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

    const center = { x: evt.offsetX, y: evt.offsetY }
    if (evt.deltaY < 0) {
      this.zoomIn(center)
    } else {
      this.zoomOut(center)
    }
  }

  public setZoom(scale: number, center?: ICoord) {
    const prevScale = this.scale

    if (!center) {
      center = this.stage.center
    }

    const { x: canvas_x, y: canvas_y } = offsetToCanvas(center.x, center.y, {
      tx: this.tx,
      ty: this.ty,
      scaleX: prevScale,
      scaleY: prevScale
    })

    this.scale = scale

    const dx = -canvas_x * (this.scale - prevScale)
    const dy = -canvas_y * (this.scale - prevScale)

    this.tx += dx
    this.ty += dy

    this.stage.render()
  }

  public zoomIn(center?: ICoord) {
    const nv = Math.min(this.scale * 1.1, maxScale)
    this.setZoom(nv, center)
  }

  public zoomOut(center?: ICoord) {
    const nv = Math.max(this.scale * 0.9, minScale)
    this.setZoom(nv, center)
  }
}

type Matrix = { tx: number; ty: number; scaleX: number; scaleY: number }
function offsetToCanvas(ox: number, oy: number, matrix: Matrix) {
  const x = (ox - matrix.tx) / matrix.scaleX
  const y = (oy - matrix.ty) / matrix.scaleY

  return { x, y }
}
