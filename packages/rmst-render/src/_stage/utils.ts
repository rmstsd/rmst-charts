import { ICursor, Stage } from '..'
import { EventParameter, EventType, OnEventType, supportBubblesEventType } from '../constant'
import { IShape } from '../type'
import { isStage } from '../utils'

export function initStage(canvasContainer: HTMLElement, dpr: number) {
  const { clientWidth, clientHeight } = canvasContainer

  const canvasElement = document.createElement('canvas')
  const canvasWidth = clientWidth * dpr
  const canvasHeight = clientHeight * dpr

  canvasElement.width = canvasWidth
  canvasElement.height = canvasHeight
  canvasElement.style.width = '100%'
  canvasElement.style.height = '100%'

  canvasContainer.append(canvasElement)

  const ctx = canvasElement.getContext('2d')
  return { canvasElement, ctx }
}

export function triggerEventHandlers(
  elementItem: IShape | Stage,
  eventName: OnEventType,
  eventParameter: EventParameter
) {
  elementItem[eventName](eventParameter)
  const eventType = eventName.slice(2) as EventType

  const handlers = elementItem.eventTypeHandlerMap.get(eventType)
  if (Array.isArray(handlers)) {
    handlers.forEach(handlerItem => {
      handlerItem(eventParameter)
    })
  }

  const parent = elementItem.parent

  if (parent && !isStage(parent)) {
    if (supportBubblesEventType.includes(eventType)) {
      const _parent = parent as unknown as IShape

      triggerEventHandlers(_parent, eventName, eventParameter)
    }
  }
}

export const findToRoot = (elementItem: IShape) => {
  const stack = [elementItem]
  let parent = elementItem.parent
  while (parent && !isStage(parent)) {
    stack.unshift(parent)
    parent = parent.parent
  }

  return stack
}
export function isPointerEventsNone(elementItem) {
  return elementItem.data.pointerEvents === 'none'
}
export function compareZLevel(possible) {
  const stack = possible.map(item => {
    const arr: IShape[] = []
    let shape = item
    while (shape && !isStage(shape)) {
      arr.unshift(shape)
      shape = shape.parent as IShape
    }
    return arr
  })

  let ans: IShape = null
  let level_index = 0

  while (!ans) {
    const pps = stack.sort((a, b) => {
      const aItem = a.at(level_index)
      const bItem = b.at(level_index)

      return aItem.data.zIndex - bItem.data.zIndex
    })

    const maxZIndexItem = pps.at(-1)[level_index]

    for (let i = 0; i < pps.length; i++) {
      const item = pps[i][level_index]

      if (maxZIndexItem === item) {
        continue
      } else {
        if (item.data.zIndex <= maxZIndexItem.data.zIndex) {
          pps.splice(i, 1)
          i--
        }
      }
    }

    const tempAns = pps
      .map(item => item[level_index])
      .toSorted((a, b) => a.data.zIndex - b.data.zIndex)
      .at(-1)

    if (possible.includes(tempAns)) {
      ans = tempAns
    } else {
      level_index++
    }
  }

  return ans
}

export const setCursor = (stage: Stage, cursor: ICursor) => {
  stage.canvasElement.style.setProperty('cursor', cursor)
}
