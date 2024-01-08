import { Stage } from 'rmst-render/_stage'
import { BoxHidden } from 'rmst-render/shape/BoxHidden'
import Group from 'rmst-render/shape/Group'
import Line from 'rmst-render/shape/Line'

export function isGroup(shape: IShape): shape is Group {
  return shape.type === 'Group'
}

export function isBoxHidden(shape: IShape): shape is BoxHidden {
  return shape.type === 'BoxHidden'
}

export function isLine(shape: IShape): shape is Line {
  return shape.type === 'Line'
}

export function isStage(shape: IShape): shape is Stage {
  return shape.type === 'Stage'
}
