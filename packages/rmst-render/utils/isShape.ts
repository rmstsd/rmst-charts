import { Stage } from 'rmst-render/_stage'
import { Group, Line, Text, BoxHidden } from 'rmst-render'

import { IShape } from 'rmst-render/type'

export function isGroup(shape: IShape): shape is Group {
  return shape.type === 'Group'
}

export function isBoxHidden(shape: IShape): shape is BoxHidden {
  return shape.type === 'BoxHidden'
}

export function isLine(shape: IShape): shape is Line {
  return shape.type === 'Line'
}

export function isText(shape: IShape): shape is Text {
  return shape.type === 'Text'
}

export function isStage(shape): shape is Stage {
  return shape.type === 'Stage'
}
