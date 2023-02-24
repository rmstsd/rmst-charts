import { measureText } from '../rmst-charts-old/utils/canvasUtil'
import Path from './Path'

export class Text extends Path {
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
    const { x, y, content, color, fontSize } = this.data

    ctx.fillStyle = color
    ctx.textBaseline = 'top'
    ctx.font = `${fontSize}px 微软雅黑`

    ctx.fillText(content, x, y)
  }
}

export default Text
