export const clipRect = (ctx: CanvasRenderingContext2D, path2D: Path2D, cb: () => void) => {
  ctx.save()
  ctx.clip(path2D)

  cb()

  ctx.restore()
}
