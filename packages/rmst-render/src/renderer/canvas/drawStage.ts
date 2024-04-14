import { BoxHidden, Circle, Group, Line, Text, Trapezoid } from '../../shape'
import { clipRect, createLinePath2D, setCtxFontSize } from '../../utils'
import { Stage } from '../../_stage'
import { IShape } from '../../type'
import { fillOrStroke, hasStroke, setCtxMatrix, setCtxStyleProp } from './fillOrStroke'
import { setCirclePath2D, setRectPath2D, setTrapezoidPath2D } from './setPath2D'
import { sortChildren } from './util'

export function drawStage(stage: Stage) {
  const { ctx } = stage
  ctx.clearRect(0, 0, stage.canvasElement.width, stage.canvasElement.height)

  drawChildren(stage.children)

  function drawChildren(list: IShape[]) {
    sortChildren(list).forEach(elementItem => {
      const { data } = elementItem

      ctx.beginPath()

      ctx.save()

      setCtxStyleProp(ctx, elementItem)
      setCtxMatrix(ctx, elementItem)

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
          drawChildren((elementItem as Group).children)
          break
        }
        case 'BoxHidden': {
          setRectPath2D(elementItem)

          clipRect(ctx, elementItem.path2D, () => {
            fillOrStroke(ctx, elementItem)
            drawChildren((elementItem as BoxHidden).children)
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

      ctx.restore()
    })
  }
}
