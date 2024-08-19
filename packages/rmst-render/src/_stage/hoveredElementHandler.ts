import { EventParameter } from '../constant'
import { findToRoot, triggerEventHandlers } from './utils'
import { ICursor, IShape } from '../type'
import { isStage } from '../utils'
import { Stage } from '.'
import EventDispatcher from './controller/EventDispatcher'

export const handleHoveredElement = (stage: Stage, hovered: IShape, x: number, y: number) => {
  const { eventDispatcher } = stage

  if (hovered) {
    setHoveredCursor(stage, hovered)

    const eventParameter: EventParameter = { target: hovered, x, y }
    triggerEventHandlers(hovered, 'onmousemove', eventParameter)

    const stack = findToRoot(hovered)

    for (let i = eventDispatcher.hoveredStack.length - 1; i >= 0; i--) {
      const elementItem = eventDispatcher.hoveredStack[i]

      if (!stack.includes(elementItem)) {
        const eventParameter: EventParameter = { target: elementItem, x, y }
        triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)

        eventDispatcher.hoveredStack.splice(i, 1)
      }
    }

    stack.forEach(elementItem => {
      if (!eventDispatcher.hoveredStack.includes(elementItem)) {
        const eventParameter: EventParameter = { target: elementItem, x, y }
        triggerEventHandlers(elementItem, 'onmouseenter', eventParameter)

        eventDispatcher.hoveredStack.push(elementItem)
      }
    })
  } else {
    setCursor(stage, 'default')

    triggerHoveredStackMouseleave(eventDispatcher, x, y)
  }
}

const setHoveredCursor = (stage: Stage, hovered: IShape) => {
  let hasCursorTarget = hovered
  while (hasCursorTarget && !hasCursorTarget.data.cursor) {
    const parent = hasCursorTarget.parent as unknown as IShape
    if (isStage(parent)) {
      break
    }

    hasCursorTarget = parent
  }
  const cursor = hasCursorTarget.data.cursor || 'auto'
  setCursor(stage, cursor)
}

export const setCursor = (stage: Stage, cursor: ICursor) => {
  stage.canvasElement.style.setProperty('cursor', cursor)
}

export const triggerHoveredStackMouseleave = (eventDispatcher: EventDispatcher, x, y) => {
  eventDispatcher.hoveredStack.toReversed().forEach(elementItem => {
    const eventParameter: EventParameter = { target: elementItem, x, y }
    triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)
  })

  eventDispatcher.hoveredStack = []
}
