export function randomColor() {
  const r = Math.round(255 * Math.random())
  const g = Math.round(255 * Math.random())
  const b = Math.round(255 * Math.random())

  return `rgb(${r}, ${g}, ${b})`
}

export const isProd = import.meta.env.PROD
