import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { compose, translate } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'
import { translateHorizontalCursor, translateVerticalCursor } from '../../cursorManager/icon'
import { randomColor } from '@/utils'

export default class ToolTranslate implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  private downPos
  private moveCoord

  private downSnap
  private copySnap
  private originSelected
  private clonedList

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    const { selectManager, keyboard } = this.wbEditor
    const { isAltKeyPressing } = keyboard

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

    {
      let cursor
      if (isAltKeyPressing) {
        cursor = { type: 'duplicate' as const }
      } else {
        if (isShiftKeyPressing) {
          if (Math.abs(dx) > Math.abs(dy)) {
            cursor = translateHorizontalCursor
            dy = 0
          } else {
            cursor = translateVerticalCursor
            dx = 0
          }
        } else {
          cursor = 'default'
        }
      }
      this.wbEditor.cursorManager.setCursor(cursor)
    }

    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = snap[item.id]

      const tmt = translate(dx, dy)
      item.attr('mt', compose(tmt, dSnap.downMt))
    })

    this.wbEditor.triggerRender()
  }
}
