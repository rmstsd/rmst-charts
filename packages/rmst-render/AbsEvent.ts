import { Group } from 'zrender'
import Stage from './Stage'
import { EventType, Handler, dpr } from './constant'
import Draggable from './Draggable'

abstract class AbsEvent {
  onclick: Handler = () => {}
  onmousemove: Handler = () => {}
  onmouseenter: Handler = () => {}
  onmouseleave: Handler = () => {}
  onmousedown: Handler = () => {}
  onmouseup: Handler = () => {}

  ondrag: Handler = () => {}

  draggingMgr: Draggable

  constructor() {
    this.draggingMgr = new Draggable(this as unknown as IShape)
  }

  parent: Stage | Group = null

  data
  path2D
  isLine?: boolean

  findStage() {
    let stage = this.parent

    while (stage && stage.parent) {
      stage = stage.parent
    }

    return stage as unknown as Stage
  }

  isInner(offsetX: number, offsetY: number) {
    const stage = this.findStage()

    if (!stage) return

    stage.ctx.lineWidth = this.data.lineWidth + 5
    const isInPath = () => {
      return stage.ctx.isPointInPath(this.path2D, offsetX * dpr, offsetY * dpr)
    }
    const isInStroke = () => {
      return stage.ctx.isPointInStroke(this.path2D, offsetX * dpr, offsetY * dpr)
    }

    if (this.isLine && !this.data.closed) {
      return isInStroke()
    }

    return isInPath() || isInStroke()
  }

  eventTypeHandlerMap = new Map<EventType, Handler[]>()
  on(eventType: EventType, handler: Handler) {
    let handlers = this.eventTypeHandlerMap.get(eventType)

    if (!handlers) {
      handlers = []
      this.eventTypeHandlerMap.set(eventType, handlers)
    }

    handlers.push(handler)

    return () => {
      this.off(eventType, handler)
    }
  }

  off(eventType: EventType, handler: Handler) {
    const handlers = this.eventTypeHandlerMap.get(eventType)

    if (!handlers || handlers.length === 0) {
      return
    }

    this.eventTypeHandlerMap.set(
      eventType,
      handlers.filter(item => item !== handler)
    )
  }
}

export default AbsEvent
