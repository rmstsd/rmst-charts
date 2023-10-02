// 柱状图 计算 和 绘制

import { primaryColor } from '../constant.js'
import { getActiveIndexFromOffsetX, getCanvasPxFromRealNumber, getYTickFromOffsetY } from '../convert.js'
import drawDashLine, { drawSegmentLine } from '../utils/drawHelpers.js'

export function calcMain(dataSource: number[], renderTree: ICharts.IRenderTree) {
  const { xAxis, yAxis } = renderTree
  const { min, realInterval, tickInterval } = yAxis.tickConstant

  const { axis, ticks } = xAxis
  const yAxis_start_y = yAxis.axis.start.y

  const padding = axis.xAxisInterval / 5

  const res = dataSource.map((dataItem, index) => {
    const x = ticks[index].start.x - axis.xAxisInterval / 2 + padding
    const y = getCanvasPxFromRealNumber(dataItem, yAxis_start_y, min, realInterval, tickInterval)

    const width = axis.xAxisInterval - padding * 2
    const height = axis.start.y - y

    return { x, y, width, height }
  })

  return res
}

type IChartBar = ICoord & { width: number; height: number }
export function drawMain(
  ctx: CanvasRenderingContext2D,
  chartArray: IChartBar[],
  { renderTree, option }: { renderTree: ICharts.IRenderTree; option: ICharts.IOption }
) {
  console.log(chartArray)

  // drawNoRaf()

  drawRaf()

  function drawRaf() {
    chartArray.forEach(incrementExec)

    function incrementExec(item: IChartBar, index: number) {
      const per = item.height / 100

      const bitRect = {
        x: item.x,
        y: renderTree.xAxis.axis.start.y,
        width: item.width,
        height: per
      }

      drawBitTask()

      function drawBitTask() {
        console.log('drawBitTask bar')

        requestAnimationFrame(() => {
          if (bitRect.y === item.y) {
            ctx.fillText(String(option.series.data[index] as number), item.x, item.y)
            return
          }

          bitRect.y -= per

          if (bitRect.y < item.y) {
            bitRect.height = bitRect.y + per - item.y
            bitRect.y = item.y
          }

          ctx.fillStyle = 'rgba(0, 0, 255, 0.3)'
          ctx.fillRect(bitRect.x, bitRect.y, bitRect.width, bitRect.height)

          drawBitTask()
        })
      }
    }
  }

  function drawNoRaf() {
    chartArray.forEach(item => {
      const { x, y, width, height } = item
      ctx.fillStyle = primaryColor
      ctx.fillRect(x, y, width, height)
    })
  }
}

// canvas 的 mousemove 事件
export function canvasMousemove(
  evt: MouseEvent,
  ctx: CanvasRenderingContext2D,
  option: ICharts.IOption,
  renderTree: ICharts.IRenderTree
) {
  const { offsetX, offsetY } = evt

  const { xAxis, yAxis } = renderTree

  const xAxis_start_x = xAxis.axis.start.x
  const xAxis_end_x = xAxis.axis.end.x
  const yAxis_start_y = yAxis.axis.start.y
  const yAxis_end_y = yAxis.axis.end.y

  const { xAxisInterval } = xAxis.axis

  const { tickInterval, realInterval, min } = yAxis.tickConstant

  const { assistY, realTickValue } = getYTickFromOffsetY(
    offsetY,
    yAxis_start_y,
    tickInterval,
    realInterval,
    min,
    yAxis.ticks
  )

  const activeIndex = getActiveIndexFromOffsetX(offsetX, xAxis_start_x, xAxisInterval)
  const verticalX = xAxis.ticks[activeIndex].start.x

  console.log(activeIndex, verticalX)

  drawDashLine(ctx, xAxis.ticks[activeIndex].start, { x: verticalX, y: 0 })
}
