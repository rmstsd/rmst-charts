import { ICoord, IRect, Path } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from './../type'
import { uuid } from '@/utils'
import { applyToPoint, compose, inverse, translate } from 'transformation-matrix'
import { Graph } from '../../../type'
import { ToolEnumKey } from './../constant'

export default abstract class ToolDrawByRect implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  downPos: ICoord

  graphItem = {} as Graph

  onDragStart(downEvt: PointerEvent) {
    this.downPos = this.wbEditor.client2Stage(downEvt)

    const mt = compose(inverse(this.wbEditor.graphLayer.data.mt))
    this.downPos = applyToPoint(mt, this.downPos)

    this.graphItem.id = uuid()
    this.graphItem.graphShape = new Path({})
    this.wbEditor.graphLayer.append(this.graphItem.graphShape)

    this.wbEditor.graphs.push(this.graphItem)

    this.wbEditor.selectManager.clearSelect()
    this.wbEditor.selectManager.selectedIds.push(this.graphItem.id)
  }

  onDragMove(moveEvt: PointerEvent) {
    const { wbEditor, downPos } = this

    let movePos = wbEditor.client2Stage(moveEvt)
    const mt = compose(inverse(this.wbEditor.graphLayer.data.mt))
    movePos = applyToPoint(mt, movePos)

    const tl = { x: Math.min(movePos.x, downPos.x), y: Math.min(movePos.y, downPos.y) }
    const br = { x: Math.max(movePos.x, downPos.x), y: Math.max(movePos.y, downPos.y) }

    const width = br.x - tl.x
    const height = br.y - tl.y

    const graphData = this.getGraphPathD({ x: 0, y: 0, width, height })
    this.graphItem.graphShape.attr({
      id: this.graphItem.id,
      name: graphData.name,
      d: graphData.d,
      mt: translate(tl.x, tl.y),
      fillStyle: 'pink',
      lineWidth: 1,
      extraData: {
        wbType: graphData.wbType
      }
    })

    wbEditor.selectManager.renderSelected()
  }

  onDragEnd(upEvt: PointerEvent) {}

  protected abstract getGraphPathD(rect: IRect): { d: string; name: string; wbType: ToolEnumKey }
}
