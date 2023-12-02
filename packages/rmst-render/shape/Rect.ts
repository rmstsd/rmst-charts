import AbstractUi, { AbstractUiData } from './AbstractUi'

export const defaultRectData = {
  cornerRadius: 0,
  lineWidth: 1
}

export interface RectData extends AbstractUiData {
  x: number
  y: number
  width: number
  height: number
  cornerRadius?: number
}

export class Rect extends AbstractUi {
  constructor(data: RectData) {
    super()

    this.data = { ...defaultRectData, ...data }
  }

  declare data: RectData

  draw(ctx: CanvasRenderingContext2D) {
    this.path2D = drawRect(ctx, this.data)
  }
}

export default Rect

// 使用 二次贝塞尔曲线绘制圆角矩形
// ctx.beginPath()
// ctx.strokeStyle = 'blue'
// ctx.moveTo(x + radius, y)
// ctx.lineTo(x + width - radius, y)
// ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
// ctx.lineTo(x + width, y + height - radius)
// ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
// ctx.lineTo(x + radius, y + height)
// ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
// ctx.lineTo(x, y + radius)
// ctx.quadraticCurveTo(x, y, x + radius, y)
// ctx.stroke()

export function drawRect(ctx: CanvasRenderingContext2D, data) {
  const { x, y, width, height, cornerRadius, strokeStyle, fillStyle, lineWidth } = data

  ctx.fillStyle = fillStyle
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth

  ctx.beginPath()
  const path2D = new Path2D()
  path2D.moveTo(x + cornerRadius, y)
  path2D.lineTo(x + width - cornerRadius, y)
  path2D.arc(x + width - cornerRadius, y + cornerRadius, cornerRadius, (Math.PI / 2) * 3, 0)
  path2D.lineTo(x + width, y + height - cornerRadius)
  path2D.arc(x + width - cornerRadius, y + height - cornerRadius, cornerRadius, 0, Math.PI / 2)
  path2D.lineTo(x + cornerRadius, y + height)
  path2D.arc(x + cornerRadius, y + height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI)
  path2D.lineTo(x, y + cornerRadius)
  path2D.arc(x + cornerRadius, y + cornerRadius, cornerRadius, Math.PI, (Math.PI / 2) * 3)

  if (fillStyle) {
    ctx.fill(path2D)
  }
  if (strokeStyle) {
    ctx.stroke(path2D)
  }

  return path2D
}
