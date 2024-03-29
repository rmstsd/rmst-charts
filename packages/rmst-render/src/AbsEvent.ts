import { Stage } from './_stage'
import { EventType, Handler, Noop } from './constant'
import { BoxHidden } from './shape/BoxHidden'
import { Group } from './shape'

export interface EventOpt {
  onclick?: Handler

  onmouseenter?: Handler
  onmousemove?: Handler
  onmouseleave?: Handler

  onmousedown?: Handler
  onmouseup?: Handler

  ondragstart?: Handler
  ondrag?: Handler
  ondragend?: Handler
}

abstract class AbsEvent {
  onclick: Handler = Noop

  onmouseenter: Handler = Noop
  onmousemove: Handler = Noop
  onmouseleave: Handler = Noop

  onmousedown: Handler = Noop
  onmouseup: Handler = Noop

  ondragstart: Handler = Noop
  ondrag: Handler = Noop
  ondragend: Handler = Noop

  parent: Stage | Group | BoxHidden = null

  data = null
  path2D: Path2D = null

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
