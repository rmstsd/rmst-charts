import { ICoord, IShape } from 'rmst-render'
import { WbCursor } from '../cursorManager'

export type PointerContext = {
  hovered: IShape
  clientCoord: ICoord
  sceneCoord: ICoord
  isInWbCanvas: boolean
  isPointerDown: boolean
}

export interface ITool {
  cursor?: WbCursor

  enableActive?: () => Promise<boolean> // 代表激活成功
  onActive?: () => void
  onDeActive?: () => void

  onPointerDown?: (downEvt: PointerEvent, sceneCoord: ICoord) => void

  // 移动时, 不管鼠标是否按下
  onPointerMove?: (context: { moveEvt?: PointerEvent; sceneCoord?: ICoord; isInWbCanvas: boolean }) => void

  // 在非拖拽时, 鼠标移动
  onPointerMoveNotDragging?: (context: PointerContext) => void
  onPointerUp?: (UpEvt: PointerEvent, sceneCoord: ICoord) => void

  onDragStart: (downEvt: PointerEvent, sceneCoord: ICoord) => void
  onDragMove: (moveEvt: PointerEvent, sceneCoord: ICoord) => void
  onDragEnd: (upEvt: PointerEvent, sceneCoord: ICoord) => void

  onDrawAfterEnd?: () => void | boolean // 拖拽结束后是否退出当前工具

  onShiftToggle?: (isShiftKeyPressing: boolean) => void
  onAltToggle?: (isAltKeyPressing: boolean) => void
  onSpaceToggle?: (isSpaceKeyPressing: boolean) => void
}
