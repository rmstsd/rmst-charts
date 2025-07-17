import { cloneDeep } from 'es-toolkit'
import { applyToPoint, applyToPoints, compose, identity, Matrix, scale } from 'transformation-matrix'

export function toStageCoord(rect) {
  const tl = { x: rect.x, y: rect.y }
  const tr = { x: rect.x + rect.width, y: rect.y }
  const br = { x: rect.x + rect.width, y: rect.y + rect.height }
  const bl = { x: rect.x, y: rect.y + rect.height }

  const [tlCoord, trCoord, brCoord, blCoord] = applyToPoints(rect.mt, [tl, tr, br, bl])

  return { tl: tlCoord, tr: trCoord, br: brCoord, bl: blCoord }
}

export function mergeBox(rects) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const item of rects) {
    minX = Math.min(minX, item.tl.x, item.tr.x, item.br.x, item.bl.x)
    minY = Math.min(minY, item.tl.y, item.tr.y, item.br.y, item.bl.y)

    maxX = Math.max(maxX, item.tl.x, item.tr.x, item.br.x, item.bl.x)
    maxY = Math.max(maxY, item.tl.y, item.tr.y, item.br.y, item.bl.y)
  }

  return { minX, minY, maxX, maxY }
}

interface ITransformRect {
  id?: string
  x?: number
  y?: number
  width: number
  height: number
  mt: Matrix

  fill?: string
  stroke?: string
}

/**
 * 重新计算 width、height 和 transform
 * 确保 transform 后的 size 和 transform 前的 size 相同
 */
export const recomputeTransformRect = (rect: ITransformRect): ITransformRect => {
  const newSize = getTransformedSize(rect)

  const scaleX = newSize.width ? rect.width / newSize.width : 1
  const scaleY = newSize.height ? rect.height / newSize.height : 1

  const scaleMatrix = scale(scaleX, scaleY)

  const tf = compose(rect.mt, scaleMatrix)

  return {
    //  ...rect,
    width: newSize.width,
    height: newSize.height,
    mt: tf
  }
}

const distance = (p1: IPoint, p2: IPoint) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

const getTransformedSize = (rect: ITransformRect): ISize => {
  const tf = cloneDeep(rect.mt)
  tf.e = 0
  tf.f = 0

  const rightTop = applyToPoint(tf, { x: rect.width, y: 0 })
  const leftBottom = applyToPoint(tf, { x: 0, y: rect.height })
  const zero = { x: 0, y: 0 }
  return {
    width: distance(rightTop, zero),
    height: distance(leftBottom, zero)
  }
}
