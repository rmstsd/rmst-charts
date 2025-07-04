import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'

import { applyToPoint, compose, inverse, translate } from 'transformation-matrix'
import { cloneDeep } from 'es-toolkit'

export default class ToolTranslate implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  downPos
  downSnap

  onDragStart(downEvt: PointerEvent) {
    console.log('ToolTranslate onDragStart')

    this.downPos = this.wbEditor.client2World(downEvt)

    this.downSnap = this.wbEditor.selectManager.selectedGraphs.map(item => ({
      downMt: cloneDeep(item.graphShape.data.mt),
      downLocalPos: applyToPoint(inverse(this.wbEditor.graphLayer.data.mt), this.downPos)
    }))
  }

  onDragMove(moveEvt: PointerEvent) {
    console.log('ToolTranslate onDragMove')
    const movePos = this.wbEditor.client2World(moveEvt)

    this.wbEditor.selectManager.selectedGraphs.forEach((item, index) => {
      const dSnap = this.downSnap[index]
      const moveLocalPos = applyToPoint(inverse(this.wbEditor.graphLayer.data.mt), movePos)

      const dx = moveLocalPos.x - dSnap.downLocalPos.x
      const dy = moveLocalPos.y - dSnap.downLocalPos.y

      const tmt = translate(dx, dy)

      item.graphShape.attr('mt', compose(tmt, dSnap.downMt))
    })

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolTranslate onDragEnd')
  }
}
