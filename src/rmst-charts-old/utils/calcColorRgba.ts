export const calcColorRgba = (curr: number, initColor: string, finishColor: string) => {
  const canvas = document.createElement('canvas')
  const width = 1
  const height = 256

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, initColor)
  grad.addColorStop(1, finishColor)

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)
  const { data } = ctx.getImageData(0, curr, 1, 1)
  const [r, g, b, a] = data

  const rgba = `rgba(${r}, ${g}, ${b}, ${a / 255})`

  return { height, rgba }
}
