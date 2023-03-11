import Path from './Path'

const defaultData = {
  cornerRadius: 0
}

export class Rect extends Path {
  constructor(data: Rect['data']) {
    super()

    this.data = { ...defaultData, ...data }
  }

  declare data: {
    x: number
    y: number
    width: number
    height: number
    bgColor: string
    cornerRadius?: number
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height, bgColor, cornerRadius } = this.data

    this.setShadow(ctx, this.data)

    ctx.fillStyle = bgColor

    ctx.beginPath()
    ctx.moveTo(x + cornerRadius, y)
    ctx.lineTo(x + width - cornerRadius, y)
    ctx.arc(x + width - cornerRadius, y + cornerRadius, cornerRadius, (Math.PI / 2) * 3, 0)
    ctx.lineTo(x + width, y + height - cornerRadius)
    ctx.arc(x + width - cornerRadius, y + height - cornerRadius, cornerRadius, 0, Math.PI / 2)
    ctx.lineTo(x + cornerRadius, y + height)
    ctx.arc(x + cornerRadius, y + height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI)
    ctx.lineTo(x, y + cornerRadius)
    ctx.arc(x + cornerRadius, y + cornerRadius, cornerRadius, Math.PI, (Math.PI / 2) * 3)

    if (ctx.isCtx2) {
      this.setFillStyle(ctx)
    }
    ctx.fill()
  }

  // isInner(offsetX: number, offsetY: number) {
  //   const isInnerRect =
  //     offsetX >= this.data.x &&
  //     offsetX <= this.data.x + this.data.width &&
  //     offsetY >= this.data.y &&
  //     offsetY <= this.data.y + this.data.height

  //   return isInnerRect
  // }
}

export default Rect
