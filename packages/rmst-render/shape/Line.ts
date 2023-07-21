import Group from '../Group'
import { convertToNormalPoints, createPath2D } from '../utils'
import Path from './Path'

const defaultData = {
  lineWidth: 1,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin
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
