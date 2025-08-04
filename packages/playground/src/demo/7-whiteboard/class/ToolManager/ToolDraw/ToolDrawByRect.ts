import { getRectByTwoPoint, ICoord, IShape } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from './../type'
import { translate } from 'transformation-matrix'
import { IGraph } from '../../../type'
import { defaultGraphFillColor } from '@/demo/7-whiteboard/color'
import { cloneDeep, noop } from 'es-toolkit'
import { ass } from '../ass'

export default abstract class ToolDrawByRect implements ITool {
  constructor(protected wbEditor: WhiteboardEditor) {}

  private downPos: ICoord
  private movePos: ICoord

  graphItem = {} as IGraph

  private unbind = noop

  private spaceDownPos
  private spacePrevPos

  onActive() {
    const unbind_1 = this.wbEditor.keyboard.eventEmitter.on('shiftKeyToggle', () => {
      this.updateShape()
    })
    const unbind_2 = this.wbEditor.keyboard.eventEmitter.on('altToggle', () => {
      this.updateShape()
    })

    const unbind_3 = this.wbEditor.keyboard.eventEmitter.on('spaceToggle', () => {
      this.spaceDownPos = cloneDeep(this.downPos)
      this.spacePrevPos = cloneDeep(this.movePos)

      this.updateShape()
    })

    this.unbind = () => {
      unbind_1()
      unbind_2()
      unbind_3()
    }
  }

  onDeActive() {
    this.unbind()
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.downPos = sceneCoord

    this.graphItem = { graphShape: this.getShape() }
    this.wbEditor.graphLayer.append(this.graphItem.graphShape)

    this.wbEditor.selectManager.select(this.graphItem.graphShape.id)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.movePos = sceneCoord

    this.updateShape()
  }

  private updateShape() {
    const { wbEditor, downPos, movePos } = this

    if (!downPos || !movePos) {
      return
    }

    const { isSpaceKeyPressing, isAltKeyPressing, isShiftKeyPressing } = wbEditor.keyboard

    const rectAns = ass(downPos, movePos, {
      isSpaceKeyPressing,
      isAltKeyPressing,
      isShiftKeyPressing,
      spacePrevPos: this.spacePrevPos,
      spaceDownPos: this.spaceDownPos
    })

    this.graphItem.graphShape.attr({
      width: rectAns.width,
      height: rectAns.height,
      mt: translate(rectAns.x, rectAns.y),
      fillStyle: defaultGraphFillColor,
      lineWidth: 1
    })

    wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {}

  onPointerUp(upEvt: PointerEvent, sceneCoord: ICoord) {
    const width = 100
    const height = 100

    this.graphItem.graphShape = this.getShape()
    this.wbEditor.graphLayer.append(this.graphItem.graphShape)

    this.wbEditor.selectManager.select(this.graphItem.graphShape.id)

    this.graphItem.graphShape.attr({
      width,
      height,
      mt: translate(sceneCoord.x - width / 2, sceneCoord.y - height / 2),
      fillStyle: defaultGraphFillColor,
      lineWidth: 1
    })

    this.wbEditor.triggerRender()
  }

  onDrawAfterEnd() {
    this.downPos = null
    this.movePos = null
  }

  protected abstract getShape(): IShape
}
