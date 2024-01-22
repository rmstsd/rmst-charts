import { Stage } from './_stage'
import { EventType, Handler } from './constant'
import { BoxHidden } from './shape/BoxHidden'
import { Group } from './shape'

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

  parent: Stage | Group | BoxHidden = null

  data
  path2D

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
