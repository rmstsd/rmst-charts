import Group from './Group'
import { convertToNormalPoints, createPath2D } from '../utils'
import AbstractUi, { AbstractUiData } from './AbstractUi'

const defaultData = {
  lineWidth: 1,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin
}

interface LineData extends AbstractUiData {
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

export class Line extends AbstractUi {
  constructor(data: LineData) {
    super()

    this.data = { ...defaultData, ...data }

    this.path2D = data.path2D ? data.path2D : createPath2D(data)
  }

  declare data: LineData

  isLine = true

  draw(ctx: CanvasRenderingContext2D) {
    const { bgColor, fillStyle, strokeStyle, lineWidth, lineCap, lineJoin, closed, smooth } = this.data

    // 调用 this.attr() 方法后,  需重新计算 path2D, 且一定会有 bug, 需要优化
    this.path2D = this.data.path2D ? this.data.path2D : createPath2D(this.data)

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
  }
}

export default Line
