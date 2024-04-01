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
