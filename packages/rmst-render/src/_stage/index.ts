import { Draggable, Camera, Ruler, DirtyRect, SelectedMgr, EventDispatcher } from './controller'

import { initStage } from './utils'
import { mountStage } from './renderUi'
import { IShape, IShapeType } from '../type'
import { drawStage } from '../renderer/canvas'
import AbsEvent from '../AbsEvent'

interface IOption {
  container?: HTMLElement
  dpr?: number

  enableCamera?: boolean
  enableRuler?: boolean
}

const defaultOption: IOption = {
  enableCamera: true,
  enableRuler: false
}

export class Stage extends AbsEvent {
  constructor(option: IOption) {
    super()

    const mergedOptions = { ...defaultOption, ...option }
    const { container, dpr, enableCamera, enableRuler } = mergedOptions
    this.enableRuler = enableRuler

    this.dpr = dpr ?? window.devicePixelRatio

    const stage = initStage(container, this.dpr, () => this.syncRender())

    this.canvasElement = stage.canvasElement
    this.ctx = stage.ctx

    this.draggingMgr = new Draggable(this)
    this.camera = new Camera(this, enableCamera)
    this.ruler = new Ruler(this)
    this.eventDispatcher = new EventDispatcher(this)
    this.selectedMgr = new SelectedMgr(this)

    this.dirtyRect = new DirtyRect(this)

    this.removeStageListener = this.addStageListener()
  }

  camera: Camera
  ruler: Ruler
  draggingMgr: Draggable
  eventDispatcher: EventDispatcher
  selectedMgr: SelectedMgr

  dirtyRect: DirtyRect

  enableRuler: boolean

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
    return { width: this.canvasElement.clientWidth, height: this.canvasElement.clientHeight }
  }

  public dispose() {
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

  public removeAllShape() {
    this.dispose()
    this.children = []
    this.render()
  }

  public append(p: IShape[]): void
  public append(p: IShape): void
  public append(...args: IShape[]): void
  public append(...args) {
    const elements = args.flat(1)
    this.children = this.children.concat(elements)
    this.children = this.children.map(item => Object.assign(item, { parent: this }))
    mountStage(this.children, this)
    this.render()
  }

  public render() {
    if (this.isDispatchedAsyncRenderTask) {
      return
    }
    this.isDispatchedAsyncRenderTask = true
    requestAnimationFrame(() => {
      this.syncRender()
      this.isDispatchedAsyncRenderTask = false
    })
  }

  private syncRender() {
    drawStage(this)
    if (this.enableRuler) {
      this.ruler.drawRuler()
    }
  }

  private addStageListener() {
    const { camera, draggingMgr, eventDispatcher } = this

    const canvasMousedown = (evt: MouseEvent) => {
      const hovered = this.eventDispatcher.hovered

      camera.mousedown(evt)
      draggingMgr.mousedown(evt, hovered)
      eventDispatcher.mousedown(evt, hovered)
    }
    const canvasMouseleave = evt => {
      eventDispatcher.mouseleave(evt)
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

    this.canvasElement.addEventListener('mousedown', canvasMousedown)
    this.canvasElement.addEventListener('mouseleave', canvasMouseleave)

    document.addEventListener('mouseup', documentMouseup)
    document.addEventListener('mousemove', documentMousemove)

    return () => {
      this.canvasElement.removeEventListener('mousedown', canvasMousedown)
      this.canvasElement.removeEventListener('mouseleave', canvasMouseleave)

      document.removeEventListener('mouseup', documentMouseup)
      document.removeEventListener('mousemove', documentMousemove)
    }
  }
}
