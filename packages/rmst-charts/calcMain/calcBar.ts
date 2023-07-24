// 柱状图 计算 和 绘制
import { Stage, Rect, Text, Circle } from 'rmst-render'

import { primaryColor, primaryColorAlpha } from '../constant.js'
import { getCanvasDistanceFromRealNumber, getCanvasPxFromRealNumber } from '../convert.js'
import { ICoordinateSystemElements } from '../coordinateSystem/index.js'

function calcMain(dataSource: number[], xAxisData, yAxis) {
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

function calcPolarMain(
  stage: Stage,
  seriesItem: ICharts.series,
  coordinateSystem: ICoordinateSystemElements
) {
  const { polarAxisData } = coordinateSystem.polar
  const arcs = polarAxisData.radianAngles.map((item, index) => {
    const { min, realInterval, tickInterval } = polarAxisData.tickConstant

    const radius = getCanvasDistanceFromRealNumber(
      seriesItem.data[index] as number,
      min,
      realInterval,
      tickInterval
    )

    const gapAngle = (item.endAngle - item.startAngle) * 0.2

    const arc = new Circle({
      x: stage.center.x,
      y: stage.center.y,
      radius: 0,
      startAngle: item.startAngle + gapAngle,
      endAngle: item.endAngle - gapAngle,
      bgColor: primaryColor,
      extraData: { radius }
    })

    arc.onEnter = () => {
      stage.setCursor('pointer')
    }

    arc.onLeave = () => {
      stage.setCursor('auto')
    }
    return arc
  })

  const afterAppendStage = () => {
    arcs.forEach(item => {
      item.animateCartoon({ radius: item.data.extraData.radius })
    })
  }

  return { elements: arcs, afterAppendStage }
}

export function createRenderElements(
  stage: Stage,
  seriesItem: ICharts.series,
  coordinateSystem: ICoordinateSystemElements
) {
  if (seriesItem.coordinateSystem === 'polar') {
    const polarMain = calcPolarMain(stage, seriesItem, coordinateSystem)

    return polarMain
  }

  const xAxisData = coordinateSystem.cartesian2d.XAxisShape.xAxisData
  const yAxisData = coordinateSystem.cartesian2d.YAxisShape.yAxisData

  const data = calcMain(seriesItem.data as number[], xAxisData, yAxisData)

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