import Path from './Path'

export default class Rect extends Path {
  constructor(data: Rect['data']) {
    super()

    this.data = data
  }

  data: { x: number; y: number; width: number; height: number; bgColor: string; [key: string]: any }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height, bgColor } = this.data

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, width, height)
  }

  isInner(x: number, y: number) {
    const isInnerRect =
      x >= this.data.x &&
      x <= this.data.x + this.data.width &&
      y >= this.data.y &&
      y <= this.data.y + this.data.height

    return isInnerRect
  }
}
