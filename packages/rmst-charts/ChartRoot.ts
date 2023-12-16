import { Stage } from 'rmst-render'

import { ICoordinateSystemElements, createCoordinateSystemElements } from './coordinateSystem'

import Legend, { LegendDataItem } from './components/legend'

import LineMain from './chart/LineMain'
import PieMain from './chart/PieMain'
import BarMain from './chart/BarMain'

export class ChartRoot {
  constructor(canvasContainer: HTMLElement) {
    this.stage = new Stage({
      container: canvasContainer
    })
  }

  stage: Stage

  option: ICharts.IOption

  finalSeries: ICharts.series[]

  seriesInstances: (LineMain | BarMain | PieMain)[] = []

  legend: Legend

  coordinateSystem: ICoordinateSystemElements

  setOption(innerOption: ICharts.IOption) {
    this.option = innerOption

    const { stage } = this

    stage.removeAllElements()

    const legendData: LegendDataItem[] = []

    const renderedElements = []

    const afterTasks = []

    this.finalSeries = handleSeries(innerOption.series)

    this.coordinateSystem = createCoordinateSystemElements(stage, innerOption, this.finalSeries)
    if (this.coordinateSystem.hasCartesian2d) {
      renderedElements.push(...this.coordinateSystem.cartesian2d.cartesian2dAllShapes)
    }
    if (this.coordinateSystem.hasPolar) {
      renderedElements.push(...this.coordinateSystem.polar.polarAllShapes)
    }

    this.finalSeries.forEach((seriesItem, index) => {
      switch (seriesItem.type) {
        case 'line': {
          const line = new LineMain(this)
          line.render(seriesItem, index)

          renderedElements.push(line.lineElements.mainPolyline)
          renderedElements.push(...line.lineElements.arcs)

          if (seriesItem.name) {
            legendData.push({ label: seriesItem.name, color: line.color })
          }

          afterTasks.push(() => {
            line.afterAppendStage()
          })

          this.seriesInstances.push(line)

          break
        }
        case 'bar': {
          const bar = new BarMain(this)
          bar.render(seriesItem, index)

          renderedElements.push(...bar.backgroundElements)
          renderedElements.push(...bar.mainElements)

          renderedElements.push(...bar.polarBarElements)

          afterTasks.push(() => {
            bar.afterAppendStage()
          })
          this.seriesInstances.push(bar)
          break
        }
        case 'pie': {
          const pie = new PieMain(this)
          pie.render(seriesItem)

          legendData.push(...pie.data.map(item => ({ color: item.color, label: item.label })))

          renderedElements.push(...pie.pieElements)
          renderedElements.push(...pie.labelElements)

          afterTasks.push(() => {
            pie.afterAppendStage()
          })

          this.seriesInstances.push(pie)
          break
        }
        default: {
          console.log('新图待实现')
        }
      }
    })

    this.legend = new Legend(this)
    this.legend.render(legendData)

    this.legend.onSelect = (index, legendItem) => {
      this.seriesInstances.forEach(item => {
        item?.select(index)
      })
    }
    this.legend.onCancelSelect = (index, legendItem) => {
      this.seriesInstances.forEach(item => {
        item?.cancelSelect(index)
      })
    }

    renderedElements.push(...this.legend.elements)

    stage.append(renderedElements)

    afterTasks.forEach(fn => {
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
