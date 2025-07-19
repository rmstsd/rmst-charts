import { ICoord, IRect, Path } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from './../type'
import { uuid } from '@/utils'
import { translate } from 'transformation-matrix'
import { IGraph } from '../../../type'
import { ToolEnumKey } from './../constant'
import { defaultGraphFillColor } from '@/demo/7-whiteboard/color'

export default abstract class ToolDrawByRect implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  downPos: ICoord

  graphItem = {} as IGraph

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.downPos = sceneCoord

    this.graphItem.id = uuid()
    this.graphItem.graphShape = new Path({})
    this.wbEditor.graphLayer.append(this.graphItem.graphShape)

    this.wbEditor.graphs.push(this.graphItem)

    this.wbEditor.selectManager.select(this.graphItem.id)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    const { wbEditor, downPos } = this

    const tl = { x: Math.min(sceneCoord.x, downPos.x), y: Math.min(sceneCoord.y, downPos.y) }
    const br = { x: Math.max(sceneCoord.x, downPos.x), y: Math.max(sceneCoord.y, downPos.y) }

    const width = br.x - tl.x
    const height = br.y - tl.y

    const graphData = this.getGraphPathD({ x: 0, y: 0, width, height })
    this.graphItem.graphShape.attr({
      id: this.graphItem.id,
      name: graphData.name,
      d: graphData.d,
      width,
      height,
      mt: translate(tl.x, tl.y),
      fillStyle: defaultGraphFillColor,
      lineWidth: 1,
      extraData: {
        wbType: graphData.wbType
      }
    })

    wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {}

  onPointerUp(upEvt: PointerEvent, sceneCoord: ICoord) {
    const width = 100
    const height = 100

    const graphData = this.getGraphPathD({ x: 0, y: 0, width, height })

    this.graphItem.id = uuid()
    this.graphItem.graphShape = new Path({})
    this.wbEditor.graphLayer.append(this.graphItem.graphShape)

    this.wbEditor.graphs.push(this.graphItem)

    this.wbEditor.selectManager.select(this.graphItem.id)

    this.graphItem.graphShape.attr({
      id: this.graphItem.id,
      name: graphData.name,
      d: graphData.d,
      width,
      height,
      mt: translate(sceneCoord.x - width / 2, sceneCoord.y - height / 2),
      fillStyle: defaultGraphFillColor,
      lineWidth: 1,
      extraData: {
        wbType: graphData.wbType
      }
    })

    this.wbEditor.triggerRender()
  }

  protected abstract getGraphPathD(rect: IRect): { d: string; name: string; wbType: ToolEnumKey }
}
