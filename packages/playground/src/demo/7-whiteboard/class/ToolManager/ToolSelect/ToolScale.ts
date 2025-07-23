import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint, compose, inverse } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'
import { TransformOrigin } from '../constant'
import { getCursorRotation } from '../../cursorManager'
import { resizeRect, TransformRect } from './resizeStrategy'
import { recomputeTransformRect } from '@/demo/6-other/mtDe/Xg_multi/util'

export default class ToolScale implements ITool {
  constructor(private wbEditor: WhiteboardEditor, private transformOrigin: TransformOrigin, private cursorType) {
    console.log(transformOrigin)

    if (!transformOrigin) {
      throw new Error('transformOrigin is required')
    }
  }

  startRad: number
  downSnap

  isSingleSelect = false
  downRect

  onDragStart(downEvt: PointerEvent) {
    console.log('ToolScale onDragStart')

    this.downRect = this.wbEditor.selectManager.transformRect
    this.isSingleSelect = this.wbEditor.selectManager.selectedIds.length === 1

    const sel = this.wbEditor.selectManager.selectedGraphs.map(item => ({
      id: item.graphShape.id,
      graphShapeRect: {
        width: item.graphShape.data.width,
        height: item.graphShape.data.height,
        mt: cloneDeep(item.graphShape.data.mt)
      }
    }))

    this.downSnap = keyBy(sel, item => item.id)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    const movePos = applyToPoint(inverse(this.downRect.mt), sceneCoord)

    let transformRect: TransformRect

    if (this.isSingleSelect) {
      transformRect = resizeRect(this.transformOrigin, movePos, this.downRect)

      const item = this.wbEditor.selectManager.selectedGraphs[0]
      item.graphShape.attr({ width: transformRect.width, height: transformRect.height, mt: transformRect.mt })
    } else {
      transformRect = resizeRect(this.transformOrigin, movePos, this.downRect, { changeWidthAndHeight: false })

      const prependedTransform = compose(transformRect.mt, inverse(this.downRect.mt))

      this.wbEditor.selectManager.selectedGraphs.forEach(item => {
        const dSnap = this.downSnap[item.graphShape.id].graphShapeRect
        const newWorldTf = compose(prependedTransform, dSnap.mt)
        const reCalcRect = recomputeTransformRect({ width: dSnap.width, height: dSnap.height, mt: newWorldTf })
        item.graphShape.attr({ width: reCalcRect.width, height: reCalcRect.height, mt: reCalcRect.mt })
      })
    }

    {
      const rotation = getCursorRotation('resize', this.cursorType, transformRect.mt)
      this.wbEditor.cursorManager.setCursor({ type: 'resize', rotation })
    }

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolScale onDragEnd')
  }
}
