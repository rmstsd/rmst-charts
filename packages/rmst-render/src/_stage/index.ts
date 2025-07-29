import { Draggable, Camera, Ruler, DirtyRect, EventDispatcher } from './controller'
import { mountParentInChildren, mountStageInChildren } from './renderUi'
import { IShape, IShapeType } from '../type'
import { drawStage } from '../renderer/canvas'
import { ResizeMng } from './controller/resizeMng'
import { Group } from '../shape'

interface IOption {
  container?: HTMLElement
  dpr?: number

  enableCamera?: boolean
  enableRuler?: boolean
  enableCursor?: boolean
}

const defaultOption: IOption = {
  enableCamera: true,
  enableRuler: false,
  enableCursor: true
}

export class Stage extends Group {
  constructor(option: IOption) {
    super()

    const mergedOptions = { ...defaultOption, ...option }
    const { container, dpr, enableCamera, enableRuler } = mergedOptions
    this.options = mergedOptions

    this.enableRuler = enableRuler

    this.dpr = dpr ?? window.devicePixelRatio
    this.container = container
    this.initStage()

    this.draggingMgr = new Draggable(this)
    this.camera = new Camera(this, enableCamera)
    this.ruler = new Ruler(this)
    this.eventDispatcher = new EventDispatcher(this)

    this.dirtyRect = new DirtyRect(this)
    this.resizeMng = new ResizeMng(this)

    this.removeStageListener = this.addStageListener()
  }

  options: IOption

  type: IShapeType = 'Stage'

  data = { children: [] }

  camera: Camera
  ruler: Ruler
  draggingMgr: Draggable
  eventDispatcher: EventDispatcher
  resizeMng: ResizeMng

  dirtyRect: DirtyRect

  enableRuler: boolean
  dpr = 1

  container: HTMLElement
  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  parent: null

  private isDispatchedAsyncRenderTask = false
  private removeStageListener: Function

  initStage() {
    this.container.style.position = 'relative'

    const canvasElement = document.createElement('canvas')
    const ctx = canvasElement.getContext('2d')
    this.canvasElement = canvasElement
    this.ctx = ctx

    canvasElement.style.position = 'absolute'
    canvasElement.style.inset = '0'

    this.updateCanvasSize()

    this.container.append(canvasElement)
  }

  updateCanvasSize() {
    this.dpr = window.devicePixelRatio

    const { container, canvasElement } = this

    const canvasWidth = container.clientWidth * this.dpr
    const canvasHeight = container.clientHeight * this.dpr

    canvasElement.width = canvasWidth
    canvasElement.height = canvasHeight
    canvasElement.style.width = `${container.clientWidth}px`
    canvasElement.style.height = `${container.clientHeight}px`
  }

  get center() {
    return { x: this.canvasElement.offsetWidth / 2, y: this.canvasElement.offsetHeight / 2 }
  }

  get canvasSize() {
    return { width: this.canvasElement.clientWidth, height: this.canvasElement.clientHeight }
  }

  public dispose() {
    this.removeStageListener()
    this.canvasElement?.remove()
    this.removeAllChildren()

    this.resizeMng.dispose()
  }

  override removeAllChildren(): void {
    super.removeAllChildren()
    this.render()
  }

  public append(p: IShape[]): void
  public append(p: IShape): void
  public append(...args: IShape[]): void
  public append(...args) {
    const elements = args.flat(1)
    this.data.children = this.data.children.concat(elements)

    mountParentInChildren(this)

    this.data.children = this.data.children.map(item => Object.assign(item, { parent: this }))
    mountStageInChildren(this.data.children, this)

    this.render()

    // this.syncRender()
  }

  // 异步绘制
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

  // 同步绘制
  syncRender() {
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
