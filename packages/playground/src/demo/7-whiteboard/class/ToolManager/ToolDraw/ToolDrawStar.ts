import { ICoord, IRect, Path } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from '../constant'

// 星形
export default class ToolDrawStar extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  getGraphPathD(rect: IRect, sides: number = 5) {
    const { width, height } = rect
    const d = calculateStarPath(width, height, sides)
    return { d }
  }

  getShape() {
    const rect = { x: 0, y: 0, width: 1, height: 1 }
    const defaultSides = 5

    return new Path({
      d: this.getGraphPathD(rect, defaultSides).d,
      ...rect,
      name: ToolEnum.label(ToolEnum.Star),
      extraData: {
        wbType: ToolEnum.Star,
        sides: defaultSides // 存储边数，方便后续修改
      }
    })
  }
}

/**
 * Calculates star path data (d attribute) based on a bounding box and inner ratio.
 */
export const calculateStarPath = (
  width: number,
  height: number,
  pointsCount: number,
  ratio: number = 0.382, // 内圆半径 与外圆半径 的比例, 默认值为 0.382, 即黄金分割比例
  rotation: number = 0
): string => {
  if (pointsCount < 2) return ''

  const rx = width / 2
  const ry = height / 2
  const cx = rx
  const cy = ry

  const points: ICoord[] = []
  const startAngle = (rotation * Math.PI) / 180 - Math.PI / 2

  // A star has 2 * pointsCount total vertices (inner and outer)
  const totalPoints = pointsCount * 2

  for (let i = 0; i < totalPoints; i++) {
    const isInner = i % 2 !== 0
    const currentRatio = isInner ? ratio : 1
    const angle = startAngle + (i * Math.PI) / pointsCount

    points.push({
      x: cx + rx * currentRatio * Math.cos(angle),
      y: cy + ry * currentRatio * Math.sin(angle)
    })
  }

  return pointsToPath(points)
}

const pointsToPath = (points: ICoord[]): string => {
  const pathData =
    points.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${acc}${command}${point.x.toFixed(3)},${point.y.toFixed(3)} `
    }, '') + 'Z'
  return pathData
}
