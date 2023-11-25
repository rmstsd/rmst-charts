import { EventType, eventList } from '../constant'
import { initStage } from './utils'

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

  findHover(x: number, y: number) {
    const elements = this.elements.toReversed()

    for (const elementItem of elements) {
      const isInner = elementItem.isInner(x, y)
      if (isInner) {
        return elementItem
      }
    }

    return null
  }
  prevHovered: IShape

  addStageEventListener() {
    this.canvasElement.onmousemove = evt => {
      const hovered = this.findHover(evt.offsetX, evt.offsetY)

      if (!hovered) {
        if (this.prevHovered) {
          this.prevHovered.onmouseleave()
          this.prevHovered = undefined

          this.setCursor('default')
        }
        return
      }

      if (hovered && hovered !== this.prevHovered) {
        if (this.prevHovered) {
          this.prevHovered.onmouseleave()
        }
        this.prevHovered = hovered

        hovered.onmouseenter()

        if (hovered.data.cursor) {
          this.setCursor(hovered.data.cursor)
        }
      }

      if (hovered) {
        hovered.onmousemove()
      }
    }

    eventList.forEach(eventName => {
      if (eventName === 'onmousemove') {
        return
      }

      this.canvasElement[eventName] = evt => {
        const elements = this.elements.toReversed()

        for (const elementItem of elements) {
          const isInner = elementItem.isInner(evt.offsetX, evt.offsetY)

          if (isInner) {
            const eventParameter = { target: elementItem, x: evt.offsetX, y: evt.offsetY }

            elementItem[eventName](eventParameter)

            const handlers = elementItem.eventTypeHandlerMap.get(eventName.slice(2) as EventType)
            if (Array.isArray(handlers)) {
              handlers.forEach(handlerItem => {
                handlerItem(eventParameter)
              })
            }
            break
          }
        }
      }
    })
  }

  setCursor(cursor: ICursor) {
    this.canvasElement.style.setProperty('cursor', cursor)
  }
}

export default Stage
