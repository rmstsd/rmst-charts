import { UiBase } from '../../shape'
import { IShape } from '../../type'

export function fillOrStroke(ctx: CanvasRenderingContext2D, elementItem: UiBase) {
  fill(ctx, elementItem)
  stroke(ctx, elementItem)
}

export const fill = (ctx: CanvasRenderingContext2D, elementItem: UiBase) => {
  if (elementItem.data.fillStyle) {
    ctx.fill(elementItem.path2D)
  }
}

export const stroke = (ctx: CanvasRenderingContext2D, elementItem: UiBase) => {
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
