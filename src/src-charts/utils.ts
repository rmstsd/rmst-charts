import { tickColor } from './constant.js'

// 测量文本宽高
export function measureText(ctx: CanvasRenderingContext2D, text: string) {
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width: textWidth } = ctx.measureText(text)

  // qq 浏览器只返回了 `width`
  const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent || parseInt(ctx.font)

  return { textWidth, textHeight }
}

// 绘制线段
export function drawSegmentLine(
  ctx: CanvasRenderingContext2D,
  start: ICharts.ICoord,
  end: ICharts.ICoord,
  strokeStyle = tickColor,
  lineWidth = 1
) {
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

// 绘制圆
export function drawArc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius = 3,
  strokeStyle = 'purple',
  lineWidth = 1
) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.stroke()
}

// 计算理想的 y轴最大值, 最小值, 刻度间隔
export function calcPerfect(max: number, min: number) {
  const intervals = [300, 200, 100, 50, 30, 20, 10, 5, 4, 3, 2, 1]
  const minCount = 4
  const maxCount = 7

  let perfectCount
  let perfectInterval

  let perfectMax
  let perfectMin

  for (const inter of intervals) {
    perfectMax = ceil(max, inter)
    perfectMin = floor(min, inter)

    const decimalCount = (perfectMax - perfectMin) / inter
    if (decimalCount >= minCount && decimalCount <= maxCount) {
      perfectCount = Math.ceil(decimalCount)
      perfectInterval = inter
      break
    }
  }

  return { perfectMax, perfectMin, perfectInterval }

  // return 100
  function floor(num = 123, multiple = 100) {
    const stack = []
    let i = 0
    while (!stack.length || stack[stack.length - 1] <= num) {
      stack.push(i * multiple)
      i++
    }
    stack.pop()
    return stack.pop()
  }
  // return 200
  function ceil(num = 123, multiple = 100) {
    const stack = []
    let i = 0
    while (!stack.length || stack[stack.length - 1] <= num) {
      stack.push(i * multiple)
      i++
    }
    return stack.pop()
  }
}

// 计算 和 绘制贝塞尔曲线
export function drawBezier(ctx: CanvasRenderingContext2D, points, distance: number) {
  const allControlPoint = calcAllControlPoint()
  const finalPoint = calcFinalPoint()

  finalPoint.forEach(item => {
    drawBezier(item.start, item.end, item.cp1, item.cp2)
  })

  function drawBezier(start: ICharts.ICoord, end: ICharts.ICoord, cp1: ICharts.ICoord, cp2: ICharts.ICoord) {
    ctx.strokeStyle = 'black'
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

    const ans = []
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]

      const slope = (next[1] - prev[1]) / (next[0] - prev[0]) // 直线的斜率
      const b = curr[1] - slope * curr[0] // 经过做标点的 y = kx + b

      const pow2 = (num: number) => Math.pow(num, 2)

      // y = slope * x + b    // 二元一次方程
      // (curr[0] - x) ** 2 + (curr[1] - slope * x - b) ** 2 = distance ** 2 // 勾股定理

      // (pow2(slope) + 1)*pow2(x) +  (2*slope*b -  2*curr[0] - 2*curr[1]*slope)*x + pow2(curr[0]) - 2*curr[1]*b  + pow2(curr[1]) + pow2(b) - distance ** 2 = 0

      const four_ac =
        4 * (pow2(slope) + 1) * (pow2(curr[0]) - 2 * curr[1] * b + pow2(curr[1]) + pow2(b) - distance ** 2) // 4ac
      const det = Math.sqrt(pow2(2 * slope * b - 2 * curr[0] - 2 * curr[1] * slope) - four_ac) // 根号下(b方 - 4ac)
      const fb = -(2 * slope * b - 2 * curr[0] - 2 * curr[1] * slope) // -b
      const two_a = 2 * (pow2(slope) + 1) // 2a

      let cp1_x = (fb - det) / two_a
      let cp1_y = slope * cp1_x + b

      let cp2_x = (fb + det) / two_a
      let cp2_y = slope * cp2_x + b

      // 如果是峰值 直接拉平
      if ((curr[1] >= prev[1] && curr[1] >= next[1]) || (curr[1] <= prev[1] && curr[1] <= next[1])) {
        cp1_x = curr[0] - distance
        cp1_y = curr[1]

        cp2_x = curr[0] + distance
        cp2_y = curr[1]
      }

      ans.push([cp1_x, cp1_y], [cp2_x, cp2_y])
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
