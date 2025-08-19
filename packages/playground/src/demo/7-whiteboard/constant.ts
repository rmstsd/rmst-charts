import { cloneDeep } from 'es-toolkit'
import { applyToPoint, Matrix } from 'transformation-matrix'
import { ToolEnum } from './class/ToolManager/constant'
import { IShape } from 'rmst-render'

export enum Graph_Id {
  graph_root_group = 'graph_root_group',
  graph_ctrl_translate = 'graph_ctrl_translate',
  graph_ctrl_rotate = 'graph_ctrl_rotate',
  graph_ctrl_scale = 'graph_ctrl_scale',

  ruler_zone_horizontal = 'ruler_zone_horizontal',
  ruler_zone_vertical = 'ruler_zone_vertical',
  ruler_zone_both = 'ruler_zone_both'
}

export enum Ruler_Direction {
  ruler_line_horizontal = 'ruler_line_horizontal',
  ruler_line_vertical = 'ruler_line_vertical'
}

export const rulerZoneIds: string[] = [Graph_Id.ruler_zone_horizontal, Graph_Id.ruler_zone_vertical, Graph_Id.ruler_zone_both]

export const isCtrlHandleShape = (shape: IShape) => {
  return (
    shape.data.id === Graph_Id.graph_ctrl_translate ||
    shape.data.id === Graph_Id.graph_ctrl_rotate ||
    shape.data.id === Graph_Id.graph_ctrl_scale
  )
}

// 是用户绘制出来的图形
export const isWbGraphShape = (shape: IShape) => {
  if (!shape) {
    return false
  }

  return ToolEnum.has(shape.data.extraData?.wbType)
}

// 是拖拽出来的 红色标尺
export const isRulerLineHorizontal = (shape: IShape) => {
  const type = shape?.data.extraData?.type

  return type === Ruler_Direction.ruler_line_horizontal
}

// 是拖拽出来的 红色标尺
export const isRulerLineVertical = (shape: IShape) => {
  const type = shape?.data.extraData?.type

  return type === Ruler_Direction.ruler_line_vertical
}

export const calcRotateRad = (mt: Matrix) => {
  const p = { x: 1, y: 0 }
  const cmt = cloneDeep(mt)
  cmt.e = 0
  cmt.f = 0
  const tp = applyToPoint(cmt, p)
  const rad = Math.atan2(tp.y, tp.x)

  return rad
}

export function isFlipped(matrix: Matrix) {
  // 提取变换矩阵的相关值
  const a = matrix.a
  const b = matrix.b
  const c = matrix.c
  const d = matrix.d

  // 计算行列式
  const determinant = a * d - b * c

  // 如果行列式为负，则图形被翻转
  return determinant < 0
}

//  0 到 360 度之间
export function normalizeAngle(degrees) {
  degrees = degrees % 360
  if (degrees < 0) degrees += 360

  return degrees
}

// 计算 x 方向的缩放因子
export const getScaleFromMatrix_x = (m: Matrix) => {
  const { a, b } = m
  return Math.sqrt(a * a + b * b)
}

// 计算 y 方向的缩放因子
export const getScaleFromMatrix_y = (m: Matrix) => {
  const { c, d } = m
  return Math.sqrt(c * c + d * d)
}
