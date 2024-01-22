// @ts-check
import drawSegmentLine from './drawSegmentLine.js'
import measureText from './measureText.js'

/**
 * @param {CanvasRenderingContext2D} ctx
 */
export default function drawAssistLine(ctx, { horizontal, vertical }, strokeStyle) {
  ctx.setLineDash([4])
  drawSegmentLine(ctx, horizontal.start, horizontal.end, strokeStyle)
  drawSegmentLine(ctx, vertical.start, vertical.end, strokeStyle)
  ctx.setLineDash([])

  drawRealTimeTickValue(ctx, horizontal)
}

// 绘制实时刻度
function drawRealTimeTickValue(ctx, horizontal) {
  let [x, y] = horizontal.start
  const { textWidth, textHeight } = measureText(ctx, horizontal.text)

  const padding = 10
  const rect_height = textHeight + padding

  const rect_y = y - rect_height / 2

  x += 100
  ctx.fillStyle = '#eee'
  fillRoundRect(ctx, x, rect_y, textWidth + padding, rect_height, 5)

  ctx.fillStyle = '#444'
  ctx.fillText(horizontal.text, x + padding / 2, rect_y + textHeight + padding / 2)
}

// 绘制圆角矩形
function fillRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arc(x + width - radius, y + radius, radius, (Math.PI / 2) * 3, 0)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2)
  ctx.lineTo(x + radius, y + height)
  ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y + radius)
  ctx.arc(x + radius, y + radius, radius, Math.PI, (Math.PI / 2) * 3)
  ctx.fill()
}
