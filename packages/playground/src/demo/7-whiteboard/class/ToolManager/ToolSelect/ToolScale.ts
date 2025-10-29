import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint, compose, inverse } from 'transformation-matrix'
import { cloneDeep, isNotNil, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'
import { TransformOrigin } from '../constant'
import { getCursorRotation } from '../../cursorManager'
import { resizeRect, TransformRect } from './resizeStrategy'
import { recomputeTransformRect } from '@/demo/6-other/mtDe/Xg_multi/util'
import { calcRotateRad } from '@/demo/7-whiteboard/constant'

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

  movePos: ICoord

  onDragStart(downEvt: PointerEvent) {
    console.log('ToolScale onDragStart')

    this.downRect = this.wbEditor.selectManager.transformRect
    this.isSingleSelect = this.wbEditor.selectManager.selectedIds.length === 1

    const sel = this.wbEditor.selectManager.selectedGraphs.map(item => ({
      id: item.id,
      graphShapeRect: {
        width: item.data.width,
        height: item.data.height,
        mt: cloneDeep(item.data.mt)
      }
    }))

    this.downSnap = keyBy(sel, item => item.id)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.movePos = sceneCoord

    this.updateSize()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolScale onDragEnd')
    this.wbEditor.refLine.clearRefLine()
  }

  private updateSize() {
    const { movePos } = this
    if (!movePos) {
      return
    }

    const { isShiftKeyPressing, isAltKeyPressing } = this.wbEditor.keyboard

    const isHandleFourVertex = [TransformOrigin.tr, TransformOrigin.tr, TransformOrigin.br, TransformOrigin.bl].includes(
      this.transformOrigin
    )
    const isHandleFourSide_x90Deg =
      [TransformOrigin.Top, TransformOrigin.Left, TransformOrigin.Bottom, TransformOrigin.Right].includes(this.transformOrigin) &&
      calcRotateRad(this.downRect.mt) % (Math.PI / 2) === 0

    // 拽四个角 || (拽单边 && 旋转角度是 90 度的倍数)
    if (isHandleFourVertex || isHandleFourSide_x90Deg) {
      const offset = this.wbEditor.refLine.getOffset(
        [this.movePos],
        this.wbEditor.selectManager.selectedGraphs.map(item => item.id)
      )
      this.movePos.x += offset.x
      this.movePos.y += offset.y
    }

    let transformRect: TransformRect

    const localPos = applyToPoint(inverse(this.downRect.mt), this.movePos)
    if (this.isSingleSelect) {
      transformRect = resizeRect(this.transformOrigin, localPos, this.downRect, {
        keepRatio: isShiftKeyPressing,
        scaleFromCenter: isAltKeyPressing
      })

      const item = this.wbEditor.selectManager.selectedGraphs[0]
      item.attr({ width: transformRect.width, height: transformRect.height, mt: transformRect.mt })
    } else {
      transformRect = resizeRect(this.transformOrigin, localPos, this.downRect, {
        changeWidthAndHeight: false,
        keepRatio: isShiftKeyPressing,
        scaleFromCenter: isAltKeyPressing
      })

      const prependedTransform = compose(transformRect.mt, inverse(this.downRect.mt))

      this.wbEditor.selectManager.selectedGraphs.forEach(item => {
        const dSnap = this.downSnap[item.id].graphShapeRect
        const newWorldTf = compose(prependedTransform, dSnap.mt)
        const reCalcRect = recomputeTransformRect({ width: dSnap.width, height: dSnap.height, mt: newWorldTf })
        item.attr({ width: reCalcRect.width, height: reCalcRect.height, mt: reCalcRect.mt })
      })
    }

    {
      const rotation = getCursorRotation('resize', this.cursorType, transformRect.mt)
      this.wbEditor.cursorManager.setCursor({ type: 'resize', rotation })
    }

    this.wbEditor.refLine.drawRefLine()
    this.wbEditor.triggerRender()
  }

  onShiftToggle() {
    this.updateSize()
  }

  onAltToggle() {
    this.updateSize()
  }
}
