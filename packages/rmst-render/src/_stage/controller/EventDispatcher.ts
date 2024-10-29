import { IShape, Stage } from '../..'
import { EventParameter } from '../../constant'
import { findHover_v2 } from '../findHover'
import { handleHoveredElement, triggerHoveredStackMouseleave } from '../hoveredElementHandler'
import { triggerEventHandlers } from '../utils'

export default class EventDispatcher {
  constructor(private stage: Stage) {}

  private mousedownObject: IShape | null = null
  private mouseupObject: IShape | null = null

  hoveredStack: IShape[] = []

  mousedown(evt, hovered: IShape) {
    const x = evt.offsetX
    const y = evt.offsetY

    const eventParameter: EventParameter = { target: hovered, x, y, nativeEvent: evt }

    if (hovered) {
      this.mousedownObject = hovered
      triggerEventHandlers(hovered, 'onmousedown', eventParameter)
    }
    // 触发舞台(canvas Element)的事件
    triggerEventHandlers(this.stage, 'onmousedown', eventParameter)
  }

  mousemove(evt) {
    const { draggingMgr, camera } = this.stage
    if (draggingMgr.dragging) {
      return
    }
    if (camera.isSpacePressing) {
      return
    }

    const hovered = findHover_v2(this.stage, evt.offsetX, evt.offsetY)
    handleHoveredElement(this.stage, hovered, evt.offsetX, evt.offsetY)

    {
      // 触发舞台(canvas Element)的事件
      const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
      triggerEventHandlers(this.stage, 'onmousemove', eventParameter)
    }
  }

  mouseleave(evt) {
    const { stage } = this
    if (this.hoveredStack.length) {
      triggerHoveredStackMouseleave(this, evt.offsetX, evt.offsetY)
    }

    {
      // 触发舞台(canvas Element)的事件
      const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
      stage.onmouseleave(eventParameter)
    }
  }

  mouseup(evt) {
    const x = evt.offsetX
    const y = evt.offsetY

    const hovered = findHover_v2(this.stage, x, y)
    const eventParameter: EventParameter = { target: hovered, x, y, nativeEvent: evt }

    if (hovered) {
      this.mouseupObject = hovered
      triggerEventHandlers(hovered, 'onmouseup', eventParameter)
    }
    triggerEventHandlers(this.stage, 'onmouseup', eventParameter)

    if (hovered) {
      if (this.mousedownObject === this.mouseupObject) {
        triggerEventHandlers(hovered, 'onclick', eventParameter)
      }
    }

    triggerEventHandlers(this.stage, 'onclick', eventParameter)
  }
}
