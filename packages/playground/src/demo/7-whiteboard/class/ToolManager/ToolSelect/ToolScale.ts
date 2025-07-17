import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint, compose, identity, inverse, scale, translate } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'
import { TransformOrigin } from '../constant'
import { getCursorRotation } from '../../cursorManager'
import { resizeStrategy, ResizeStrategyOp } from './resizeStrategy'
import { recomputeTransformRect } from '@/demo/6-other/mtDe/Xg_multi/util'

export default class ToolScale implements ITool {
  constructor(private wbEditor: WhiteboardEditor, private transformOrigin: TransformOrigin, private cursorType) {
    console.log(transformOrigin)

    if (!transformOrigin) {
      throw new Error('transformOrigin is required')
    }
  }

  origin: ICoord
  startRad: number
  downSnap

  isSingleSelect = false
  downRect

  strategy: ResizeStrategyOp

  onDragStart(downEvt: PointerEvent) {
    console.log('ToolScale onDragStart')

    const { downRect } = this.wbEditor.selectManager.transformDownRect

    this.downRect = downRect
    this.isSingleSelect = this.wbEditor.selectManager.selectedIds.length === 1

    this.strategy = resizeStrategy[this.transformOrigin]
    this.origin = this.strategy.getOrigin(downRect)

    const sel = this.wbEditor.selectManager.selectedGraphs.map(item => ({
      id: item.id,
      graphShapeRect: {
        width: item.graphShape.data.width,
        height: item.graphShape.data.height,
        mt: cloneDeep(item.graphShape.data.mt)
      }
    }))

    this.downSnap = keyBy(sel, item => item.id)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    // console.log('ToolScale onDragMove')

    const movePos = applyToPoint(inverse(this.downRect.mt), sceneCoord)
    const newSize = this.strategy.getNewSize(this.origin, movePos, this.downRect)

    if (this.isSingleSelect) {
      const scaleX = Math.sign(newSize.width) || 1 // 如果是 0 取 1
      const scaleY = Math.sign(newSize.height) || 1
      const scaleMt = scale(scaleX, scaleY)
      newSize.width = Math.abs(newSize.width)
      newSize.height = Math.abs(newSize.height)

      const item = this.wbEditor.selectManager.selectedGraphs[0]
      const dSnap = this.downSnap[item.id].graphShapeRect

      const newMt = compose(dSnap.mt, scaleMt)

      const oldGlobalPos = applyToPoint(this.downRect.mt, this.origin)
      const newOrigin = this.strategy.getOrigin(newSize)
      const newGlobalPos = applyToPoint(newMt, newOrigin)

      const diffPos = { x: newGlobalPos.x - oldGlobalPos.x, y: newGlobalPos.y - oldGlobalPos.y }
      const fixPos = translate(-diffPos.x, -diffPos.y)

      item.graphShape.attr({ width: newSize.width, height: newSize.height, mt: compose(fixPos, newMt) })

      {
        const rotation = getCursorRotation('resize', this.cursorType, newMt)
        this.wbEditor.cursorManager.setCursor({ type: 'resize', rotation })
      }
    } else {
      const sx = newSize.width / this.downRect.width
      const sy = newSize.height / this.downRect.height

      const scaleTransform = scale(sx, sy)

      const transformRect = { mt: compose(this.downRect.mt, scaleTransform) }

      const oldGlobalPos = applyToPoint(this.downRect.mt, this.origin)
      const newOrigin = this.strategy.getOrigin(this.downRect) // 缩放多个时, 改变的是矩阵, 缩放中心要基于原 rect 的宽高来求
      const newGlobalPos = applyToPoint(transformRect.mt, newOrigin)
      const diffPos = { x: newGlobalPos.x - oldGlobalPos.x, y: newGlobalPos.y - oldGlobalPos.y }
      const fixPos = translate(-diffPos.x, -diffPos.y)
      transformRect.mt = compose(fixPos, transformRect.mt)

      const prependedTransform = compose(transformRect.mt, inverse(this.downRect.mt))

      this.wbEditor.selectManager.selectedGraphs.forEach(item => {
        const dSnap = this.downSnap[item.id].graphShapeRect
        const newWorldTf = compose(prependedTransform, dSnap.mt)
        const reCalcRect = recomputeTransformRect({ width: dSnap.width, height: dSnap.height, mt: newWorldTf })
        item.graphShape.attr({ width: reCalcRect.width, height: reCalcRect.height, mt: reCalcRect.mt })
      })

      {
        const rotation = getCursorRotation('resize', this.cursorType, transformRect.mt)
        this.wbEditor.cursorManager.setCursor({ type: 'resize', rotation })
      }
    }

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolScale onDragEnd')
  }
}
