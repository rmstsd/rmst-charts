// 折线图 计算 和 绘制

import colorAlpha from 'color-alpha'
import { Stage, Circle, Line, Group } from 'rmst-render'

import type { IXAxisElements } from '../coordinateSystem/cartesian2d/calcXAxis.js'
import type { IYAxisElements } from '../coordinateSystem/cartesian2d/calcYAxis.js'

import { colorPalette, primaryColor, primaryColorAlpha } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'
import { pointToFlatArray } from '../utils/utils.js'
import { ICoordinateSystemElements } from '../coordinateSystem/index.js'
import BoxHidden from 'rmst-render/shape/BoxHidden.js'

function calcMain(
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

const defaultSeriesItem = {
  animationDuration: 1000,
  lineStyle: { width: 2, cap: 'butt', join: 'bevel' },
  symbol: 'circle'
} as const

export function createRenderElements(
  stage: Stage,
  seriesItem: ICharts.LineSeries,
  coordinateSystem: ICoordinateSystemElements,
  series: ICharts.LineSeries[]
) {
  const xAxisData = coordinateSystem.cartesian2d.cartesian2dAxisData.xAxisData
  const yAxisData = coordinateSystem.cartesian2d.cartesian2dAxisData.yAxisData

  const serIndex = series.findIndex(item => item === seriesItem)

  const pointData = calcMain(seriesItem.data as number[], xAxisData, yAxisData)

  const { areaStyle, smooth, step, animationDuration, lineStyle, symbol } = {
    ...defaultSeriesItem,
    ...seriesItem
  }

  // 计算出 阶梯折线图 要绘制的额外的点
  const finalCoordPoints = smooth ? pointData : calcPointsByUserPoints(pointData, step)

  const mainLinePoints = pointToFlatArray(finalCoordPoints)

  // 主折线
  const mainLine = new Line({
    points: mainLinePoints,
    bgColor: colorPalette[serIndex],
    lineWidth: lineStyle.width,
    lineCap: lineStyle.cap,
    lineJoin: lineStyle.join,
    clip: true,
    smooth: seriesItem.smooth
  })

  const boxHidden = new BoxHidden({
    x: xAxisData.axis.start.x,
    y: yAxisData.axis.end.y,
    width: 0,
    height: stage.canvasSize.height
  })
  if (areaStyle) {
    boxHidden.append(createArea())

    function createArea() {
      const prevSeries = series[serIndex - 1]

      const xAxisPointData = [
        { x: finalCoordPoints.at(0).x, y: xAxisData.axis.start.y },
        { x: finalCoordPoints.at(-1).x, y: xAxisData.axis.end.y }
      ]
      const prevPointData =
        serIndex === 0 ? xAxisPointData : calcMain(prevSeries.data as number[], xAxisData, yAxisData)

      function calcAreaFillStyle() {
        // 是数组则认为是渐变
        if (Array.isArray(areaStyle.color)) {
          const max_y = Math.max(...pointData.map(item => item.y))
          const min_y = Math.min(...prevPointData.map(item => item.y))

          const gradient = stage.ctx.createLinearGradient(0, 0, max_y, min_y)
          areaStyle.color.forEach(item => {
            gradient.addColorStop(
              item.offset,
              areaStyle.opacity ? colorAlpha(item.color, areaStyle.opacity) : item.color
            )
          })
          return gradient
        }

        return areaStyle.color || colorAlpha(colorPalette[serIndex], 0.6)
      }

      // 注意点的顺序是 从右向左的
      const prevLinePoints = pointToFlatArray(prevPointData.reverse())

      const mainLinePath2DCopy = new Path2D(mainLine.path2D)
      mainLinePath2DCopy.lineTo(prevLinePoints[0], prevLinePoints[1])

      const prevLinePath2D = new Line({
        points: prevLinePoints,
        smooth: serIndex === 0 ? false : prevSeries.smooth,
        lineWidth: 0
      }).path2D

      prevLinePath2D.lineTo(mainLinePoints[0], mainLinePoints[1])
      prevLinePath2D.addPath(mainLinePath2DCopy)

      const innerSingleArea = new Line({
        path2D: prevLinePath2D,
        fillStyle: calcAreaFillStyle() as CanvasFillStrokeStyles['fillStyle'],
        strokeStyle: 'transparent',
        closed: true,
        clip: true,
        lineWidth: 0
      })

      innerSingleArea.onmouseenter = () => {
        stage.setCursor('pointer')
        innerSingleArea.attr({ fillStyle: colorAlpha(primaryColor, 0.7) })
      }
      innerSingleArea.onmouseleave = () => {
        stage.setCursor('auto')
        innerSingleArea.attr({ fillStyle: primaryColorAlpha })
      }

      return innerSingleArea
    }
  }
  boxHidden.append(mainLine)

  let arcs: Circle[] = []
  const normalRadius = 2
  if (symbol !== 'none') {
    arcs = createSymbol()

    function createSymbol() {
      const initRadius = 0
      const activeRadius = 4
      const arcs = pointData.map(item => {
        const arcItem = new Circle({
          x: item.x,
          y: item.y,
          radius: initRadius,
          bgColor: 'white',
          strokeStyle: colorPalette[serIndex],
          lineWidth: 4
        })

        arcItem.onmouseenter = () => {
          stage.setCursor('pointer')
          arcItem.animateCartoon({ radius: activeRadius })
        }

        arcItem.onmouseleave = () => {
          stage.setCursor('auto')
          arcItem.animateCartoon({ radius: normalRadius })
        }

        return arcItem
      })

      return arcs
    }
  }

  const ticksXs = xAxisData.ticks.map(item => item.start.x)

  async function afterAppendStage() {
    let currentIndex = 0
    boxHidden.animateCartoon(
      { width: stage.canvasSize.width },
      {
        duration: seriesItem.animationDuration,
        during(percent, newState) {
          if (symbol === 'none') return

          if (xAxisData.axis.start.x + (newState.width as number) >= ticksXs[currentIndex]) {
            // 数据点的数量可能会比刻度的数量少
            arcs[currentIndex]?.animateCartoon({ radius: normalRadius }, { duration: 300 })

            currentIndex++
          }
        }
      }
    )
  }

  const elements = [boxHidden, ...arcs]

  return { elements, afterAppendStage }
}

// 阶梯折线图 - smooth 应该失效
function calcPointsByUserPoints(pointData: ICoord[], step: ICharts.LineSeries['step']): ICoord[] {
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
