// 柱状图 计算 和 绘制
import { Stage, Rect, Text } from '@/rmst-render'

import type { IXAxisElements } from '../calcAxis/calcXAxis.js'
import type { IYAxisElements } from '../calcAxis/calcYAxis.js'
import { primaryColor } from '../constant.js'
import { getCanvasPxFromRealNumber } from '../convert.js'

export function calcMain(dataSource: number[], xAxisData, yAxis) {
  const { min, realInterval, tickInterval } = yAxis.tickConstant

  const { axis, ticks } = xAxisData
  const yAxis_start_y = yAxis.axis.start.y

  const res = dataSource.map((dataItem, index) => {
    const width = axis.xAxisInterval / 2

    const x = ticks[index].start.x - width / 2
    const y = getCanvasPxFromRealNumber(dataItem, yAxis_start_y, min, realInterval, tickInterval)

    const height = axis.start.y - y

    return { x, y, width, height }
  })

  return res
}

export function createRenderElements(
  stage: Stage,
  seriesItem: ICharts.series,
  xAxisData: IXAxisElements['xAxisData'],
  yAxisData: IYAxisElements['yAxisData']
) {
  const data = calcMain(seriesItem.data, xAxisData, yAxisData)

  const x_axis_start_y = xAxisData.axis.start.y

  const backgroundRects = seriesItem.showBackground
    ? data.map(item => {
        return new Rect({
          x: item.x,
          y: x_axis_start_y,
          width: item.width,
          height: yAxisData.axis.end.y - yAxisData.axis.start.y,
          bgColor: 'rgba(180, 180, 180, 0.2)'
        })
      })
    : []

  const rects = data.map((item, index) => {
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

      rectItem.animateCartoon({ y: dataItem.y, height: dataItem.height })
    }
  }

  return { elements: [...backgroundRects, ...rects], afterAppendStage }
}
