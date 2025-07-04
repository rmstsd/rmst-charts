import { scale, rotate, translate, compose, applyToPoint, transform } from 'transformation-matrix'

import { Box, Circle, Ellipse, Group, RmstImage as RrImage, Line, Path, Text, Trapezoid } from '../../shape'
import { clipRect, createLinePath2D, setCtxFontSize } from '../../utils'
import { Stage } from '../../_stage'
import { IShape } from '../../type'
import { fill, fillOrStroke, hasStroke, setCtxStyleProp, stroke } from './fillOrStroke'
import { setCirclePath2D, setEllipsePath2D, setRectPath2D, setTrapezoidPath2D } from './setPath2D'
import { sortChildren } from './util'

export function drawStage(stage: Stage) {
  console.log('--> drawStage')

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

  drawChildren(stage.children)

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
          // 在有描边的情况下, 必须先 fill, 再 stoke, 否则会出现内容覆盖描边的问题
          setRectPath2D(elementItem)
          fill(ctx, elementItem)

          clipRect(ctx, elementItem.path2D, () => {
            drawChildren((elementItem as Box).children)
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
          const rrImageElementItem = elementItem as RrImage

          let { width, height, src } = data as RrImage['data']

          const drawImage = (image: HTMLImageElement) => {
            ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, width, height)
          }

          if (rrImageElementItem.nativeImage) {
            drawImage(rrImageElementItem.nativeImage)
          } else {
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
