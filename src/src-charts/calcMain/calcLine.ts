// 折线图 计算 和 绘制
import { primaryColor } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'
import { drawArc, drawBezier, drawSegmentLine } from '../utils.js'

export function calcMain(
  dataSource: number[],
  xAxis: ICharts.IRenderTree['xAxis'],
  yAxis: ICharts.IRenderTree['yAxis']
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

export function calcInitRafValue(chartArray: ICharts.ICoord[], otherConfig) {
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

export function drawMain(ctx: CanvasRenderingContext2D, chartArray: ICharts.ICoord[], otherConfig) {
  const { smooth, xAxisInterval } = otherConfig

  if (smooth) drawBezier(ctx, chartArray, xAxisInterval)
  else {
    const lineArr: { start: ICharts.ICoord; end: ICharts.ICoord }[] = chartArray.reduce(
      (acc, item, idx, originArr) =>
        idx === originArr.length - 1 ? acc : acc.concat({ start: item, end: originArr[idx + 1] }),
      []
    )

    function drawNoRaf() {
      lineArr.forEach(item => drawSegmentLine(ctx, item.start, item.end, primaryColor, 2))

      chartArray.forEach(item => {
        drawArc(ctx, item.x, item.y, 3, primaryColor, 1.5)
      })
    }

    console.log(lineArr)
    drawRaf()

    function drawRaf() {
      const per = 5 // xAxisInterval / segmentCount

      const first_x = lineArr[0].start.x
      const last_x = lineArr.at(-1).end.x

      let bitStart: ICharts.ICoord = { x: lineArr[0].start.x, y: lineArr[0].start.y }

      incrementExec()
      drawArcRafTask(0)

      function incrementExec() {
        requestAnimationFrame(() => {
          drawBitTask()

          if (bitStart.x === last_x) return
          incrementExec()
        })

        function drawBitTask() {
          const idx1 = Math.floor((bitStart.x - first_x) / xAxisInterval)

          const bit_end_x = bitStart.x + per
          const idx2 = Math.floor((bit_end_x - first_x) / xAxisInterval)

          let bitEnd: ICharts.ICoord = {} as ICharts.ICoord

          // 如果没有跨过某个点
          if (idx1 === idx2) {
            const lineIndex = Math.floor((bit_end_x - first_x) / xAxisInterval)
            const currLine = lineArr[lineIndex]

            const k = (currLine.end.y - currLine.start.y) / (currLine.end.x - currLine.start.x)
            const b = currLine.start.y - currLine.start.x * k

            bitEnd = { x: bit_end_x, y: k * bit_end_x + b }
          } else {
            bitEnd = chartArray[idx2]

            drawArcRafTask(idx2)
          }

          drawSegmentLine(ctx, bitStart, bitEnd, primaryColor, 2)

          bitStart = bitEnd
        }
      }

      function drawArcRafTask(index: number) {
        const currentPoint = chartArray[index]
        let radius = 0
        exec()

        function exec() {
          requestAnimationFrame(() => {
            radius += 0.05
            drawArc(ctx, currentPoint.x, currentPoint.y, radius, primaryColor, 2)
            if (radius >= 2) return

            exec()
          })
        }
      }
    }
  }
}
