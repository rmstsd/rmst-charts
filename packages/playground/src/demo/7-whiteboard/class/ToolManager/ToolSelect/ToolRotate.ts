import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint, compose, rotate } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'
import { CursorType } from '../../cursorManager'
import { calcRotateRad, isFlipped } from '@/demo/7-whiteboard/constant'

export default class ToolRotate implements ITool {
  constructor(private wbEditor: WhiteboardEditor, private cursorType: CursorType) {}

  origin: ICoord
  startRad: number
  downSnap

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    console.log('ToolRotate onDragStart')

    const { downRect } = this.wbEditor.selectManager.transformDownRect

    this.origin = applyToPoint(downRect.mt, { x: downRect.width / 2, y: downRect.height / 2 })
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

      const newMt = compose(rotate(diffRad, this.origin.x, this.origin.y), dSnap.mt)

      const isFlip = isFlipped(newMt)

      // let angle = calcRotateRad(newMt)

      // this.wbEditor.cursorManager.setCursor(getCursor(this.cursorType, angle, isFlip))

      item.graphShape.attr('mt', newMt)
    })

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolRotate onDragEnd')
  }
}
