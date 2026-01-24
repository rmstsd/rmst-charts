// 紧凑包围盒

import { ICoord } from '../type'
import { pointsToPath } from './pointsToPath'

/**
 * Normalizes a set of points to fit exactly within a bounding box defined by width and height.
 */
const normalizePoints = (points: ICoord[], width: number, height: number): ICoord[] => {
  if (points.length === 0) return points

  // Find actual min/max of the generated points
  let minX = points[0].x
  let maxX = points[0].x
  let minY = points[0].y
  let maxY = points[0].y

  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }

  const currentWidth = maxX - minX
  const currentHeight = maxY - minY

  // Avoid division by zero for degenerate shapes
  if (currentWidth === 0 || currentHeight === 0) return points

  // Map points to the target bounding box [0, 0, width, height]
  return points.map(p => ({
    x: ((p.x - minX) / currentWidth) * width,
    y: ((p.y - minY) / currentHeight) * height
  }))
}

/**
 * Calculates polygon path data (d attribute) based on a bounding box.
 * Vertices are normalized to fill the bounding box.
 */
export const calculatePolygonPath = (width: number, height: number, sides: number, rotation: number = 0): string => {
  if (sides < 3) return ''

  // We generate points on a unit circle first
  const points: ICoord[] = []
  const startAngle = (rotation * Math.PI) / 180 - Math.PI / 2

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / sides
    points.push({
      x: Math.cos(angle),
      y: Math.sin(angle)
    })
  }

  const normalized = normalizePoints(points, width, height)
  return pointsToPath(normalized)
}

/**
 * Calculates star path data (d attribute) based on a bounding box and inner ratio.
 * Vertices are normalized to fill the bounding box.
 */
export const calculateStarPath = (
  width: number,
  height: number,
  pointsCount: number,
  ratio: number = 0.382,
  rotation: number = 0
): string => {
  if (pointsCount < 2) return ''

  const points: ICoord[] = []
  const startAngle = (rotation * Math.PI) / 180 - Math.PI / 2
  const totalPoints = pointsCount * 2

  for (let i = 0; i < totalPoints; i++) {
    const isInner = i % 2 !== 0
    const currentRatio = isInner ? ratio : 1
    const angle = startAngle + (i * Math.PI) / pointsCount

    points.push({
      x: currentRatio * Math.cos(angle),
      y: currentRatio * Math.sin(angle)
    })
  }

  const normalized = normalizePoints(points, width, height)
  return pointsToPath(normalized)
}
