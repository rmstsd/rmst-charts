import { IShape } from './type'

export type EventType = 'mouseleave' | 'mouseenter' | 'mousemove' | 'mousedown' | 'mouseup' | 'click'
export type OnEventType = `on${EventType}`

export const supportBubblesEventType: EventType[] = ['click']

export type EventParameter = {
  target: IShape
  x: number
  y: number
  dx?: number
  dy?: number
  nativeEvent?: MouseEvent
}
export type Handler = (parameter: EventParameter) => void

export const eventStageList: OnEventType[] = [
  'onmouseleave',
  'onmouseenter',
  'onmousemove',
  'onmousedown',
  'onmouseup',
  'onclick'
]

export const dpr = window.devicePixelRatio

export const Noop = function () {}
