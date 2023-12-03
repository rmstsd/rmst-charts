import { EventParameter, EventType, OnEventType, dpr } from 'rmst-render/constant'
import Group from './../shape/Group'

function createCanvas(containerWidth: number, containerHeight: number) {
  const canvasElement = document.createElement('canvas')
  const canvasWidth = containerWidth * dpr
  const canvasHeight = containerHeight * dpr

  canvasElement.width = canvasWidth
  canvasElement.height = canvasHeight
  canvasElement.style.width = '100%'
  canvasElement.style.height = '100%'

  const ctx = canvasElement.getContext('2d')

  ctx.scale(dpr, dpr)
  ctx.textBaseline = 'top'
  ctx.font = `${14}px 微软雅黑`

  return { canvasElement, ctx }
}

export function initStage(canvasContainer: HTMLElement) {
  const { offsetWidth, offsetHeight } = canvasContainer
  const { canvasElement, ctx } = createCanvas(offsetWidth, offsetHeight)

  canvasContainer.append(canvasElement)

  return { canvasElement, ctx }
}

export function triggerEventHandlers(elementItem: IShape, eventName: OnEventType, eventParameter: EventParameter) {
  elementItem[eventName](eventParameter)

  const handlers = elementItem.eventTypeHandlerMap.get(eventName.slice(2) as EventType)
  if (Array.isArray(handlers)) {
    handlers.forEach(handlerItem => {
      handlerItem(eventParameter)
    })
  }

  const parent = elementItem.parent
  if (parent && parent.type !== 'Stage') {
    const _parent = parent as unknown as IShape

    triggerEventHandlers(_parent, eventName, { ...eventParameter, target: _parent })
  }
}

export function findHover(children: IShape[], x: number, y: number): IShape {
  const _elements = children.toReversed()

  for (const elementItem of _elements) {
    if (elementItem.type === 'Group' || elementItem.type === 'BoxHidden') {
      if (elementItem.type === 'BoxHidden') {
        if (!elementItem.isInner(x, y)) {
          continue
        }
      }

      const hovered = findHover((elementItem as Group).children, x, y)
      if (hovered) {
        return hovered
      }
    } else {
      const isInner = elementItem.isInner(x, y)
      if (isInner) {
        return elementItem
      }
    }
  }

  return null
}
