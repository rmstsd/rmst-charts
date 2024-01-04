import { Stage } from 'rmst-render'

import { ICoordinateSystemElements, createCoordinateSystemElements } from './coordinateSystem'

import Legend from './components/legend'
import dataZoom, { RangeRatioDecimal, hasDataZoom } from './components/dataZoom'

import { SeriesManager } from './SeriesMgr'

const rangeRatio2Index = (rangeRatio: RangeRatioDecimal, startIdx, endIdx: number) => {
  const rs = Math.floor(startIdx + (endIdx - startIdx) * rangeRatio.startRatio)
  const re = Math.ceil(startIdx + (endIdx - startIdx) * rangeRatio.endRatio)

  return { startIndex: rs, endIndex: re }
}

const getRangeRatio = (option: ICharts.IOption): RangeRatioDecimal => {
  if (hasDataZoom(option)) {
    return { startRatio: option.dataZoom[0].start / 100, endRatio: option.dataZoom[0].end / 100 }
  }

  return { startRatio: 0, endRatio: 100 }
}

export class ChartRoot {
  constructor(canvasContainer: HTMLElement) {
    this.stage = new Stage({
      container: canvasContainer
    })
  }

  firstSetOption = true // 初始化还是更新

  stage: Stage

  userOption: ICharts.IOption
  dataZoomOption: ICharts.IOption

  finalSeries: ICharts.series[]

  seriesManager: SeriesManager

  legend: Legend

  dataZoom: dataZoom

  coordinateSystem: ICoordinateSystemElements

  renderedElements = []

  private calcFinalSeries() {
    let finalSeries = handleSeries(this.dataZoomOption.series)

    this.finalSeries = finalSeries
  }

  private renderCoordinateSystem() {
    const list: IShape[] = []
    this.coordinateSystem = createCoordinateSystemElements(this.stage, this.dataZoomOption, this.finalSeries)
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

    this.dataZoom.render(this._range)

    this.dataZoom.onRange = r => {
      this._range = r
      this.setOption(this.userOption, r)
    }

    return this.dataZoom.elements
  }

  _range

  setOption(innerOption: ICharts.IOption, rangeRatio?: RangeRatioDecimal) {
    console.log(this.firstSetOption ? '初始化' : '更新')

    this.renderedElements = []

    this.firstSetOption = false

    this.userOption = innerOption

    if (!rangeRatio) {
      rangeRatio = getRangeRatio(this.userOption)
    }

    const _dataZoomOption = window.structuredClone(this.userOption)

    if (_dataZoomOption.xAxis) {
      const { startIndex, endIndex } = rangeRatio2Index(rangeRatio, 0, _dataZoomOption.xAxis.data.length)

      _dataZoomOption.xAxis.data = _dataZoomOption.xAxis.data.slice(startIndex, endIndex)
      _dataZoomOption.series.forEach(item => {
        item.data = item.data.slice(startIndex, endIndex)
      })
    }

    this.dataZoomOption = _dataZoomOption

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
