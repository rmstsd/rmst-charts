import { BoxHidden, Circle, Ellipse, Group, Image, Line, Path, Rect, Text } from './shape'

export type IShape = Group | BoxHidden | Circle | Rect | Line | Text | Ellipse | Path | Image
export type IShapeType =
  | 'Line'
  | 'Rect'
  | 'Ellipse'
  | 'Trapezoid'
  | 'Circle'
  | 'Text'
  | 'Group'
  | 'BoxHidden'
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
