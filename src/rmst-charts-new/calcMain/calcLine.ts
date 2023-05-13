// 折线图 计算 和 绘制

import { calculateControlPoint } from '@/demo/other/AniCurve'
import colorAlpha from 'color-alpha'
import { Stage, Circle, Line } from '../../rmst-render'

import type { IXAxisElements } from '../calcAxis/calcXAxis.js'
import type { IYAxisElements } from '../calcAxis/calcYAxis.js'
import { primaryColor, primaryColorAlpha } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'
import { drawArc } from '../utils/drawHelpers'
import { pointToFlatArray } from '../utils/utils.js'
// import { drawArc, drawSegmentLine } from '../utils/drawHelpers.js'
// import { drawBezier } from '../utils/utils.js'

export function calcMain(
  dataSource: number[],
  xAxisData: IXAxisElements['xAxisData'],
  yAxisData: IYAxisElements['yAxisData']
) {
  const { min, realInterval, tickInterval } = yAxisData.tickConstant

  const yAxis_start_y = yAxisData.axis.start.y

  return dataSource.map((dataItem, index) => {
    const { x: tick_x } = xAxisData.ticks[index].start
    const y = getCanvasPxFromRealNumber(dataItem, yAxis_start_y, min, realInterval, tickInterval)

    return { x: tick_x, y: y }
  })
}

export function createRenderElements(
  stage: Stage,
  seriesItem: ICharts.series,
  xAxisData: IXAxisElements['xAxisData'],
  yAxisData: IYAxisElements['yAxisData']
) {
  const pointData = calcMain(seriesItem.data as number[], xAxisData, yAxisData)

  const { areaStyle, smooth, step } = seriesItem

  const finalCoordPoints = calcPointsByUserPoints(pointData, step)

  const mainLinePoints = pointToFlatArray(finalCoordPoints)

  let singleArea
  if (areaStyle) singleArea = createArea()
  function createArea() {
    // 面积图区域
    const singleArea = new Line({
      points: [
        finalCoordPoints.at(0).x,
        xAxisData.axis.start.y,

        ...mainLinePoints,

        finalCoordPoints.at(-1).x,
        xAxisData.axis.end.y
      ],
      fillStyle: primaryColorAlpha,
      strokeStyle: 'transparent',
      closed: true,
      clip: true
    })
    singleArea.onEnter = () => {
      stage.setCursor('pointer')
      singleArea.attr({ fillStyle: colorAlpha(primaryColor, 0.7) })
    }
    singleArea.onLeave = () => {
      stage.setCursor('auto')
      singleArea.attr({ fillStyle: primaryColorAlpha })
    }

    return singleArea
  }

  // 主折线
  const mainLine = new Line({
    points: mainLinePoints,
    bgColor: primaryColor,
    lineWidth: 2,
    clip: true
  })

  const initRadius = 0
  const normalRadius = 3
  const arcs = pointData.map(item => {
    const arcItem = new Circle({
      x: item.x,
      y: item.y,
      radius: smooth ? 5 : initRadius,
      bgColor: 'white',
      strokeStyle: primaryColor
    })

    arcItem.onEnter = () => {
      stage.setCursor('pointer')
      arcItem.animate({ radius: 4 }, 300)
    }

    arcItem.onLeave = () => {
      stage.setCursor('auto')
      arcItem.animate({ radius: normalRadius }, 300)
    }

    return arcItem
  })

  async function afterAppendStage() {
    if (smooth) {
      // drawBezier(stage.ctx, pointData, xAxisData.axis.xAxisInterval)

      const allControlPoint = calcAllControlPoint(pointData, xAxisData.axis.xAxisInterval)

      let curIndex = 0 // 第一段曲线

      const drawBb = () => {
        let t = 0
        const curLine = allControlPoint[curIndex]

        return new Promise(resolve => {
          const exec = () => {
            const { cp1, cp2, tempEnd } = calculateControlPoint(t, {
              start: curLine.start,
              p1: curLine.cp1,
              p2: curLine.cp2,
              end: curLine.end
            })

            stage.ctx.strokeStyle = primaryColor
            stage.ctx.lineWidth = 2
            stage.ctx.beginPath()
            stage.ctx.moveTo(curLine.start.x, curLine.start.y)
            stage.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, tempEnd.x, tempEnd.y)
            stage.ctx.stroke()

            if (t === 1) {
              resolve(true)
              t = 0
              return
            }

            requestAnimationFrame(() => {
              t += 0.05
              if (t > 1) t = 1
              exec()
            })
          }

          exec()
        })
      }

      for (const asd of allControlPoint) {
        await drawBb()
        curIndex += 1
      }

      return
    }

    mainLine.animate(undefined, 5000, 'left-right')
    if (areaStyle) singleArea.animate(undefined, 5000, 'left-right')
  }

  const elements = [mainLine]
  if (areaStyle) elements.unshift(singleArea)

  return { elements, afterAppendStage }
}

// 计算 两个控制点 和 两个端点
function calcAllControlPoint(points, distance) {
  distance = distance / 2

  const ans: ICharts.ICoord[] = []
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    const slope = (next.y - prev.y) / (next.x - prev.x) // 直线的斜率
    const b = curr.y - slope * curr.x // 经过做标点的 y = kx + b

    const pow2 = (num: number) => Math.pow(num, 2)

    const four_ac =
      4 * (pow2(slope) + 1) * (pow2(curr.x) - 2 * curr.y * b + pow2(curr.y) + pow2(b) - distance ** 2) // 4ac
    const det = Math.sqrt(pow2(2 * slope * b - 2 * curr.x - 2 * curr.y * slope) - four_ac) // 根号下(b方 - 4ac)
    const fb = -(2 * slope * b - 2 * curr.x - 2 * curr.y * slope) // -b
    const two_a = 2 * (pow2(slope) + 1) // 2a

    let cp1_x = (fb - det) / two_a
    let cp1_y = slope * cp1_x + b

    let cp2_x = (fb + det) / two_a
    let cp2_y = slope * cp2_x + b

    // 如果是峰值 直接拉平
    if ((curr.y >= prev.y && curr.y >= next.y) || (curr.y <= prev.y && curr.y <= next.y)) {
      cp1_x = curr.x - distance
      cp1_y = curr.y

      cp2_x = curr.x + distance
      cp2_y = curr.y
    }

    ans.push({ x: cp1_x, y: cp1_y }, { x: cp2_x, y: cp2_y })
  }

  ans.unshift(points[0])
  ans.push(points[points.length - 1])

  return calcFinalPoint(ans, points)

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

// 计算 和 绘制贝塞尔曲线
function drawBezier(ctx: CanvasRenderingContext2D, points: ICharts.ICoord[], distance: number) {
  const finalPoint = calcAllControlPoint(points, points)

  // 画曲线
  finalPoint.forEach(item => {
    drawBezierInner(item.start, item.end, item.cp1, item.cp2)
  })

  function drawBezierInner(
    start: ICharts.ICoord,
    end: ICharts.ICoord,
    cp1: ICharts.ICoord,
    cp2: ICharts.ICoord
  ) {
    ctx.strokeStyle = primaryColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y)
    ctx.stroke()

    // 画控制点
    drawArc(ctx, cp1.x, cp1.y, 2, 'red')
    drawArc(ctx, cp2.x, cp2.y, 2, 'red')
  }
}

function calcPointsByUserPoints(pointData: ICharts.ICoord[], step: ICharts.series['step']): ICharts.ICoord[] {
  if (!step) return pointData

  const finalPointsCoord = pointData.reduce((acc, item, idx, originArr) => {
    if (idx === originArr.length - 1) return acc.concat(item)

    const addPoint = []

    const nextPoint = originArr[idx + 1]

    // 在某个点开始的时候拐弯
    if (step === 'start') addPoint.push({ x: item.x, y: nextPoint.y })

    // 结束的时候拐弯
    if (step === 'end') addPoint.push({ x: nextPoint.x, y: item.y })

    if (step === 'middle') {
      const centerX = (item.x + nextPoint.x) / 2
      addPoint.push({ x: centerX, y: item.y })
      addPoint.push({ x: centerX, y: nextPoint.y })
    }

    return acc.concat(item, addPoint)
  }, [])

  return finalPointsCoord
}
