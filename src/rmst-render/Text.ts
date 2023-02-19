import Path from './Path'

export default class Text extends Path {
  constructor(data: Text['data']) {
    super()

    this.data = data
  }

  declare data: {
    x: number
    y: number
    content: string
    color?: string
    fontSize?: number
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, content, color, fontSize } = this.data

    ctx.fillStyle = color
    ctx.textBaseline = 'top'
    ctx.font = `${fontSize}px 微软雅黑`

    ctx.fillText(content, x, y)
  }
}
