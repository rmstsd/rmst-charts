import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { compose, translate } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'

export default class ToolTranslate implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  downPos
  downSnap

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    console.log('ToolTranslate onDragStart')

    this.downPos = sceneCoord

    this.downSnap = this.downSnap = keyBy(
      this.wbEditor.selectManager.selectedGraphs.map(item => ({
        id: item.id,
        downMt: cloneDeep(item.graphShape.data.mt)
      })),
      item => item.id
    )
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = this.downSnap[item.id]
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
