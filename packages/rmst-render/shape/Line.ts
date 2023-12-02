import { convertToNormalPoints, createPath2D } from '../utils'
import AbstractUi, { AbstractUiData } from './AbstractUi'
import { calcTotalLineLength, pointToFlatArray } from 'rmst-charts/utils/utils'

const defaultData = {
  lineWidth: 1,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin
}

interface LineData extends AbstractUiData {
  path2D?: Path2D
  points?: number[]
  bgColor?: string
  closed?: boolean
  smooth?: boolean
}

export class Line extends AbstractUi {
  constructor(data: LineData) {
    super()

    this.data = { ...defaultData, ...data }

    this.path2D = data.path2D ? data.path2D : createPath2D(data)
  }

  declare data: LineData

  isLine = true

  draw(ctx: CanvasRenderingContext2D) {
    const { bgColor, fillStyle, strokeStyle, lineWidth, lineCap, lineJoin, closed, smooth } = this.data

    // 调用 this.attr() 方法后,  需重新计算 path2D, 且一定会有 bug, 需要优化
    this.path2D = this.data.path2D ? this.data.path2D : createPath2D(this.data)

    ctx.beginPath()
    ctx.lineCap = lineCap
    ctx.lineJoin = lineJoin

    ctx.fillStyle = fillStyle || '#333'
    ctx.strokeStyle = bgColor || strokeStyle

    if (lineWidth !== 0) {
      ctx.lineWidth = lineWidth
      ctx.stroke(this.path2D)
    }

    if (closed) {
      ctx.fill(this.path2D)
    }
  }

  animateE2e(totalTime?: number) {
    if (this.data.smooth) {
      return
    }

    const points = convertToNormalPoints(this.data.points)
    const { totalLineLength, lines, lineLengths } = calcTotalLineLength(points)

    let currIndex = 0
    this.animateCustomCartoon({
      startValue: 0,
      endValue: totalLineLength,
      totalTime,
      frameCallback: elapsedLength => {
        let tempL = 0

        for (let i = 0; i < lineLengths.length; i++) {
          tempL += lineLengths[i]
          if (tempL >= elapsedLength) {
            currIndex = i
            break
          }
        }

        const lastOnePoint = (() => {
          const currLine = lines[currIndex]

          const currLineElapsedLength =
            elapsedLength - lineLengths.slice(0, currIndex).reduce((acc, item) => acc + item, 0)

          const ratio = currLineElapsedLength / lineLengths[currIndex]

          // currLineElapsedLength / lineLengths[currIndex] = x - x1 /  x2 - x1

          const x = ratio * (currLine.end.x - currLine.start.x) + currLine.start.x
          const y = ratio * (currLine.end.y - currLine.start.y) + currLine.start.y

          return { x, y }
        })()

        const _points = points.slice(0, currIndex + 1).concat(lastOnePoint)

        this.attr({ points: pointToFlatArray(_points) })
      }
    })
  }
}

export default Line
