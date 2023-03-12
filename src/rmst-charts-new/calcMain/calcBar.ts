// 柱状图 计算 和 绘制

import { Stage, Rect, Text } from '../../rmst-render'

import { IXAxisElements } from '../calcAxis/calcXAxis.js'
import { IYAxisElements } from '../calcAxis/calcYAxis.js'
import { primaryColor } from '../constant.js'
import { getActiveIndexFromOffsetX, getCanvasPxFromRealNumber, getYTickFromOffsetY } from '../convert.js'
// import drawDashLine, { drawSegmentLine } from '../utils/drawHelpers.js'

export function calcMain(dataSource: number[], xAxisData, yAxis) {
  const { min, realInterval, tickInterval } = yAxis.tickConstant

  const { axis, ticks } = xAxisData
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

export function createRenderElements(
  stage: Stage,
  seriesItem,
  xAxisData: IXAxisElements['xAxisData'],
  yAxisData: IYAxisElements['yAxisData']
) {
  const data = calcMain(seriesItem.data, xAxisData, yAxisData)

  console.log(data)

  const rects = data.map((item, index) => {
    const x_axis_start_y = xAxisData.axis.start.y

    const rectItem = new Rect({
      x: item.x,
      y: x_axis_start_y,
      width: item.width,
      height: 0,
      bgColor: primaryColor
    })

    rectItem.onEnter = () => {
      stage.setCursor('pointer')
    }

    rectItem.onLeave = () => {
      stage.setCursor('auto')
    }

    return rectItem
  })

  async function afterAppendStage() {
    for (let index = 0; index < rects.length; index++) {
      const rectItem = rects[index]

      const dataItem = data[index]

      rectItem.animate({ y: dataItem.y, height: dataItem.height })
    }
  }

  return { elements: [...rects], afterAppendStage }
}
