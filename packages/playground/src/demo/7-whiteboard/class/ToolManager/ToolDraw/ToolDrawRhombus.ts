import { IRect, Path } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from './../constant'

// 菱形
export default class ToolDrawRhombus extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  getGraphPathD(rect: IRect) {
    const { width, height } = rect

    const d = drawRhombus(width / 2, height / 2, width, height)

    return { d }
  }

  getShape() {
    const rect = { x: 0, y: 0, width: 1, height: 1 }
    return new Path({
      d: this.getGraphPathD(rect).d,
      ...rect,
      name: ToolEnum.label(ToolEnum.Rhombus),
      extraData: { wbType: ToolEnum.Rhombus }
    })
  }
}

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
