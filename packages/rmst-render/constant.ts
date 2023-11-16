export type EventType = 'mousemove' | 'mousedown' | 'mouseup' | 'click'
export type OnEventType = `on${EventType}`
export type Handler = () => void

export const eventList: OnEventType[] = ['onmousemove', 'onmousedown', 'onmouseup', 'onclick']

export const absMap = {
  onmousedown: 'handleMouseDown',
  onmouseup: 'handleMouseUp',
  onclick: 'handleClick'
}

export const dpr = window.devicePixelRatio
