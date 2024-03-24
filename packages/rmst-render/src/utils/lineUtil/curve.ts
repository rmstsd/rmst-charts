// 曲线的相关函数

import { convertToNormalPoints } from '.'
import { ICoord } from '../../type'

export function calcSmoothPath2D(points: number[], percent) {
  const [start_x, start_y, ...restPoints] = points

  const path2D = new Path2D()

  if (percent === 0) {
    return path2D
  }

  const normalPoints = convertToNormalPoints(points)
  const allControlPoint = calcAllControlPoint(normalPoints)

  const percentSeg = allControlPoint.length * percent

  const elapsedIndex = Math.floor(percentSeg)
  const t = percentSeg - elapsedIndex

  const percentControlPoint = allControlPoint[Math.ceil(percentSeg) - 1]

  const tempAns = calculateControlPoint(t, percentControlPoint)

  const ans = allControlPoint.slice(0, elapsedIndex)
  if (percent !== 1) {
    ans.push({ start: percentControlPoint.start, end: tempAns.tempEnd, cp1: tempAns.cp1, cp2: tempAns.cp2 })
  }

  path2D.moveTo(start_x, start_y)
  ans.forEach(item => {
    path2D.bezierCurveTo(item.cp1.x, item.cp1.y, item.cp2.x, item.cp2.y, item.end.x, item.end.y)
  })

  return path2D
}

type FinalPoint = {
  start: ICoord // 起点
  cp1: ICoord // 控制点1 控制起点
  cp2: ICoord // 控制点2 控制终点
  end: ICoord // 终点
}
export function calculateControlPoint(t: number, finalPoint: FinalPoint) {
  const { start, cp1, cp2, end } = finalPoint

  const a_x = (1 - t) * start.x + t * cp1.x
  const a_y = (1 - t) * start.y + t * cp1.y

  const b_x = (1 - t) * cp1.x + t * cp2.x
  const b_y = (1 - t) * cp1.y + t * cp2.y

  const c_x = (1 - t) * cp2.x + t * end.x
  const c_y = (1 - t) * cp2.y + t * end.y

  const d_x = (1 - t) * a_x + t * b_x
  const d_y = (1 - t) * a_y + t * b_y

  const e_x = (1 - t) * b_x + t * c_x
  const e_y = (1 - t) * b_y + t * c_y

  const p_x = (1 - t) * d_x + t * e_x
  const p_y = (1 - t) * d_y + t * e_y

  return { cp1: { x: a_x, y: a_y }, cp2: { x: d_x, y: d_y }, tempEnd: { x: p_x, y: p_y } }
}

// 计算 两个控制点 和 两个端点
export function calcAllControlPoint(
  points: ICoord[],
  ver?: 'new' | 'old'
): { start: ICoord; end: ICoord; cp1: ICoord; cp2: ICoord }[] {
  const cpArray = [] // 所有的控制点

  for (let i = 1; i < points.length - 1; i++) {
    // 以三个点为基准
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    // 与第一个点和第三个点的连线平行的线, 且与第二个点相交
    const k = (next.y - prev.y) / (next.x - prev.x) // 直线的斜率
    const b = curr.y - k * curr.x // 经过中间点的 y = kx + b

    let { cp1_x, cp2_x, distance } = ver === 'old' ? oldVersion() : newVersion()
    // let { cp1_x, cp2_x, distance } = newVersion()

    let cp1_y = k * cp1_x + b
    let cp2_y = k * cp2_x + b

    function newVersion() {
      const distance = (next.x - curr.x) / 3
      const cp1_x = curr.x - distance
      const cp2_x = curr.x + distance

      const distance_2half = (next.x - curr.x) / 2

      return { cp1_x, cp2_x, distance: distance_2half }
    }

    // 旧版本 实在想不起来当初是怎么整出来 一元二次方程式的
    function oldVersion() {
      const distance = (next.x - curr.x) / 2
      const pow2 = (num: number) => Math.pow(num, 2) // 平方: Math.pow(3, 2) = 3 * 3 = 9

      const four_ac = 4 * (pow2(k) + 1) * (pow2(curr.x) - 2 * curr.y * b + pow2(curr.y) + pow2(b) - distance ** 2) // 4ac
      const det = Math.sqrt(pow2(2 * k * b - 2 * curr.x - 2 * curr.y * k) - four_ac) // 根号下(b方 - 4ac)
      const fb = -(2 * k * b - 2 * curr.x - 2 * curr.y * k) // -b
      const two_a = 2 * (pow2(k) + 1) // 2a

      let cp1_x = (fb - det) / two_a
      let cp2_x = (fb + det) / two_a

      return { cp1_x, cp2_x, distance }
    }

    // 如果是峰值 直接拉平, 控制点的 x坐标取两个点的中间值
    if ((curr.y >= prev.y && curr.y >= next.y) || (curr.y <= prev.y && curr.y <= next.y)) {
      cp1_x = curr.x - distance
      cp1_y = curr.y

      cp2_x = curr.x + distance
      cp2_y = curr.y
    }

    cpArray.push({ x: cp1_x, y: cp1_y }, { x: cp2_x, y: cp2_y })
  }

  cpArray.unshift(points[0])
  cpArray.push(points.at(-1))

  return calcFinalPoint(cpArray, points)

  function calcFinalPoint(allControlPoint, points) {
    const ans = []
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]
      const end = points[i + 1]

      const cp1 = allControlPoint[i * 2]
      const cp2 = allControlPoint[i * 2 + 1]

      ans.push({ start, end, cp1, cp2 })
    }
    return ans
  }
}
