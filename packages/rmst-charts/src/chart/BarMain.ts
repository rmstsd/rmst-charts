import { Circle, Rect, Trapezoid } from 'rmst-render'

import { colorPalette, primaryColor } from '../constant'
import { IPolarElements } from '../coordinateSystem/polar'

import { getCanvasDistanceFromRealNumber, getCanvasPxFromRealNumber } from '../utils/convert'
import _Chart from './_chart'
import { style } from '../style'

type BarDataItem = { x: number; y: number; width: number; height: number }
function calcBarData(dataSource: number[], xAxisData, yAxis, prevDataSource: null | number[]) {
  const { min, realInterval, tickInterval } = yAxis.tickConstant

  const { axis, ticks } = xAxisData
  const yAxis_start_y = yAxis.axis.start.y

  const res = dataSource.map((dataItem, index) => {
    const width = axis.xAxisInterval / 2

    const x = ticks[index].start.x - width / 2
    const y = getCanvasPxFromRealNumber(dataItem, yAxis_start_y, min, realInterval, tickInterval)

    let height: number
    if (prevDataSource === null) {
      height = axis.start.y - y
    } else {
      height = getCanvasPxFromRealNumber(prevDataSource[index], yAxis_start_y, min, realInterval, tickInterval) - y
    }

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
        item.animateCartoon({ endAngle: item.data.extraData.endAngle }, { duration: 500, easing: 'quadraticInOut' })
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
      item.animateCartoon({ radius: item.data.extraData.radius }, { duration: 500, easing: 'quadraticInOut' })
    })
  }

  return { elements: arcs, afterAppendStage }
}

const defaultBarSeriesItem = { animation: true }
export default class BarMain extends _Chart<ICharts.BarSeries> {
  data: BarDataItem[] = []

  mainElements: Rect[] = []
  backgroundElements: Rect[] = []

  polarBarElements = []

  color: string

  render(seriesItem: ICharts.BarSeries, seriesIndex: number) {
    const { coordinateSystem } = this.cr
    this.seriesItem = { ...defaultBarSeriesItem, ...seriesItem }

    if (seriesItem.coordinateSystem === 'polar') {
      const { elements, afterAppendStage } = calcPolarMain(this.cr.stage.center, seriesItem, coordinateSystem.polar)

      this.polarBarElements = elements

      this.afterAppendStage = () => {
        afterAppendStage()
      }

      return
    }

    this.color = colorPalette[seriesIndex]

    const xAxisData = coordinateSystem.cartesian2d.cartesian2dAxisData.xAxisData
    const yAxisData = coordinateSystem.cartesian2d.cartesian2dAxisData.yAxisData

    const finalSeries = this.cr.finalSeries as ICharts.LineSeries[]
    this.data = calcBarData(
      seriesItem.data as number[],
      xAxisData,
      yAxisData,
      seriesIndex === 0 ? null : finalSeries[seriesIndex - 1].data
    )

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
      const commonOpt = {
        x: item.x,
        y: this.seriesItem.animation ? item.y + item.height : item.y,
        width: item.width,
        height: this.seriesItem.animation ? 0 : item.height,
        fillStyle: this.color,
        cursor: 'pointer' as const
      }
      const rectItem = Reflect.has(seriesItem.itemStyle || {}, 'shortLength')
        ? new Trapezoid({ ...commonOpt, shortLength: seriesItem.itemStyle.shortLength })
        : new Rect(commonOpt)

      rectItem.onmouseenter = () => {
        rectItem.animateCartoon({ opacity: 0.8 }, { duration: 200 })
      }

      rectItem.onmouseleave = () => {
        rectItem.animateCartoon({ opacity: 1 }, { duration: 200 })
      }

      return rectItem
    })
  }

  afterAppendStage() {
    if (!this.seriesItem.animation) {
      return
    }
    this.mainElements.forEach((rectItem, index) => {
      const dataItem = this.data[index]

      rectItem.animateCartoon({ y: dataItem.y, height: dataItem.height }, { easing: 'quadraticInOut', duration: 500 })
    })
  }

  select(index?: number) {}

  cancelSelect(index?: number) {}

  getTooltipContent(index: number) {
    return `
    <div style="${style.row}">
      <div style="${style.tagSign(this.color)}"></div> 
      <div>${this.seriesItem.name || ''}</div>
      <div style="${style.value}">${this.seriesItem.data[index]}</div>
    </div>`
  }
}
