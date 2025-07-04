import { getBBox, ICoord, Path } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from '../type'
import { IGraph } from '../../../type'

export default class ToolDrawImage implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  downPos: ICoord
  graphItem = {} as IGraph

  private points: [number, number, number][] = []

  onActive() {
    this.wbEditor.selectManager.clearSelect()
  }

  onPointerDown(downEvt: PointerEvent) {}

  onDragStart(downEvt: PointerEvent) {}

  onDragMove(moveEvt: PointerEvent) {}

  onDragEnd(upEvt: PointerEvent) {}
}
