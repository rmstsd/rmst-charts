import { Circle, Rect } from 'rmst-render'

import { ChartRoot } from 'rmst-charts/ChartRoot'
import { colorPalette, primaryColor } from 'rmst-charts/constant'
import { IPolarElements } from 'rmst-charts/coordinateSystem/polar'

import { getCanvasDistanceFromRealNumber, getCanvasPxFromRealNumber } from 'rmst-charts/utils/convert'

type BarDataItem = { x: number; y: number; width: number; height: number }
function calcBarData(dataSource: number[], xAxisData, yAxis) {
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

function calcPolarMain(center, seriesItem: ICharts.BarSeries, coordinateSystemPolar: IPolarElements) {
  const { polarAxisData } = coordinateSystemPolar

  // 极坐标系的径向轴 临时方案, 错误的方案
  if (polarAxisData.mainChartsData) {
    const arcs = polarAxisData.mainChartsData.map(item => {
      const arc = new Circle({
        x: center.x,
        y: center.y,
        startAngle: item.startAngle,
        endAngle: item.startAngle,
        innerRadius: item.innerRadius,
        radius: item.radius,
        fillStyle: primaryColor,
        cursor: 'pointer',
        extraData: { endAngle: item.endAngle }
      })

      return arc
    })

    const afterAppendStage = () => {
      arcs.forEach(item => {
        item.animateCartoon({ endAngle: item.data.extraData.endAngle }, { easing: 'cubicInOut' })
      })
    }

    return { elements: arcs, afterAppendStage }
  }

  const arcs = polarAxisData.radianAngles.map((item, index) => {
    const { min, realInterval, tickInterval } = polarAxisData.tickConstant

    const radius = getCanvasDistanceFromRealNumber(seriesItem.data[index] as number, min, realInterval, tickInterval)

    const gapAngle = (item.endAngle - item.startAngle) * 0.2

    const arc = new Circle({
      x: center.x,
      y: center.y,
      radius: 0,
      startAngle: item.startAngle + gapAngle,
      endAngle: item.endAngle - gapAngle,
      fillStyle: primaryColor,
      extraData: { radius },
      cursor: 'pointer'
    })

    return arc
  })

  const afterAppendStage = () => {
    arcs.forEach(item => {
      item.animateCartoon({ radius: item.data.extraData.radius }, { easing: 'cubicInOut' })
    })
  }

  return { elements: arcs, afterAppendStage }
}

export default class BarMain {
  seriesItem: ICharts.BarSeries

  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr
  }

  data: BarDataItem[] = []

  mainElements: Rect[] = []
  backgroundElements: Rect[] = []

  polarBarElements = []

  render(seriesItem: ICharts.BarSeries, seriesIndex: number) {
    const { coordinateSystem } = this.cr

    if (seriesItem.coordinateSystem === 'polar') {
      const { elements, afterAppendStage } = calcPolarMain(this.cr.stage.center, seriesItem, coordinateSystem.polar)

      this.polarBarElements = elements

      this.afterAppendStage = () => {
        afterAppendStage()
      }

      return
    }

    const xAxisData = coordinateSystem.cartesian2d.cartesian2dAxisData.xAxisData
    const yAxisData = coordinateSystem.cartesian2d.cartesian2dAxisData.yAxisData

    this.data = calcBarData(seriesItem.data as number[], xAxisData, yAxisData)

    const x_axis_start_y = xAxisData.axis.start.y

    this.backgroundElements = seriesItem.showBackground
      ? this.data.map(
          item =>
            new Rect({
              x: item.x,
              y: x_axis_start_y,
              width: item.width,
              height: yAxisData.axis.end.y - yAxisData.axis.start.y,
              fillStyle: 'rgba(180, 180, 180, 0.2)'
            })
        )
      : []

    this.mainElements = this.data.map(item => {
      const rectItem = new Rect({
        x: item.x,
        y: x_axis_start_y,
        width: item.width,
        height: 0,
        fillStyle: colorPalette[seriesIndex],
        cursor: 'pointer'
      })

      rectItem.onmouseenter = () => {
        rectItem.animateCartoon({ opacity: 0.9 }, { duration: 200 })
      }

      rectItem.onmouseleave = () => {
        rectItem.animateCartoon({ opacity: 1 }, { duration: 200 })
      }

      return rectItem
    })
  }

  afterAppendStage() {
    this.mainElements.forEach((rectItem, index) => {
      const dataItem = this.data[index]

      rectItem.animateCartoon({ y: dataItem.y, height: dataItem.height }, { easing: 'cubicInOut' })
    })
  }
}
