// @ts-check
import { getCanvasPxFromRealNumber } from './convert.js'
import drawSegmentLine from './drawSegmentLine.js'

export function getCandle(dataSource, xAxis, yAxis) {
  const { min, realInterval, tickInterval } = yAxis.tickConstant

  const xAxisTicks = xAxis.ticks
  const yAxis_start_y = yAxis.axis.start[1]

  const candleArray = dataSource.map((item, index) => {
    const { date, openPrice, closePrice, topPrice, bottomPrice } = item

    const [bigNumber, smallNumber] = [openPrice, closePrice].sort((a, b) => b - a)

    const rect_y = getCanvasPxFromRealNumber(bigNumber, yAxis_start_y, min, realInterval, tickInterval)
    const rect_bottom_y = getCanvasPxFromRealNumber(smallNumber, yAxis_start_y, min, realInterval, tickInterval)
    const width = xAxis.axis.xAxisInterval / 1.3
    const height = rect_bottom_y - rect_y

    const [tick_x] = xAxisTicks[index].start
    const rect_x = tick_x - width / 2
    const isRise = closePrice > openPrice

    const top_start_y = getCanvasPxFromRealNumber(topPrice, yAxis_start_y, min, realInterval, tickInterval)
    const bottom_start_y = getCanvasPxFromRealNumber(bottomPrice, yAxis_start_y, min, realInterval, tickInterval)

    return {
      topLine: { start: [tick_x, top_start_y], end: [tick_x, rect_y] },
      centerRect: { x: rect_x, y: rect_y, width, height },
      bottomLine: { start: [tick_x, bottom_start_y], end: [tick_x, rect_y + height] },
      isRise
    }
  })
  return candleArray
}

export function drawCandle(ctx, candleArray, activeIndex) {
  candleArray.forEach((coorItem, index) => {
    const { topLine, centerRect, bottomLine, isRise } = coorItem
    const { x, y, width, height } = centerRect

    const style = isRise ? '#FF443F' : '#00A843'
    const lineWidth = activeIndex === index ? 2 : 1

    drawSegmentLine(ctx, topLine.start, topLine.end, style, lineWidth)
    drawSegmentLine(ctx, bottomLine.start, bottomLine.end, style, lineWidth)

    ctx.beginPath()
    ctx.rect(x, y, width, height)

    // 先填充 再描边    --顺序很重要
    ctx.fillStyle = isRise ? '#fff' : style
    ctx.fill()

    ctx.strokeStyle = style
    ctx.lineWidth = lineWidth
    ctx.stroke()
  })
}
