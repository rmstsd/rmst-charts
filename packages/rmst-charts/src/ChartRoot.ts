import { IShape, Stage } from 'rmst-render'

import { ICoordinateSystemElements, createCoordinateSystemElements } from './coordinateSystem'
import {
  Legend,
  dataZoom,
  RangeRatioDecimal,
  hasDataZoom,
  AssistLine,
  Tooltip,
  getRangeRatio,
  rangeRatio2Index
} from './components'

import { SeriesManager } from './SeriesMgr'

import { isInnerRect, stClone } from './utils'

export class ChartRoot {
  constructor(canvasContainer: HTMLElement) {
    const div = document.createElement('div')
    div.style.setProperty('position', 'relative')
    div.style.setProperty('width', '100%')
    div.style.setProperty('height', '100%')

    canvasContainer.appendChild(div)

    this.stage = new Stage({ container: div, enableSt: false })
    this.wrapperContainer = div

    let isInner = false
    this.stage.onmousemove = evt => {
      if (this.coordinateSystem.hasCartesian2d) {
        if (this.isInnerCartesian2dRect(evt.x, evt.y)) {
          if (!isInner) {
            isInner = true

            this.assistLine?.show()
            this.tooltip?.show()
          }

          this.assistLine?.onCartesian2dRectMousemove(evt)
          this.tooltip?.onCartesian2dRectMousemove(evt)
        } else if (isInner) {
          isInner = false

          this.assistLine?.hide()
          this.tooltip?.hide()
        }
      }
    }

    this.stage.canvasElement.onwheel = evt => {
      this.onwheel(evt)
    }

    this.stage.onmousedown = evt => {
      this.onmousedown(evt)
    }

    this.stage.onmouseleave = () => {
      isInner = false
      this.tooltip?.hide()
      this.assistLine?.setVisible(false)
    }
  }

  private onwheel(evt: WheelEvent) {
    if (!hasDataZoom(this.userOption) || !this.isInnerCartesian2dRect(evt.offsetX, evt.offsetY)) {
      return
    }

    evt.preventDefault()

    const curRangeRatio = { ...this.dataZoom.rangeRatio }

    const dis = 0.01
    if (evt.deltaY > 0) {
      curRangeRatio.startRatio = Math.min(curRangeRatio.startRatio + dis, curRangeRatio.endRatio)
      curRangeRatio.endRatio = Math.max(curRangeRatio.endRatio - dis, curRangeRatio.startRatio)
    } else {
      curRangeRatio.startRatio = Math.max(curRangeRatio.startRatio - dis, 0)
      curRangeRatio.endRatio = Math.min(curRangeRatio.endRatio + dis, 1)
    }

    this._range = curRangeRatio
    this.setOption(this.userOption, curRangeRatio)
  }

  private onmousedown(evt) {
    if (!this.coordinateSystem.hasCartesian2d || !this.isInnerCartesian2dRect(evt.x, evt.y)) {
      return
    }

    let mousedownOffsetX = evt.nativeEvent.offsetX

    const canvasElementRect = this.stage.canvasElement.getBoundingClientRect()

    const handleDocumentMousemove = (evt: MouseEvent) => {
      evt.preventDefault()

      const { clientX } = evt
      const offsetCanvasLeft = clientX - canvasElementRect.left
      const offsetValue = offsetCanvasLeft - mousedownOffsetX

      const { xAxisData } = this.coordinateSystem.cartesian2d.cartesian2dAxisData

      // 如果移动距离不够
      if (Math.abs(offsetValue) < xAxisData.axis.xAxisInterval) {
        return
      }
      mousedownOffsetX = offsetCanvasLeft

      const curRangeRatio = { ...this.dataZoom.rangeRatio }

      const dis = 0.01
      if (offsetValue > 0) {
        curRangeRatio.startRatio -= dis
        curRangeRatio.endRatio -= dis
        if (curRangeRatio.startRatio < 0) {
          return
        }
      } else {
        curRangeRatio.startRatio += dis
        curRangeRatio.endRatio += dis
        if (curRangeRatio.endRatio > 1) {
          return
        }
      }

      this._range = curRangeRatio
      this.setOption(this.userOption, curRangeRatio)
    }

    const handleDocumentMouseup = () => {
      document.removeEventListener('mousemove', handleDocumentMousemove)
      document.removeEventListener('mouseup', handleDocumentMouseup)
    }

    document.addEventListener('mousemove', handleDocumentMousemove)
    document.addEventListener('mouseup', handleDocumentMouseup)
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

  initialize = true // 初始化

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
    // console.log(this.firstSetOption ? '初始化' : '更新')

    this.renderedElements = []

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
      if (this.initialize && this.coordinateSystem.hasCartesian2d) {
        this.assistLine = new AssistLine(this)
        this.assistLine.render()
        this.renderedElements.push(...this.assistLine.elements)
      }
    }

    {
      if (this.initialize) {
        this.tooltip = new Tooltip(this)
      }
    }

    this.refreshChart()

    this.initialize = false
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
          //@ts-ignore
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
                  // @ts-ignore
                  .filter(item => item.stack === 'sign')
                  .slice(0, serIndex)
                  .map(item => item.data[dataIndex])
                  //@ts-ignore
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
