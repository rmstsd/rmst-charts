import { Stage, Line, Text, measureText } from 'rmst-render'

import {
  canvasPaddingBottom,
  canvasPaddingLeft,
  canvasPaddingRight,
  canvasPaddingTop,
  dataZoomHeight,
  splitLineColor,
  tickColor,
  yAxisPadding
} from 'rmst-charts/constant.js'

import { calcPerfectTick } from '../utils'
import { getCanvasDistanceFromRealNumber } from 'rmst-charts/utils/convert'
import { pointToFlatArray } from 'rmst-render/utils'
import { hasDataZoom } from 'rmst-charts/components/dataZoom'

function getYAxis(dataSource: number[], containerWidth, containerHeight: number, innerOption: ICharts.IOption) {
  const axis_x = canvasPaddingLeft
  const start_y = containerHeight - canvasPaddingBottom - (hasDataZoom(innerOption) ? dataZoomHeight : 0)
  const end_y = canvasPaddingTop
  const xAxisEndX = containerWidth - canvasPaddingRight

  const yAxisLength = start_y - end_y
  const axis = { start: { x: axis_x, y: start_y }, end: { x: axis_x, y: end_y } }

  const { perfectInterval, perfectMin, intervalCount, tickValues } = calcPerfectTick(dataSource)

  const tickInterval = (yAxisLength - yAxisPadding) / intervalCount
  const ticks = tickValues.map((tickValue, index) => {
    const start_x = axis_x
    const end_x = xAxisEndX // axis_x + 100
    const tick_y =
      // 新的计算方式能够更好的自定义增加刻度
      start_y - getCanvasDistanceFromRealNumber(tickValue, perfectMin, perfectInterval, tickInterval) // start_y - tickInterval * index

    const { textWidth, textHeight } = measureText(String(tickValue), 14)

    return {
      start: { x: start_x, y: tick_y },
      end: { x: end_x, y: tick_y },
      text: { x: start_x - textWidth - 5, y: tick_y - textHeight / 2, value: tickValue }
    }
  })

  return { axis, ticks, tickConstant: { min: perfectMin, realInterval: perfectInterval, tickInterval } }
}

export type IYAxisElements = ReturnType<typeof createYAxisElements>
export function createYAxisElements(stage: Stage, series: ICharts.series[], innerOption: ICharts.IOption) {
  // K线图 需要 flat 一下, 折线图 和 柱状图 不需要
  const seriesData = series.reduce((acc, serItem) => acc.concat(serItem.data.flat()), []) as number[]
  const yAxisData = getYAxis(seriesData, stage.canvasElement.offsetWidth, stage.canvasElement.offsetHeight, innerOption)

  const yAxisLine = new Line({
    points: pointToFlatArray([yAxisData.axis.start, yAxisData.axis.end]),
    strokeStyle: splitLineColor
  })

  const ticksLines = yAxisData.ticks.map((item, idx) => {
    return new Line({
      points: [item.start.x, item.start.y, item.end.x, item.end.y],
      strokeStyle: idx === 0 ? 'transparent' : splitLineColor
    })
  })

  const tickTexts = yAxisData.ticks.map(item => {
    return new Text({
      x: item.text.x,
      y: item.text.y,
      content: String(item.text.value),
      fillStyle: tickColor
    })
  })

  return { yAxisLine, ticksLines, tickTexts, yAxisData }
}
