import { getCanvasPxFromRealNumber } from 'rmst-charts/utils/convert'

import { IXAxisElements } from 'rmst-charts/coordinateSystem/cartesian2d/calcXAxis'
import { IYAxisElements } from 'rmst-charts/coordinateSystem/cartesian2d/calcYAxis'

import _Chart from './_chart'
import { Line, Rect } from 'rmst-render'
import { pointToFlatArray } from 'rmst-charts/utils/utils'

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

class CandlestickMain extends _Chart<ICharts.CandlestickSeries> {
  elements: IShape[] = []

  render(seriesItem: ICharts.CandlestickSeries) {
    this.seriesItem = seriesItem

    const xAxisData = this.cr.coordinateSystem.cartesian2d.cartesian2dAxisData.xAxisData
    const yAxisData = this.cr.coordinateSystem.cartesian2d.cartesian2dAxisData.yAxisData

    const candleArray = calcCandlestickData(seriesItem.data, xAxisData, yAxisData)

    candleArray.forEach((candleItem, index) => {
      const { topLine, centerRect, bottomLine, isRise } = candleItem
      const { x, y, width, height } = centerRect

      const style = isRise ? '#FF443F' : '#00A843'

      const highestLine = new Line({
        points: pointToFlatArray([topLine.start, topLine.end]),
        strokeStyle: style,
        cursor: 'pointer'
      })
      const lowestLine = new Line({
        points: pointToFlatArray([bottomLine.start, bottomLine.end]),
        strokeStyle: style,
        cursor: 'pointer'
      })

      const rect = new Rect({
        x,
        y,
        width,
        height,
        fillStyle: isRise ? '#fff' : style,
        strokeStyle: style,
        cursor: 'pointer'
      })

      this.elements.push(highestLine, lowestLine, rect)
    })
  }

  afterAppendStage() {}
}

export default CandlestickMain
