import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint, compose, rotate } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'
import { CursorType, getCursorRotation } from '../../cursorManager'
import { calcRotateRad } from '@/demo/7-whiteboard/constant'

export default class ToolRotate implements ITool {
  constructor(private wbEditor: WhiteboardEditor, private cursorType: CursorType) {}

  origin: ICoord
  startRad: number
  downSnap
  downRect
  isSingleSelect = false

  startShapeRotation

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    console.log('ToolRotate onDragStart')

    this.downRect = this.wbEditor.selectManager.transformRect
    this.isSingleSelect = this.wbEditor.selectManager.selectedIds.length === 1

    this.origin = applyToPoint(this.downRect.mt, { x: this.downRect.width / 2, y: this.downRect.height / 2 })
    this.startRad = Math.atan2(sceneCoord.y - this.origin.y, sceneCoord.x - this.origin.x)

    this.startShapeRotation = calcRotateRad(this.downRect.mt)

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

    let newMt

    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = this.downSnap[item.id].graphShapeRect

      newMt = compose(rotate(diffRad, this.origin.x, this.origin.y), dSnap.mt)

      item.graphShape.attr('mt', newMt)
    })

    {
      const mt = this.isSingleSelect ? newMt : compose(rotate(diffRad, this.origin.x, this.origin.y), this.downRect.mt)
      const rotation = getCursorRotation('rotation', this.cursorType, mt)
      this.wbEditor.cursorManager.setCursor({ type: 'rotation', rotation })
    }

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolRotate onDragEnd')
  }
}
