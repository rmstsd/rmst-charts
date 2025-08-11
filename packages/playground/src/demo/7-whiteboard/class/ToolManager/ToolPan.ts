import { ICoord } from 'rmst-render'
import WhiteboardEditor from '../../whiteboardEditor'
import { ITool } from './type'
import { grabbingCursor, grabCursor, WbCursor } from '../cursorManager'

export default class ToolPan implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  cursor?: WbCursor = grabCursor

  downPos?: ICoord

  onPointerDown(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.wbEditor.cursorManager.setCursor(grabbingCursor)
  }

  onDragStart(downEvt, sceneCoord) {
    this.downPos = sceneCoord
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    if (!this.downPos) {
      return
    }

    const deltaX = sceneCoord.x - this.downPos.x
    const deltaY = sceneCoord.y - this.downPos.y

    this.wbEditor.camera.pan(deltaX, deltaY)
  }

  onDragEnd(upEvt: PointerEvent, sceneCoord: ICoord) {
    this.wbEditor.cursorManager.setCursor(this.cursor)
  }

  onPointerUp(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.wbEditor.cursorManager.setCursor(this.cursor)
  }

  onDrawAfterEnd() {
    return false
  }
}
