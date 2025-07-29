import EventEmitter from 'rmst-render/event_emitter'
import WhiteboardEditor from '../whiteboardEditor'

interface Events {
  spaceToggle: (isSpacePressing: boolean) => void
  ctrlToggle: (isCtrlPressing: boolean) => void
  altToggle: (isAltPressing: boolean) => void
  shiftKeyToggle: (isShiftKeyPressing: boolean) => void
}

export class Keyboard {
  constructor(private wbEditor: WhiteboardEditor) {}

  private abCt = new AbortController()

  eventEmitter = new EventEmitter<Events>()

  isSpacePressing = false
  isCtrlPressing = false
  isAltPressing = false
  isShiftKeyPressing = false

  bindEvent() {
    const documentKeydown = (evt: KeyboardEvent) => {
      // 按下 空格 ctrl alt shift 时
      if (evt.code === 'Space' || evt.ctrlKey || evt.altKey || evt.shiftKey) {
        evt.preventDefault()
      }

      const prevIsSpacePressing = this.isSpacePressing
      const prevIsCtrlPressing = this.isCtrlPressing
      const prevIsAltPressing = this.isAltPressing
      const prevIsShiftKeyPressing = this.isShiftKeyPressing

      this.isCtrlPressing = evt.ctrlKey
      this.isAltPressing = evt.altKey
      this.isShiftKeyPressing = evt.shiftKey

      if (evt.code === 'Space') {
        this.isSpacePressing = evt.type === 'keydown'
      }

      if (this.isSpacePressing !== prevIsSpacePressing) {
        this.onSpaceToggle(this.isSpacePressing)
        this.eventEmitter.emit('spaceToggle', this.isSpacePressing)
      }

      if (this.isCtrlPressing !== prevIsCtrlPressing) {
        this.onCtrlToggle(this.isCtrlPressing)
        this.eventEmitter.emit('ctrlToggle', this.isCtrlPressing)
      }

      if (this.isAltPressing !== prevIsAltPressing) {
        this.onAltToggle(this.isAltPressing)
        this.eventEmitter.emit('altToggle', this.isAltPressing)
      }

      if (this.isShiftKeyPressing !== prevIsShiftKeyPressing) {
        this.onShiftToggle(this.isShiftKeyPressing)
        this.eventEmitter.emit('shiftKeyToggle', this.isShiftKeyPressing)
      }

      if (evt.type === 'keydown') {
        this.onKeyDown(evt)
      }
    }

    document.addEventListener('keydown', documentKeydown, { signal: this.abCt.signal })
    document.addEventListener('keyup', documentKeydown, { signal: this.abCt.signal })
  }

  onCtrlToggle(isCtrlPressing: boolean) {}

  onAltToggle(isAltPressing: boolean) {}

  onSpaceToggle(isSpacePressing: boolean) {}

  onShiftToggle(isShiftKeyPressing: boolean) {}

  private onKeyDown(evt: KeyboardEvent) {
    if (evt.code === 'Delete') {
      const { selectManager } = this.wbEditor

      if (selectManager.selectedIds.length) {
        selectManager.selectedGraphs.forEach(item => {
          item.remove()
        })
        selectManager.clearSelect()

        this.wbEditor.triggerRender()
      }
    }
  }

  dispose() {
    this.eventEmitter.offAll()
    this.abCt.abort()
  }
}
