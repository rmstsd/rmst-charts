import { IRect, Path } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from './../constant'

export default class ToolDrawEllipse extends ToolDrawByRect {
  cursor = 'crosshair'

  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  getGraphPathD(rect: IRect) {
    const { width, height } = rect

    const cx = width / 2
    const cy = height / 2
    const rx = width / 2
    const ry = height / 2

    const d = drawEllipsePath(cx, cy, rx, ry)

    return d
  }

  getShape() {
    const rect = { x: 0, y: 0, width: 1, height: 1 }

    return new Path({
      d: this.getGraphPathD(rect),
      ...rect,
      name: ToolEnum.label(ToolEnum.Ellipse),
      extraData: { wbType: ToolEnum.Ellipse, innerRadius: 0 }
    })
  }
}

/** 顺时针绘制椭圆路径 */
export function drawEllipsePath(cx: number, cy: number, rx: number, ry: number) {
  return `M ${cx - rx},${cy} A ${rx},${ry} 0 1,1 ${cx + rx},${cy} A ${rx},${ry} 0 1,1 ${cx - rx},${cy} Z`
}

/**
 * 绘制 donut (环形) 路径：外椭圆顺时针 + 内椭圆逆时针
 * innerRatio: 0 = 实心, 1 = 最大内圆 (等于外圆)
 */
export function drawDonutEllipsePath(cx: number, cy: number, rx: number, ry: number, innerRatio: number) {
  const irx = rx * innerRatio
  const iry = ry * innerRatio

  if (irx < 0.5 || iry < 0.5) {
    return drawEllipsePath(cx, cy, rx, ry)
  }

  // 外椭圆 顺时针 (sweep-flag=1)
  const outer = `M ${cx - rx},${cy} A ${rx},${ry} 0 1,1 ${cx + rx},${cy} A ${rx},${ry} 0 1,1 ${cx - rx},${cy} Z`
  // 内椭圆 逆时针 (sweep-flag=0)，形成镂空
  const inner = `M ${cx - irx},${cy} A ${irx},${iry} 0 1,0 ${cx + irx},${cy} A ${irx},${iry} 0 1,0 ${cx - irx},${cy} Z`

  return `${outer} ${inner}`
}
