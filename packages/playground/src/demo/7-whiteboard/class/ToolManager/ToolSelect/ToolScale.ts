import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'

import { applyToPoint, compose, inverse, rotate, translate } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'
import { TransformOrigin } from '../constant'

export default class ToolScale implements ITool {
  constructor(private wbEditor: WhiteboardEditor, private transformOrigin: TransformOrigin) {
    console.log(transformOrigin)
    if (!transformOrigin) {
      throw new Error('transformOrigin is required')
    }
  }

  origin: ICoord
  startRad: number
  downSnap

  onDragStart(downEvt: PointerEvent) {
    console.log('ToolScale onDragStart')

    const { graphLayerCoordSys } = this.wbEditor.selectManager.transformDownRect

    const downPos = applyToPoint(inverse(this.wbEditor.graphLayer.data.mt), this.wbEditor.client2Stage(downEvt))
    this.origin = {
      x: (graphLayerCoordSys.tl.x + graphLayerCoordSys.br.x) / 2,
      y: (graphLayerCoordSys.tl.y + graphLayerCoordSys.br.y) / 2
    }
    this.startRad = Math.atan2(downPos.y - this.origin.y, downPos.x - this.origin.x)

    const sel = this.wbEditor.selectManager.selectedGraphs.map(item => ({
      id: item.id,
      graphShapeRect: { mt: cloneDeep(item.graphShape.data.mt) }
    }))

    this.downSnap = keyBy(sel, item => item.id)
  }

  onDragMove(moveEvt: PointerEvent) {
    console.log('ToolScale onDragMove')

    const movePos = applyToPoint(inverse(this.wbEditor.graphLayer.data.mt), this.wbEditor.client2Stage(moveEvt))
    const currRad = Math.atan2(movePos.y - this.origin.y, movePos.x - this.origin.x)
    const diffRad = currRad - this.startRad

    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = this.downSnap[item.id].graphShapeRect

      item.graphShape.attr('mt', compose(rotate(diffRad, this.origin.x, this.origin.y), dSnap.mt))
    })

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolScale onDragEnd')
  }
}
