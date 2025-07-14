import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { compose, translate } from 'transformation-matrix'
import { cloneDeep } from 'es-toolkit'
import { ICoord } from 'rmst-render'

export default class ToolTranslate implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  downPos
  downSnap

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    console.log('ToolTranslate onDragStart')

    this.downPos = sceneCoord

    this.downSnap = this.wbEditor.selectManager.selectedGraphs.map(item => ({
      downMt: cloneDeep(item.graphShape.data.mt)
    }))
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    // console.log('ToolTranslate onDragMove')

    this.wbEditor.selectManager.selectedGraphs.forEach((item, index) => {
      const dSnap = this.downSnap[index]
      const moveLocalPos = sceneCoord

      const dx = moveLocalPos.x - this.downPos.x
      const dy = moveLocalPos.y - this.downPos.y

      const tmt = translate(dx, dy)

      item.graphShape.attr('mt', compose(tmt, dSnap.downMt))
    })

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolTranslate onDragEnd')
  }
}
