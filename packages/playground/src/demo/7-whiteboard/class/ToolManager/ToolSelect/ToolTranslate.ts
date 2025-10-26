import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { compose, translate } from 'transformation-matrix'
import { cloneDeep, isNotNil, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'
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

    const newData = this.wbEditor.selectManager.selectedGraphs.map(item => {
      const dSnap = snap[item.id]

      const tmt = translate(dx, dy)
      return {
        width: item.data.width,
        height: item.data.height,
        mt: compose(tmt, dSnap.downMt)
      }
    })

    const item = newData[0]

    const points = [
      { x: item.mt.e, y: item.mt.f },
      { x: item.mt.e + item.width, y: item.mt.f },
      { x: item.mt.e + item.width, y: item.mt.f + item.height },
      { x: item.mt.e, y: item.mt.f + item.height },
      // Mid
      { x: item.mt.e + item.width / 2, y: item.mt.f + item.height / 2 }
    ]
    const offset = this.wbEditor.refLine.getOffset(
      points,
      this.wbEditor.selectManager.selectedGraphs.map(item => item.id)
    )

    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = snap[item.id]

      const tmt = translate(dx, dy)
      const newMt = compose(tmt, dSnap.downMt)

      if (isNotNil(offset.x)) {
        newMt.e += offset.x
      }

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
