// 折线图 计算 和 绘制
import Circle from '../../rmst-render/Circle.js'
import Line from '../../rmst-render/Line.js'
import Stage from '../../rmst-render/Stage.js'
import type { IXAxisElements } from '../calcAxis/calcXAxis.js'
import type { IYAxisElements } from '../calcAxis/calcYAxis.js'
import { primaryColor, primaryColorAlpha } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'
// import { drawArc, drawSegmentLine } from '../utils/drawHelpers.js'
// import { drawBezier } from '../utils/utils.js'

export function calcMain(
  dataSource: number[],
  xAxisData: IXAxisElements['xAxisData'],
  yAxisData: IYAxisElements['yAxisData']
) {
  const { min, realInterval, tickInterval } = yAxisData.tickConstant

  const yAxis_start_y = yAxisData.axis.start.y

  return dataSource.map((dataItem, index) => {
    const { x: tick_x } = xAxisData.ticks[index].start
    const y = getCanvasPxFromRealNumber(dataItem, yAxis_start_y, min, realInterval, tickInterval)

    return { x: tick_x, y: y }
  })
}

export function createRenderElements(
  stage: Stage,
  innerOption: ICharts.IOption,
  xAxisData: IXAxisElements['xAxisData'],
  yAxisData: IYAxisElements['yAxisData']
) {
  const pointData = calcMain(innerOption.series.data, xAxisData, yAxisData)

  const { areaStyle } = innerOption.series

  const lineArr: { start: ICharts.ICoord; end: ICharts.ICoord }[] = pointData.reduce(
    (acc, item, idx, originArr) =>
      idx === originArr.length - 1 ? acc : acc.concat({ start: item, end: originArr[idx + 1] }),
    []
  )

  function pointToArray(list: { x: number; y: number }[]) {
    return list.reduce((acc, item) => acc.concat([item.x, item.y]), [])
  }

  const singleArea = new Line({
    points: [],
    fillStyle: primaryColorAlpha,
    strokeStyle: 'transparent',
    closed: true
  })

  const lines = lineArr.map(
    item =>
      new Line({
        points: [item.start.x, item.start.y, item.start.x, item.start.y],
        bgColor: primaryColor,
        lineWidth: 2
      })
  )

  const initRadius = 0
  const normalRadius = 3
  const arcs = pointData.map(item => {
    const arcItem = new Circle({
      x: item.x,
      y: item.y,
      radius: initRadius,
      bgColor: 'white',
      strokeStyle: primaryColor
    })

    arcItem.onEnter = () => {
      stage.setCursor('pointer')
      arcItem.animate({ radius: 4 }, 300)
    }

    arcItem.onLeave = () => {
      stage.setCursor('auto')
      arcItem.animate({ radius: normalRadius }, 300)
    }

    return arcItem
  })

  async function afterAppendStage() {
    const [firstArc, ...restArcs] = arcs
    firstArc.animate({ radius: normalRadius })
    for (let i = 0; i < lines.length; i++) {
      const { start, end } = lineArr[i]
      await lines[i].animate({
        points: [start.x, start.y, end.x, end.y],
        animateCallback: prop => {
          if (areaStyle) {
            singleArea.attr({
              points: [
                // x轴起始的点
                pointData[0].x,
                xAxisData.axis.start.y,

                // 中间的数据点
                ...pointToArray(pointData.slice(0, i + 1)),

                prop.points[2],
                prop.points[3],

                // x轴结尾的点
                prop.points[2],
                xAxisData.axis.start.y
              ]
            })
          }
        }
      })
      restArcs[i].animate({ radius: normalRadius })
    }
  }

  const elements = [...lines, ...arcs]
  if (areaStyle) elements.unshift(singleArea)

  return { elements, afterAppendStage }
}

// export function drawMain(
//   ctx: CanvasRenderingContext2D,
//   chartArray: ICharts.ICoord[],
//   { renderTree, option }: { renderTree: ICharts.IRenderTree; option: ICharts.IOption }
// ) {
//   const { xAxisInterval } = renderTree.xAxis.axis

//   const { smooth } = option.series

//   if (smooth) drawBezier(ctx, chartArray, xAxisInterval)
//   else {
//     const lineArr: { start: ICharts.ICoord; end: ICharts.ICoord }[] = chartArray.reduce(
//       (acc, item, idx, originArr) =>
//         idx === originArr.length - 1 ? acc : acc.concat({ start: item, end: originArr[idx + 1] }),
//       []
//     )

//     console.log(lineArr)
//     drawRaf()

//     function drawRaf() {
//       const per = 3 // xAxisInterval / 30

//       const first_x = lineArr[0].start.x
//       const last_x = lineArr.at(-1).end.x

//       let bitStart: ICharts.ICoord = { x: lineArr[0].start.x, y: lineArr[0].start.y }

//       incrementExec()
//       drawArcRafTask(0)

//       function incrementExec() {
//         requestAnimationFrame(() => {
//           drawBitTask()

//           if (bitStart.x === last_x) return
//           incrementExec()
//         })

//         // 绘制每一小段 (不是两个点之间)
//         function drawBitTask() {
//           console.log('drawBitTask line')

//           const idx1 = Math.floor((bitStart.x - first_x) / xAxisInterval)

//           const bit_end_x = bitStart.x + per
//           const idx2 = Math.floor((bit_end_x - first_x) / xAxisInterval)

//           let bitEnd: ICharts.ICoord = {} as ICharts.ICoord

//           // 如果没有跨过某个点
//           if (idx1 === idx2) {
//             const lineIndex = Math.floor((bit_end_x - first_x) / xAxisInterval)
//             const currLine = lineArr[lineIndex]

//             const k = (currLine.end.y - currLine.start.y) / (currLine.end.x - currLine.start.x)
//             const b = currLine.start.y - currLine.start.x * k

//             bitEnd = { x: bit_end_x, y: k * bit_end_x + b }
//           } else {
//             bitEnd = chartArray[idx2]

//             drawArcRafTask(idx2)
//           }

//           drawSegmentLine(ctx, bitStart, bitEnd, primaryColor, 2) // rgba(0, 16, 128, 0.5)

//           bitStart = bitEnd
//         }
//       }

//       function drawArcRafTask(index: number) {
//         const currentPoint = chartArray[index]
//         let radius = 0
//         exec()

//         function exec() {
//           requestAnimationFrame(() => {
//             radius += 0.05
//             drawArc(ctx, currentPoint.x, currentPoint.y, radius, primaryColor, 2)
//             if (radius >= 2) return

//             exec()
//           })
//         }
//       }
//     }

//     function drawNoRaf() {
//       lineArr.forEach(item => drawSegmentLine(ctx, item.start, item.end, primaryColor, 2))

//       chartArray.forEach(item => {
//         drawArc(ctx, item.x, item.y, 3, primaryColor, 1.5)
//       })
//     }
//   }
// }

// canvas 的 mousemove 事件
// export function canvasMousemove(evt) {}
