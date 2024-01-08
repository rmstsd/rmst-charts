import AbstractUi, { AbstractUiData } from './AbstractUi'

const defaultData = {
  fillStyle: '#333',
  fontSize: 14,
  textAlign: 'left' as CanvasTextAlign
}

interface TextData extends AbstractUiData {
  x: number
  y: number
  content: string
  fontSize?: number
  textAlign?: CanvasTextAlign
}

export class Text extends AbstractUi<TextData> {
  constructor(data: TextData) {
    super('Text', data, defaultData)
  }

  declare data: TextData

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx)

    const { x, y, content, fillStyle, fontSize, textAlign = 'left' } = this.data

    setCtxFontSize(ctx, fontSize)

    ctx.fillStyle = fillStyle

    ctx.textAlign = textAlign
    ctx.fillText(content, x, y)
  }
}

export default Text

// 测量文本宽高
let ctx: CanvasRenderingContext2D
export function measureText(text: string, fontSize: number) {
  if (!ctx) {
    ctx = document.createElement('canvas').getContext('2d')
  }

  setCtxFontSize(ctx, fontSize)
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width: textWidth } = ctx.measureText(text)

  // qq 浏览器只返回了 `width`
  const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent || parseInt(ctx.font)

  return { textWidth, textHeight }
}

export function setCtxFontSize(ctx: CanvasRenderingContext2D, fontSize = 14) {
  ctx.font = `${fontSize}px 微软雅黑`
}
