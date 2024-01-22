// import { Line } from '../shape'
import { ICoord } from '../type'

export function createLinePath2D(data) {
  let path2D: Path2D
  const { points, closed, smooth, percent } = data

  if (smooth) {
    path2D = calcSmoothPath2D(points)
  } else {
    path2D = new Path2D()

    const pts = calcPointsByPercent(points, percent)

    const [start_x, start_y, ...restPoints] = pts
    const restNormalPoints = convertToNormalPoints(restPoints)
    path2D.moveTo(start_x, start_y)

    restNormalPoints.forEach(({ x, y }) => {
      path2D.lineTo(x, y)
    })
  }

  if (closed) {
    path2D.closePath()
  }

  return path2D
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

export function calcSmoothPath2D(points: number[]) {
  const [start_x, start_y, ...restPoints] = points
  const allControlPoint = calcAllControlPoint(convertToNormalPoints(points))

  const path2D = new Path2D()
  path2D.moveTo(start_x, start_y)
  allControlPoint.forEach(item => {
    path2D.bezierCurveTo(item.cp1.x, item.cp1.y, item.cp2.x, item.cp2.y, item.end.x, item.end.y)
  })

  return path2D
}

// --
export function pointToFlatArray(list: { x: number; y: number }[]) {
  return list.reduce((acc, item) => acc.concat(item.x, item.y), [])
}

export function convertToNormalPoints(points: number[]): ICoord[] {
  return points
    .reduce((acc, item, index) => {
      const tarIndex = Math.floor(index / 2)
      if (index % 2 == 0) acc.push([item])
      else acc[tarIndex].push(item)
      return acc
    }, [])
    .map(([x, y]) => ({ x, y }))
}
// --

// 计算 两个控制点 和 两个端点
export function calcAllControlPoint(
  points: ICoord[],
  ver?: 'new' | 'old'
): { start: ICoord; end: ICoord; cp1: ICoord; cp2: ICoord }[] {
  const cpArray = [] // 所有的控制点

  for (let i = 1; i < points.length - 1; i++) {
    // 以三个点为基准
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    // 与第一个点和第三个点的连线平行的线, 且与第二个点相交
    const k = (next.y - prev.y) / (next.x - prev.x) // 直线的斜率
    const b = curr.y - k * curr.x // 经过中间点的 y = kx + b

    let { cp1_x, cp2_x, distance } = ver === 'old' ? oldVersion() : newVersion()
    // let { cp1_x, cp2_x, distance } = newVersion()

    let cp1_y = k * cp1_x + b
    let cp2_y = k * cp2_x + b

    function newVersion() {
      const distance = (next.x - curr.x) / 3
      const cp1_x = curr.x - distance
      const cp2_x = curr.x + distance

      const distance_2half = (next.x - curr.x) / 2

      return { cp1_x, cp2_x, distance: distance_2half }
    }

    // 旧版本 实在想不起来当初是怎么整出来 一元二次方程式的
    function oldVersion() {
      const distance = (next.x - curr.x) / 2
      const pow2 = (num: number) => Math.pow(num, 2) // 平方: Math.pow(3, 2) = 3 * 3 = 9

      const four_ac = 4 * (pow2(k) + 1) * (pow2(curr.x) - 2 * curr.y * b + pow2(curr.y) + pow2(b) - distance ** 2) // 4ac
      const det = Math.sqrt(pow2(2 * k * b - 2 * curr.x - 2 * curr.y * k) - four_ac) // 根号下(b方 - 4ac)
      const fb = -(2 * k * b - 2 * curr.x - 2 * curr.y * k) // -b
      const two_a = 2 * (pow2(k) + 1) // 2a

      let cp1_x = (fb - det) / two_a
      let cp2_x = (fb + det) / two_a

      return { cp1_x, cp2_x, distance }
    }

    // 如果是峰值 直接拉平, 控制点的 x坐标取两个点的中间值
    if ((curr.y >= prev.y && curr.y >= next.y) || (curr.y <= prev.y && curr.y <= next.y)) {
      cp1_x = curr.x - distance
      cp1_y = curr.y

      cp2_x = curr.x + distance
      cp2_y = curr.y
    }

    cpArray.push({ x: cp1_x, y: cp1_y }, { x: cp2_x, y: cp2_y })
  }

  cpArray.unshift(points[0])
  cpArray.push(points.at(-1))

  return calcFinalPoint(cpArray, points)

  function calcFinalPoint(allControlPoint, points) {
    const ans = []
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]
      const end = points[i + 1]

      const cp1 = allControlPoint[i * 2]
      const cp2 = allControlPoint[i * 2 + 1]

      ans.push({ start, end, cp1, cp2 })
    }
    return ans
  }
}

export function calcTotalLineLength(points: { x: number; y: number }[]) {
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

// 计算斜率 y = kx + b 中的 k
export function calcK(p1: ICoord, p2: ICoord) {
  return (p1.y - p2.y) / (p1.x - p2.x)
}

// 计算 y = kx + b 中的 b
export function calcB(k: number, p: ICoord) {
  return p.y - k * p.x
}
