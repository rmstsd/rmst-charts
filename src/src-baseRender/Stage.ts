import Circle from './Circle'

type IOption = {
  container: HTMLElement
}

export default class Stage {
  constructor(option: IOption) {
    const { container } = option
    const stage = initStage(container)

    this.canvasElement = stage.canvasElement
    this.ctx = stage.ctx

    this.addStageEventListener()
  }

  canvasElement: HTMLCanvasElement

  ctx: CanvasRenderingContext2D

  elements: Circle[] = []

  append(element) {
    this.elements = this.elements.concat(element)

    this.renderStage()
  }

  renderStage() {
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

    this.canvasElement.onclick = evt => {
      this.elements.forEach(elementItem => {
        elementItem.handleClick(evt.offsetX, evt.offsetY)
      })
    }
  }
}

const dpr = 1.5
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

  return { canvasElement, ctx }
}

function initStage(canvasContainer: HTMLElement) {
  const { offsetWidth, offsetHeight } = canvasContainer
  const { canvasElement, ctx } = createCanvas(offsetWidth, offsetHeight)

  canvasContainer.append(canvasElement)

  return { canvasElement, ctx }
}
