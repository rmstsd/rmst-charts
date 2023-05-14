import Path from './Path'

const defaultData = {
  lineWidth: 1
}

export class Line extends Path {
  constructor(data: Line['data']) {
    super()

    this.data = { ...defaultData, ...data }

    if (data.clip) {
      const normalPoints = convertNormalPoints(data.points)

      const rr = {
        lt_x: Math.min(...normalPoints.map(item => item.x)) - this.data.lineWidth / 2,
        lt_y: Math.min(...normalPoints.map(item => item.y)) - this.data.lineWidth / 2,
        rb_x: Math.max(...normalPoints.map(item => item.x)) + this.data.lineWidth,
        rb_y: Math.max(...normalPoints.map(item => item.y)) + this.data.lineWidth
      }

      this.surroundBoxData = {
        x: rr.lt_x,
        y: rr.lt_y,
        width: rr.rb_x - rr.lt_x,
        height: rr.rb_y - rr.lt_y
      }
    }
  }

  isLine = true

  declare data: {
    points: number[]
    bgColor?: string
    fillStyle?: string
    strokeStyle?: string
    lineWidth?: number
    closed?: boolean
    smooth?: boolean
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.beforeDrawClip(ctx)

    const { points, bgColor, fillStyle, strokeStyle, lineWidth, closed, smooth } = this.data

    this.setShadow(ctx, this.data)

    ctx.beginPath()

    const [start_x, start_y, ...restPoints] = points

    const path2D = new Path2D()

    if (smooth) {
      const allControlPoint = calcAllControlPoint(convertNormalPoints(points))

      path2D.moveTo(start_x, start_y)
      allControlPoint.forEach(item => {
        path2D.bezierCurveTo(item.cp1.x, item.cp1.y, item.cp2.x, item.cp2.y, item.end.x, item.end.y)
      })
    } else {
      const restNormalPoints = convertNormalPoints(restPoints)
      path2D.moveTo(start_x, start_y)
      restNormalPoints.forEach(({ x, y }) => {
        path2D.lineTo(x, y)
      })
    }

    if (closed) path2D.closePath()

    // ctx.moveTo(start_x, start_y)
    // restPointsMatrix.forEach(([x, y]) => {
    //   ctx.lineTo(x, y)
    // })
    // if (closed) ctx.closePath()

    // ctx.lineJoin = 'round'

    ctx.fillStyle = fillStyle || '#333'
    ctx.strokeStyle = bgColor || strokeStyle

    ctx.lineWidth = lineWidth

    this.path2D = path2D
    ctx.stroke(path2D)

    if (closed) ctx.fill(path2D)

    // 绘制辅助的包围盒
    // ctx.lineWidth = 1
    // ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    // ctx.strokeRect(
    //   this.surroundBoxData.x,
    //   this.surroundBoxData.y,
    //   this.surroundBoxData.width,
    //   this.surroundBoxData.height
    // )

    ctx.restore() // 恢复clip
  }
}

export default Line

function convertNormalPoints(points: number[]) {
  return points
    .reduce((acc, item, index) => {
      const tarIndex = Math.floor(index / 2)
      if (index % 2 == 0) acc.push([item])
      else acc[tarIndex].push(item)
      return acc
    }, [])
    .map(([x, y]) => ({ x, y }))
}

// 计算 两个控制点 和 两个端点
function calcAllControlPoint(points) {
  const ans: ICharts.ICoord[] = []
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    const distance = (next.x - curr.x) / 2

    const slope = (next.y - prev.y) / (next.x - prev.x) // 直线的斜率
    const b = curr.y - slope * curr.x // 经过做标点的 y = kx + b

    const pow2 = (num: number) => Math.pow(num, 2)

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

  return calcFinalPoint(ans, points)

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
