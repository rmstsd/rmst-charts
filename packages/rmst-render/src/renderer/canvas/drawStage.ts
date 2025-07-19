import { scale, translate, compose } from 'transformation-matrix'
import { fitAndPosition } from 'object-fit-math'

import { Box, Circle, Ellipse, Group, RmstImage, Line, Path, Text, Trapezoid } from '../../shape'
import { clipRect, createLinePath2D, setCtxFontSize } from '../../utils'
import { Stage } from '../../_stage'
import { IShape } from '../../type'
import { fill, fillOrStroke, setCtxStyleProp, stroke } from './fillOrStroke'
import { createRectPath2D, setCirclePath2D, setEllipsePath2D, setRectPath2D, setTrapezoidPath2D } from './setPath2D'
import { sortChildren } from './util'
import { isNil } from 'es-toolkit'

export function drawStage(stage: Stage) {
  const { ctx, camera, dpr, container, canvasElement } = stage
  const setCanvasStyle = () => {
    const { clientWidth, clientHeight } = container

    const canvasWidth = clientWidth * dpr
    const canvasHeight = clientHeight * dpr

    canvasElement.width = canvasWidth
    canvasElement.height = canvasHeight

    canvasElement.style.position = 'absolute'
    canvasElement.style.inset = '0'
    canvasElement.style.width = `${clientWidth}px`
    canvasElement.style.height = `${clientHeight}px`

    ctx.scale(dpr, dpr)
    ctx.textBaseline = 'hanging'
    ctx.font = `${14}px 微软雅黑`
  }

  setCanvasStyle()

  ctx.clearRect(0, 0, stage.canvasSize.width * stage.dpr, stage.canvasSize.height * stage.dpr)

  ctx.save()

  const matrix = compose(translate(camera.tx, camera.ty), scale(camera.zoom, camera.zoom))
  ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)

  // ctx.translate(camera.tx, camera.ty)
  // ctx.scale(camera.zoom, camera.zoom)

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
          const { closed, path2D } = (elementItem as Line).data

          // 调用 attr() 方法后,  需重新计算 path2D, 且一定会有 bug, 需要优化
          elementItem.path2D = path2D ? path2D : createLinePath2D(data)

          stroke(ctx, elementItem)
          if (closed) {
            fill(ctx, elementItem)
          }
          break
        }
        case 'Rect': {
          setRectPath2D(elementItem)
          fillOrStroke(ctx, elementItem)
          break
        }
        case 'Group': {
          drawChildren((elementItem as Group).data.children)
          break
        }
        case 'Box': {
          // 在有描边的情况下, 必须先 fill, 再 stoke, 否则会出现内容覆盖描边的问题
          setRectPath2D(elementItem)
          fill(ctx, elementItem)

          clipRect(ctx, elementItem.path2D, () => {
            drawChildren((elementItem as Box).data.children)
          })
          stroke(ctx, elementItem)

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
        case 'Image': {
          const rrImageElementItem = elementItem as RmstImage
          let { width, height, cornerRadius, src, objectFit } = rrImageElementItem.data

          if (rrImageElementItem.nativeImage && rrImageElementItem.oldSrc === src) {
            const image = rrImageElementItem.nativeImage
            const ratio = image.naturalWidth / image.naturalHeight

            if (width && isNil(height)) {
              height = width / ratio
            } else if (height && isNil(width)) {
              width = height * ratio
            }

            rrImageElementItem.path2D = createRectPath2D({ x: 0, y: 0, width, height, cornerRadius })
            fill(ctx, rrImageElementItem)

            clipRect(ctx, rrImageElementItem.path2D, () => {
              const rect = fitAndPosition(
                { width, height },
                { width: image.naturalWidth, height: image.naturalHeight },
                objectFit
              )
              ctx.drawImage(
                image,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight,
                rect.x,
                rect.y,
                rect.width,
                rect.height
              )
            })

            stroke(ctx, rrImageElementItem)
          } else {
            rrImageElementItem.oldSrc = src

            const image = new Image()
            image.src = src

            image.onload = () => {
              rrImageElementItem.nativeImage = image
              drawStage(stage)
            }
          }

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
