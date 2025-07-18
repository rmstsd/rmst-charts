import { cloneDeep } from 'es-toolkit'
import { applyToPoint, Matrix } from 'transformation-matrix'
import { ToolEnum } from './class/ToolManager/constant'
import { IShape } from 'rmst-render'

export enum Graph_Id {
  graph_root_group = 'graph_root_group',
  graph_ctrl_translate = 'graph_ctrl_translate',
  graph_ctrl_rotate = 'graph_ctrl_rotate',
  graph_ctrl_scale = 'graph_ctrl_scale'
}

export const isCtrlHandleShape = (shape: IShape) => {
  return (
    shape.data.id === Graph_Id.graph_ctrl_translate ||
    shape.data.id === Graph_Id.graph_ctrl_rotate ||
    shape.data.id === Graph_Id.graph_ctrl_scale
  )
}

// 是用户绘制出来的图形
export const isWbGraphShape = (shape: IShape) => {
  return ToolEnum.has(shape.data.extraData?.wbType)
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
