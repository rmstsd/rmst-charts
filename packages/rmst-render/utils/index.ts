export * from './isShape'
export * from './lineUtil'

export * from './math'

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
