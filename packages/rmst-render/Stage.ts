import Circle from './shape/Circle'
import Line from './shape/Line'
import AbstractUi from './shape/AbstractUi'
import Rect from './shape/Rect'

type IGraph = Circle | Rect | AbstractUi | Line

type IOption = {
  container: HTMLElement
}

export type IExtraData = ReturnType<typeof Stage.createExtraData>

export class Stage {
  static stageConstant = { _id: 0, r: 0, g: 0, b: 0 }

  // TODO: rbg不能大于255
  static createExtraData() {
    this.stageConstant.r += 1

    return {
      _id: ++this.stageConstant._id,
      rgb: `rgb(${[this.stageConstant.r, this.stageConstant.g, this.stageConstant.b].toString()})`
    }
  }

  constructor(option: IOption) {
    const { container } = option
    const stage = initStage(container)

    this.canvasElement = stage.canvasElement
    this.ctx = stage.ctx

    this.addStageEventListener()
  }

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  parent: null
  elements: IGraph[] = []

  get center() {
    return { x: this.canvasElement.offsetWidth / 2, y: this.canvasElement.offsetHeight / 2 }
  }

  get canvasSize() {
    return { width: this.canvasElement.offsetWidth, height: this.canvasElement.offsetHeight }
  }

  removeAllElements() {
    this.elements = []

    this.renderStage()
  }

  append(element: IGraph | IGraph[]) {
    this.elements = this.elements.concat(element)
    this.elements = this.elements.map(item => Object.assign(item, { parent: this }))

    this.renderStage()
  }

  renderStage() {
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height)

    this.elements.forEach(elementItem => {
      elementItem.draw(this.ctx)
    })
  }

  addStageEventListener() {
    this.canvasElement.onmousemove = evt => {
      this.elements.forEach(elementItem => {
        elementItem.handleMove(evt.offsetX, evt.offsetY)
      })
    }

    this.canvasElement.onmousedown = evt => {
      for (const elementItem of this.elements.slice(0).reverse()) {
        const isInner = elementItem.handleMouseDown(evt.offsetX, evt.offsetY)

        if (isInner) {
          break
        }
      }
    }

    this.canvasElement.onmouseup = evt => {
      for (const elementItem of this.elements.slice(0).reverse()) {
        const isInner = elementItem.handleMouseUp(evt.offsetX, evt.offsetY)

        if (isInner) {
          break
        }
      }
    }

    this.canvasElement.onclick = evt => {
      for (const elementItem of this.elements.slice(0).reverse()) {
        const isInner = elementItem.handleClick(evt.offsetX, evt.offsetY)

        if (isInner) {
          break
        }
      }
    }
  }

  setCursor(cursor: ICursor) {
    this.canvasElement.style.cursor = cursor
  }
}

type ICursor =
  | 'url'
  | 'default'
  | 'auto'
  | 'crosshair'
  | 'pointer'
  | 'move'
  | 'e-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 'n-resize'
  | 'se-resize'
  | 'sw-resize'
  | 's-resize'
  | 'w-resize'
  | 'text'
  | 'wait'
  | 'help'

export const dpr = window.devicePixelRatio
function createCanvas(containerWidth: number, containerHeight: number) {
  const canvasElement = document.createElement('canvas')
  const canvasWidth = containerWidth * dpr
  const canvasHeight = containerHeight * dpr

  canvasElement.width = canvasWidth
  canvasElement.height = canvasHeight
  canvasElement.style.width = '100%'
  canvasElement.style.height = '100%'

  const ctx = canvasElement.getContext('2d')

  ctx.scale(dpr, dpr)
  ctx.textBaseline = 'top'
  ctx.font = `${14}px 微软雅黑`

  return { canvasElement, ctx }
}

function initStage(canvasContainer: HTMLElement) {
  const { offsetWidth, offsetHeight } = canvasContainer
  const { canvasElement, ctx } = createCanvas(offsetWidth, offsetHeight)

  canvasContainer.append(canvasElement)

  return { canvasElement, ctx }
}

export default Stage
