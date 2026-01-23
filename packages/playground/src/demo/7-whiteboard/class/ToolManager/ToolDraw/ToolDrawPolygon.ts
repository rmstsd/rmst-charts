import { ICoord, IRect, Path } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from './../constant'

// 多边形
export default class ToolDrawPolygon extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  getGraphPathD(rect: IRect, sides: number = 3) {
    const { width, height } = rect
    const d = calculatePolygonPath(width, height, sides)
    return { d }
  }

  getShape() {
    const rect = { x: 0, y: 0, width: 1, height: 1 }
    const defaultSides = 3

    return new Path({
      d: this.getGraphPathD(rect, defaultSides).d,
      ...rect,
      name: ToolEnum.label(ToolEnum.Polygon),
      extraData: {
        wbType: ToolEnum.Polygon,
        sides: defaultSides // 存储边数，方便后续修改
      }
    })
  }
}

/**
 * 计算多边形路径
 * 使用类似 Figma 的算法：从中心点向外绘制正多边形
 * @param width 宽度
 * @param height 高度
 * @param sides 边数（至少为 3）
 * @param rotation 旋转角度（度），默认为 0
 */
export const calculatePolygonPath = (width: number, height: number, sides: number, rotation: number = 0): string => {
  if (sides < 3) return ''

  const rx = width / 2
  const ry = height / 2
  const cx = rx
  const cy = ry

  const points: ICoord[] = []

  // Figma 的默认多边形（三角形）从顶部开始指向
  // 使用 -90 度（-π/2）作为起始偏移
  const startAngle = (rotation * Math.PI) / 180 - Math.PI / 2

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / sides
    points.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle)
    })
  }

  // 生成 SVG 路径数据: M x y L x y ... Z
  const pathData =
    points.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${acc}${command} ${point.x.toFixed(3)},${point.y.toFixed(3)} `
    }, '') + 'Z'

  return pathData
}
