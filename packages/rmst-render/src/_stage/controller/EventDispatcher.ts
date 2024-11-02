import { IShape, isStage, Stage } from '../..'
import { EventParameter } from '../../constant'
import { findHover_v2 } from '../findHover'
import { setCursor, findToRoot, triggerEventHandlers } from '../utils'

// 事件分发器 包含父子关系的事件分发
export class EventDispatcher {
  constructor(private stage: Stage) {}

  private mousedownObject: IShape | null = null

  private hoveredStack: IShape[] = []

  public hovered: IShape = null

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

    this.hovered = findHover_v2(this.stage, evt.offsetX, evt.offsetY)

    if (draggingMgr.dragging) {
      return
    }

    if (camera.isSpacePressing || camera.isDragging) {
      return
    }

    this.stage.selectedMgr.onHoveredChange(this.hovered)

    this.handleHoveredStack(evt.offsetX, evt.offsetY)

    {
      // 触发舞台(canvas Element)的事件
      const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
      triggerEventHandlers(this.stage, 'onmousemove', eventParameter)
    }
  }

  mouseleave(evt) {
    const { stage } = this

    this.hovered = null
    this.stage.selectedMgr.onHoveredChange(this.hovered)

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

    const mouseupHovered = findHover_v2(this.stage, x, y)
    const eventParameter: EventParameter = { target: mouseupHovered, x, y, nativeEvent: evt }

    if (mouseupHovered) {
      triggerEventHandlers(mouseupHovered, 'onmouseup', eventParameter)
    }
    triggerEventHandlers(this.stage, 'onmouseup', eventParameter)

    if (mouseupHovered && this.mousedownObject === mouseupHovered) {
      triggerEventHandlers(mouseupHovered, 'onclick', eventParameter)
    }
    triggerEventHandlers(this.stage, 'onclick', eventParameter)
  }

  private handleHoveredStack(x: number, y: number) {
    const { hovered } = this

    this.setHoveredCursor()

    if (hovered) {
      const eventParameter: EventParameter = { target: hovered, x, y }
      triggerEventHandlers(hovered, 'onmousemove', eventParameter)

      const stack = findToRoot(hovered)

      for (let i = this.hoveredStack.length - 1; i >= 0; i--) {
        const elementItem = this.hoveredStack[i]

        if (!stack.includes(elementItem)) {
          const eventParameter: EventParameter = { target: elementItem, x, y }
          triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)

          this.hoveredStack.splice(i, 1)
        }
      }

      stack.forEach(elementItem => {
        if (!this.hoveredStack.includes(elementItem)) {
          const eventParameter: EventParameter = { target: elementItem, x, y }
          triggerEventHandlers(elementItem, 'onmouseenter', eventParameter)

          this.hoveredStack.push(elementItem)
        }
      })
    } else {
      this.triggerHoveredStackMouseleave(x, y)
    }
  }

  setHoveredCursor() {
    const { stage, hovered } = this

    if (!hovered) {
      setCursor(stage, 'default')
      return
    }

    let hasCursorTarget = hovered
    while (hasCursorTarget && !hasCursorTarget.data.cursor) {
      const parent = hasCursorTarget.parent as unknown as IShape
      if (isStage(parent)) {
        break
      }

      hasCursorTarget = parent
    }
    const cursor = hasCursorTarget.data.cursor || 'auto'
    setCursor(stage, cursor)
  }

  private triggerHoveredStackMouseleave(x, y) {
    this.hoveredStack.toReversed().forEach(elementItem => {
      const eventParameter: EventParameter = { target: elementItem, x, y }
      triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)
    })

    this.hoveredStack = []
  }
}
