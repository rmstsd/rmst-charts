import Group from 'rmst-render/Group'
import Path from './Path'
import { setCtxFontSize } from 'rmst-charts/utils/canvasUtil'

const defaultData = {
  color: '#333',
  fontSize: 16
}

export class Text extends Path {
  constructor(data: Text['data']) {
    super()

    if (data.clip) {
      this.surroundBoxCoord = {
        lt_x: data.surroundBoxCoord.x,
        lt_y: data.surroundBoxCoord.y,
        rb_x: data.surroundBoxCoord.x + data.surroundBoxCoord.width,
        rb_y: data.surroundBoxCoord.y + data.surroundBoxCoord.height
      }
    }
    this.data = { ...defaultData, ...data }
  }

  declare data: {
    x: number
    y: number
    content: string
    color?: string
    fontSize?: number
    textAlign?: CanvasTextAlign
    clip?: boolean
    surroundBoxCoord?: { x: number; y: number; width: number; height: number }
    [key: string]: any
  }

  isText = true

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
    if (!(this.parent instanceof Group)) {
      this.beforeDrawClip(ctx)
    }

    const { x, y, content, color, fontSize, textAlign = 'left' } = this.data

    setCtxFontSize(ctx, fontSize)

    this.setShadow(ctx, this.data)

    ctx.fillStyle = color

    ctx.textAlign = textAlign
    ctx.fillText(content, x, y)

    if (!(this.parent instanceof Group)) {
      ctx.restore()
    }
  }
}

export default Text

// 测量文本宽高
export function measureText(ctx: CanvasRenderingContext2D, text: string) {
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width: textWidth } = ctx.measureText(text)

  // qq 浏览器只返回了 `width`
  const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent || parseInt(ctx.font)

  return { textWidth, textHeight }
}
