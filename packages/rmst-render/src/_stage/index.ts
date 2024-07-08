import colorAlpha from 'color-alpha'

import Draggable from '../Draggable'
import { EventParameter, eventStageList, OnEventType } from '../constant'
import { initStage, triggerEventHandlers } from './utils'
import { mountStage } from './renderUi'
import { IShape, IShapeType } from '../type'
import { drawStage } from '../renderer/canvas'
import Rect from '../shape/Rect'
import { BoundingRect } from '../shape/AbstractUi'
import AbsEvent from '../AbsEvent'
import { handleHoveredElement, setCursor, triggerStageHoveredStackMouseleave } from './hoveredElementHandler'
import { findHover_v2 } from './findHover'

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

    if (this.enableSt) {
      this.addStageTransformEventListener()
    }
  }

  dpr = window.devicePixelRatio

  translateX = 0
  translateY = 0
  scale = 1

  type: IShapeType = 'Stage'

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  parent: null
  children: IShape[] = []

  draggingMgr: Draggable

  private isDispatchedAsyncRenderTask = false

  hoveredStack: IShape[] = []

  isMousedown = false
  isSpaceKeyDown = false

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
      this.isDispatchedAsyncRenderTask = false
    })
  }

  private addStageHitEventListener() {
    this.canvasElement.addEventListener('mousemove', evt => {
      if (this.draggingMgr.dragging) {
        return
      }

      if (this.isSpaceKeyDown) {
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

  private addStageTransformEventListener() {
    let prev = { x: 0, y: 0 }
    this.canvasElement.addEventListener('mousedown', evt => {
      prev.x = evt.offsetX
      prev.y = evt.offsetY
      this.isMousedown = true
    })
    document.addEventListener('mouseup', evt => {
      this.isMousedown = false
      if (this.isSpaceKeyDown) {
        setCursor(this, 'grab')
      }
    })

    document.addEventListener('mousemove', evt => {
      if (this.isSpaceKeyDown && this.isMousedown) {
        const dx = evt.offsetX - prev.x
        const dy = evt.offsetY - prev.y

        prev.x = evt.offsetX
        prev.y = evt.offsetY

        this.translateX += dx
        this.translateY += dy
        this.renderStage()
      }
    })

    this.canvasElement.addEventListener('mousedown', evt => {
      if (this.isSpaceKeyDown) {
        setCursor(this, 'grabbing')
      }
    })

    document.addEventListener('keydown', evt => {
      if (evt.code === 'Space') {
        if (this.isMousedown) {
          return
        }
        if (!this.isSpaceKeyDown) {
          this.isSpaceKeyDown = true
          this.draggingMgr.disabledDragElement = true

          setCursor(this, 'grab')
        }
      }
    })
    document.addEventListener('keyup', evt => {
      if (evt.code === 'Space') {
        this.isSpaceKeyDown = false
        this.draggingMgr.disabledDragElement = false
        setCursor(this, 'default')
      }
    })

    this.canvasElement.addEventListener('wheel', evt => {
      evt.preventDefault()

      const prevScale = this.scale
      const { x: canvasCoordX, y: canvasCoordY } = offsetToCanvas(evt.offsetX, evt.offsetY, {
        tx: this.translateX,
        ty: this.translateY,
        scaleX: prevScale,
        scaleY: prevScale
      })

      if (evt.deltaY < 0) {
        this.scale *= 1.1
      } else {
        this.scale *= 0.9
      }

      const dx = -canvasCoordX * (this.scale - prevScale)
      const dy = -canvasCoordY * (this.scale - prevScale)

      this.translateX += dx
      this.translateY += dy

      this.renderStage()
    })
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

type Matrix = { tx: number; ty: number; scaleX: number; scaleY: number }
function offsetToCanvas(ox: number, oy: number, matrix: Matrix) {
  const x = (ox - matrix.tx) / matrix.scaleX
  const y = (oy - matrix.ty) / matrix.scaleY

  return { x, y }
}
