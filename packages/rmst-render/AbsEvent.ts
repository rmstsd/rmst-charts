import { Group } from 'zrender'
import { Stage } from './Stage'
import { EventType, Handler, dpr } from './constant'
import { isLine } from './utils'

abstract class AbsEvent {
  onclick: Handler = () => {}

  onmouseenter: Handler = () => {}
  onmousemove: Handler = () => {}
  onmouseleave: Handler = () => {}

  onmousedown: Handler = () => {}
  onmouseup: Handler = () => {}

  ondragstart: Handler = () => {}
  ondrag: Handler = () => {}
  ondragend: Handler = () => {}

  parent: Stage | Group = null

  data
  path2D

  isInner(offsetX: number, offsetY: number) {
    const stage = this.stage

    if (!stage) {
      return
    }

    stage.ctx.lineWidth = this.data.lineWidth + 5
    const x = offsetX * dpr
    const y = offsetY * dpr

    const isInPath = () => {
      return stage.ctx.isPointInPath(this.path2D, x, y)
    }
    const isInStroke = () => {
      return stage.ctx.isPointInStroke(this.path2D, x, y)
    }

    if (isLine(this as unknown as IShape) && !this.data.closed) {
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
