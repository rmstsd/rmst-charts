import Circle from './shape/Circle'
import Line from './shape/Line'
import AbstractUi from './shape/AbstractUi'
import Rect from './shape/Rect'
import Group from './shape/Group'
import Text from './shape/Text'

declare global {
  type IShape = Group | Circle | Rect | Line | Text | AbstractUi

  type IOption = {
    container: HTMLElement
  }

  type DraggableControlCoord = {
    mouseCoord: { offsetX: number; offsetY: number }
    shapeCoord: { x: number; y: number }
  }

  interface DebugOption {
    disabledCanvasHandleMouseDown?: boolean
    disabledCanvasHandleMouseUp?: boolean
  }

  type ICursor =
    | 'url'
    | 'default'
    | 'auto'
    | 'crosshair'
    | 'pointer'
    | 'move'
    | 'e-resize'
    | 'ne-resize'
    | 'nw-resize'
    | 'n-resize'
    | 'se-resize'
    | 'sw-resize'
    | 's-resize'
    | 'w-resize'
    | 'text'
    | 'wait'
    | 'help'
}
