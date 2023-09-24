// 折线图 计算 和 绘制
import { primaryColor } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'
import { drawArc, drawSegmentLine } from '../utils/drawHelpers.js'
import { drawBezier } from '../utils/utils.js'

export function calcMain(dataSource: number[], renderTree: ICharts.IRenderTree) {
  const { xAxis, yAxis } = renderTree
  const { min, realInterval, tickInterval } = yAxis.tickConstant

  const xAxisTicks = xAxis.ticks
  const yAxis_start_y = yAxis.axis.start.y

  return dataSource.map((dataItem, index) => {
    const { x: tick_x } = xAxisTicks[index].start
    const y = getCanvasPxFromRealNumber(dataItem, yAxis_start_y, min, realInterval, tickInterval)

    return { x: tick_x, y: y }
  })
}

export function drawMain(
  ctx: CanvasRenderingContext2D,
  chartArray: ICoord[],
  { renderTree, option }: { renderTree: ICharts.IRenderTree; option: ICharts.IOption }
) {
  const { xAxisInterval } = renderTree.xAxis.axis

  const { smooth } = option.series

  if (smooth) drawBezier(ctx, chartArray, xAxisInterval)
  else {
    const lineArr: { start: ICoord; end: ICoord }[] = chartArray.reduce(
      (acc, item, idx, originArr) =>
        idx === originArr.length - 1 ? acc : acc.concat({ start: item, end: originArr[idx + 1] }),
      []
    )

    console.log(lineArr)
    drawRaf()

    function drawRaf() {
      const per = 3 // xAxisInterval / 30

      const first_x = lineArr[0].start.x
      const last_x = lineArr.at(-1).end.x

      let bitStart: ICoord = { x: lineArr[0].start.x, y: lineArr[0].start.y }

      incrementExec()
      drawArcRafTask(0)

      function incrementExec() {
        requestAnimationFrame(() => {
          drawBitTask()

          if (bitStart.x === last_x) return
          incrementExec()
        })

        // 绘制每一小段 (不是两个点之间)
        function drawBitTask() {
          console.log('drawBitTask line')

          const idx1 = Math.floor((bitStart.x - first_x) / xAxisInterval)

          const bit_end_x = bitStart.x + per
          const idx2 = Math.floor((bit_end_x - first_x) / xAxisInterval)

          let bitEnd: ICoord = {} as ICoord

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

          drawSegmentLine(ctx, bitStart, bitEnd, primaryColor, 2) // rgba(0, 16, 128, 0.5)

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

    function drawNoRaf() {
      lineArr.forEach(item => drawSegmentLine(ctx, item.start, item.end, primaryColor, 2))

      chartArray.forEach(item => {
        drawArc(ctx, item.x, item.y, 3, primaryColor, 1.5)
      })
    }
  }
}

// canvas 的 mousemove 事件
export function canvasMousemove(evt) {}
