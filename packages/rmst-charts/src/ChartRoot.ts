import { IShape, Stage } from 'rmst-render'

import { ICoordinateSystemElements, createCoordinateSystemElements } from './coordinateSystem'
import { Legend, dataZoom, RangeRatioDecimal, hasDataZoom, AssistLine, Tooltip } from './components'

import { SeriesManager } from './SeriesMgr'

import { isInnerRect, stClone } from './utils'

const rangeRatio2Index = (rangeRatio: RangeRatioDecimal, startIdx: number, endIdx: number) => {
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
    const div = document.createElement('div')
    div.style.setProperty('position', 'relative')
    div.style.setProperty('width', '100%')
    div.style.setProperty('height', '100%')

    canvasContainer.appendChild(div)

    this.stage = new Stage({ container: div })
    this.wrapperContainer = div

    let isInner = false
    this.stage.onmousemove = evt => {
      if (this.coordinateSystem.hasCartesian2d) {
        if (this.isInnerCartesian2dRect(evt.x, evt.y)) {
          if (!isInner) {
            isInner = true

            this.assistLine?.onCartesian2dRectMouseenter(evt)
            this.tooltip?.onCartesian2dRectMouseenter(evt)
          }

          this.assistLine?.onCartesian2dRectMousemove(evt)
          this.tooltip?.onCartesian2dRectMousemove(evt)
        } else if (isInner) {
          isInner = false

          this.assistLine?.onCartesian2dRectMouseleave(evt)
          this.tooltip?.onCartesian2dRectMouseleave(evt)
        }
      }
    }
  }

  private isInnerCartesian2dRect(x: number, y: number) {
    const { yAxisData, xAxisData } = this.coordinateSystem.cartesian2d.cartesian2dAxisData

    const xAxis_start_x = xAxisData.axis.start.x
    const xAxis_end_x = xAxisData.axis.end.x

    const yAxis_start_y = yAxisData.axis.start.y
    const yAxis_end_y = yAxisData.axis.end.y

    return isInnerRect(x, y, xAxis_start_x, xAxis_end_x, yAxis_end_y, yAxis_start_y)
  }

  wrapperContainer: HTMLDivElement

  firstSetOption = true // 初始化还是更新

  stage: Stage

  userOption: ICharts.IOption
  dataZoomOption: ICharts.IOption

  finalSeries: ICharts.series[]

  seriesManager: SeriesManager

  legend: Legend

  dataZoom: dataZoom

  coordinateSystem: ICoordinateSystemElements

  assistLine: AssistLine

  tooltip: Tooltip

  renderedElements = []

  private calcFinalSeries() {
    let finalSeries = handleSeries(this.dataZoomOption.series)

    this.finalSeries = finalSeries
  }

  private renderCoordinateSystem() {
    const list: IShape[] = []
    this.coordinateSystem = createCoordinateSystemElements(this.stage, this.dataZoomOption, this.finalSeries)

    const { coordinateSystem } = this
    if (coordinateSystem.hasCartesian2d) {
      const { cartesian2dAllShapes } = coordinateSystem.cartesian2d
      list.push(...cartesian2dAllShapes)
    }
    if (coordinateSystem.hasPolar) {
      list.push(...coordinateSystem.polar.polarAllShapes)
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

    const _dataZoomOption = stClone(this.userOption)

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
      this.seriesManager.onSelect = (index, pie) => {
        console.log(index, pie)

        this.tooltip.externalShow(pie, index)
      }
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

    {
      // 辅助刻度尺 仅对 二维的直角坐标系 有效
      if (this.coordinateSystem.hasCartesian2d) {
        this.assistLine = new AssistLine(this)
        this.assistLine.render()
        this.renderedElements.push(...this.assistLine.elements)
      }
    }

    {
      this.tooltip = new Tooltip(this)
    }

    this.refreshChart()
  }

  refreshChart() {
    const { stage } = this

    stage.removeAllShape()
    stage.append(this.renderedElements)

    this.seriesManager.afterTasks.forEach(fn => {
      fn()
    })
  }
}

function handleSeries(series: ICharts.series[]): ICharts.series[] {
  const ans = series
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
    // 堆叠 data求和计算 // todo: 应该先进行分组, 再计算数据求和
    .map((serItem, serIndex) => {
      switch (serItem.type) {
        case 'line':
        case 'bar':
          // @ts-ignore
          if (serItem.stack !== 'sign') {
            return serItem
          }

          const lineSeries = series

          return {
            ...serItem,
            data: serItem.data.map((dataItem, dataIndex) => {
              return (
                dataItem +
                lineSeries
                  .filter(item => item.stack === 'sign')
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

  return ans
}
