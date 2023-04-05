import Path from './Path'

const defaultData = {
  lineWidth: 1
}

export class Line extends Path {
  constructor(data: Line['data']) {
    super()

    this.data = { ...defaultData, ...data }
  }

  isLine = true

  declare data: {
    points: number[]
    bgColor?: string
    fillStyle?: string
    strokeStyle?: string
    lineWidth?: number
    closed?: boolean
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { points, bgColor, fillStyle, strokeStyle, lineWidth, closed } = this.data

    this.setShadow(ctx, this.data)

    ctx.beginPath()

    const [start_x, start_y, ...restPoints] = points

    const restPointsMatrix = restPoints.reduce((acc, item, index) => {
      const tarIndex = Math.floor(index / 2)
      if (index % 2 == 0) acc.push([item])
      else acc[tarIndex].push(item)
      return acc
    }, [])

    const path2D = new Path2D()
    path2D.moveTo(start_x, start_y)
    restPointsMatrix.forEach(([x, y]) => {
      path2D.lineTo(x, y)
    })
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
  }
}

export default Line
