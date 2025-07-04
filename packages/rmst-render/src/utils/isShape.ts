import { Group, Line, Text, Box } from './../shape'

import { Stage } from '../_stage'

export function isGroup(shape): shape is Group {
  return shape.type === 'Group'
}

export function isBox(shape): shape is Box {
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
