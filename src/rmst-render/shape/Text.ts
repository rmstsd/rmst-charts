import Path from './Path'

export class Text extends Path {
  constructor(data: Text['data']) {
    super()

    this.data = { ...data }
  }

  declare data: {
    x: number
    y: number
    content: string
    color?: string
    fontSize?: number
    textAlign?: CanvasTextAlign
    [key: string]: any
  }

  isInner(offsetX: any, offsetY: any): boolean {
    const stage = this.findStage()
    const { textWidth, textHeight } = measureText(stage.ctx, this.data.content)

    return (
      offsetX >= this.data.x &&
      offsetX <= this.data.x + textWidth &&
      offsetY >= this.data.y &&
      offsetY <= this.data.y + textHeight
    )
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, content, color, fontSize, textAlign = 'left' } = this.data

    this.setShadow(ctx, this.data)

    ctx.fillStyle = color

    ctx.textAlign = textAlign
    ctx.fillText(content, x, y)
  }
}

export default Text

// 测量文本宽高
function measureText(ctx: CanvasRenderingContext2D, text: string) {
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width: textWidth } = ctx.measureText(text)

  // qq 浏览器只返回了 `width`
  const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent || parseInt(ctx.font)

  return { textWidth, textHeight }
}
