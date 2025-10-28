import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint, compose, translate } from 'transformation-matrix'
import { cloneDeep, isNotNil, keyBy } from 'es-toolkit'
import { ICoord, mergeBox } from 'rmst-render'
import { translateHorizontalCursor, translateVerticalCursor } from '../../cursorManager/icon'

export default class ToolTranslate implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  private downPos
  private moveCoord

  private downSnap
  private copySnap
  private originSelected
  private clonedList

  private isDragging = false
  private dxThanDy = false

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    const { selectManager, keyboard } = this.wbEditor
    const { isAltKeyPressing } = keyboard

    this.isDragging = true
    this.downPos = sceneCoord

    selectManager.hideCtrlBox()

    this.originSelected = selectManager.selectedGraphs
    this.downSnap = keyBy(
      selectManager.selectedGraphs.map(item => ({ id: item.id, downMt: cloneDeep(item.data.mt) })),
      item => item.id
    )

    this.resetClonedList()

    this.onAltToggle(isAltKeyPressing)
  }

  private resetClonedList() {
    this.clonedList = this.originSelected.map(item => {
      const originMt = this.downSnap[item.id].downMt

      const newItem = item.clone()
      // newItem.attr('fillStyle', randomColor()) // debug
      newItem.attr('mt', originMt)
      return newItem
    })
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.moveCoord = sceneCoord
    this.updatePosition()
  }

  onDragEnd(upEvt: PointerEvent) {
    this.wbEditor.selectManager.showCtrlBox()
    this.wbEditor.refLine.clearRefLine()
  }

  onShiftToggle(isShiftKeyPressing: boolean) {
    this.updatePosition()
  }

  onAltToggle(isAltKeyPressing: boolean) {
    const { selectManager } = this.wbEditor

    this.updateCursor()

    if (!this.isDragging) {
      return
    }

    if (isAltKeyPressing) {
      this.resetClonedList()

      this.wbEditor.graphLayer.append(this.clonedList)

      this.originSelected.forEach(item => {
        item.attr('mt', this.downSnap[item.id].downMt)
      })

      selectManager.batchSelect(this.clonedList.map(item => item.id))
      this.copySnap = keyBy(
        this.wbEditor.selectManager.selectedGraphs.map(item => ({ id: item.id, downMt: cloneDeep(item.data.mt) })),
        item => item.id
      )
    } else {
      this.clonedList?.forEach(item => {
        item.remove()
      })

      selectManager.batchSelect(this.originSelected.map(item => item.id))
    }

    this.updatePosition()
  }

  private updatePosition() {
    if (!this.downPos || !this.moveCoord) {
      return
    }

    const { isShiftKeyPressing, isAltKeyPressing } = this.wbEditor.keyboard

    const snap = isAltKeyPressing ? this.copySnap : this.downSnap

    const moveLocalPos = this.moveCoord
    let dx = moveLocalPos.x - this.downPos.x
    let dy = moveLocalPos.y - this.downPos.y

    if (isShiftKeyPressing) {
      this.dxThanDy = Math.abs(dx) > Math.abs(dy)

      if (this.dxThanDy) {
        dy = 0
      } else {
        dx = 0
      }
    }

    this.updateCursor()

    const tmt = translate(dx, dy)
    const newData = this.wbEditor.selectManager.selectedGraphs.map(item => {
      const dSnap = snap[item.id]

      return { width: item.data.width, height: item.data.height, mt: compose(tmt, dSnap.downMt) }
    })

    let points = []
    if (newData.length === 1) {
      const item = newData[0]
      points = [
        { x: 0, y: 0 },
        { x: item.width, y: 0 },
        { x: item.width, y: item.height },
        { x: 0, y: item.height },
        // Mid
        { x: item.width / 2, y: item.height / 2 }
      ].map(pItem => applyToPoint(item.mt, pItem))
    } else {
      // 多个
      const selRects = newData.map(item => {
        const tl = applyToPoint(item.mt, { x: 0, y: 0 })
        const tr = applyToPoint(item.mt, { x: item.width, y: 0 })
        const br = applyToPoint(item.mt, { x: item.width, y: item.height })
        const bl = applyToPoint(item.mt, { x: 0, y: item.height })
        return { tl, tr, br, bl }
      })

      const { minX, minY, maxX, maxY } = mergeBox(selRects)

      points = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
        // Mid
        { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
      ]
    }

    const offset = this.wbEditor.refLine.getOffset(
      points,
      this.wbEditor.selectManager.selectedGraphs.map(item => item.id)
    )

    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = snap[item.id]

      const tmt = translate(dx, dy)
      const newMt = compose(tmt, dSnap.downMt)

      newMt.e += offset.x
      newMt.f += offset.y

      item.attr('mt', newMt)
    })

    this.wbEditor.refLine.drawRefLine()
    this.wbEditor.triggerRender()
  }

  // 调用该方法的地方略微有点乱
  private updateCursor() {
    const { isShiftKeyPressing, isAltKeyPressing } = this.wbEditor.keyboard

    let cursor
    if (isAltKeyPressing) {
      cursor = { type: 'duplicate' as const }
    } else {
      if (isShiftKeyPressing) {
        if (this.dxThanDy) {
          cursor = translateHorizontalCursor
        } else {
          cursor = translateVerticalCursor
        }
      } else {
        cursor = 'default'
      }
    }

    this.wbEditor.cursorManager.setCursor(cursor)
  }
}
