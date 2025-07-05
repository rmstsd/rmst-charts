import { ICoord } from 'rmst-render'

export type Destructor = () => void

export interface ITool {
  onActive?: () => void | Destructor
  onDeActive?: () => void

  onPointerDown?: (downEvt: PointerEvent, sceneCoord: ICoord) => void
  onPointerUp?: (downEvt: PointerEvent, sceneCoord: ICoord) => void

  onDragStart: (downEvt: PointerEvent, sceneCoord: ICoord) => void
  onDragMove: (moveEvt: PointerEvent, sceneCoord: ICoord) => void
  onDragEnd: (upEvt: PointerEvent, sceneCoord: ICoord) => void
}
