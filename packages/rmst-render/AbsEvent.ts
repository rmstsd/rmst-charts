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
  onDragMove: Handler = () => {}

  draggingMgr: Draggable

  constructor() {
    this.draggingMgr = new Draggable(this as unknown as IShape)
  }

  isMouseInner = false // 鼠标是否已经移入某个元素

  mouseDownOffset = { x: 0, y: 0 } // 鼠标按下的时候 鼠标位置相对于 图形的 x, y 的偏移量

  mouseDownOffsetPoints: { x: number; y: number }[] = []

  parent: Stage | Group = null

  data
  path2D
  surroundBoxCoord
  clipWidth
  clipHeight
  isLine

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
    const isInSurroundBox = () => {
      const surroundBoxCoord = this.surroundBoxCoord
        ? this.surroundBoxCoord
        : { lt_x: 0, lt_y: 0, rb_x: 0, rb_y: 0 }

      return (
        offsetX > surroundBoxCoord.lt_x &&
        offsetX < surroundBoxCoord.lt_x + this.clipWidth &&
        offsetY > surroundBoxCoord.lt_y &&
        offsetY < surroundBoxCoord.lt_y + this.clipHeight
      )
    }

    if (this.isLine && !this.data.closed) {
      return isInStroke()
    }

    if (this.data.clip) {
      return isInSurroundBox() && (isInPath() || isInStroke())
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
