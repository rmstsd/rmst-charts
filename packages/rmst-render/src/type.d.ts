import { Matrix } from 'transformation-matrix'
import { Box, Circle, Ellipse, Group, RmstImage, Line, Path, Rect, Text, Star } from './shape'
import type * as CSS from 'csstype'
import Polygon from './shape/Polygon'

export type IShape = Group | Box | Rect | Circle | Line | Text | Ellipse | Path | RmstImage | Star | Polygon
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
  | 'Star'
  | 'Polygon'

export type ICursor = CSS.Property.Cursor

export type ICoord = { x: number; y: number }

export type ITransFormRect = { width: number; height: number; mt: Matrix }

export interface IRect {
  x: number
  y: number
  width: number
  height: number
}
