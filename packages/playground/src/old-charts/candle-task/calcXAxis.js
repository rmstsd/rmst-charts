// @ts-check
import { canvasPaddingBottom, canvasPaddingLeft, canvasPaddingRight } from './constant.js'
import drawSegmentLine from './drawSegmentLine.js'
import measureText from './measureText.js'

export function getXAxis(ctx, dataSource, containerWidth, containerHeight) {
  const start_x = canvasPaddingLeft
  const axis_y = containerHeight - canvasPaddingBottom
  const end_x = containerWidth - canvasPaddingRight

  const tickValues = dataSource.map(item => item.date)
  const xAxisInterval = (end_x - start_x) / tickValues.length

  const axis = { start: [start_x, axis_y], end: [end_x, axis_y], xAxisInterval }

  const { textHeight } = measureText(ctx, '0')
  const tickLength = 10

  const ticks = tickValues.map((dateString, index) => {
    const x = canvasPaddingLeft + xAxisInterval / 2 + index * xAxisInterval
    const y_start = axis_y
    const y_end = axis_y + tickLength

    return {
      start: [x, y_start],
      end: [x, y_end],
      text: { x, y: y_start + textHeight + tickLength + 5, value: dateString }
    }
  })
  return { axis, ticks }
}

export function drawXAxis(ctx, xAxis) {
  const { axis, ticks } = xAxis
  drawSegmentLine(ctx, axis.start, axis.end)

  const c = Math.floor(ticks.length / 4)

  ticks.forEach((tick, index) => {
    if (index % c !== 0) return

    const { start, end, text } = tick
    const { x, y, value } = text
    drawSegmentLine(ctx, start, end)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#666'
    ctx.fillText(value, x, y)
  })
}
