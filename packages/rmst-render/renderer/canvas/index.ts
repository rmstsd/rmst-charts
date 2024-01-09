// 1. 此方法的 绘制 层级关系 父子关系

import { Stage } from 'rmst-render/_stage'
import { IShape } from 'rmst-render/type'
import { createPath2D, getPointOnArc, setCtxFontSize } from 'rmst-render/utils'

// 2. Circle.draw 递归
export function drawAllShape(stage: Stage) {
  sortByZIndex(stage)

  const { ctx } = stage

  ctx.clearRect(0, 0, stage.canvasElement.width, stage.canvasElement.height)

  drawSs(stage.children)

  function drawSs(list: IShape[]) {
    list.forEach(elementItem => {
      const { data } = elementItem

      setCtxStyleProp(ctx, data)

      switch (elementItem.type) {
        case 'Circle': {
          const { x, y, radius, innerRadius, strokeStyle, fillStyle, startAngle, endAngle, offsetAngle, lineWidth } =
            data
          const isWholeArc = startAngle === 0 && endAngle === 360 // 是否是整圆

          const d = innerRadius
            ? calcRingD(radius, innerRadius, startAngle, endAngle, x, y, isWholeArc)
            : calcD(radius, startAngle, endAngle, x, y, isWholeArc, offsetAngle)

          const path = new Path2D(d)
          elementItem.path2D = path

          ctx.beginPath()

          if (strokeStyle) {
            ctx.lineWidth = lineWidth
            ctx.strokeStyle = strokeStyle
            ctx.stroke(path)
          }

          ctx.fillStyle = fillStyle
          ctx.fill(path)

          break
        }
        case 'Line': {
          const { fillStyle, strokeStyle, lineWidth, lineCap, lineJoin, closed } = data

          // 调用 attr() 方法后,  需重新计算 path2D, 且一定会有 bug, 需要优化
          elementItem.path2D = data.path2D ? data.path2D : createPath2D(data)

          ctx.beginPath()
          ctx.lineCap = lineCap
          ctx.lineJoin = lineJoin

          ctx.fillStyle = fillStyle
          ctx.strokeStyle = strokeStyle

          if (lineWidth !== 0) {
            ctx.lineWidth = lineWidth
            ctx.stroke(elementItem.path2D)
          }

          if (closed) {
            ctx.fill(elementItem.path2D)
          }
          break
        }
        case 'Rect': {
          elementItem.path2D = drawRect(ctx, data)
          break
        }
        case 'Text': {
          const { x, y, content, fillStyle, fontSize, textAlign = 'left' } = data

          setCtxFontSize(ctx, fontSize)

          ctx.fillStyle = fillStyle

          ctx.textAlign = textAlign
          ctx.fillText(content, x, y)
          break
        }
        case 'Group': {
          drawSs(elementItem.children)
          break
        }
        case 'BoxHidden': {
          ctx.save()

          elementItem.path2D = drawRect(ctx, data)
          ctx.clip(elementItem.path2D)

          drawSs(elementItem.children)

          ctx.restore()
          break
        }

        default:
          break
      }
    })
  }
}

function setCtxStyleProp(ctx: CanvasRenderingContext2D, data) {
  const { shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, opacity } = data

  ctx.globalAlpha = opacity

  ctx.shadowOffsetX = shadowOffsetX
  ctx.shadowOffsetY = shadowOffsetY
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur
}

function sortByZIndex(root) {
  if (root.children) {
    root.children = root.children.toSorted((a, b) => {
      const a_zIndex = a.data.zIndex ?? 0
      const b_zIndex = b.data.zIndex ?? 0

      return a_zIndex - b_zIndex
    })

    for (const item of root.children) {
      sortByZIndex(item)
    }
  }
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
