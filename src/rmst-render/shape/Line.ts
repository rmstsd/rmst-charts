import Group from '../Group'
import Path from './Path'

const defaultData = {
  lineWidth: 1,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin
}

function createPath2D(data: Line['data']) {
  // 创建 Path2D
  let path2D: Path2D
  const { points, closed, smooth } = data
  const [start_x, start_y, ...restPoints] = points
  if (smooth) {
    path2D = calcSmoothPath2D(points)
  } else {
    path2D = new Path2D()
    const restNormalPoints = convertToNormalPoints(restPoints)
    path2D.moveTo(start_x, start_y)
    restNormalPoints.forEach(({ x, y }) => {
      path2D.lineTo(x, y)
    })
  }
  if (closed) {
    path2D.closePath()
  }

  return path2D
}
export class Line extends Path {
  constructor(data: Line['data']) {
    super()

    this.data = { ...defaultData, ...data }

    this.path2D = data.path2D ? data.path2D : createPath2D(data)

    if (data.clip) {
      if (data.path2D) {
        // 如何根据 path2D 计算包围盒?
        this.surroundBoxCoord = undefined

        return
      }
      const normalPoints = convertToNormalPoints(data.points)

      this.surroundBoxCoord = {
        lt_x: Math.min(...normalPoints.map(item => item.x)) - this.data.lineWidth / 2,
        lt_y: Math.min(...normalPoints.map(item => item.y)) - this.data.lineWidth / 2,
        rb_x: Math.max(...normalPoints.map(item => item.x)) + this.data.lineWidth,
        rb_y: Math.max(...normalPoints.map(item => item.y)) + this.data.lineWidth
      }
    }
  }

  isLine = true

  declare data: {
    path2D?: Path2D
    points?: number[]
    bgColor?: string
    fillStyle?: CanvasFillStrokeStyles['fillStyle']
    strokeStyle?: CanvasFillStrokeStyles['strokeStyle']
    lineWidth?: number
    lineCap?: CanvasLineCap
    lineJoin?: CanvasLineJoin
    closed?: boolean
    smooth?: boolean
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!(this.parent instanceof Group)) this.beforeDrawClip(ctx)

    const { bgColor, fillStyle, strokeStyle, lineWidth, lineCap, lineJoin, closed, smooth } = this.data

    this.setShadow(ctx, this.data)

    ctx.beginPath()
    ctx.lineCap = lineCap
    ctx.lineJoin = lineJoin

    ctx.fillStyle = fillStyle || '#333'
    ctx.strokeStyle = bgColor || strokeStyle

    if (lineWidth !== 0) {
      ctx.lineWidth = lineWidth
      ctx.stroke(this.path2D)
    }

    if (closed) {
      ctx.fill(this.path2D)
    }

    if (!(this.parent instanceof Group)) ctx.restore() // 恢复clip
  }
}

export default Line

export function calcSmoothPath2D(points: number[]) {
  const [start_x, start_y, ...restPoints] = points
  const allControlPoint = calcAllControlPoint(convertToNormalPoints(points))

  const path2D = new Path2D()
  path2D.moveTo(start_x, start_y)
  allControlPoint.forEach(item => {
    path2D.bezierCurveTo(item.cp1.x, item.cp1.y, item.cp2.x, item.cp2.y, item.end.x, item.end.y)
  })

  return path2D
}

function convertToNormalPoints(points: number[]): ICharts.ICoord[] {
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
export function calcAllControlPoint(
  points: ICharts.ICoord[]
): { start: ICharts.ICoord; end: ICharts.ICoord; cp1: ICharts.ICoord; cp2: ICharts.ICoord }[] {
  const ans = []
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
