import { ICoord, Stage } from '../..'
import { setCursor } from '../utils'

const minScale = 0.1
const maxScale = 5

export class Camera {
  constructor(private stage: Stage, private enable: boolean) {
    const documentKeydown = (evt: KeyboardEvent) => {
      const prevIsCtrlPressing = this.isCtrlPressing
      const prevIsAltPressing = this.isAltPressing

      const prevIsSpacePressing = this.isSpacePressing

      this.isCtrlPressing = evt.ctrlKey
      this.isAltPressing = evt.altKey

      if (evt.code === 'Space') {
        this.isSpacePressing = evt.type === 'keydown'
      }

      if (this.isCtrlPressing !== prevIsCtrlPressing) {
        this.onCtrlToggle()
      }

      if (this.isAltPressing !== prevIsAltPressing) {
        this.onAltToggle()
      }

      if (this.isSpacePressing !== prevIsSpacePressing) {
        this.onSpaceToggle()
      }
    }

    document.addEventListener('keydown', documentKeydown)
    document.addEventListener('keyup', documentKeydown)

    const canvasWheel = (evt: WheelEvent) => {
      if (!this.enable) {
        return
      }

      evt.preventDefault()

      if (this.isCtrlPressing) {
        const center = { x: evt.offsetX, y: evt.offsetY }
        if (evt.deltaY < 0) {
          this.zoomIn(center)
        } else {
          this.zoomOut(center)
        }
      }
    }
    this.stage.canvasElement.addEventListener('wheel', canvasWheel)

    // document.removeEventListener('keydown', documentKeydown)
    // document.removeEventListener('keyup', documentKeydown)
  }

  public isSpacePressing = false
  private isCtrlPressing = false
  private isAltPressing = false

  // 画布平移中
  public isDragging = false

  private onCtrlToggle() {
    console.log('ctrl toggle', this.isCtrlPressing)
  }

  private onAltToggle() {
    console.log('Alt toggle', this.isAltPressing)
  }

  private onSpaceToggle() {
    console.log('space toggle', this.isSpacePressing)
    if (!this.enable) {
      return
    }

    if (this.isDragging) {
      return
    }

    this.stage.draggingMgr.disabledDragElement = this.isSpacePressing ? true : false
    const hovered = this.stage.eventDispatcher.hovered

    if (this.isSpacePressing) {
      this.stage.selectedMgr.onElementLeave(hovered)
      setCursor(this.stage, 'grab')
    } else {
      this.stage.selectedMgr.onElementEnter(hovered)
      this.stage.eventDispatcher.setHoveredCursor()
    }
  }

  public tx = 0
  public ty = 0
  public zoom = 1

  private prevClient = { x: 0, y: 0 }

  mousedown(evt) {
    if (!this.enable) {
      return
    }

    if (this.isSpacePressing) {
      this.isDragging = true
      setCursor(this.stage, 'grabbing')

      evt.preventDefault()
      this.prevClient.x = evt.clientX
      this.prevClient.y = evt.clientY
    }
  }

  mousemove(evt) {
    if (this.isDragging) {
      const dx = evt.clientX - this.prevClient.x
      const dy = evt.clientY - this.prevClient.y

      this.prevClient.x = evt.clientX
      this.prevClient.y = evt.clientY

      this.setTranslate({ x: this.tx + dx, y: this.ty + dy })
    }
  }

  mouseup(evt) {
    this.isDragging = false
    if (this.isSpacePressing) {
      setCursor(this.stage, 'grab')
    }
  }

  public setTranslate({ x, y }: ICoord) {
    this.tx = x
    this.ty = y
    this.stage.render()
  }

  public setZoom(scale: number, center?: ICoord) {
    const prevScale = this.zoom

    if (!center) {
      center = this.stage.center
    }

    const { x: canvas_x, y: canvas_y } = offsetToCanvas(center.x, center.y, {
      tx: this.tx,
      ty: this.ty,
      scaleX: prevScale,
      scaleY: prevScale
    })

    this.zoom = scale

    const dx = -canvas_x * (this.zoom - prevScale)
    const dy = -canvas_y * (this.zoom - prevScale)

    this.tx += dx
    this.ty += dy

    this.stage.render()
  }

  public zoomIn(center?: ICoord) {
    const nv = Math.min(this.zoom * 1.1, maxScale)
    this.setZoom(nv, center)
  }

  public zoomOut(center?: ICoord) {
    const nv = Math.max(this.zoom * 0.9, minScale)
    this.setZoom(nv, center)
  }
}

type Matrix = { tx: number; ty: number; scaleX: number; scaleY: number }
function offsetToCanvas(ox: number, oy: number, matrix: Matrix) {
  const x = (ox - matrix.tx) / matrix.scaleX
  const y = (oy - matrix.ty) / matrix.scaleY

  return { x, y }
}
