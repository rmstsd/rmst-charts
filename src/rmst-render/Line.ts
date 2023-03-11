import Path from './Path'

export class Line extends Path {
  constructor(data: Line['data']) {
    super()

    this.data = { ...data }
  }

  declare data: {
    points: number[]
    bgColor?: string
    fillStyle?: string
    strokeStyle?: string
    closed?: boolean
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { points, bgColor, fillStyle, strokeStyle, closed, lineWidth = 1 } = this.data

    this.setShadow(ctx, this.data)

    ctx.beginPath()

    const [start_x, start_y, ...restPoints] = points

    const restPointsMatrix = restPoints.reduce((acc, item, index) => {
      const tarIndex = Math.floor(index / 2)
      if (index % 2 == 0) acc.push([item])
      else acc[tarIndex].push(item)
      return acc
    }, [])

    ctx.moveTo(start_x, start_y)
    restPointsMatrix.forEach(([x, y]) => {
      ctx.lineTo(x, y)
    })

    if (closed) ctx.closePath()

    ctx.fillStyle = fillStyle || '#333'
    ctx.strokeStyle = bgColor || strokeStyle

    ctx.lineWidth = lineWidth

    ctx.stroke()
    ctx.fill()
  }
}

export default Line
