import { scale, rotate, translate, compose, applyToPoint, transform } from 'transformation-matrix'

import { BoxHidden, Circle, Ellipse, Group, Line, Path, Text, Trapezoid } from '../../shape'
import { clipRect, createLinePath2D, setCtxFontSize } from '../../utils'
import { Stage } from '../../_stage'
import { IShape } from '../../type'
import { fillOrStroke, hasStroke, setCtxStyleProp } from './fillOrStroke'
import { setCirclePath2D, setEllipsePath2D, setRectPath2D, setTrapezoidPath2D } from './setPath2D'
import { sortChildren } from './util'

export function drawStage(stage: Stage) {
  const { ctx, camera } = stage
  ctx.clearRect(0, 0, stage.canvasSize.width * stage.dpr, stage.canvasSize.height * stage.dpr)

  ctx.save()

  const matrix = compose(translate(camera.tx, camera.ty), scale(camera.zoom, camera.zoom))
  ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)

  // ctx.translate(camera.tx, camera.ty)
  // ctx.scale(camera.zoom, camera.zoom)

  drawChildren(stage.children)

  ctx.restore()

  function drawChildren(list: IShape[]) {
    sortChildren(list).forEach(elementItem => {
      const { data } = elementItem

      if (!data.visible) {
        return
      }

      ctx.beginPath()

      ctx.save()

      setCtxStyleProp(ctx, elementItem)
      const mt = data.mt
      ctx.transform(mt.a, mt.b, mt.c, mt.d, mt.e, mt.f)

      switch (elementItem.type) {
        case 'Circle': {
          setCirclePath2D(elementItem as Circle)
          fillOrStroke(ctx, elementItem)
          break
        }
        case 'Ellipse': {
          setEllipsePath2D(elementItem as Ellipse)
          fillOrStroke(ctx, elementItem)
          break
        }
        case 'Path': {
          elementItem.path2D = new Path2D((elementItem as Path).data.d)
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
          let { x, y, content, fontSize, textAlign = 'left', textBaseline } = data as Text['data']

          x = 0
          y = 0

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
