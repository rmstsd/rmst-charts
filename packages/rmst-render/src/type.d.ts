import { Box, Circle, Ellipse, Group, RmstImage, Line, Path, Rect, Text } from './shape'
import type * as CSS from 'csstype'

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

export type ICursor = CSS.Property.Cursor

export type ICoord = { x: number; y: number }

export interface IRect {
  x: number
  y: number
  width: number
  height: number
}
