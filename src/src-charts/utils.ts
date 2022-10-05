import { primaryColor, tickColor } from './constant.js'

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
export function drawBezier(ctx: CanvasRenderingContext2D, points: ICharts.ICoord[], distance: number) {
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

  function drawBezier(start: ICharts.ICoord, end: ICharts.ICoord, cp1: ICharts.ICoord, cp2: ICharts.ICoord) {
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

    const ans: ICharts.ICoord[] = []
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

      const four_ac =
        4 * (pow2(slope) + 1) * (pow2(curr.x) - 2 * curr.y * b + pow2(curr.y) + pow2(b) - distance ** 2) // 4ac
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

// 绘制圆角矩形
export function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arc(x + width - radius, y + radius, radius, (Math.PI / 2) * 3, 0)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2)
  ctx.lineTo(x + radius, y + height)
  ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y + radius)
  ctx.arc(x + radius, y + radius, radius, Math.PI, (Math.PI / 2) * 3)
  ctx.fill()
}

export function setCtxFontSize(ctx: CanvasRenderingContext2D, fontSize: number = 14) {
  ctx.font = `${fontSize}px 微软雅黑`
}
