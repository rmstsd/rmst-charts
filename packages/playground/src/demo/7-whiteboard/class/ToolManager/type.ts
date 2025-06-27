export interface ITool {
  onActive?: () => void
  onDeActive?: () => void

  onPointerDown?: (downEvt: PointerEvent) => void
  onDragStart: (downEvt: PointerEvent) => void
  onDragMove: (moveEvt: PointerEvent) => void
  onDragEnd: (upEvt: PointerEvent) => void
}
