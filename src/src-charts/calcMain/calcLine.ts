// 折线图 计算 和 绘制
import { primaryColor } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'
import { drawArc, drawBezier, drawSegmentLine } from '../utils.js'

export function calcMain(
  dataSource: number[],
  xAxis: TCharts.IRenderTree['xAxis'],
  yAxis: TCharts.IRenderTree['yAxis']
) {
  const { min, realInterval, tickInterval } = yAxis.tickConstant

  const xAxisTicks = xAxis.ticks
  const yAxis_start_y = yAxis.axis.start.y

  return dataSource.map((dataItem, index) => {
    const { x: tick_x } = xAxisTicks[index].start
    const y = getCanvasPxFromRealNumber(dataItem, yAxis_start_y, min, realInterval, tickInterval)

    return { x: tick_x, y: y }
  })
}

export function calcInitRafValue(chartArray: TCharts.ICoord[], otherConfig) {
  const { xAxisInterval } = otherConfig

  const first_point_x = chartArray[0].x
  const per = xAxisInterval / 23
  const last_end_x = chartArray[chartArray.length - 1].x

  const aniConfig = {
    start_x: first_point_x,
    end_x: first_point_x,
    per,
    first_point_x,
    last_end_x
  }
  const checkStop = () => aniConfig.end_x === last_end_x

  return { aniConfig, checkStop }
}

export function drawMain(ctx: CanvasRenderingContext2D, chartArray: TCharts.ICoord[], otherConfig) {
  const { smooth, xAxisInterval } = otherConfig

  // 画圆
  chartArray.forEach(item => {
    drawArc(ctx, item.x, item.y, 3, primaryColor, 2)
  })

  // 画线段
  if (smooth) drawBezier(ctx, chartArray, xAxisInterval)
  else {
    const lineArr = chartArray.reduce(
      (acc, item, idx, originArr) =>
        idx === originArr.length - 1 ? acc : acc.concat({ start: item, end: originArr[idx + 1] }),
      []
    )

    function drawNoRaf() {
      lineArr.forEach(item => drawSegmentLine(ctx, item.start, item.end, primaryColor, 2))
    }

    drawRaf()

    function drawRaf() {
      console.log(lineArr)

      const per = xAxisInterval / 3

      const start_x = lineArr[0].start[0]

      const lineItem = lineArr[0]

      const end_x = start_x + per

      function drawBitLine(start: TCharts.ICoord, end: TCharts.ICoord) {
        drawSegmentLine(ctx, start, end, primaryColor, 2)
      }
    }
  }
}
