import { IShape, Stage } from '../..'
import { EventParameter } from '../../constant'
import { findHover_v2 } from '../findHover'
import { setCursor, setHoveredCursor, findToRoot, triggerEventHandlers } from '../utils'

export class EventDispatcher {
  constructor(private stage: Stage) {}

  private mousedownObject: IShape | null = null
  private mouseupObject: IShape | null = null

  private hoveredStack: IShape[] = []

  get hovered() {
    return this.hoveredStack.at(-1) || null
  }

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
    this.handleHoveredElement(this.stage, hovered, evt.offsetX, evt.offsetY)

    {
      // 触发舞台(canvas Element)的事件
      const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
      triggerEventHandlers(this.stage, 'onmousemove', eventParameter)
    }
  }

  mouseleave(evt) {
    const { stage } = this
    if (this.hoveredStack.length) {
      this.triggerHoveredStackMouseleave(evt.offsetX, evt.offsetY)
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

  private handleHoveredElement = (stage: Stage, hovered: IShape, x: number, y: number) => {
    const eventDispatcher = this

    if (hovered) {
      setHoveredCursor(stage, hovered)

      const eventParameter: EventParameter = { target: hovered, x, y }
      triggerEventHandlers(hovered, 'onmousemove', eventParameter)

      const stack = findToRoot(hovered)

      for (let i = eventDispatcher.hoveredStack.length - 1; i >= 0; i--) {
        const elementItem = eventDispatcher.hoveredStack[i]

        if (!stack.includes(elementItem)) {
          const eventParameter: EventParameter = { target: elementItem, x, y }
          triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)

          stage.selectedMgr.onElementLeave(elementItem)

          eventDispatcher.hoveredStack.splice(i, 1)
        }
      }

      stack.forEach(elementItem => {
        if (!eventDispatcher.hoveredStack.includes(elementItem)) {
          const eventParameter: EventParameter = { target: elementItem, x, y }
          triggerEventHandlers(elementItem, 'onmouseenter', eventParameter)

          eventDispatcher.hoveredStack.push(elementItem)

          stage.selectedMgr.onElementEnter(elementItem)
        }
      })
    } else {
      setCursor(stage, 'default')

      this.triggerHoveredStackMouseleave(x, y)
    }
  }

  private triggerHoveredStackMouseleave(x, y) {
    this.hoveredStack.toReversed().forEach(elementItem => {
      const eventParameter: EventParameter = { target: elementItem, x, y }
      triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)

      this.stage.selectedMgr.onElementLeave(elementItem)
    })

    this.hoveredStack = []
  }
}
