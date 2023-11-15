import Circle from './shape/Circle'
import Line from './shape/Line'
import AbstractUi from './shape/AbstractUi'
import Rect from './shape/Rect'

declare global {
  type IShape = Circle | Rect | AbstractUi | Line

  type IOption = {
    container: HTMLElement
  }

  type SurroundBoxCoord = { lt_x: number; lt_y: number; rb_x: number; rb_y: number }

  type DraggableControlCoord = {
    mouseCoord: { offsetX: number; offsetY: number }
    shapeCoord: { x: number; y: number }
  }

  type DraggableControl = (coord: DraggableControlCoord) => {
    x: number
    y: number
  }

  interface DebugOption {
    disabledCanvasHandleMouseDown?: boolean
    disabledCanvasHandleMouseUp?: boolean
  }
}
