interface DragOptions {
  start?: (downEvt: React.PointerEvent | PointerEvent) => void
  onMove?: (moveEvt: PointerEvent) => void
  onUp?: (upEvt: PointerEvent) => void
}

let disableClick = false
document.addEventListener(
  'click',
  evt => {
    if (disableClick) {
      evt.stopPropagation()
    }
  },
  { capture: true }
)

export const startDrag = (downEvt: React.PointerEvent | PointerEvent, options: DragOptions) => {
  const { start, onMove, onUp } = options

  const abCt = new AbortController()

  const target = downEvt.target as HTMLElement
  target.setPointerCapture(downEvt.pointerId)

  let isMoved = false

  target.addEventListener(
    'pointermove',
    moveEvt => {
      const dis = Math.hypot(moveEvt.clientX - downEvt.clientX, moveEvt.clientY - downEvt.clientY)

      if (!isMoved) {
        if (dis < 10) {
          return
        }
        disableClick = true
        clearWebSelection()

        start?.(downEvt)
        isMoved = true
      }

      onMove?.(moveEvt)
    },
    { signal: abCt.signal }
  )

  const cancel = (evt: PointerEvent) => {
    setTimeout(() => {
      disableClick = false
    })

    abCt.abort()

    if (isMoved) {
      onUp?.(evt)
    }
  }

  target.addEventListener('pointerup', cancel, { signal: abCt.signal })
  target.addEventListener('pointercancel', cancel, { signal: abCt.signal })
}

export function clearWebSelection() {
  const sel = window.getSelection()
  if (sel.rangeCount > 0) sel.removeAllRanges()
}
