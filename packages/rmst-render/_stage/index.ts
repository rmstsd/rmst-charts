import Draggable from 'rmst-render/Draggable'
import { EventParameter, eventList } from '../constant'
import { initStage, triggerEventHandlers } from './utils'
import { resetSchedulerCount } from './scheduler'
import { findHover } from './findHover'
import { mountStage } from './renderUi'
import { ICursor, IShape, IShapeType } from 'rmst-render/type'
import { drawAllShape } from 'rmst-render/renderer/canvas'

interface IOption {
  container: HTMLElement
}

export class Stage {
  constructor(option: IOption) {
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

  removeAllShape() {
    this.children = []

    this.renderStage()
  }

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

      drawAllShape(this)

      this.isAsyncRenderTask = false
    })
  }

  private prevHovered: IShape

  private addStageEventListener() {
    this.canvasElement.onmousemove = evt => {
      // 此逻辑 可能会影响 拖放功能 的图形拾取; 暂时注释 与 zrender 的 UI 表现一致
      if (this.draggingMgr.dragging) {
        return
      }

      const hovered = findHover(this.ctx, this.children, evt.offsetX, evt.offsetY)

      if (!hovered) {
        if (this.prevHovered) {
          const eventParameter: EventParameter = { target: this.prevHovered, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(this.prevHovered, 'onmouseleave', eventParameter)

          this.prevHovered = undefined

          this.setCursor('default')
        }
        return
      }

      if (hovered && hovered !== this.prevHovered) {
        if (this.prevHovered) {
          const eventParameter: EventParameter = { target: this.prevHovered, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(this.prevHovered, 'onmouseleave', eventParameter)
        }
        this.prevHovered = hovered
        const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
        triggerEventHandlers(hovered, 'onmouseenter', eventParameter)

        const cursor = hovered.data.cursor || 'auto'
        this.setCursor(cursor)
      }

      if (hovered) {
        const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
        triggerEventHandlers(hovered, 'onmousemove', eventParameter)
      }
    }

    eventList.forEach(eventName => {
      if (eventName === 'onmousemove') {
        return
      }

      this.canvasElement[eventName] = evt => {
        const hovered = findHover(this.ctx, this.children, evt.offsetX, evt.offsetY)
        if (hovered) {
          const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(hovered, eventName, eventParameter)
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
}
