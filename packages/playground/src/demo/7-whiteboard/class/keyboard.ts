import EventEmitter from 'rmst-render/event_emitter'
import WhiteboardEditor from '../whiteboardEditor'

interface Events {
  spaceToggle: (isSpaceKeyPressing: boolean) => void
  ctrlToggle: (isCtrlPressing: boolean) => void
  altToggle: (isAltKeyPressing: boolean) => void
  shiftKeyToggle: (isShiftKeyPressing: boolean) => void
}

export class Keyboard {
  constructor(private wbEditor: WhiteboardEditor) {}

  private abCt = new AbortController()

  eventEmitter = new EventEmitter<Events>()

  isSpaceKeyPressing = false
  isCtrlKeyPressing = false
  isAltKeyPressing = false
  isShiftKeyPressing = false

  bindEvent() {
    const documentKeydown = (evt: KeyboardEvent) => {
      // 按下 空格 ctrl alt shift 时
      if (evt.code === 'Space' || evt.ctrlKey || evt.altKey || evt.shiftKey) {
        evt.preventDefault()
      }

      const prevIsSpacePressing = this.isSpaceKeyPressing
      const prevIsCtrlPressing = this.isCtrlKeyPressing
      const prevIsAltPressing = this.isAltKeyPressing
      const prevIsShiftKeyPressing = this.isShiftKeyPressing

      this.isCtrlKeyPressing = evt.ctrlKey
      this.isAltKeyPressing = evt.altKey
      this.isShiftKeyPressing = evt.shiftKey

      if (evt.code === 'Space') {
        this.isSpaceKeyPressing = evt.type === 'keydown'
      }

      if (this.isSpaceKeyPressing !== prevIsSpacePressing) {
        this.onSpaceToggle(this.isSpaceKeyPressing)
        this.eventEmitter.emit('spaceToggle', this.isSpaceKeyPressing)
      }

      if (this.isCtrlKeyPressing !== prevIsCtrlPressing) {
        this.onCtrlToggle(this.isCtrlKeyPressing)
        this.eventEmitter.emit('ctrlToggle', this.isCtrlKeyPressing)
      }

      if (this.isAltKeyPressing !== prevIsAltPressing) {
        this.onAltToggle(this.isAltKeyPressing)
        this.eventEmitter.emit('altToggle', this.isAltKeyPressing)
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

  onCtrlToggle(isCtrlKeyPressing: boolean) {}

  onAltToggle(isAltKeyPressing: boolean) {}

  onSpaceToggle(isSpaceKeyPressing: boolean) {}

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
