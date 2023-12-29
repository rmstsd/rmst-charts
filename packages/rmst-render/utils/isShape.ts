import { Stage } from 'rmst-render/stage'
import Group from 'rmst-render/shape/Group'
import Line from 'rmst-render/shape/Line'

export function isGroup(shape: IShape): shape is Group {
  return shape.type === 'Group'
}

export function isLine(shape: IShape): shape is Line {
  return shape.type === 'Line'
}

export function isStage(shape): shape is Stage {
  return shape.type === 'Stage'
}
