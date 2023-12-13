import { createPath2D } from '../utils'
import AbstractUi, { AbstractUiData } from './AbstractUi'

const defaultData: LineData = {
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  percent: 1
}

interface LineData extends AbstractUiData {
  path2D?: Path2D
  points?: number[]
  closed?: boolean
  smooth?: boolean
  percent?: number // 0 - 1
}

export class Line extends AbstractUi {
  constructor(data: LineData) {
    super('Line', data, defaultData)

    this.path2D = data.path2D ? data.path2D : createPath2D(this.data)
  }

  declare data: LineData

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx)

    const { fillStyle, strokeStyle, lineWidth, lineCap, lineJoin, closed } = this.data

    // 调用 this.attr() 方法后,  需重新计算 path2D, 且一定会有 bug, 需要优化
    this.path2D = this.data.path2D ? this.data.path2D : createPath2D(this.data)

    ctx.beginPath()
    ctx.lineCap = lineCap
    ctx.lineJoin = lineJoin

    ctx.fillStyle = fillStyle
    ctx.strokeStyle = strokeStyle

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
