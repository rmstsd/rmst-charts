import { ICoord, uuid } from 'rmst-render'
import { Graph_Id } from '../../constant'
import WhiteboardEditor from '../../whiteboardEditor'
import { ITool } from './type'

export class ToolRuler implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  isX: boolean
  isY: boolean
  isBoth: boolean

  id: string

  setRulerId(id: string) {
    this.isX = id === Graph_Id.ruler_assist_line_x
    this.isY = id === Graph_Id.ruler_assist_line_y
    this.isBoth = id === Graph_Id.ruler_assist_line_both
  }

  onDragStart(evt: PointerEvent, sceneCoord: ICoord) {
    this.id = uuid()
    this.wbEditor.ruler.addRuler(this.isX ? 'horizontal' : 'vertical', this.id, this.isX ? sceneCoord.y : sceneCoord.x)
  }

  onDragMove(evt: PointerEvent, sceneCoord: ICoord) {
    this.wbEditor.ruler.updateRuler(this.isX ? 'horizontal' : 'vertical', this.id, this.isX ? sceneCoord.y : sceneCoord.x)
  }

  onDragEnd(evt: PointerEvent, sceneCoord: ICoord) {}

  onDrawAfterEnd() {
    return false
  }
}
