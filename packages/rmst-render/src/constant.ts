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

export const Noop = function () {}

export const matrixMap = {
  水平缩放: 'a',
  垂直倾斜: 'b',
  水平倾斜: 'c',
  垂直缩放: 'd',
  水平移动: 'e',
  垂直移动: 'f'
}
