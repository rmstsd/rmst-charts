import Draggable from 'rmst-render/Draggable'
import { EventParameter, eventList } from '../constant'
import { findHover, initStage, sortByZIndex, triggerEventHandlers } from './utils'

export class Stage {
  constructor(option: IOption) {
    const { container } = option
    const stage = initStage(container)

    this.canvasElement = stage.canvasElement
    this.ctx = stage.ctx

    this.addStageEventListener()
  }

  type: IShapeType = 'Stage'

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  parent: null
  children: IShape[] = []

  get center() {
    return { x: this.canvasElement.offsetWidth / 2, y: this.canvasElement.offsetHeight / 2 }
  }

  get canvasSize() {
    return { width: this.canvasElement.offsetWidth, height: this.canvasElement.offsetHeight }
  }

  removeAllElements() {
    this.children = []

    // this.renderStage()
  }

  append(element: IShape | IShape[]) {
    console.log('append')
    this.children = this.children.concat(element)
    this.children = this.children.map(item => Object.assign(item, { parent: this }))

    const mountStage = (children: IShape[]) => {
      children.forEach(item => {
        item.stage = this

        if (item.children) {
          mountStage(item.children)
        }
      })
    }

    mountStage(this.children)

    this.renderStage()
  }

  isRuning = false

  renderStage() {
    if (this.isRuning) {
      return
    }

    this.isRuning = true

    const refresh = () => {
      sortByZIndex(this)
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height)
      this.children.forEach(elementItem => {
        elementItem.draw(this.ctx)
      })
    }

    requestAnimationFrame(() => {
      refresh()
      this.isRuning = false
    })
  }

  prevHovered: IShape

  addStageEventListener() {
    this.canvasElement.onmousemove = evt => {
      const hovered = findHover(this.children, evt.offsetX, evt.offsetY)

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

        const cursor = hovered.data.cursor || 'auto'
        this.setCursor(cursor)
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
        const hovered = findHover(this.children, evt.offsetX, evt.offsetY)
        if (hovered) {
          const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY }
          triggerEventHandlers(hovered, eventName, eventParameter)
        }
      }
    })

    // 拖拽
    this.canvasElement.addEventListener('mousedown', evt => {
      const hovered = findHover(this.children, evt.offsetX, evt.offsetY)
      if (hovered) {
        const eventParameter: EventParameter = { target: hovered, x: evt.offsetX, y: evt.offsetY, nativeEvent: evt }
        this.draggingMgr.dragStart(eventParameter, this.canvasElement.getBoundingClientRect())
      }
    })
  }

  draggingMgr = new Draggable()

  setCursor(cursor: ICursor) {
    this.canvasElement.style.setProperty('cursor', cursor)
  }
}
