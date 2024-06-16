import colorAlpha from 'color-alpha'

import Draggable from '../Draggable'
import { EventParameter, eventStageList } from '../constant'
import { initStage, triggerEventHandlers } from './utils'
import { mountStage } from './renderUi'
import { IShape, IShapeType } from '../type'
import { drawStage } from '../renderer/canvas'
import Rect from '../shape/Rect'
import { BoundingRect } from '../shape/AbstractUi'
import AbsEvent from '../AbsEvent'
import { handleHoveredElement, setCursor, triggerStageHoveredStackMouseleave } from './hoveredElementHandler'

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

    this.draggingMgr = new Draggable(this)

    this.addStageHitEventListener()
    this.addStageTransformEventListener()
  }

  dpr = window.devicePixelRatio

  translateX = 0
  translateY = 0

  prevTranslateX = 0 // 上一次的偏移量
  prevTranslateY = 0

  mouseDownOffsetX = 0 // 鼠标按下时，鼠标的偏移量
  mouseDownOffsetY = 0

  wheelMouseOffsetX = 0 // 鼠标滚轮滚动时，鼠标的偏移量
  wheelMouseOffsetY = 0

  scale = 1
  preScale = 1
  scaleStep = 0.1
  maxScale = 5
  minScale = 0.2

  defaultTransform: DOMMatrix2DInit

  resetTransform() {
    this.ctx.setTransform(this.defaultTransform)
  }

  type: IShapeType = 'Stage'

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  parent: null
  children: IShape[] = []

  draggingMgr: Draggable

  private isAsyncRenderTask = false

  hoveredStack: IShape[] = []

  isMousedown = false
  isSpaceKeyDown = false

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
    if (this.isAsyncRenderTask) {
      return
    }
    this.isAsyncRenderTask = true

    requestAnimationFrame(() => {
      drawStage(this)
      this.isAsyncRenderTask = false
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
        }
      })
  }

  private addStageTransformEventListener() {
    this.canvasElement.addEventListener('mousedown', evt => {
      this.isMousedown = true
    })
    this.canvasElement.addEventListener('mouseup', evt => {
      this.isMousedown = false
    })

    this.canvasElement.addEventListener('mousemove', evt => {
      if (this.isSpaceKeyDown && this.isMousedown) {
        // 鼠标按下后的移动偏移量 = 当前鼠标的位置 - 鼠标按下的位置
        // 当前拖动偏移量 = 上一次的偏移量 + 鼠标按下后的移动偏移量
        this.translateX = this.prevTranslateX + (evt.clientX - this.mouseDownOffsetX)
        this.translateY = this.prevTranslateY + (evt.clientY - this.mouseDownOffsetY)

        this.renderStage()
      }
    })

    this.canvasElement.addEventListener('mousedown', evt => {
      if (this.isSpaceKeyDown) {
        setCursor(this, 'grabbing')

        // 记录鼠标按下时，鼠标的位置
        this.mouseDownOffsetX = evt.clientX
        this.mouseDownOffsetY = evt.clientY
      }
    })

    this.canvasElement.addEventListener('mouseup', evt => {
      // 记录鼠标抬起时，鼠标的位置
      this.prevTranslateX = this.translateX
      this.prevTranslateY = this.translateY

      if (this.isSpaceKeyDown) {
        setCursor(this, 'grab')
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
        if (this.isMousedown) {
          return
        }
        this.isSpaceKeyDown = false
        this.draggingMgr.disabledDragElement = false
        setCursor(this, 'default')
      }
    })

    this.canvasElement.addEventListener('wheel', event => {
      this.wheelMouseOffsetX = event.offsetX
      this.wheelMouseOffsetY = event.offsetY

      if (event.deltaY < 0) {
        if (this.scale >= this.maxScale) {
          return
        }
        this.scale = parseFloat((this.scale + this.scaleStep).toFixed(2))
      } else {
        if (this.scale <= this.minScale) {
          return
        }
        this.scale = parseFloat((this.scale - this.scaleStep).toFixed(2))
      }

      // 缩放比
      const zoomRatio = this.scale / this.preScale

      // 鼠标当前的位置 - 当前拖动偏移量
      this.translateX = this.wheelMouseOffsetX - (this.wheelMouseOffsetX - this.translateX) * zoomRatio
      this.translateY = this.wheelMouseOffsetY - (this.wheelMouseOffsetY - this.translateY) * zoomRatio

      this.renderStage()

      // 将当前的缩放比例保存为 上一次的缩放比例
      this.preScale = this.scale
      // 记录鼠标滚轮停止时，鼠标的位置
      this.prevTranslateX = this.translateX
      this.prevTranslateY = this.translateY
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
