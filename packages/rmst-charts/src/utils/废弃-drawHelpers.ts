import { tickColor } from '../constant.js'

// 绘制线段
function drawSegmentLine(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  strokeStyle = tickColor,
  lineWidth = 1
) {
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

// 绘制圆
export function drawArc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius = 3,
  strokeStyle = 'purple',
  lineWidth = 1
) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.stroke()
}

// 绘制圆角矩形
function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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

// 绘制虚线
function drawDashLine(ctx: CanvasRenderingContext2D, start, end, strokeStyle = '#aaa') {
  ctx.setLineDash([4])
  drawSegmentLine(ctx, start, end, strokeStyle)
  ctx.setLineDash([])
}
