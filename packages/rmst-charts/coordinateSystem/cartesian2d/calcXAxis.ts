// @ts-check
import { Stage, Line, Text, measureText } from 'rmst-render'

import { canvasPaddingBottom, canvasPaddingLeft, canvasPaddingRight, tickColor } from 'rmst-charts/constant.js'
import { pointToFlatArray } from 'rmst-charts/utils/utils.js'

function getXAxis(ctx, xAxis, containerWidth, containerHeight) {
  const start_x = canvasPaddingLeft
  const axis_y = containerHeight - canvasPaddingBottom
  const end_x = containerWidth - canvasPaddingRight

  const { data, boundaryGap = true } = xAxis

  const count = boundaryGap ? data.length : data.length - 1 // x轴刻度值左右的空余距离
  const xAxisInterval = (end_x - start_x) / count
  const firstPaddingLeft = boundaryGap ? xAxisInterval / 2 : 0

  const axis = { start: { x: start_x, y: axis_y }, end: { x: end_x, y: axis_y }, xAxisInterval }

  const ticks = data.map((valueString, index) => {
    const { textWidth, textHeight } = measureText(ctx, valueString, 14)
    const tickLength = 10

    const x = firstPaddingLeft + start_x + index * xAxisInterval
    const y_start = axis_y
    const y_end = axis_y + tickLength

    return {
      start: { x, y: y_start },
      end: { x, y: y_end },
      text: { x: x - textWidth / 2, y: y_end + 5, value: valueString }
    }
  })

  return { axis, ticks }
}

export type IXAxisElements = ReturnType<typeof createXAxisElements>
export function createXAxisElements(stage: Stage, innerOption: ICharts.IOption) {
  const xAxisData = getXAxis(
    stage.ctx,
    innerOption.xAxis,
    stage.canvasElement.offsetWidth,
    stage.canvasElement.offsetHeight
  )

  const xAxisLine = new Line({
    points: [xAxisData.axis.start.x, xAxisData.axis.start.y, xAxisData.axis.end.x, xAxisData.axis.end.y],
    strokeStyle: tickColor
  })

  const ticksLines = xAxisData.ticks.map(item => {
    return new Line({
      points: pointToFlatArray([item.start, item.end]),
      strokeStyle: tickColor
    })
  })

  const tickTexts = xAxisData.ticks.map(item => {
    return new Text({ x: item.text.x, y: item.text.y, content: item.text.value, fillStyle: tickColor })
  })

  return { xAxisLine, ticksLines, tickTexts, xAxisData }
}
