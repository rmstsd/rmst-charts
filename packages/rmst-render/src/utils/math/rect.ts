// 根据两个点的坐标, 返回矩形的 x  ,y , width, height
export function getRectByTwoPoint(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const x = Math.min(p1.x, p2.x)
  const y = Math.min(p1.y, p2.y)
  const width = Math.abs(p1.x - p2.x)
  const height = Math.abs(p1.y - p2.y)
  return { x, y, width, height }
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
