import { Circle, Rect, Trapezoid } from '../../shape'
import { getPointOnArc } from '../../utils'

export function setTrapezoidPath2D(elementItem: Trapezoid) {
  const { x, y, width, height, shortLength } = elementItem.data

  const path2D = new Path2D()

  let _shortLength: number

  if (typeof shortLength === 'number') {
    _shortLength = shortLength
  } else if (typeof shortLength === 'string') {
    _shortLength = (parseFloat(shortLength) / 100) * width
  }

  path2D.moveTo(x + (width / 2 - _shortLength / 2), y)
  path2D.lineTo(x + (width / 2 - _shortLength / 2) + _shortLength, y)
  path2D.lineTo(x + width, y + height)
  path2D.lineTo(x, y + height)

  path2D.closePath()

  elementItem.path2D = path2D
}

export function setRectPath2D(elementItem: Rect) {
  elementItem.path2D = createRectPath2D(elementItem.data)
}

export function createRectPath2D(data) {
  const { x, y, width, height, cornerRadius = 0 } = data

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
  path2D.closePath()

  return path2D
}

export function setCirclePath2D(elementItem: Circle) {
  const { x, y, radius, innerRadius, startAngle, endAngle, offsetAngle } = elementItem.data
  const isWholeArc = startAngle === 0 && endAngle === 360 // 是否是整圆

  const d = innerRadius
    ? calcRingD(radius, innerRadius, startAngle, endAngle, x, y, isWholeArc)
    : calcD(radius, startAngle, endAngle, x, y, isWholeArc, offsetAngle)

  elementItem.path2D = new Path2D(d)
}

// 圆形/扇形 返回 path 的 d属性 返回的是 圆弧  -起始角度遵循数学上的平面直角坐标系
const calcD = (
  radius: number,
  startAngle: number,
  endAngle: number,
  centerX: number,
  centerY: number,
  isWholeArc: boolean,
  offsetAngle: number
) => {
  startAngle = startAngle + offsetAngle
  endAngle = endAngle + offsetAngle

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

  const d = isWholeArc
    ? `M${centerX},${M_y} A${radius},${radius} 0 1 1, ${centerX - 0.01},${centerY - radius}Z`
    : `M${centerX},${centerY} L${startX},${startY} A${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${endX},${endY} Z`

  return d
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
