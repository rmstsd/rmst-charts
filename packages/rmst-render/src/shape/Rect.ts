import AbstractUi, { AbstractUiData } from './AbstractUi'

export const defaultRectData = {
  cornerRadius: 0,
  lineWidth: 1
}

export interface RectData extends AbstractUiData {
  x?: number
  y?: number
  width?: number
  height?: number
  cornerRadius?: number
}

export class Rect extends AbstractUi<RectData> {
  constructor(data: RectData) {
    super('Rect', data, defaultRectData)
  }

  declare data: RectData
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
