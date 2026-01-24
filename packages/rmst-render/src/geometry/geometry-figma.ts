import { ICoord } from '../type'
import { pointsToPath } from './pointsToPath'

// 使用类似 Figma 的算法

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

  return pointsToPath(points)
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
