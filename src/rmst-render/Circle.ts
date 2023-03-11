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
    strokeStyle?: string
    startAngle?: number // 圆弧 饼图 角度 60 180 360
    endAngle?: number // 圆弧 饼图
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, radius, strokeStyle, bgColor, startAngle, endAngle } = this.data

    this.setShadow(ctx, this.data)

    ctx.beginPath()
    ctx.arc(x, y, radius, deg2rad(startAngle), deg2rad(endAngle))

    const isWholeArc = startAngle === 0 && endAngle === 360 // 是否是整圆
    if (!isWholeArc) {
      ctx.lineTo(x, y)

      // 获取圆弧的起始点
      const { x: start_x, y: start_y } = getPointOnArc(x, y, radius, startAngle)
      ctx.lineTo(start_x, start_y)
    }

    ctx.fillStyle = bgColor
    ctx.strokeStyle = strokeStyle

    ctx.fill()
    ctx.stroke()
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

// 获取圆弧上的点 圆心 半径 角度-60°
export function getPointOnArc(x0, y0, r, deg) {
  const alpha = deg2rad(deg)

  const x = x0 + r * Math.cos(alpha) // Math.cos 传入弧度
  const y = y0 + r * Math.sin(alpha)

  return { x, y }
}

// 角度转弧度
export function deg2rad(deg) {
  return (deg * Math.PI) / 180
}

// 弧度转角度
export function rad2deg(radian) {
  var degrees = (radian * 180) / Math.PI
  return degrees
}
