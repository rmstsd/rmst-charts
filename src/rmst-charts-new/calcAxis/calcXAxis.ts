// @ts-check

import Line from '../../rmst-render/Line.js'
import Stage from '../../rmst-render/Stage.js'
import Text from '../../rmst-render/Text.js'
import { canvasPaddingBottom, canvasPaddingLeft, canvasPaddingRight, tickColor } from '../constant.js'
import { measureText } from '../utils/canvasUtil.js'
import { pointToArray } from '../utils/utils.js'

function getXAxis(ctx, dataSource, containerWidth, containerHeight) {
  const start_x = canvasPaddingLeft
  const axis_y = containerHeight - canvasPaddingBottom
  const end_x = containerWidth - canvasPaddingRight

  const tickValues = dataSource
  const xAxisInterval = (end_x - start_x) / tickValues.length

  const axis = { start: { x: start_x, y: axis_y }, end: { x: end_x, y: axis_y }, xAxisInterval }

  const ticks = tickValues.map((valueString, index) => {
    const { textWidth, textHeight } = measureText(ctx, valueString)
    const tickLength = 10

    const x = canvasPaddingLeft + xAxisInterval / 2 + index * xAxisInterval
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

export type IXAxisElements = ReturnType<typeof createRenderElements>
export function createRenderElements(stage: Stage, innerOption) {
  const series = [].concat(innerOption.series)

  const xAxisData = getXAxis(
    stage.ctx,
    innerOption.xAxis.data,
    stage.canvasElement.offsetWidth,
    stage.canvasElement.offsetHeight
  )

  const xAxisLine = new Line({
    points: [xAxisData.axis.start.x, xAxisData.axis.start.y, xAxisData.axis.end.x, xAxisData.axis.end.y],
    strokeStyle: tickColor
  })

  const ticksLines = xAxisData.ticks.map(item => {
    return new Line({
      points: pointToArray([item.start, item.end]),
      strokeStyle: tickColor
    })
  })

  const tickTexts = xAxisData.ticks.map(item => {
    return new Text({ x: item.text.x, y: item.text.y, content: item.text.value, color: tickColor })
  })

  return { xAxisLine, ticksLines, tickTexts, xAxisData }
}
