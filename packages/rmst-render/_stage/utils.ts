import { EventParameter, EventType, OnEventType, dpr } from 'rmst-render/constant'
import Group from '../shape/Group'
import { Stage } from '.'

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
        } else {
          return elementItem // 解决后代 dataZoom 的 enter 事件bug (需重新思考)
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

export function sortByZIndex(root: Stage) {
  if (root.children) {
    root.children = root.children.toSorted((a, b) => {
      const a_zIndex = a.data.zIndex ?? 0
      const b_zIndex = b.data.zIndex ?? 0

      return a_zIndex - b_zIndex
    })

    for (const item of root.children) {
      sortByZIndex(item)
    }
  }
}

export function refreshStage(stage: Stage) {
  sortByZIndex(stage)

  stage.ctx.clearRect(0, 0, stage.canvasElement.width, stage.canvasElement.height)

  stage.children.forEach(elementItem => {
    elementItem.draw(stage.ctx)
  })
}

export function mountStage(children: IShape[], stage: Stage) {
  children.forEach(item => {
    item.stage = stage

    if (item.children) {
      mountStage(item.children, stage)
    }
  })
}
