import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint, inverse } from 'transformation-matrix'
import { ICoord, Rect } from 'rmst-render'
import { primaryAlphaColor, primaryColor } from '@/demo/7-whiteboard/color'

export default class ToolBoxSelection implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {
    wbEditor.selectLayer.selectToolGroup.append(this.boxSelectionRect)
  }

  downPos: ICoord

  boxSelectionRect = new Rect({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fillStyle: primaryAlphaColor,
    strokeStyle: primaryColor,
    lineWidth: 2
  })

  onDragStart(downEvt: PointerEvent) {
    const { wbEditor } = this

    this.downPos = applyToPoint(inverse(wbEditor.graphLayer.data.mt), this.wbEditor.client2Stage(downEvt))
    // this.boxSelectionRect.attr({ visible: true })
  }

  onDragMove(moveEvt: PointerEvent) {
    const { wbEditor } = this

    const movePos = applyToPoint(inverse(wbEditor.graphLayer.data.mt), this.wbEditor.client2Stage(moveEvt))

    let tl = { x: Math.min(this.downPos.x, movePos.x), y: Math.min(this.downPos.y, movePos.y) }
    let br = { x: Math.max(this.downPos.x, movePos.x), y: Math.max(this.downPos.y, movePos.y) }

    tl = applyToPoint(wbEditor.graphLayer.data.mt, tl)
    br = applyToPoint(wbEditor.graphLayer.data.mt, br)

    this.boxSelectionRect.attr({ visible: true, x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y })
  }

  onDragEnd(upEvt: PointerEvent) {
    this.boxSelectionRect.attr({ visible: false })
  }
}
