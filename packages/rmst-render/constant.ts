export type EventType = 'mousemove' | 'mousedown' | 'mouseup' | 'click'
export type OnEventType = `on${EventType}`

export type HandlerArgs = { target; x: number; y: number }
export type Handler = (parameter: HandlerArgs) => void

export const eventList: OnEventType[] = ['onmousemove', 'onmousedown', 'onmouseup', 'onclick']

export const dpr = window.devicePixelRatio
