import Path from './Path'

export class Line extends Path {
  constructor(data: Line['data']) {
    super()

    this.data = data
  }

  declare data: {
    points: { x: number; y: number }[]
    bgColor?: string
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { points, bgColor } = this.data

    this.setShadow(ctx, this.data)

    ctx.beginPath()

    const [startPoint, ...restPoints] = points

    ctx.moveTo(startPoint.x, startPoint.y)

    restPoints.forEach(item => {
      ctx.lineTo(item.x, item.y)
    })

    ctx.strokeStyle = bgColor
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

export default Line
