// @ts-check
// 饼图 计算 和 绘制

import { primaryColor, pieColors } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'
import { drawArc, drawBezier, drawSegmentLine } from '../utils.js'

export function calcMain(dataSource, end_angle = Math.PI * 2) {
  const sum = dataSource.reduce((acc, item) => acc + item.value, 0)
  const radianArray = dataSource.map(item => (item.value / sum) * end_angle)

  const finalRadianArray = []
  radianArray.forEach((item, index) => {
    const lastItem = finalRadianArray[finalRadianArray.length - 1]

    const startAngle = index === 0 ? 0 : lastItem.endAngle
    const endAngle = index === 0 ? item : lastItem.endAngle + item
    const nvItem = { startAngle, endAngle, color: pieColors[index] }

    finalRadianArray.push(nvItem)
  })

  return finalRadianArray
}

export function calcInitRafValue() {
  const aniConfig = { end_angle: 0 }
  const checkStop = () => aniConfig.end_angle === Math.PI * 2

  return { aniConfig, checkStop }
}

export function drawMain(ctx, chartArray, otherConfig) {
  const { circleCenter, aniConfig, dataSource } = otherConfig

  aniConfig ? drawRaf() : drawPie(chartArray)

  function drawRaf() {
    aniConfig.end_angle = aniConfig.end_angle + 0.1
    if (aniConfig.end_angle > Math.PI * 2) aniConfig.end_angle = Math.PI * 2

    const rafChartArray = calcMain(dataSource, aniConfig.end_angle)

    drawPie(rafChartArray)
  }

  function drawPie(pieChartArray) {
    pieChartArray.forEach(item => {
      ctx.beginPath()
      ctx.arc(circleCenter.x, circleCenter.y, 100, item.startAngle, item.endAngle)
      ctx.lineTo(circleCenter.x, circleCenter.y)
      ctx.fillStyle = item.color
      ctx.fill()
    })
  }
}
