import { Stage } from '.'
import { Group } from '../shape'

export function mountStageInChildren(children: any[], stage: Stage) {
  children.forEach(item => {
    item.stage = stage

    if (Array.isArray(item.data.children)) {
      // @ts-ignore
      mountStageInChildren(item.data.children, stage)
    }
  })
}

export const mountParentInChildren = (shape: Group) => {
  if (Array.isArray(shape.data.children)) {
    shape.data.children.forEach(item => {
      item.parent = shape

      mountParentInChildren(item as Group)
    })
  }
}
