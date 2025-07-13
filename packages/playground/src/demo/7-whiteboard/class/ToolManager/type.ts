import { ICoord } from 'rmst-render'

export type Destructor = () => void

export interface ITool {
  enableActive?: () => Promise<boolean>
  onActive?: () => void
  onDeActive?: () => void

  onPointerDown?: (downEvt: PointerEvent, sceneCoord: ICoord) => void

  // 移动时, 不管鼠标是否按下
  onPointerMove?: (context: { moveEvt: PointerEvent; sceneCoord: ICoord; isInContainer: boolean }) => void

  // 移动时 不是拖拽
  onPointerMoveNotDragging?: (moveEvt: PointerEvent, sceneCoord: ICoord) => void
  onPointerUp?: (downEvt: PointerEvent, sceneCoord: ICoord) => void

  onDragStart: (downEvt: PointerEvent, sceneCoord: ICoord) => void
  onDragMove: (moveEvt: PointerEvent, sceneCoord: ICoord) => void
  onDragEnd: (upEvt: PointerEvent, sceneCoord: ICoord) => void
}
