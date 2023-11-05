import { absMap, eventList } from './constant'

export class Stage {
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
  elements: IShape[] = []

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

  append(element: IShape | IShape[]) {
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

  curShape

  addStageEventListener() {
    eventList.forEach(eventName => {
      this.canvasElement[eventName] = evt => {
        const elements = this.elements.toReversed()

        for (const elementItem of elements) {
          const isInner = elementItem[absMap[eventName]](evt.offsetX, evt.offsetY)

          if (eventName !== 'onmousemove') {
            if (isInner) {
              break
            }
          } else {
            if (isInner) {
              if (!elementItem.isMouseInner) {
                elementItem.isMouseInner = true

                if (this.curShape) {
                  this.curShape.isMouseInner = false
                  this.curShape.onLeave()

                  this.setCursor('auto')
                }
                this.curShape = elementItem
                this.curShape.onEnter()

                elementItem.data.cursor && this.setCursor(elementItem.data.cursor)
              }

              break
            } else {
              if (elementItem.isMouseInner) {
                elementItem.isMouseInner = false

                if (this.curShape) {
                  this.curShape.onLeave()
                  this.setCursor('auto')
                }
                this.curShape = undefined
              }
            }
          }
        }
      }
    })
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
