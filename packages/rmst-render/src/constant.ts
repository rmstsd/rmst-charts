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

export enum Pointer_Button {
  Left,
  Middle,
  Right
}
