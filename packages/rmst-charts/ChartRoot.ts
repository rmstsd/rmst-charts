import { Stage } from 'rmst-render'

import { ICoordinateSystemElements, createCoordinateSystemElements } from './coordinateSystem'

import Legend from './components/legend'
import dataZoom from './components/dataZoom'

import { SeriesManager } from './SeriesMgr'

export class ChartRoot {
  constructor(canvasContainer: HTMLElement) {
    this.stage = new Stage({
      container: canvasContainer
    })
  }

  stage: Stage

  option: ICharts.IOption

  finalSeries: ICharts.series[]

  seriesManager: SeriesManager

  legend: Legend

  dataZoom: dataZoom

  coordinateSystem: ICoordinateSystemElements

  setOption(innerOption: ICharts.IOption) {
    this.option = innerOption

    const { stage } = this

    stage.removeAllElements()

    const renderedElements = []

    const finalSeries = handleSeries(innerOption.series)
    this.finalSeries = finalSeries

    {
      // 坐标系
      this.coordinateSystem = createCoordinateSystemElements(stage, innerOption, finalSeries)
      if (this.coordinateSystem.hasCartesian2d) {
        renderedElements.push(...this.coordinateSystem.cartesian2d.cartesian2dAllShapes)
      }
      if (this.coordinateSystem.hasPolar) {
        renderedElements.push(...this.coordinateSystem.polar.polarAllShapes)
      }
    }

    {
      // 图表主体
      this.seriesManager = new SeriesManager(this)
      this.seriesManager.render(finalSeries)
      renderedElements.push(...this.seriesManager.elements)
    }

    {
      // 图例
      this.legend = new Legend(this)
      this.legend.render(this.seriesManager.legendData)
      renderedElements.push(...this.legend.elements)

      this.legend.onSelect = legendItem => {
        this.seriesManager.select(legendItem)
      }
      this.legend.onCancelSelect = legendItem => {
        this.seriesManager.cancelSelect(legendItem)
      }
    }

    {
      // 区域缩放
      this.dataZoom = new dataZoom(this)
      this.dataZoom.render()

      this.dataZoom.onRange = range => {
        this.seriesManager.setRange(range)
      }

      renderedElements.push(...this.dataZoom.elements)
    }

    stage.append(renderedElements)

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
