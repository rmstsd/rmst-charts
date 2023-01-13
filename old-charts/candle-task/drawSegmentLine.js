// @ts-check

// 绘制线段
export default function drawSegmentLine(ctx, start, end, strokeStyle = '#aaa', lineWidth = 1) {
  const [x1, y1] = start
  const [x2, y2] = end
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.stroke()
}
