import Path from './Path'

const defaultData = {
  startAngle: 0,
  endAngle: 360,
  shadowColor: '#333'
}

export class Circle extends Path {
  constructor(data: Circle['data']) {
    super()

    this.data = { ...defaultData, ...data }
  }

  declare data: {
    x: number
    y: number
    radius: number
    bgColor: string
    startAngle?: number // 圆弧 饼图 角度 60 180 360
    endAngle?: number // 圆弧 饼图
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, radius, bgColor, startAngle, endAngle } = this.data

    // 传入角度 返回 弧度
    const radian = (angle: number) => (Math.PI * angle) / 180

    this.setShadow(ctx, this.data)

    ctx.beginPath()
    ctx.arc(x, y, radius, radian(startAngle), radian(endAngle))
    ctx.lineTo(x, y)
    ctx.fillStyle = bgColor
    ctx.fill()
  }

  isInner(offsetX: number, offsetY: number) {
    const { x, y, radius, startAngle, endAngle } = this.data

    const distance = Math.sqrt((offsetX - x) ** 2 + (offsetY - y) ** 2)
    const isRadiusInner = distance <= radius

    if (!isRadiusInner) return false

    // 如果正好在圆心, 认为在扇形内, 或者在圆内
    if (offsetX === this.data.x && offsetY === this.data.y) return true

    const angle = this.calcAngle(offsetX, offsetY) - startAngle

    if (angle >= 0 && angle <= endAngle - startAngle) {
      return true
    }

    return false
  }

  calcAngle(offsetX: number, offsetY: number) {
    const sinOfAngleX = Math.abs((offsetY - this.data.y) / (offsetX - this.data.x))

    const angle = Math.round((Math.atan(sinOfAngleX) * 180) / Math.PI)

    // 第四象限
    if (offsetX >= this.data.x && offsetY >= this.data.y) {
      return angle
    }

    // 第三象限
    if (offsetX <= this.data.x && offsetY >= this.data.y) {
      return 180 - angle
    }
    // 第二象限
    if (offsetX <= this.data.x && offsetY <= this.data.y) {
      return 180 + angle
    }
    // 第一象限
    if (offsetX >= this.data.x && offsetY <= this.data.y) {
      return 360 - angle
    }
  }
}

export default Circle
