import { scale, translate, compose } from 'transformation-matrix'
import { fitAndPosition } from 'object-fit-math'

import { Box, Group, RmstImage, Line, Text } from '../../shape'
import { clipRect, measureText, setCtxFontSize } from '../../utils'
import { Stage } from '../../_stage'
import { IShape } from '../../type'
import { fill, fillOrStroke, setCtxStyleProp, stroke } from './fillOrStroke'
import { sortChildren } from './util'

export function drawStage(stage: Stage) {
  const { ctx, camera, dpr } = stage

  stage.updateCanvasSize()

  ctx.clearRect(0, 0, stage.canvasElement.width * dpr, stage.canvasElement.height * dpr)

  ctx.scale(dpr, dpr)
  ctx.textBaseline = 'hanging'
  ctx.font = `${14}px 微软雅黑`

  ctx.save()

  const matrix = compose(translate(camera.tx, camera.ty), scale(camera.zoom, camera.zoom))
  ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)

  drawChildren(stage.data.children)

  ctx.restore()

  function drawChildren(list: IShape[]) {
    for (const elementItem of sortChildren(list)) {
      const { data } = elementItem

      if (!data.visible) {
        continue
      }

      ctx.beginPath()

      ctx.save()

      const mt = data.mt
      ctx.transform(mt.a, mt.b, mt.c, mt.d, mt.e, mt.f)
      setCtxStyleProp(ctx, elementItem)

      switch (elementItem.type) {
        case 'Circle': {
          fillOrStroke(ctx, elementItem)
          break
        }
        case 'Ellipse': {
          fillOrStroke(ctx, elementItem)
          break
        }
        case 'Path':
        case 'Star':
        case 'Polygon': {
          fillOrStroke(ctx, elementItem)
          break
        }
        case 'Trapezoid': {
          fillOrStroke(ctx, elementItem)
          break
        }
        case 'Line': {
          const { closed, path2D } = (elementItem as Line).data

          stroke(ctx, elementItem)
          if (closed) {
            fill(ctx, elementItem)
          }
          break
        }
        case 'Rect': {
          fillOrStroke(ctx, elementItem)
          break
        }
        case 'Group': {
          drawChildren((elementItem as Group).data.children)
          break
        }
        case 'Box': {
          // 在有描边的情况下, 必须先 fill, 再 stoke, 否则会出现内容覆盖描边的问题
          fill(ctx, elementItem)

          clipRect(ctx, elementItem.path2D, () => {
            drawChildren((elementItem as Box).data.children)
          })
          stroke(ctx, elementItem)

          break
        }
        case 'Image': {
          const rrImageElementItem = elementItem as RmstImage
          let { width, height, cornerRadius, src, objectFit } = rrImageElementItem.data

          if (rrImageElementItem.nativeImage) {
            const image = rrImageElementItem.nativeImage
            fill(ctx, rrImageElementItem)
            clipRect(ctx, rrImageElementItem.path2D, () => {
              const rect = fitAndPosition(
                { width, height },
                { width: image.naturalWidth, height: image.naturalHeight },
                objectFit
              )

              ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, rect.x, rect.y, rect.width, rect.height)
            })
            stroke(ctx, rrImageElementItem)
          }

          break
        }
        case 'Text': {
          const textElementItem = elementItem as Text
          let { content, fontSize, textAlign = 'left', textBaseline, boxData } = data as Text['data']

          const textSize = measureText(content, fontSize)

          const padding = boxData?.padding ?? 0

          let x = 0
          if (textAlign === 'center') {
            x = -textSize.textWidth / 2
          } else if (textAlign === 'right') {
            x = -textSize.textWidth
          }

          if (boxData?.fillStyle) {
            ctx.fillStyle = boxData.fillStyle
            ctx.fill(textElementItem.path2D)
          }

          setCtxStyleProp(ctx, textElementItem)
          clipRect(ctx, textElementItem.path2D, () => {
            setCtxFontSize(ctx, fontSize)

            ctx.textBaseline = textBaseline
            ctx.fillText(content, x + padding, padding)
          })

          stroke(ctx, textElementItem)

          break
        }

        default:
          console.log(elementItem.type, '该图形 暂未实现')
          break
      }

      ctx.restore()
    }
  }
}
