import { cloneDeep } from 'es-toolkit'
import { applyToPoint, Matrix } from 'transformation-matrix'

export enum Graph_Id {
  graph_root_group = 'graph_root_group',
  graph_ctrl_translate = 'translate',
  graph_ctrl_rotate = 'rotate',
  graph_ctrl_scale = 'scale'
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
