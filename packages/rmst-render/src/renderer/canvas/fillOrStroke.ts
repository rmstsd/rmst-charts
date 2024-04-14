import { AbstractUi } from '../../shape'
import { IShape } from '../../type'
import { deg2rad } from '../../utils'

export function fillOrStroke(ctx: CanvasRenderingContext2D, elementItem) {
  if (elementItem.data.fillStyle) {
    ctx.fill(elementItem.path2D)
  }
  if (hasStroke(elementItem.data.lineWidth, elementItem.data.strokeStyle)) {
    ctx.stroke(elementItem.path2D)
  }
}

export function hasStroke(lineWidth: number, strokeStyle: CanvasFillStrokeStyles['strokeStyle']) {
  return lineWidth > 0 && lineWidth !== Infinity && strokeStyle
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

export function setCtxMatrix(ctx: CanvasRenderingContext2D, elementItem: AbstractUi) {
  const sb = elementItem.getBoundingRect()

  if (sb) {
    const { data } = elementItem
    if (data.rotate != null) {
      ctx.translate(sb.x, sb.y)
      ctx.rotate(deg2rad(data.rotate))
      ctx.translate(-sb.x, -sb.y)
    }
  }
}
