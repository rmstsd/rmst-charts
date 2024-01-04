import { Stage } from 'rmst-render'

import { ICoordinateSystemElements, createCoordinateSystemElements } from './coordinateSystem'

import Legend from './components/legend'
import dataZoom, { RangeRatio } from './components/dataZoom'

import { SeriesManager } from './SeriesMgr'

const rangeRatio2Index = (rangeRatio: RangeRatio, startIdx, endIdx: number) => {
  const rs = Math.floor(startIdx + (endIdx - startIdx) * (rangeRatio.startRatio / 100))
  const re = Math.ceil(startIdx + (endIdx - startIdx) * (rangeRatio.endRatio / 100))

  return { startIndex: rs, endIndex: re }
}
export class ChartRoot {
  constructor(canvasContainer: HTMLElement) {
    this.stage = new Stage({
      container: canvasContainer
    })
  }

  firstSetOption = true // 初始化还是更新

  stage: Stage

  option: ICharts.IOption

  finalSeries: ICharts.series[]

  seriesManager: SeriesManager

  legend: Legend

  dataZoom: dataZoom

  coordinateSystem: ICoordinateSystemElements

  renderedElements = []

  private calcFinalSeries() {
    let finalSeries = handleSeries(this.option.series)

    this.finalSeries = finalSeries
  }

  private renderCoordinateSystem() {
    const list: IShape[] = []
    this.coordinateSystem = createCoordinateSystemElements(this.stage, this.option, this.finalSeries)
    if (this.coordinateSystem.hasCartesian2d) {
      list.push(...this.coordinateSystem.cartesian2d.cartesian2dAllShapes)
    }
    if (this.coordinateSystem.hasPolar) {
      list.push(...this.coordinateSystem.polar.polarAllShapes)
    }

    return list
  }

  private renderDataZoom() {
    // 区域缩放
    this.dataZoom = new dataZoom(this)

    this.dataZoom.initRangeRatio()

    this.dataZoom.render()

    return this.dataZoom.elements
  }

  handleZoom() {
    const startRatio = this.option.dataZoom[0].start
    const endRatio = this.option.dataZoom[0].end

    const { startIndex, endIndex } = rangeRatio2Index({ startRatio, endRatio }, 0, this.option.xAxis.data.length)

    this.option.xAxis.data = this.option.xAxis.data.slice(startIndex, endIndex)

    this.option.series.forEach(item => {
      item.data = item.data.slice(startIndex, endIndex)
    })
  }

  setOption(innerOption: ICharts.IOption) {
    console.log(this.firstSetOption ? '初始化' : '更新')

    this.firstSetOption = false

    this.option = innerOption

    // this.handleZoom()
    console.log(this.option)

    this.calcFinalSeries()

    this.renderedElements.push(...this.renderCoordinateSystem())
    this.renderedElements.push(...this.renderDataZoom())

    {
      // 图表主体
      this.seriesManager = new SeriesManager(this)
      this.seriesManager.render(this.finalSeries)
      this.renderedElements.push(...this.seriesManager.elements)
    }

    {
      // 图例
      this.legend = new Legend(this)
      this.legend.render(this.seriesManager.legendData)
      this.renderedElements.push(...this.legend.elements)

      this.legend.onSelect = legendItem => {
        this.seriesManager.select(legendItem)
      }
      this.legend.onCancelSelect = legendItem => {
        this.seriesManager.cancelSelect(legendItem)
      }
    }

    this.refreshChart()
  }

  refreshChart() {
    const { stage } = this

    console.log(this.renderedElements)

    stage.removeAllElements()
    stage.append(this.renderedElements)

    this.seriesManager.afterTasks.forEach(fn => {
      fn()
    })
  }
}

function handleSeries(series: ICharts.series[]): ICharts.series[] {
  return (
    series
      // 设置默认的 2d 坐标系
      .map(item => {
        const nvItem = { ...item }

        // 饼图没有坐标系
        if (nvItem.type === 'pie') {
          nvItem.coordinateSystem = undefined
          return nvItem
        }

        // 默认坐标系为 二维的直角坐标系
        if (!nvItem.coordinateSystem) {
          nvItem.coordinateSystem = 'cartesian2d'
          return nvItem
        }

        return nvItem
      })
      // 折线图堆叠 data求和计算
      .map((serItem, serIndex) => {
        switch (serItem.type) {
          case 'line':
            if (serItem.stack !== 'Total') {
              return serItem
            }

            const lineSeries = series.filter(item => item.type === 'line') as ICharts.LineSeries[]

            return {
              ...serItem,
              data: serItem.data.map((dataItem, dataIndex) => {
                return (
                  dataItem +
                  lineSeries
                    .filter(item => item.stack === 'Total')
                    .slice(0, serIndex)
                    .map(item => item.data[dataIndex])
                    .reduce((prev, cur) => prev + cur, 0)
                )
              })
            }

          default:
            return serItem
        }
      })
  )
}
