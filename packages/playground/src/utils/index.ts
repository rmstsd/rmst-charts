export function randomColor() {
  const r = Math.round(255 * Math.random())
  const g = Math.round(255 * Math.random())
  const b = Math.round(255 * Math.random())

  return `rgb(${r}, ${g}, ${b})`
}

export function randomCircleX(canvasSizeWidth, maxRadius: number) {
  return maxRadius + Math.random() * (canvasSizeWidth - maxRadius * 2)
}

export function randomCircleY(canvasSizeHeight, maxRadius: number) {
  return maxRadius + Math.random() * (canvasSizeHeight - maxRadius * 2)
}

export const isProd = import.meta.env.PROD
export const isDev = import.meta.env.DEV

export function sleep(ms: number) {
  let t = Date.now()
  while (Date.now() - t < ms) {}
}
