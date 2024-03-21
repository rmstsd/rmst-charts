import colorAlpha from 'color-alpha'

import Draggable from '../Draggable'
import { EventParameter, Handler, eventStageList } from '../constant'
import { initStage, triggerEventHandlers } from './utils'
import { resetSchedulerCount } from './scheduler'
import { findHover } from './findHover'
import { mountStage } from './renderUi'
import { ICursor, IShape, IShapeType } from '../type'
import { drawStageShapes } from '../renderer/canvas'
import Rect from '../shape/Rect'
import { BoundingRect } from '../shape/AbstractUi'
import { isStage } from '../utils'
import AbsEvent from '../AbsEvent'

interface IOption {
  container: HTMLElement
}

export class Stage extends AbsEvent {
  constructor(option: IOption) {
    super()

    const { container } = option
    const stage = initStage(container)

    this.canvasElement = stage.canvasElement
    this.ctx = stage.ctx

    this.addStageEventListener()
  }

  type: IShapeType = 'Stage'

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  parent: null
  children: IShape[] = []

  get center() {
    return { x: this.canvasElement.offsetWidth / 2, y: this.canvasElement.offsetHeight / 2 }
  }

  get canvasSize() {
    return { width: this.canvasElement.offsetWidth, height: this.canvasElement.offsetHeight }
  }

  dispose() {
    const disposeAll = (children: IShape[]) => {
      children.forEach(item => {
        item.dispose()

        if (Array.isArray(item['children'])) {
          disposeAll(item['children'])
        }
      })
    }

    disposeAll(this.children)
  }

  removeAllShape() {
    this.dispose()

    this.children = []

    this.renderStage()
  }

  append(p: IShape[]): void
  append(p: IShape): void
  append(...args: IShape[]): void
  append(...args) {
    const elements = args.flat(1)

    this.children = this.children.concat(elements)
    this.children = this.children.map(item => Object.assign(item, { parent: this }))

    mountStage(this.children, this)

    this.renderStage()
  }

  private isAsyncRenderTask = false

  // 调度层 - 收集多次任务指令
  renderStage() {
    if (this.isAsyncRenderTask) {
      return
    }

    this.isAsyncRenderTask = true

    requestAnimationFrame(() => {
      resetSchedulerCount()

      drawStageShapes(this)

      this.isAsyncRenderTask = false
    })
  }

  private hoveredStack: IShape[] = []

  private addStageEventListener() {
    this.canvasElement.onmousemove = evt => {
      {
        // 触发舞台(canvas Element)的事件
        const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
        this.onmousemove(eventParameter)
      }

      if (this.draggingMgr.dragging) {
        return
      }

      const hovered = findHover(this.ctx, this.children, evt.offsetX, evt.offsetY)

      if (hovered) {
        {
          let hasCursorTarget = hovered

          while (hasCursorTarget && !hasCursorTarget.data.cursor) {
            const parent = hasCursorTarget.parent as unknown as IShape
            if (isStage(parent)) {
              break
            }

            hasCursorTarget = parent
          }

          const cursor = hasCursorTarget.data.cursor || 'auto'

          this.setCursor(cursor)

          const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(hovered, 'onmousemove', eventParameter)
        }

        if (this.hoveredStack.length === 0) {
          const stack = [hovered]
          let parent = hovered.parent
          while (parent && !isStage(parent)) {
            stack.unshift(parent)
            parent = parent.parent
          }

          stack.forEach(eleItem => {
            const eventParameter: EventParameter = { target: eleItem, x: evt.offsetX, y: evt.offsetY }
            triggerEventHandlers(eleItem, 'onmouseenter', eventParameter)
          })

          this.hoveredStack = stack
        }

        if (!this.hoveredStack.find(item => item === hovered)) {
          const stackTopElement = this.hoveredStack.at(-1)

          // 对于同级元素直接替换掉栈顶元素
          if (hovered.parent !== stackTopElement) {
            this.hoveredStack[this.hoveredStack.length - 1] = hovered

            const eventParameter: EventParameter = { target: stackTopElement, x: evt.offsetX, y: evt.offsetY }
            triggerEventHandlers(stackTopElement, 'onmouseleave', eventParameter)
          } else {
            this.hoveredStack.push(hovered)
          }

          const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(hovered, 'onmouseenter', eventParameter)
        }

        if (this.hoveredStack.at(-1) !== hovered) {
          const elementItem = this.hoveredStack.pop()
          const eventParameter: EventParameter = { target: elementItem, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)
        }
      } else {
        this.setCursor('default')

        if (this.hoveredStack.length) {
          const elementItem = this.hoveredStack.pop()
          const eventParameter: EventParameter = { target: elementItem, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)
        }
      }
    }

    this.canvasElement.onmouseleave = evt => {
      if (this.hoveredStack.length) {
        this.hoveredStack.toReversed().forEach(eleItem => {
          const eventParameter: EventParameter = { target: eleItem, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(eleItem, 'onmouseleave', eventParameter)
        })

        this.hoveredStack = []
      }

      {
        // 触发舞台(canvas Element)的事件
        const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
        this.onmouseleave(eventParameter)
      }
    }

    eventStageList
      .filter(n => !['onmousemove', 'onmouseleave'].includes(n))
      .forEach(eventName => {
        this.canvasElement[eventName] = evt => {
          {
            // 触发舞台(canvas Element)的事件
            const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
            this[eventName](eventParameter)
          }
        }
      })

    // 拖拽
    this.canvasElement.addEventListener('mousedown', evt => {
      const hovered = findHover(this.ctx, this.children, evt.offsetX, evt.offsetY)
      if (hovered) {
        const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
        this.draggingMgr.dragStart(eventParameter, this.canvasElement.getBoundingClientRect())
      }
    })
  }

  draggingMgr = new Draggable()

  setCursor(cursor: ICursor) {
    this.canvasElement.style.setProperty('cursor', cursor)
  }

  dirtyRectUi: Rect
  timer
  renderDirtyRectUi(sb: BoundingRect) {
    if (!this.dirtyRectUi) {
      this.dirtyRectUi = new Rect({
        ...sb,
        fillStyle: colorAlpha('red', 0.2),
        strokeStyle: 'red',
        opacity: 0,
        pointerEvents: 'none'
      })
      this.append(this.dirtyRectUi)
    }

    clearTimeout(this.timer)

    this.dirtyRectUi.attr(sb)
    this.dirtyRectUi.animateCartoon({ opacity: 1 }, { duration: 300 })

    this.timer = setTimeout(() => {
      this.dirtyRectUi.animateCartoon({ opacity: 0 }, { duration: 300 })
    }, 800)
  }
}
