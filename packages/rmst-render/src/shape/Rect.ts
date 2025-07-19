import { IShapeType } from '../type'
import UiBase, { UiBaseData } from './UiBase'

export const defaultRectData = {
  cornerRadius: 0,
  lineWidth: 1
}

export interface RectData extends UiBaseData {
  cornerRadius?: number
  padding?: number
}

export class Rect extends UiBase<RectData> {
  constructor(data: RectData) {
    super(data, defaultRectData)
  }

  type: IShapeType = 'Rect'

  declare data: RectData

  getBBox() {
    const data = this.data

    return { x: 0, y: 0, width: data.width, height: data.height }
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
