import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { compose, translate } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'

export default class ToolTranslate implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  private downPos
  private downSnap

  private moveCoord

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    console.log('ToolTranslate onDragStart')

    const { selectManager, keyboard } = this.wbEditor
    const { isAltKeyPressing } = keyboard

    this.wbEditor.selectManager.hideCtrlBox()

    this.downPos = sceneCoord

    if (isAltKeyPressing) {
      const clonedList = this.wbEditor.selectManager.selectedGraphs.map(item => item.clone())
      this.wbEditor.graphLayer.append(clonedList)
      selectManager.batchSelect(clonedList.map(item => item.id))
    }

    this.downSnap = keyBy(
      this.wbEditor.selectManager.selectedGraphs.map(item => ({
        id: item.id,
        downMt: cloneDeep(item.data.mt)
      })),
      item => item.id
    )
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.moveCoord = sceneCoord
    this.updatePosition()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolTranslate onDragEnd')

    this.wbEditor.selectManager.showCtrlBox()
  }

  onShiftToggle(isShiftKeyPressing: boolean) {
    this.updatePosition()
  }

  private updatePosition() {
    if (!this.downPos || !this.moveCoord) {
      return
    }

    const { isShiftKeyPressing } = this.wbEditor.keyboard

    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = this.downSnap[item.id]
      const moveLocalPos = this.moveCoord

      let dx = moveLocalPos.x - this.downPos.x
      let dy = moveLocalPos.y - this.downPos.y

      if (isShiftKeyPressing) {
        if (Math.abs(dx) > Math.abs(dy)) {
          dy = 0
        } else {
          dx = 0
        }
      }

      const tmt = translate(dx, dy)

      item.attr('mt', compose(tmt, dSnap.downMt))
    })

    this.wbEditor.triggerRender()
  }
}
