// 直线相关的工具函数

import { convertToNormalPoints, pointToFlatArray } from '.'
import { ICoord } from '../../type'

// 计算斜率 y = kx + b 中的 k
export function calcK(p1: ICoord, p2: ICoord) {
  return (p1.y - p2.y) / (p1.x - p2.x)
}

// 计算 y = kx + b 中的 b
export function calcB(k: number, p: ICoord) {
  return p.y - k * p.x
}

export function calcTotalLineLength(points: ICoord[]) {
  const lines = points.reduce((acc, item, index) => {
    if (index === 0) {
      return acc
    }

    const lineItem = { start: points[index - 1], end: item }

    return acc.concat(lineItem)
  }, [])

  const lineLengths = []

  const totalLineLength = lines.reduce((acc, item) => {
    const lengthItem = calcLineLength(item.start, item.end)

    lineLengths.push(lengthItem)

    return acc + lengthItem
  }, 0)

  return { totalLineLength, lines, lineLengths }
}

export function calcLineLength(p1: ICoord, p2: ICoord) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

// 折线 -非曲线
function calcPointsByPercent(points: number[], percent: number) {
  const normalPoints = convertToNormalPoints(points)
  const { totalLineLength, lines, lineLengths } = calcTotalLineLength(normalPoints)
  const elapsedLength = totalLineLength * percent

  let currIndex = 0
  let tempLength = 0
  for (let i = 0; i < lineLengths.length; i++) {
    tempLength += lineLengths[i]
    if (tempLength >= elapsedLength) {
      currIndex = i
      break
    }
  }

  const lastOnePoint = (() => {
    const currLine = lines[currIndex]

    const currLineElapsedLength = elapsedLength - lineLengths.slice(0, currIndex).reduce((acc, item) => acc + item, 0)

    const ratio = currLineElapsedLength / lineLengths[currIndex]

    // currLineElapsedLength / lineLengths[currIndex] = x - x1 /  x2 - x1

    const x = ratio * (currLine.end.x - currLine.start.x) + currLine.start.x
    const y = ratio * (currLine.end.y - currLine.start.y) + currLine.start.y

    return { x, y }
  })()

  const _points = normalPoints.slice(0, currIndex + 1).concat(lastOnePoint)
  const pts = pointToFlatArray(_points)

  return pts
}

export function calcStraightPath2D(points: number[], percent) {
  const path2D = new Path2D()

  const pts = calcPointsByPercent(points, percent)

  const [start_x, start_y, ...restPoints] = pts
  const restNormalPoints = convertToNormalPoints(restPoints)
  path2D.moveTo(start_x, start_y)

  restNormalPoints.forEach(({ x, y }) => {
    path2D.lineTo(x, y)
  })

  return path2D
}
