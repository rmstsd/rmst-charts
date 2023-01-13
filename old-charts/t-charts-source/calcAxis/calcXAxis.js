// @ts-check

import { dpr, canvasPaddingBottom, canvasPaddingLeft, canvasPaddingRight, tickColor } from '../constant.js'
import { drawSegmentLine, measureText } from '../utils.js'

export function getXAxis(ctx, dataSource, containerWidth, containerHeight) {
  const start_x = canvasPaddingLeft
  const axis_y = containerHeight - canvasPaddingBottom
  const end_x = containerWidth - canvasPaddingRight

  const tickValues = dataSource
  const xAxisInterval = (end_x - start_x) / tickValues.length

  const axis = { start: { x: start_x, y: axis_y }, end: { x: end_x, y: axis_y }, xAxisInterval }

  const { textHeight } = measureText(ctx, '0')
  const tickLength = 10

  const ticks = tickValues.map((valueString, index) => {
    const x = canvasPaddingLeft + xAxisInterval / 2 + index * xAxisInterval
    const y_start = axis_y
    const y_end = axis_y + tickLength

    return {
      start: { x: x, y: y_start },
      end: { x: x, y: y_end },
      text: { x, y: y_start + textHeight + tickLength + 5, value: valueString }
    }
  })
  return { axis, ticks }
}

export function drawXAxis(ctx, xAxis) {
  const { axis, ticks } = xAxis
  drawSegmentLine(ctx, axis.start, axis.end)

  // const c = Math.floor(ticks.length / 4)

  ticks.forEach((tick, index) => {
    // if (index % c !== 0) return

    const { start, end, text } = tick
    const { x, y, value } = text
    drawSegmentLine(ctx, start, end)
    ctx.textAlign = 'center'
    ctx.fillStyle = tickColor
    ctx.fillText(value, x, y)
  })
}
