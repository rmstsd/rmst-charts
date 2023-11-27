import Group from 'rmst-render/shape/Group'
import AbstractUi, { AbstractUiData } from './AbstractUi'

const defaultData = {
  color: '#333',
  fontSize: 14,
  textAlign: 'left' as const
}

interface TextData extends AbstractUiData {
  x: number
  y: number
  content: string
  color?: string
  fontSize?: number
  textAlign?: CanvasTextAlign
  clip?: boolean
  [key: string]: any
}

export class Text extends AbstractUi {
  constructor(data: TextData) {
    super()

    this.data = { ...defaultData, ...data }
  }

  declare data: TextData

  isText = true

  isInner(offsetX: any, offsetY: any): boolean {
    const stage = this.findStage()
    const { textWidth, textHeight } = measureText(stage.ctx, this.data.content, this.data.fontSize)

    return (
      offsetX >= this.data.x &&
      offsetX <= this.data.x + textWidth &&
      offsetY >= this.data.y &&
      offsetY <= this.data.y + textHeight
    )
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, content, color, fontSize, textAlign = 'left' } = this.data

    setCtxFontSize(ctx, fontSize)

    this.setShadow(ctx, this.data)

    ctx.fillStyle = color

    ctx.textAlign = textAlign
    ctx.fillText(content, x, y)
  }
}

export default Text

// 测量文本宽高
export function measureText(ctx: CanvasRenderingContext2D, text: string, fontSize: number) {
  setCtxFontSize(ctx, fontSize)
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width: textWidth } = ctx.measureText(text)

  // qq 浏览器只返回了 `width`
  const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent || parseInt(ctx.font)

  return { textWidth, textHeight }
}

export function setCtxFontSize(ctx: CanvasRenderingContext2D, fontSize: number = 14) {
  ctx.font = `${fontSize}px 微软雅黑`
}
