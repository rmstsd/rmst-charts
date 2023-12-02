import AbstractUi, { AbstractUiData } from './AbstractUi'

const defaultData = {
  color: '#333',
  fontSize: 14,
  textAlign: 'left' as CanvasTextAlign
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

    const { x, y, content, fontSize, textAlign } = this.data

    const { textWidth, textHeight } = measureText(stage.ctx, content, fontSize)

    const halfWidth = textWidth / 2

    const textRect_x = (() => {
      if (textAlign === 'left') {
        return x
      }
      if (textAlign === 'center') {
        return x - halfWidth
      }
      if (textAlign === 'right') {
        return x - textWidth
      }
    })()

    const textRect_y = (() => {
      return y
    })()

    const is_x = offsetX >= textRect_x && offsetX <= textRect_x + textWidth

    const is_y = offsetY >= textRect_y && offsetY <= textRect_y + textHeight

    const isInner = is_x && is_y

    return isInner
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, content, color, fontSize, textAlign = 'left' } = this.data

    setCtxFontSize(ctx, fontSize)

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

export function setCtxFontSize(ctx: CanvasRenderingContext2D, fontSize = 14) {
  ctx.font = `${fontSize}px 微软雅黑`
}
