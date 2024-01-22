// @ts-check
import calcPerfect from './calcPerfect.js'
import { canvasPaddingBottom, canvasPaddingLeft, canvasPaddingTop, yAxisPadding } from './constant.js'
import drawSegmentLine from './drawSegmentLine.js'
import measureText from './measureText.js'

export function getYAxis(ctx, dataSource, containerHeight) {
  const axis_x = canvasPaddingLeft
  const start_y = containerHeight - canvasPaddingBottom
  const end_y = canvasPaddingTop
  const yAxisLength = start_y - end_y
  const axis = { start: [axis_x, start_y], end: [axis_x, end_y] }

  const allNumbers = dataSource.reduce((acc, item) => acc.concat(item.openPrice, item.closePrice, item.topPrice, item.bottomPrice), [])
  const maxRealValue = Math.max(...allNumbers)
  const minRealValue = Math.min(...allNumbers)

  const { perfectInterval: realInterval, perfectMax: max, perfectMin: min } = calcPerfect(maxRealValue, minRealValue)

  const intervalCount = (max - min) / realInterval // 间隔数量
  const tickValues = Array.from({ length: intervalCount + 1 }, (_, index) => min + index * realInterval)
  const tickInterval = (yAxisLength - yAxisPadding) / intervalCount

  const ticks = tickValues.map((tickValue, index) => {
    const start_x = axis_x
    const end_x = axis_x + 10
    const tick_y = start_y - tickInterval * index

    const { textWidth, textHeight } = measureText(ctx, tickValue)

    return {
      start: [start_x, tick_y],
      end: [end_x, tick_y],
      text: { x: start_x - textWidth - 3, y: tick_y + textHeight / 2, value: tickValue }
    }
  })
  return { axis, ticks, tickConstant: { min, realInterval, tickInterval } }
}

export function drawYAxis(ctx, yAxis) {
  const { axis, ticks } = yAxis
  drawSegmentLine(ctx, axis.start, axis.end)
  ticks.forEach(tick => {
    const { start, end, text } = tick
    const { x, y, value } = text
    drawSegmentLine(ctx, start, end)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#555'
    ctx.fillText(value, x, y)
  })
}
