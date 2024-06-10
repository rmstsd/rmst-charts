import colorAlpha from 'color-alpha'

import Draggable from '../Draggable'
import { EventParameter, eventStageList } from '../constant'
import { findToRoot, initStage, triggerEventHandlers } from './utils'
import { resetSchedulerCount } from './scheduler'
import { findHover_v2 } from './findHover'
import { mountStage } from './renderUi'
import { ICursor, IShape, IShapeType } from '../type'
import { drawStage } from '../renderer/canvas'
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
    const stage = initStage(container, this)

    this.canvasElement = stage.canvasElement
    this.ctx = stage.ctx

    this.ctx.scale(this.dpr, this.dpr)
    this.ctx.textBaseline = 'hanging'
    this.ctx.font = `${14}px 微软雅黑`

    this.defaultTransform = this.ctx.getTransform()

    this.addStageEventListener()
  }

  dpr = 1.8 // window.devicePixelRatio

  mouseDownOffsetX = 0 // 鼠标按下时，鼠标的偏移量
  mouseDownOffsetY = 0
  offsetX = 0 // 当前拖动偏移量
  offsetY = 0
  preOffsetX = 0 // 上一次的偏移量
  preOffsetY = 0
  mouseOffsetX = 0 // 鼠标滚轮滚动时，鼠标的偏移量
  mouseOffsetY = 0

  scale = 1
  preScale = 1 // 上一次的缩放比例
  scaleStep = 0.1 // 每次缩放的间隔
  maxScale = 5 // 最大缩放比例
  minScale = 0.2 // 最小缩放比例

  defaultTransform: DOMMatrix2DInit

  resetTransform() {
    this.ctx.setTransform(this.defaultTransform)
  }

  type: IShapeType = 'Stage'

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  parent: null
  children: IShape[] = []

  draggingMgr = new Draggable()

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

      drawStage(this)

      this.isAsyncRenderTask = false
    })
  }

  private hoveredStack: IShape[] = []

  private addStageEventListener() {
    this.canvasElement.onmousemove = evt => {
      {
        // 触发舞台(canvas Element)的事件
        const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
        triggerEventHandlers(this, 'onmousemove', eventParameter)
      }

      if (this.draggingMgr.dragging) {
        return
      }

      this.handleHoveredElement(evt.offsetX, evt.offsetY)
    }

    this.canvasElement.onmouseleave = evt => {
      if (this.hoveredStack.length) {
        this.hoveredStack.toReversed().forEach(elementItem => {
          const eventParameter: EventParameter = { target: elementItem, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)
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
          const x = evt.offsetX
          const y = evt.offsetY
          {
            // 触发舞台(canvas Element)的事件
            const eventParameter: EventParameter = { target: null, x, y, nativeEvent: evt }
            triggerEventHandlers(this, eventName, eventParameter)
          }

          const hovered = findHover_v2(this, x, y)
          if (hovered) {
            const eventParameter: EventParameter = { target: hovered, x, y, nativeEvent: evt }
            triggerEventHandlers(hovered, eventName, eventParameter)
          }
        }
      })

    // 拖拽
    this.canvasElement.addEventListener('mousedown', evt => {
      const x = evt.offsetX
      const y = evt.offsetY
      const hovered = findHover_v2(this, x, y)

      if (hovered) {
        const eventParameter: EventParameter = { target: hovered, x, y, nativeEvent: evt }
        this.draggingMgr.dragStart(eventParameter, this)
      }
    })

    this.canvasElement.onwheel = event => {
      this.mouseOffsetX = event.offsetX
      this.mouseOffsetY = event.offsetY

      if (event.deltaY < 0) {
        if (this.scale >= this.maxScale) {
          return
        }
        this.scale = parseFloat((this.scale + this.scaleStep).toFixed(2))
      } else {
        // 画布缩小
        if (this.scale <= this.minScale) {
          return
        }
        this.scale = parseFloat((this.scale - this.scaleStep).toFixed(2))
      }

      // 缩放比
      const zoomRatio = this.scale / this.preScale

      // 鼠标当前的位置 - 当前拖动偏移量
      this.offsetX = this.mouseOffsetX - (this.mouseOffsetX - this.offsetX) * zoomRatio
      this.offsetY = this.mouseOffsetY - (this.mouseOffsetY - this.offsetY) * zoomRatio

      drawStage(this)

      // 将当前的缩放比例保存为 上一次的缩放比例
      this.preScale = this.scale
      // 记录鼠标滚轮停止时，鼠标的位置
      this.preOffsetX = this.offsetX
      this.preOffsetY = this.offsetY
    }
  }

  private handleHoveredElement(x: number, y: number) {
    const hovered = findHover_v2(this, x, y)

    if (hovered) {
      this.setHoveredElementCursor(hovered)

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

      stack.forEach(item => {
        if (!this.hoveredStack.includes(item)) {
          const eventParameter: EventParameter = { target: item, x, y }
          triggerEventHandlers(item, 'onmouseenter', eventParameter)

          this.hoveredStack.push(item)
        }
      })
    } else {
      this.setCursor('default')

      this.hoveredStack.toReversed().forEach(elementItem => {
        const eventParameter: EventParameter = { target: elementItem, x, y }
        triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)
      })

      this.hoveredStack = []
    }
  }

  private setHoveredElementCursor(hovered: IShape) {
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
  }

  private setCursor(cursor: ICursor) {
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
