import { EventParameter } from '../constant'
import { findToRoot, triggerEventHandlers } from './utils'
import { findHover_v2 } from './findHover'
import { ICursor, IShape } from '../type'

import { isStage } from '../utils'

import { Stage } from '.'

export const handleHoveredElement = (stage: Stage, x: number, y: number) => {
  const hovered = findHover_v2(stage, x, y)

  if (hovered) {
    setHoveredElementCursor(stage, hovered)

    const eventParameter: EventParameter = { target: hovered, x, y }
    triggerEventHandlers(hovered, 'onmousemove', eventParameter)

    const stack = findToRoot(hovered)

    for (let i = stage.hoveredStack.length - 1; i >= 0; i--) {
      const elementItem = stage.hoveredStack[i]

      if (!stack.includes(elementItem)) {
        const eventParameter: EventParameter = { target: elementItem, x, y }
        triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)

        stage.hoveredStack.splice(i, 1)
      }
    }

    stack.forEach(elementItem => {
      if (!stage.hoveredStack.includes(elementItem)) {
        const eventParameter: EventParameter = { target: elementItem, x, y }
        triggerEventHandlers(elementItem, 'onmouseenter', eventParameter)

        stage.hoveredStack.push(elementItem)
      }
    })
  } else {
    setCursor(stage, 'default')

    triggerStageHoveredStackMouseleave(stage, x, y)
  }
}

const setHoveredElementCursor = (stage: Stage, hovered: IShape) => {
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

export const triggerStageHoveredStackMouseleave = (stage: Stage, x, y) => {
  stage.hoveredStack.toReversed().forEach(elementItem => {
    const eventParameter: EventParameter = { target: elementItem, x, y }
    triggerEventHandlers(elementItem, 'onmouseleave', eventParameter)
  })

  stage.hoveredStack = []
}
