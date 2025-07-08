import { IRect } from '../../type'

// 检测两个矩形是否发生碰撞
export function isRectCollision(rect1: IRect, rect2: IRect) {
  const { x: x1, y: y1, width: w1, height: h1 } = rect1
  const { x: x2, y: y2, width: w2, height: h2 } = rect2

  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2
}

/**
 * 检测轴对齐矩形（AABB）与有方向矩形（OBB）的碰撞
 * @param {Object} aabb - 轴对齐矩形 { x, y, hw, hh }
 * @param {Object} obb - 有方向矩形 { x, y, hw, hh, rotation }
 * @returns {boolean} 是否碰撞
 */
export function isRectCollisionOBB(aabb: IRect, obb: IRect & { rotation: number }) {
  aabb.hw = aabb.width
  aabb.hh = aabb.height

  obb.hw = obb.width
  obb.hh = obb.height

  // 计算OBB的旋转矩阵
  const cos = Math.cos(obb.rotation)
  const sin = Math.sin(obb.rotation)

  // OBB的本地轴向量
  const u = { x: cos, y: sin } // 本地x轴
  const v = { x: -sin, y: cos } // 本地y轴（垂直于x轴）

  // 分离轴列表：AABB的两个轴 + OBB的两个轴
  const axes = [
    { x: 1, y: 0 }, // AABB x轴
    { x: 0, y: 1 }, // AABB y轴
    { x: -sin, y: cos }, // OBB x轴法向量
    { x: -cos, y: -sin } // OBB y轴法向量
  ]

  // 检查每个分离轴
  for (const axis of axes) {
    // 计算AABB在轴上的投影区间
    const aabbMin = projectAABB(aabb, axis)
    const aabbMax = aabbMin + getAABBProjectionRange(aabb, axis)

    // 计算OBB在轴上的投影区间
    const obbMin = projectOBB(obb, axis, u, v)
    const obbMax = obbMin + getOBBProjectionRange(obb, axis, u, v)

    // 检查投影区间是否重叠
    if (!isOverlapping(aabbMin, aabbMax, obbMin, obbMax)) {
      return false // 只要有一个轴不重叠，就不碰撞
    }
  }

  return true // 所有轴都重叠，碰撞
}

/**
 * 计算AABB在轴上的投影最小值
 * @param {Object} aabb - 轴对齐矩形
 * @param {Object} axis - 分离轴 { x, y }
 * @returns {number} 投影最小值
 */
function projectAABB(aabb, axis) {
  const xComponent = axis.x >= 0 ? (aabb.x - aabb.hw) * axis.x : (aabb.x + aabb.hw) * axis.x
  const yComponent = axis.y >= 0 ? (aabb.y - aabb.hh) * axis.y : (aabb.y + aabb.hh) * axis.y
  return xComponent + yComponent
}

/**
 * 计算AABB在轴上的投影范围
 * @param {Object} aabb - 轴对齐矩形
 * @param {Object} axis - 分离轴 { x, y }
 * @returns {number} 投影范围
 */
function getAABBProjectionRange(aabb, axis) {
  return aabb.hw * 2 * Math.abs(axis.x) + aabb.hh * 2 * Math.abs(axis.y)
}

/**
 * 计算OBB在轴上的投影最小值
 * @param {Object} obb - 有方向矩形
 * @param {Object} axis - 分离轴 { x, y }
 * @param {Object} u - OBB本地x轴 { x, y }
 * @param {Object} v - OBB本地y轴 { x, y }
 * @returns {number} 投影最小值
 */
function projectOBB(obb, axis, u, v) {
  // 计算中心投影
  const centerProjection = obb.x * axis.x + obb.y * axis.y

  // 计算半宽和半高在轴上的投影贡献
  const uDotAxis = Math.abs(u.x * axis.x + u.y * axis.y)
  const vDotAxis = Math.abs(v.x * axis.x + v.y * axis.y)
  const range = obb.hw * uDotAxis + obb.hh * vDotAxis

  return centerProjection - range
}

/**
 * 计算OBB在轴上的投影范围
 * @param {Object} obb - 有方向矩形
 * @param {Object} axis - 分离轴 { x, y }
 * @param {Object} u - OBB本地x轴 { x, y }
 * @param {Object} v - OBB本地y轴 { x, y }
 * @returns {number} 投影范围
 */
function getOBBProjectionRange(obb, axis, u, v) {
  const uDotAxis = Math.abs(u.x * axis.x + u.y * axis.y)
  const vDotAxis = Math.abs(v.x * axis.x + v.y * axis.y)
  return 2 * (obb.hw * uDotAxis + obb.hh * vDotAxis)
}

/**
 * 检查两个区间是否重叠
 * @param {number} min1 - 区间1最小值
 * @param {number} max1 - 区间1最大值
 * @param {number} min2 - 区间2最小值
 * @param {number} max2 - 区间2最大值
 * @returns {boolean} 是否重叠
 */
function isOverlapping(min1, max1, min2, max2) {
  return min1 <= max2 && min2 <= max1
}
