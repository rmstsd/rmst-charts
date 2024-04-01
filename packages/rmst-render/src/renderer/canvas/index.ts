import { Circle, Line, Text, Trapezoid } from '../../shape'
import { clipRect, createLinePath2D, deg2rad, setCtxFontSize } from '../../utils'
import { Stage } from '../../_stage'
import { IShape } from '../../type'
import { fillOrStroke, hasStroke } from './fillOrStroke'
import { setCirclePath2D, setRectPath2D, setTrapezoidPath2D } from './setPath2D'

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
  const { ctx } = stage
  ctx.clearRect(0, 0, stage.canvasElement.width, stage.canvasElement.height)

  drawSs(stage.children)

  function drawSs(list: IShape[]) {
    list = sortChildren(list)

    list.forEach(elementItem => {
      const { data } = elementItem

      ctx.beginPath()

      setCtxStyleProp(ctx, elementItem)

      switch (elementItem.type) {
        case 'Circle': {
          setCirclePath2D(elementItem as Circle)
          fillOrStroke(ctx, elementItem)
          break
        }
        case 'Trapezoid': {
          setTrapezoidPath2D(elementItem as Trapezoid)
          fillOrStroke(ctx, elementItem)
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
          setRectPath2D(elementItem)
          fillOrStroke(ctx, elementItem)

          break
        }
        case 'Group': {
          drawSs(elementItem.children)
          break
        }
        case 'BoxHidden': {
          setRectPath2D(elementItem)

          clipRect(ctx, elementItem.path2D, () => {
            fillOrStroke(ctx, elementItem)
            drawSs(elementItem.children)
          })

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

        default:
          console.log(elementItem.type, '该图形 暂未实现')
          break
      }
    })
  }
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
    const a_zIndex = a.data.zIndex
    const b_zIndex = b.data.zIndex

    return a_zIndex - b_zIndex
  })
}
