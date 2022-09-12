import {
  canvasPaddingBottom,
  canvasPaddingLeft,
  canvasPaddingTop,
  tickColor,
  yAxisPadding
} from '../constant.js'
import { measureText, drawSegmentLine, calcPerfect } from '../utils.js'

export function getYAxis(
  ctx: CanvasRenderingContext2D,
  dataSource: ICharts.IOption['series']['data'],
  containerHeight: number,
  xAxisEndX: number
) {
  const axis_x = canvasPaddingLeft
  const start_y = containerHeight - canvasPaddingBottom
  const end_y = canvasPaddingTop
  const yAxisLength = start_y - end_y
  const axis = { start: { x: axis_x, y: start_y }, end: { x: axis_x, y: end_y } }

  const maxRealValue = Math.max(...dataSource)
  const minRealValue = Math.min(...dataSource)

  const {
    perfectInterval: realInterval,
    perfectMax: max,
    perfectMin: min
  } = calcPerfect(maxRealValue, minRealValue)

  const intervalCount = (max - min) / realInterval // 间隔数量
  const tickValues = Array.from({ length: intervalCount + 1 }, (_, index) => min + index * realInterval)
  const tickInterval = (yAxisLength - yAxisPadding) / intervalCount

  const ticks = tickValues.map((tickValue, index) => {
    const start_x = axis_x
    const end_x = xAxisEndX // axis_x + 100
    const tick_y = start_y - tickInterval * index

    const { textWidth, textHeight } = measureText(ctx, tickValue)

    return {
      start: { x: start_x, y: tick_y },
      end: { x: end_x, y: tick_y },
      text: { x: start_x - textWidth - 3, y: tick_y + textHeight / 2, value: tickValue }
    }
  })
  return { axis, ticks, tickConstant: { min, realInterval, tickInterval } }
}

export function drawYAxis(ctx: CanvasRenderingContext2D, yAxis: ICharts.IRenderTree['yAxis']) {
  const { axis, ticks } = yAxis

  // drawSegmentLine(ctx, axis.start, axis.end)

  ticks.forEach(tick => {
    const { start, end, text } = tick
    const { x, y, value } = text
    drawSegmentLine(ctx, start, end, '#ddd', 0.8)
    ctx.textAlign = 'left'
    ctx.fillStyle = tickColor
    ctx.fillText(String(value), x, y)
  })
}
