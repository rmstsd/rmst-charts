import { getRectByTwoPoint, ICoord, IShape } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from './../type'
import { translate } from 'transformation-matrix'
import { IGraph } from '../../../type'
import { defaultGraphFillColor } from '@/demo/7-whiteboard/color'
import { cloneDeep, noop } from 'es-toolkit'

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

    const { isSpacePressing, isAltPressing, isShiftKeyPressing } = wbEditor.keyboard

    if (isSpacePressing) {
      const dx = movePos.x - this.spacePrevPos.x
      const dy = movePos.y - this.spacePrevPos.y

      downPos.x = this.spaceDownPos.x + dx
      downPos.y = this.spaceDownPos.y + dy
    }

    const rect = { x: downPos.x, y: downPos.y, width: movePos.x - downPos.x, height: movePos.y - downPos.y }

    let cx = 0
    let cy = 0
    if (isAltPressing) {
      rect.width = rect.width * 2
      rect.height = rect.height * 2
      rect.x = rect.x - rect.width / 2
      rect.y = rect.y - rect.height / 2

      cx = rect.x + rect.width / 2
      cy = rect.y + rect.height / 2
    }

    if (isShiftKeyPressing) {
      const maxSize = Math.max(Math.abs(rect.width), Math.abs(rect.height))
      rect.width = (Math.sign(rect.width) || 1) * maxSize
      rect.height = (Math.sign(rect.height) || 1) * maxSize
    }

    if (isAltPressing) {
      rect.x = cx - rect.width / 2
      rect.y = cy - rect.height / 2
    }

    const rectAns = getRectByTwoPoint({ x: rect.x, y: rect.y }, { x: rect.x + rect.width, y: rect.y + rect.height })

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

  protected abstract getShape(): IShape
}
