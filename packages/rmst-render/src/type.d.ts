import { Box, Circle, Ellipse, Group, RmstImage, Line, Path, Rect, Text } from './shape'

export type IShape = Group | Box | Circle | Rect | Line | Text | Ellipse | Path | RmstImage
export type IShapeType =
  | 'Line'
  | 'Rect'
  | 'Ellipse'
  | 'Trapezoid'
  | 'Circle'
  | 'Text'
  | 'Group'
  | 'Box'
  | 'Stage'
  | 'Path'
  | 'Image'

export type ICursor =
  | 'url'
  | 'default'
  | 'auto'
  | 'crosshair'
  | 'pointer'
  | 'move'
  | 'e-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 'n-resize'
  | 'se-resize'
  | 'sw-resize'
  | 's-resize'
  | 'w-resize'
  | 'text'
  | 'wait'
  | 'help'
  | 'grab'
  | 'grabbing'

export type ICoord = { x: number; y: number }

export interface IRect {
  x: number
  y: number
  width: number
  height: number
}
