import { IRect } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from './../constant'

export default class ToolDrawRhombus extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  override getGraphPathD(rect: IRect) {
    const { width, height } = rect

    const d = drawRhombus(width / 2, height / 2, width, height)

    return { d, name: ToolEnum.label(ToolEnum.Rhombus), wbType: ToolEnum.Rhombus }
  }
}

/**
 * 使用 SVG 的 d 属性绘制菱形
 * @param {number} cx - 菱形中心的 x 坐标
 * @param {number} cy - 菱形中心的 y 坐标
 * @param {number} width - 菱形的宽度（水平方向对角线长度）
 * @param {number} height - 菱形的高度（垂直方向对角线长度）
 * @returns {string} - 菱形的 SVG d 属性路径值
 */
function drawRhombus(cx, cy, width, height) {
  const halfWidth = width / 2
  const halfHeight = height / 2

  // 计算菱形四个顶点的坐标
  const top = [cx, cy - halfHeight]
  const right = [cx + halfWidth, cy]
  const bottom = [cx, cy + halfHeight]
  const left = [cx - halfWidth, cy]

  // 构建路径字符串
  return `M ${top[0]},${top[1]} L ${right[0]},${right[1]} L ${bottom[0]},${bottom[1]} L ${left[0]},${left[1]} Z`
}
