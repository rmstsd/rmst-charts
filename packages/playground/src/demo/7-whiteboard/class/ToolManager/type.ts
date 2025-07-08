import { ICoord } from 'rmst-render'

export type Destructor = () => void

export interface ITool {
  enableActive?: () => Promise<boolean>
  onActive?: () => void
  onDeActive?: () => void

  onPointerDown?: (downEvt: PointerEvent, sceneCoord: ICoord) => void
  onPointerMove?: (moveEvt: PointerEvent, sceneCoord: ICoord) => void // 移动时, 不管鼠标是否按下
  onPointerUp?: (downEvt: PointerEvent, sceneCoord: ICoord) => void

  onDragStart: (downEvt: PointerEvent, sceneCoord: ICoord) => void
  onDragMove: (moveEvt: PointerEvent, sceneCoord: ICoord) => void
  onDragEnd: (upEvt: PointerEvent, sceneCoord: ICoord) => void
}
