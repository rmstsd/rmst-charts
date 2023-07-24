import { Stage, Line, Text } from 'rmst-render'

import {
  canvasPaddingBottom,
  canvasPaddingLeft,
  canvasPaddingRight,
  canvasPaddingTop,
  splitLineColor,
  tickColor,
  yAxisPadding
} from '../../constant.js'
import { measureText } from '../../utils/canvasUtil.js'
import { pointToFlatArray } from '../../utils/utils.js'
import { calcPerfectTick } from '../utils'

function getYAxis(
  ctx: CanvasRenderingContext2D,
  dataSource: number[],
  containerHeight: number,
  xAxisEndX: number
) {
  const axis_x = canvasPaddingLeft
  const start_y = containerHeight - canvasPaddingBottom
  const end_y = canvasPaddingTop
  const yAxisLength = start_y - end_y
  const axis = { start: { x: axis_x, y: start_y }, end: { x: axis_x, y: end_y } }

  const { perfectInterval, perfectMin, intervalCount, tickValues } = calcPerfectTick(dataSource)

  const tickInterval = (yAxisLength - yAxisPadding) / intervalCount
  const ticks = tickValues.map((tickValue, index) => {
    const start_x = axis_x
    const end_x = xAxisEndX // axis_x + 100
    const tick_y = start_y - tickInterval * index

    const { textWidth, textHeight } = measureText(ctx, String(tickValue))

    return {
      start: { x: start_x, y: tick_y },
      end: { x: end_x, y: tick_y },
      text: { x: start_x - textWidth - 5, y: tick_y - textHeight / 2, value: tickValue }
    }
  })
  return { axis, ticks, tickConstant: { min: perfectMin, realInterval: perfectInterval, tickInterval } }
}

export type IYAxisElements = ReturnType<typeof createYAxisElements>
export function createYAxisElements(stage: Stage, series: ICharts.series[]) {
  const seriesData = series.reduce((acc, item) => acc.concat(item.data), []) as number[]

  const yAxisData = getYAxis(
    stage.ctx,
    seriesData,
    stage.canvasElement.offsetHeight,
    stage.canvasElement.offsetWidth - canvasPaddingRight
  )

  const yAxisLine = new Line({
    points: pointToFlatArray([yAxisData.axis.start, yAxisData.axis.end]),
    bgColor: splitLineColor
  })

  const ticksLines = yAxisData.ticks.map(item => {
    return new Line({
      points: [item.start.x, item.start.y, item.end.x, item.end.y],
      bgColor: splitLineColor
    })
  })

  const tickTexts = yAxisData.ticks.map(item => {
    return new Text({ x: item.text.x, y: item.text.y, content: String(item.text.value), color: tickColor })
  })

  return { yAxisLine, ticksLines, tickTexts, yAxisData }
}