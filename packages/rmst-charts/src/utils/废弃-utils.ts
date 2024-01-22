import { primaryColor, tickColor } from '../constant.js'
import { drawArc } from './废弃-drawHelpers.js'

interface IC_Coord {
  x: number
  y: number
}

// 计算 和 绘制贝塞尔曲线
function drawBezier(ctx: CanvasRenderingContext2D, points: IC_Coord[], distance: number) {
  const allControlPoint = calcAllControlPoint()
  const finalPoint = calcFinalPoint()

  // 画曲线
  finalPoint.forEach(item => {
    drawBezier(item.start, item.end, item.cp1, item.cp2)
  })

  // 画实际的数值点
  points.forEach(item => {
    drawArc(ctx, item.x, item.y, 2, primaryColor, 2)
  })

  function drawBezier(start: IC_Coord, end: IC_Coord, cp1: IC_Coord, cp2: IC_Coord) {
    ctx.strokeStyle = primaryColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y)
    ctx.stroke()

    // 画控制点
    drawArc(ctx, cp1.x, cp1.y, 2, 'red')
    drawArc(ctx, cp2.x, cp2.y, 2, 'red')
  }

  function calcAllControlPoint() {
    distance = distance / 2

    const ans: IC_Coord[] = []
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]

      const slope = (next.y - prev.y) / (next.x - prev.x) // 直线的斜率
      const b = curr.y - slope * curr.x // 经过做标点的 y = kx + b

      const pow2 = (num: number) => Math.pow(num, 2)

      // y = slope * x + b    // 二元一次方程
      // (curr.x - x) ** 2 + (curr.y - slope * x - b) ** 2 = distance ** 2 // 勾股定理

      // (pow2(slope) + 1)*pow2(x) +  (2*slope*b -  2*curr.x - 2*curr.y*slope)*x + pow2(curr.x) - 2*curr.y*b  + pow2(curr.y) + pow2(b) - distance ** 2 = 0

      const four_ac = 4 * (pow2(slope) + 1) * (pow2(curr.x) - 2 * curr.y * b + pow2(curr.y) + pow2(b) - distance ** 2) // 4ac
      const det = Math.sqrt(pow2(2 * slope * b - 2 * curr.x - 2 * curr.y * slope) - four_ac) // 根号下(b方 - 4ac)
      const fb = -(2 * slope * b - 2 * curr.x - 2 * curr.y * slope) // -b
      const two_a = 2 * (pow2(slope) + 1) // 2a

      let cp1_x = (fb - det) / two_a
      let cp1_y = slope * cp1_x + b

      let cp2_x = (fb + det) / two_a
      let cp2_y = slope * cp2_x + b

      // 如果是峰值 直接拉平
      if ((curr.y >= prev.y && curr.y >= next.y) || (curr.y <= prev.y && curr.y <= next.y)) {
        cp1_x = curr.x - distance
        cp1_y = curr.y

        cp2_x = curr.x + distance
        cp2_y = curr.y
      }

      ans.push({ x: cp1_x, y: cp1_y }, { x: cp2_x, y: cp2_y })
    }

    ans.unshift(points[0])
    ans.push(points[points.length - 1])

    return ans
  }

  function calcFinalPoint() {
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
