import Path from './Path'

const defaultData = {
  startAngle: 0,
  endAngle: 360,
  shadowColor: '#333',
  lineWidth: 1
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
    innerRadius?: number
    bgColor: string
    strokeStyle?: string
    startAngle?: number // 圆弧 饼图 角度 60 180 360
    endAngle?: number // 圆弧 饼图
    lineWidth?: number
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, radius, innerRadius, strokeStyle, bgColor, startAngle, endAngle, lineWidth } = this.data
    const isWholeArc = startAngle === 0 && endAngle === 360 // 是否是整圆

    this.setShadow(ctx, this.data)

    const d = innerRadius
      ? calcRingD(radius, innerRadius, startAngle, endAngle, x, y, isWholeArc)
      : calcD(radius, startAngle, endAngle, x, y, isWholeArc)

    const path = new Path2D(d)

    ctx.beginPath()
    // ctx.arc(x, y, radius, deg2rad(startAngle), deg2rad(endAngle))

    // ctx.strokeStyle = strokeStyle
    // ctx.fillStyle = bgColor

    // ctx.fill()
    // ctx.stroke()

    if (strokeStyle) {
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = strokeStyle
      ctx.stroke(path)
    }

    ctx.fillStyle = bgColor
    ctx.fill(path)
  }

  isInner(offsetX: number, offsetY: number) {
    const { x, y, radius, innerRadius, startAngle, endAngle } = this.data

    const distance = Math.sqrt((offsetX - x) ** 2 + (offsetY - y) ** 2)
    const isRadiusInner = innerRadius ? distance <= radius && distance >= innerRadius : distance <= radius

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

// 获取圆弧上的点 圆心 半径 角度: 60°
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

// 画一个点 测试使用
export function drawArcPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillStyle: string = 'pink'
) {
  ctx.beginPath()
  ctx.arc(x, y, 2, 0, Math.PI * 2)
  ctx.fillStyle = fillStyle
  ctx.fill()
}

// 圆形/扇形 返回 path 的 d属性 返回的是 圆弧  -起始角度遵循数学上的平面直角坐标系
const calcD = (
  radius: number,
  startAngle: number,
  endAngle: number,
  centerX: number,
  centerY: number,
  isWholeArc: boolean
) => {
  // 将角度转换为弧度
  const startAngleRad = (startAngle * Math.PI) / 180
  const endAngleRad = (endAngle * Math.PI) / 180

  // 计算圆弧的起点和终点坐标
  const startX = centerX + radius * Math.cos(startAngleRad)
  const startY = centerY + radius * Math.sin(startAngleRad)
  const endX = centerX + radius * Math.cos(endAngleRad)
  const endY = centerY + radius * Math.sin(endAngleRad)

  // 计算扇形所需的路径命令
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  const sweepFlag = 1

  const M_y = centerY - radius

  const path = isWholeArc
    ? `M${centerX},${M_y} A${radius},${radius} 0 1 1, ${centerX - 0.0001},${centerY - radius}Z`
    : `M${centerX},${centerY} L${startX},${startY} A${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${endX},${endY} Z`

  // M450 200 A226 226 0 1 1, 449.9774 200Z // echarts

  return path
}

// 圆环/扇环
const calcRingD = (
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
  centerX: number,
  centerY: number,
  isWholeArc: boolean
) => {
  return isWholeArc ? calcWholeRingD() : calcRingSectorD()

  function calcWholeRingD() {
    const outerM_y = centerY - outerRadius

    const outerM = `M ${centerX} ${outerM_y}`
    const outerA = `A ${outerRadius} ${outerRadius} 0 1 1 ${centerX - 0.01} ${outerM_y}`

    const innerM_y = centerY - innerRadius

    const innerM = `M ${centerX} ${innerM_y}`
    const innerA = `A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + 0.01} ${innerM_y}`

    return `${outerM} ${outerA} ${innerM} ${innerA} Z`
  }

  function calcRingSectorD() {
    const outerStart = getPointOnArc(centerX, centerY, outerRadius, startAngle)
    const outerEnd = getPointOnArc(centerX, centerY, outerRadius, endAngle)

    const largeArcFlag = endAngle - startAngle >= 180 ? 1 : 0

    const outerM = `M ${outerStart.x} ${outerStart.y}`
    const outerA = `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`

    const innerStart = getPointOnArc(centerX, centerY, innerRadius, startAngle)
    const innerEnd = getPointOnArc(centerX, centerY, innerRadius, endAngle)

    const moveL = `L${innerEnd.x} ${innerEnd.y}`

    const innerA = `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`

    return `${outerM} ${outerA} ${moveL} ${innerA} Z`
  }
}
