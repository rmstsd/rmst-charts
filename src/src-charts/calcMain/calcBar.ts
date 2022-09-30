// 柱状图 计算 和 绘制

import { primaryColor } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'

export function calcMain(
  dataSource: number[],
  xAxis: ICharts.IRenderTree['xAxis'],
  yAxis: ICharts.IRenderTree['yAxis']
) {
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

export function calcInitRafValue(chartArray) {
  const changeValue = chartArray.map(item => item.height / 40) // 每次的增量
  const initHeight = chartArray.map(() => 0)
  const initY = chartArray.map(item => item.y + item.height)

  const aniConfig = { changeValue, initHeight, initY }
  const checkStop = () => chartArray.every((item, index) => initHeight[index] === item.height)

  return { aniConfig, checkStop }
}

type IChartBar = ICharts.ICoord & { width: number; height: number }
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

    function incrementExec(item: IChartBar, index) {
      const per = item.height / 23

      const bitRect = {
        x: item.x,
        y: renderTree.xAxis.axis.start.y,
        width: item.width,
        height: per
      }

      drawBitTask()

      function drawBitTask() {
        console.log('drawBitTask')

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
