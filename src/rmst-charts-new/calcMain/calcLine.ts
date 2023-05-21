// 折线图 计算 和 绘制

import colorAlpha from 'color-alpha'
import { Stage, Circle, Line, Group } from '@/rmst-render'

import type { IXAxisElements } from '../calcAxis/calcXAxis.js'
import type { IYAxisElements } from '../calcAxis/calcYAxis.js'
import { primaryColor, primaryColorAlpha } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'
import { pointToFlatArray } from '../utils/utils.js'

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

  // 计算出 阶梯折线图 要绘制的额外的点
  const finalCoordPoints = smooth ? pointData : calcPointsByUserPoints(pointData, step)

  const mainLinePoints = pointToFlatArray(finalCoordPoints)

  // 主折线
  const mainLine = new Line({
    points: mainLinePoints,
    bgColor: primaryColor,
    lineWidth: 2,
    clip: true,
    smooth: seriesItem.smooth
  })

  let singleArea: Line
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

  const group = new Group({
    clip: true
  })

  if (areaStyle) group.append(singleArea)
  group.append(mainLine)

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
      arcItem.animateCartoon({ radius: 4 }, 300)
    }

    arcItem.onLeave = () => {
      stage.setCursor('auto')
      arcItem.animateCartoon({ radius: normalRadius }, 300)
    }

    return arcItem
  })

  async function afterAppendStage() {
    group.animateCartoon(undefined, 1000, 'left-right')
  }

  const elements = [group]

  return { elements, afterAppendStage }
}

// 阶梯折线图 - smooth 应该失效
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
