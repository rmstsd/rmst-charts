import { Circle, Line, Rect, Text, Trapezoid } from '../../shape'
import { clipRect, createLinePath2D, getPointOnArc, setCtxFontSize } from '../../utils'
import { Stage } from '../../_stage'
import { IShape } from '../../type'
import { matrixMap } from '../../constant'

// {
//   const svgHtml = `
//     <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full"
//    width="1125" height="750" style="width: 750px; height: 500px; left:0; top:0; user-select:none">
//       <path d="${d}" fill="none" stroke="#E0E6F1"></path>
//     </svg>
//   `

//   document.querySelector('.canvas-container').insertAdjacentHTML('beforeend', svgHtml)
// }

export function drawStageShapes(stage: Stage) {
  sortByZIndex(stage)

  const { ctx } = stage

  ctx.clearRect(0, 0, stage.canvasElement.width, stage.canvasElement.height)

  drawSs(stage.children)

  function drawSs(list: IShape[]) {
    list.forEach(elementItem => {
      const { data } = elementItem

      ctx.beginPath()

      setCtxStyleProp(ctx, elementItem)

      switch (elementItem.type) {
        case 'Circle': {
          drawCircle(ctx, elementItem as Circle)
          break
        }
        case 'Trapezoid': {
          elementItem.path2D = createTrapezoidPath2D(elementItem.data)

          if (data.fillStyle) {
            ctx.fill(elementItem.path2D)
          }
          if (hasStroke(data.lineWidth, data.strokeStyle)) {
            ctx.stroke(elementItem.path2D)
          }

          break
        }
        case 'Line': {
          const { closed, path2D } = data as Line['data']

          // 调用 attr() 方法后,  需重新计算 path2D, 且一定会有 bug, 需要优化
          elementItem.path2D = path2D ? path2D : createLinePath2D(data)

          if (hasStroke(data.lineWidth, data.strokeStyle)) {
            ctx.stroke(elementItem.path2D)
          }

          if (closed) {
            ctx.fill(elementItem.path2D)
          }
          break
        }
        case 'Rect': {
          elementItem.path2D = createRectPath2D(data)

          if (data.fillStyle) {
            ctx.fill(elementItem.path2D)
          }
          if (hasStroke(data.lineWidth, data.strokeStyle)) {
            ctx.stroke(elementItem.path2D)
          }

          break
        }
        case 'Text': {
          const { x, y, content, fontSize, textAlign = 'left', textBaseline } = data as Text['data']

          setCtxFontSize(ctx, fontSize)

          ctx.textBaseline = textBaseline
          ctx.textAlign = textAlign
          ctx.fillText(content, x, y)
          break
        }
        case 'Group': {
          drawSs(elementItem.children)
          break
        }
        case 'BoxHidden': {
          elementItem.path2D = createRectPath2D(data)

          clipRect(ctx, elementItem.path2D, () => {
            if (elementItem.data.fillStyle) {
              ctx.fill(elementItem.path2D)
            }
            if (hasStroke(elementItem.data.lineWidth, elementItem.data.strokeStyle)) {
              ctx.stroke(elementItem.path2D)
            }

            drawSs(elementItem.children)
          })

          break
        }

        default:
          console.log(elementItem.type, '该图形 暂未实现')
          break
      }
    })
  }
}

export function drawCircle(ctx: CanvasRenderingContext2D, elementItem: Circle) {
  const { x, y, radius, innerRadius, strokeStyle, startAngle, endAngle, offsetAngle } = elementItem.data
  const isWholeArc = startAngle === 0 && endAngle === 360 // 是否是整圆

  const d = innerRadius
    ? calcRingD(radius, innerRadius, startAngle, endAngle, x, y, isWholeArc)
    : calcD(radius, startAngle, endAngle, x, y, isWholeArc, offsetAngle)

  elementItem.path2D = new Path2D(d)

  if (strokeStyle) {
    ctx.stroke(elementItem.path2D)
  }

  ctx.fill(elementItem.path2D)
}

export function setCtxStyleProp(ctx: CanvasRenderingContext2D, elementItem: IShape) {
  const { data } = elementItem
  const { lineWidth, lineCap, lineJoin, strokeStyle, fillStyle, opacity, lineDash } = data
  const { shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY } = data

  ctx.lineWidth = lineWidth
  ctx.lineCap = lineCap
  ctx.lineJoin = lineJoin

  ctx.strokeStyle = strokeStyle
  ctx.fillStyle = fillStyle

  ctx.setLineDash(lineDash)

  ctx.globalAlpha = opacity

  ctx.shadowOffsetX = shadowOffsetX
  ctx.shadowOffsetY = shadowOffsetY
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur
}

export function sortByZIndex(root) {
  if (root.children) {
    root.children = sortChildren(root.children)

    for (const item of root.children) {
      sortByZIndex(item)
    }
  }
}

function sortChildren(children: IShape[]) {
  return children.toSorted((a, b) => {
    const a_zIndex = a.data.zIndex ?? 0
    const b_zIndex = b.data.zIndex ?? 0

    return a_zIndex - b_zIndex
  })
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

export function createRectPath2D(data: Rect['data']) {
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

function createTrapezoidPath2D(data: Trapezoid['data']) {
  const { x, y, width, height, shortLength } = data

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

  return path2D
}

function hasStroke(lineWidth: number, strokeStyle: CanvasFillStrokeStyles['strokeStyle']) {
  return lineWidth > 0 && lineWidth !== Infinity && strokeStyle
}
