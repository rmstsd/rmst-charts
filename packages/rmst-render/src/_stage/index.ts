import colorAlpha from 'color-alpha'

import Draggable from '../Draggable'
import { EventParameter } from '../constant'
import { initStage, triggerEventHandlers } from './utils'
import { mountStage } from './renderUi'
import { IShape, IShapeType } from '../type'
import { drawStage } from '../renderer/canvas'
import Rect from '../shape/Rect'
import { BoundingRect } from '../shape/AbstractUi'
import AbsEvent from '../AbsEvent'
import { handleHoveredElement, triggerStageHoveredStackMouseleave } from './hoveredElementHandler'
import { findHover_v2 } from './findHover'
import Camera from './camera'
import { createLinePath2D } from '../utils'
import drawRuler from './ruler'

interface IOption {
  container?: HTMLElement
  enableSt?: boolean
}

const defaultOption: IOption = { enableSt: true }
export class Stage extends AbsEvent {
  constructor(option: IOption) {
    super()

    const { container, enableSt } = { ...defaultOption, ...option }
    this.enableSt = enableSt

    const stage = initStage(container, this)

    this.canvasElement = stage.canvasElement
    this.ctx = stage.ctx

    this.ctx.scale(this.dpr, this.dpr)
    this.ctx.textBaseline = 'hanging'
    this.ctx.font = `${14}px 微软雅黑`

    this.draggingMgr = new Draggable(this)

    this.addStageHitEventListener()

    this.camera = new Camera(this)

    if (this.enableSt) {
      this.camera.addStageTransformEventListener()
    }
  }

  camera: Camera

  dpr = window.devicePixelRatio

  type: IShapeType = 'Stage'

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  parent: null
  children: IShape[] = []

  draggingMgr: Draggable

  private isDispatchedAsyncRenderTask = false

  hoveredStack: IShape[] = []

  enableSt = true // 开启平移 缩放

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

  renderStage() {
    if (this.isDispatchedAsyncRenderTask) {
      return
    }
    this.isDispatchedAsyncRenderTask = true

    requestAnimationFrame(() => {
      drawStage(this)

      if (this.enableSt) {
        drawRuler(this)
      }

      this.isDispatchedAsyncRenderTask = false
    })
  }

  private addStageHitEventListener() {
    this.canvasElement.addEventListener('mousemove', evt => {
      if (this.draggingMgr.dragging) {
        return
      }

      if (this.camera.isSpaceKeyDown) {
        return
      }

      handleHoveredElement(this, evt.offsetX, evt.offsetY)

      {
        // 触发舞台(canvas Element)的事件
        const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
        triggerEventHandlers(this, 'onmousemove', eventParameter)
      }
    })

    this.canvasElement.addEventListener('mouseleave', evt => {
      if (this.hoveredStack.length) {
        triggerStageHoveredStackMouseleave(this, evt.offsetX, evt.offsetY)
      }

      {
        // 触发舞台(canvas Element)的事件
        const eventParameter: EventParameter = { target: null, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
        this.onmouseleave(eventParameter)
      }
    })

    let mousedownObject = null
    let mouseupObject = null

    this.canvasElement.onclick = evt => {
      const x = evt.offsetX
      const y = evt.offsetY

      const hovered = findHover_v2(this, x, y)
      const eventParameter: EventParameter = { target: hovered, x, y, nativeEvent: evt }

      if (hovered) {
        if (mousedownObject === mouseupObject) {
          triggerEventHandlers(hovered, 'onclick', eventParameter)
        }
      }

      // 触发舞台(canvas Element)的事件
      triggerEventHandlers(this, 'onclick', eventParameter)
    }

    this.canvasElement.onmousedown = evt => {
      const x = evt.offsetX
      const y = evt.offsetY

      const hovered = findHover_v2(this, x, y)
      const eventParameter: EventParameter = { target: hovered, x, y, nativeEvent: evt }

      if (hovered) {
        mousedownObject = hovered
        triggerEventHandlers(hovered, 'onmousedown', eventParameter)
      }
      // 触发舞台(canvas Element)的事件
      triggerEventHandlers(this, 'onmousedown', eventParameter)
    }

    this.canvasElement.onmouseup = evt => {
      const x = evt.offsetX
      const y = evt.offsetY

      const hovered = findHover_v2(this, x, y)
      const eventParameter: EventParameter = { target: hovered, x, y, nativeEvent: evt }

      if (hovered) {
        mouseupObject = hovered
        triggerEventHandlers(hovered, 'onmouseup', eventParameter)
      }
      // 触发舞台(canvas Element)的事件
      triggerEventHandlers(this, 'onmouseup', eventParameter)
    }
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
