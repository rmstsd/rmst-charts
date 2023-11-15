import { Group } from 'zrender'
import Stage from './Stage'
import { dpr } from './constant'

const debugOption: DebugOption = {
  // disabledCanvasHandleMouseMove: true,
  // disabledCanvasHandleMouseDown: true,
  // disabledCanvasHandleMouseUp: true
}

abstract class AbsEvent {
  onClick = () => {}
  onMove = () => {}
  onEnter = () => {}
  onLeave = () => {}
  onDown = () => {}
  onUp = () => {}
  onDragMove = () => {}

  isMouseInner = false // 鼠标是否已经移入某个元素

  mouseDownOffset = { x: 0, y: 0 } // 鼠标按下的时候 鼠标位置相对于 图形的 x, y 的偏移量

  mouseDownOffsetPoints: { x: number; y: number }[] = []

  parent: Stage | Group = null

  data
  path2D
  surroundBoxCoord
  clipWidth
  clipHeight
  isLine

  dndAttr(offsetX: number, offsetY: number) {}
  dndRecordMouseDownOffset(offsetX: number, offsetY: number) {}

  findStage() {
    let stage = this.parent

    while (stage && stage.parent) {
      stage = stage.parent
    }

    return stage as unknown as Stage
  }

  isInner(offsetX: number, offsetY: number) {
    const stage = this.findStage()

    if (!stage) return

    stage.ctx.lineWidth = this.data.lineWidth + 5
    const isInPath = () => {
      return stage.ctx.isPointInPath(this.path2D, offsetX * dpr, offsetY * dpr)
    }
    const isInStroke = () => {
      return stage.ctx.isPointInStroke(this.path2D, offsetX * dpr, offsetY * dpr)
    }
    const isInSurroundBox = () => {
      const surroundBoxCoord = this.surroundBoxCoord
        ? this.surroundBoxCoord
        : { lt_x: 0, lt_y: 0, rb_x: 0, rb_y: 0 }

      return (
        offsetX > surroundBoxCoord.lt_x &&
        offsetX < surroundBoxCoord.lt_x + this.clipWidth &&
        offsetY > surroundBoxCoord.lt_y &&
        offsetY < surroundBoxCoord.lt_y + this.clipHeight
      )
    }

    if (this.isLine && !this.data.closed) {
      return isInStroke()
    }

    if (this.data.clip) {
      return isInSurroundBox() && (isInPath() || isInStroke())
    }

    return isInPath() || isInStroke()
  }

  handleClick(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)
    if (isInner) {
      this.onClick()
    }

    return isInner
  }

  handleMouseDown(offsetX: number, offsetY: number) {
    if (debugOption.disabledCanvasHandleMouseDown) {
      return
    }

    const isInner = this.isInner(offsetX, offsetY)
    if (isInner) {
      this.onDown()

      if (this.data.draggable) {
        this.dndRecordMouseDownOffset(offsetX, offsetY)

        const onDocumentMousemove = (evt: MouseEvent) => {
          evt.preventDefault()

          if (this.data.draggable) {
            const { pageX, pageY } = evt

            const stage = this.findStage()
            const canvasRect = stage.canvasElement.getBoundingClientRect()

            const offsetX = pageX - canvasRect.left
            const offsetY = pageY - canvasRect.top

            this.dndAttr(offsetX, offsetY)

            this.onDragMove()
          }
        }
        const onDocumentMouseup = () => {
          document.removeEventListener('mousemove', onDocumentMousemove)
          document.removeEventListener('mouseup', onDocumentMouseup)
        }

        document.addEventListener('mousemove', onDocumentMousemove)
        document.addEventListener('mouseup', onDocumentMouseup)
      }
    }

    return isInner
  }

  handleMouseUp(offsetX: number, offsetY: number) {
    if (debugOption.disabledCanvasHandleMouseUp) {
      return
    }
    const isInner = this.isInner(offsetX, offsetY)

    if (isInner) {
      this.onUp()
    }

    return isInner
  }
}

export default AbsEvent
