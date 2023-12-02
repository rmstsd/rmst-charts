import Draggable from 'rmst-render/Draggable'
import { EventParameter, eventList } from '../constant'
import { findHover, initStage, triggerEventHandlers } from './utils'

export class Stage {
  constructor(option: IOption) {
    const { container } = option
    const stage = initStage(container)

    this.canvasElement = stage.canvasElement
    this.ctx = stage.ctx

    this.addStageEventListener()
  }

  isStage = true

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

  prevHovered: IShape

  addStageEventListener() {
    this.canvasElement.onmousemove = evt => {
      const hovered = findHover(this.elements, evt.offsetX, evt.offsetY)

      if (!hovered) {
        if (this.prevHovered) {
          const eventParameter: EventParameter = { target: this.prevHovered, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(this.prevHovered, 'onmouseleave', eventParameter)

          this.prevHovered = undefined

          this.setCursor('default')
        }
        return
      }

      if (hovered && hovered !== this.prevHovered) {
        if (this.prevHovered) {
          const eventParameter: EventParameter = { target: this.prevHovered, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(this.prevHovered, 'onmouseleave', eventParameter)
        }
        this.prevHovered = hovered
        const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
        triggerEventHandlers(hovered, 'onmouseenter', eventParameter)

        if (hovered.data.cursor) {
          this.setCursor(hovered.data.cursor)
        }
      }

      if (hovered) {
        const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
        triggerEventHandlers(hovered, 'onmousemove', eventParameter)
      }
    }

    eventList.forEach(eventName => {
      if (eventName === 'onmousemove') {
        return
      }

      this.canvasElement[eventName] = evt => {
        const hovered = findHover(this.elements, evt.offsetX, evt.offsetY)
        if (hovered) {
          const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(hovered, eventName, eventParameter)
        }
      }
    })

    // 拖拽
    this.canvasElement.addEventListener('mousedown', evt => {
      const hovered = findHover(this.elements, evt.offsetX, evt.offsetY)
      if (hovered) {
        const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
        this.draggingMgr.dragStart(eventParameter)
      }
    })
  }

  draggingMgr = new Draggable()

  setCursor(cursor: ICursor) {
    this.canvasElement.style.setProperty('cursor', cursor)
  }
}

export default Stage
