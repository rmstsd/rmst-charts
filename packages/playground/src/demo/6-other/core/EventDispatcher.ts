/* 事件对象的类型 */
export type CustomEvent = {
  type: string
  target?: any
  [attachment: string]: any
}

/* 事件监听器的类型 */
export type EventListener = (event: CustomEvent) => void

/* 事件调度器 */
export class EventDispatcher {
  // 监听器集合
  _listeners = {}

  /* 监听事件 */
  addEventListener(type: string, listener: EventListener) {
    const listeners = this._listeners
    if (listeners[type] === undefined) {
      listeners[type] = []
    }
    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener)
    }
  }

  /* 判断目标对象的某个状态是否被某个监听器监听 */
  hasEventListener(type: string, listener: EventListener) {
    const listeners = this._listeners
    return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1
  }

  /* 取消事件监听 */
  removeEventListener(type: string, listener: EventListener) {
    const listeners = this._listeners
    const listenerArray = listeners[type]
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener)
      if (index !== -1) {
        listenerArray.splice(index, 1)
      }
    }
  }

  /* 触发事件 */
  dispatchEvent(event: CustomEvent) {
    const listeners = this._listeners
    const listenerArray = listeners[event.type]
    if (listenerArray !== undefined) {
      event.target = this
      // 复制一份侦听器集合，以防在迭代时删除侦听器。
      const array = [...listenerArray]
      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, event)
      }
      event.target = null
    }
  }
}
