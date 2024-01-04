import { getCanvasPxFromRealNumber } from 'rmst-charts/utils/convert'

import { IXAxisElements } from 'rmst-charts/coordinateSystem/cartesian2d/calcXAxis'
import { IYAxisElements } from 'rmst-charts/coordinateSystem/cartesian2d/calcYAxis'

import _Chart from './_chart'
import { AnimateCartoonConfig, Line, Rect } from 'rmst-render'
import { pointToFlatArray } from 'rmst-charts/utils/utils'
import { candlestickGreen, candlestickRed } from 'rmst-charts/constant'
import { RangeRatio } from 'rmst-charts/components/dataZoom'

type CandleArray = ReturnType<typeof calcCandlestickData>
function calcCandlestickData(
  data: ICharts.CandlestickSeries['data'],
  xAxisData: IXAxisElements['xAxisData'],
  yAxisData: IYAxisElements['yAxisData']
) {
  const { min, realInterval, tickInterval } = yAxisData.tickConstant

  const xAxisTicks = xAxisData.ticks
  const yAxis_start_y = yAxisData.axis.start.y

  const candleArray = data.map((item, index) => {
    const [open, close, lowest, highest] = item

    const [bigNumber, smallNumber] = [open, close].sort((a, b) => b - a)

    const rect_y = getCanvasPxFromRealNumber(bigNumber, yAxis_start_y, min, realInterval, tickInterval)
    const rect_bottom_y = getCanvasPxFromRealNumber(smallNumber, yAxis_start_y, min, realInterval, tickInterval)
    const width = xAxisData.axis.xAxisInterval / 2

    const height = rect_bottom_y - rect_y

    const tick_x = xAxisTicks[index].start.x
    const rect_x = tick_x - width / 2
    const isRise = close > open

    const top_start_y = getCanvasPxFromRealNumber(highest, yAxis_start_y, min, realInterval, tickInterval)
    const bottom_start_y = getCanvasPxFromRealNumber(lowest, yAxis_start_y, min, realInterval, tickInterval)

    return {
      topLine: { start: { x: tick_x, y: top_start_y }, end: { x: tick_x, y: rect_y } },
      centerRect: { x: rect_x, y: rect_y, width, height },
      bottomLine: { start: { x: tick_x, y: bottom_start_y }, end: { x: tick_x, y: rect_y + height } },
      isRise // 是否 上升
    }
  })

  return candleArray
}

const defaultLineSeriesItem = { animationDuration: 300 } as ICharts.CandlestickSeries

class CandlestickMain extends _Chart<ICharts.CandlestickSeries> {
  elements: IShape[] = []

  afterAppendTasks: Function[] = []

  candleArray: CandleArray

  render(seriesItem: ICharts.CandlestickSeries) {
    this.seriesItem = { ...defaultLineSeriesItem, ...seriesItem }

    const aniCfg: AnimateCartoonConfig = { easing: 'linear', duration: this.seriesItem.animationDuration }

    const xAxisData = this.cr.coordinateSystem.cartesian2d.cartesian2dAxisData.xAxisData
    const yAxisData = this.cr.coordinateSystem.cartesian2d.cartesian2dAxisData.yAxisData

    this.candleArray = calcCandlestickData(seriesItem.data, xAxisData, yAxisData)

    this.candleArray.forEach(candleItem => {
      const { topLine, centerRect, bottomLine, isRise } = candleItem
      const { x, y, width, height } = centerRect

      const color = isRise ? candlestickRed : candlestickGreen

      const initial_y = isRise ? y + height : y

      const highestLine = new Line({
        points: isRise
          ? pointToFlatArray([
              { x: topLine.start.x, y: initial_y },
              { x: topLine.end.x, y: initial_y }
            ])
          : pointToFlatArray([
              { x: topLine.start.x, y: initial_y },
              { x: topLine.end.x, y: initial_y }
            ]), // pointToFlatArray([topLine.start, topLine.end]),
        strokeStyle: color,
        cursor: 'pointer'
      })
      this.afterAppendTasks.push(() => {
        highestLine.animateCartoon({ points: pointToFlatArray([topLine.start, topLine.end]) }, aniCfg)
      })

      const lowestLine = new Line({
        points: isRise
          ? pointToFlatArray([
              { x: bottomLine.start.x, y: initial_y },
              { x: bottomLine.end.x, y: initial_y }
            ])
          : pointToFlatArray([
              { x: bottomLine.start.x, y: initial_y },
              { x: bottomLine.end.x, y: initial_y }
            ]), // pointToFlatArray([bottomLine.start, bottomLine.end]),
        strokeStyle: color,
        cursor: 'pointer'
      })
      this.afterAppendTasks.push(() => {
        lowestLine.animateCartoon({ points: pointToFlatArray([bottomLine.start, bottomLine.end]) }, aniCfg)
      })

      const rect = new Rect({
        x,
        y: initial_y,
        width,
        height: 0,
        fillStyle: color,
        strokeStyle: color,
        cursor: 'pointer'
      })
      this.afterAppendTasks.push(() => {
        rect.animateCartoon({ y, height }, aniCfg)
      })

      this.elements.push(highestLine, lowestLine, rect)
    })
  }

  afterAppendStage() {
    this.afterAppendTasks.forEach(func => {
      func()
    })
  }

  setRange(rangeRatio: RangeRatio) {
    console.log(this.cr.dataZoom.rangeRatio)
    // console.log('cand', rangeRatio)
  }
}

export default CandlestickMain
