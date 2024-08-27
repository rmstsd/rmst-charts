import colorAlpha from 'color-alpha'

import Draggable from './controller/Draggable'
import { initStage } from './utils'
import { mountStage } from './renderUi'
import { IShape, IShapeType } from '../type'
import { drawStage } from '../renderer/canvas'
import Rect from '../shape/Rect'
import { BoundingRect } from '../shape/AbstractUi'
import AbsEvent from '../AbsEvent'
import Camera from './controller/Camera'
import drawRuler from './ruler'
import EventDispatcher from './controller/EventDispatcher'
import { findHover_v2 } from './findHover'

interface IOption {
  container?: HTMLElement
  enableSt?: boolean
  dpr?: number
}

const defaultOption: IOption = { enableSt: true }
export class Stage extends AbsEvent {
  constructor(option: IOption) {
    super()

    const { container, enableSt, dpr } = { ...defaultOption, ...option }

    this.dpr = dpr ?? window.devicePixelRatio

    const stage = initStage(container, this.dpr)

    this.canvasElement = stage.canvasElement
    this.ctx = stage.ctx

    this.ctx.scale(this.dpr, this.dpr)
    this.ctx.textBaseline = 'hanging'
    this.ctx.font = `${14}px 微软雅黑`

    this.draggingMgr = new Draggable(this)
    this.camera = new Camera(this, enableSt)
    this.eventDispatcher = new EventDispatcher(this)

    this.removeStageListener = this.addStageListener()
  }

  camera: Camera
  draggingMgr: Draggable
  eventDispatcher: EventDispatcher

  dpr = 1

  type: IShapeType = 'Stage'

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  parent: null
  children: IShape[] = []

  private isDispatchedAsyncRenderTask = false
  removeStageListener: Function

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
      if (this.camera.enable) {
        drawRuler(this)
      }
      this.isDispatchedAsyncRenderTask = false
    })
  }

  private addStageListener() {
    const { camera, draggingMgr, eventDispatcher } = this

    const canvasMousedown = (evt: MouseEvent) => {
      const hovered = findHover_v2(this, evt.offsetX, evt.offsetY)

      camera.mousedown(evt)
      draggingMgr.mousedown(evt, hovered)
      eventDispatcher.mousedown(evt, hovered)
    }
    const canvasMouseleave = evt => {
      eventDispatcher.mouseleave(evt)
    }

    const canvasWheel = evt => {
      camera.wheel(evt)
    }

    const documentMouseup = evt => {
      camera.mouseup(evt)

      if (evt.target === this.canvasElement) {
        eventDispatcher.mouseup(evt)
      }
    }

    const documentMousemove = evt => {
      camera.mousemove(evt)

      if (evt.target === this.canvasElement) {
        eventDispatcher.mousemove(evt)
      }
    }

    const documentKeydown = evt => {
      camera.keydown(evt)
    }
    const documentKeyup = evt => {
      camera.keyup(evt)
    }

    this.canvasElement.addEventListener('mousedown', canvasMousedown)
    this.canvasElement.addEventListener('mouseleave', canvasMouseleave)
    this.canvasElement.addEventListener('wheel', canvasWheel)

    document.addEventListener('mouseup', documentMouseup)
    document.addEventListener('mousemove', documentMousemove)
    document.addEventListener('keydown', documentKeydown)
    document.addEventListener('keyup', documentKeyup)

    return () => {
      this.canvasElement.removeEventListener('mousedown', canvasMousedown)
      this.canvasElement.removeEventListener('mouseleave', canvasMouseleave)
      this.canvasElement.removeEventListener('wheel', canvasWheel)

      document.removeEventListener('mouseup', documentMouseup)
      document.removeEventListener('mousemove', documentMousemove)
      document.removeEventListener('keydown', documentKeydown)
      document.removeEventListener('keyup', documentKeyup)
    }
  }

  private dirtyRectUi: Rect
  private timer
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
