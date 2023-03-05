import Line from '../../rmst-render/Line.js'
import Stage from '../../rmst-render/Stage.js'
import Text from '../../rmst-render/Text.js'

import {
  canvasPaddingBottom,
  canvasPaddingLeft,
  canvasPaddingRight,
  canvasPaddingTop,
  tickColor,
  yAxisPadding
} from '../constant.js'
import { measureText } from '../utils/canvasUtil.js'
import { drawSegmentLine } from '../utils/drawHelpers.js'
import { calcPerfect } from '../utils/utils.js'

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

export type IYAxisElements = ReturnType<typeof createRenderElements>

export function createRenderElements(stage: Stage, innerOption) {
  const yAxisData = getYAxis(
    stage.ctx,
    innerOption.series.data,
    stage.canvasElement.offsetHeight,
    stage.canvasElement.offsetWidth - canvasPaddingRight
  )

  const yAxisLine = new Line({
    points: [yAxisData.axis.start.x, yAxisData.axis.start.y, yAxisData.axis.end.x, yAxisData.axis.end.x],
    bgColor: '#aaa'
  })

  const ticksLines = yAxisData.ticks.map(item => {
    return new Line({
      points: [item.start.x, item.start.y, item.end.x, item.end.y],
      bgColor: '#aaa'
    })
  })

  const tickTexts = yAxisData.ticks.map(item => {
    return new Text({
      x: item.text.x,
      y: item.text.y,
      content: item.text.value,
      fontSize: 16,
      color: '#333'
    })
  })

  const elements = [].concat(yAxisLine, ticksLines, tickTexts)

  return { yAxisLine, ticksLines, tickTexts, yAxisData }
}

// export function drawYAxis(ctx: CanvasRenderingContext2D, yAxis: ICharts.IRenderTree['yAxis']) {
//   const { axis, ticks } = yAxis

//   // drawSegmentLine(ctx, axis.start, axis.end)

//   ticks.forEach((tick, index) => {
//     const { start, end, text } = tick
//     const { x, y, value } = text

//     if (index != 0) drawSegmentLine(ctx, start, end, '#e0e6f1', 0.8)

//     ctx.textAlign = 'left'
//     ctx.fillStyle = tickColor
//     ctx.fillText(String(value), x, y)
//   })
// }
