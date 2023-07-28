import Group from '../Group'
import Path from './Path'

const defaultData = {
  cornerRadius: 0
}

export class Rect extends Path {
  constructor(data: Rect['data']) {
    super()

    this.surroundBoxCoord = {
      lt_x: data.x,
      lt_y: data.y,
      rb_x: data.x + data.width,
      rb_y: data.y + data.height
    }

    this.data = { ...defaultData, ...data }
  }

  declare data: {
    x: number
    y: number
    width: number
    height: number
    bgColor: string
    strokeStyle?: CanvasFillStrokeStyles['strokeStyle']
    cornerRadius?: number
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!(this.parent instanceof Group)) this.beforeDrawClip(ctx)

    const { x, y, width, height, bgColor, cornerRadius, strokeStyle } = this.data

    this.setShadow(ctx, this.data)

    ctx.fillStyle = bgColor
    ctx.strokeStyle = strokeStyle

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

    this.path2D = path2D
    ctx.fill(path2D)
    if (strokeStyle) {
      ctx.stroke(path2D)
    }

    if (!(this.parent instanceof Group)) ctx.restore() // 恢复clip
  }
}

export default Rect
