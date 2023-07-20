// 测量文本宽高
export function measureText(ctx: CanvasRenderingContext2D, text: string) {
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width: textWidth } = ctx.measureText(text)

  // qq 浏览器只返回了 `width`
  const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent || parseInt(ctx.font)

  return { textWidth, textHeight }
}

export function setCtxFontSize(ctx: CanvasRenderingContext2D, fontSize: number = 14) {
  ctx.font = `${fontSize}px 微软雅黑`
}
