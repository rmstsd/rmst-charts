// @ts-check
// 柱状图 计算 和 绘制

import { primaryColor } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'

export function calcMain(dataSource, xAxis, yAxis) {
  const { min, realInterval, tickInterval } = yAxis.tickConstant

  const { axis, ticks } = xAxis
  const yAxis_start_y = yAxis.axis.start[1]

  const padding = axis.xAxisInterval / 5

  return dataSource.map((dataItem, index) => {
    const x = ticks[index].start[0] - axis.xAxisInterval / 2 + padding
    const y = getCanvasPxFromRealNumber(dataItem, yAxis_start_y, min, realInterval, tickInterval)

    const width = axis.xAxisInterval - padding * 2
    const height = axis.start[1] - y

    return { x, y, width, height }
  })
}

export function calcInitRafValue(chartArray) {
  const changeValue = chartArray.map(item => item.height / 40) // 每次的增量
  const initHeight = chartArray.map(() => 0)
  const initY = chartArray.map(item => item.y + item.height)

  const aniConfig = { changeValue, initHeight, initY }
  const checkStop = () => chartArray.every((item, index) => initHeight[index] === item.height)

  return { aniConfig, checkStop }
}

export function drawMain(ctx, chartArray, otherConfig) {
  const { aniConfig } = otherConfig

  aniConfig ? drawRaf() : drawNoRaf()

  function drawRaf() {
    const { changeValue, initHeight, initY } = aniConfig

    chartArray.forEach((item, index) => {
      initHeight[index] += changeValue[index]
      initY[index] -= changeValue[index]

      if (initHeight[index] > item.height) {
        initHeight[index] = item.height
        initY[index] = item.y
      }

      ctx.fillStyle = primaryColor
      ctx.fillRect(item.x, initY[index], item.width, initHeight[index])
    })
  }

  function drawNoRaf() {
    chartArray.forEach(item => {
      const { x, y, width, height } = item
      ctx.fillStyle = primaryColor
      ctx.fillRect(x, y, width, height)
    })
  }
}
