import { Group, Line, Text, BoxHidden } from './../shape'

import { Stage } from '../_stage'

export function isGroup(shape): shape is Group {
  return shape.type === 'Group'
}

export function isBoxHidden(shape): shape is BoxHidden {
  return shape.type === 'BoxHidden'
}

export function isLine(shape): shape is Line {
  return shape.type === 'Line'
}

export function isText(shape): shape is Text {
  return shape.type === 'Text'
}

export function isStage(shape): shape is Stage {
  return shape.type === 'Stage'
}
