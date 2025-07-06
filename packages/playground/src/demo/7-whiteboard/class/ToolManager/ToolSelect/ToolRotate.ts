import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'

import { applyToPoint, compose, inverse, rotate } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'

export default class ToolRotate implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  origin: ICoord
  startRad: number
  downSnap

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    console.log('ToolRotate onDragStart')

    const { graphLayerCoordSys } = this.wbEditor.selectManager.transformDownRect

    this.origin = {
      x: (graphLayerCoordSys.tl.x + graphLayerCoordSys.br.x) / 2,
      y: (graphLayerCoordSys.tl.y + graphLayerCoordSys.br.y) / 2
    }
    this.startRad = Math.atan2(sceneCoord.y - this.origin.y, sceneCoord.x - this.origin.x)

    const sel = this.wbEditor.selectManager.selectedGraphs.map(item => ({
      id: item.id,
      graphShapeRect: { mt: cloneDeep(item.graphShape.data.mt) }
    }))

    this.downSnap = keyBy(sel, item => item.id)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    // console.log('ToolRotate onDragMove')

    const currRad = Math.atan2(sceneCoord.y - this.origin.y, sceneCoord.x - this.origin.x)
    const diffRad = currRad - this.startRad

    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = this.downSnap[item.id].graphShapeRect

      item.graphShape.attr('mt', compose(rotate(diffRad, this.origin.x, this.origin.y), dSnap.mt))
    })

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolRotate onDragEnd')
  }
}
