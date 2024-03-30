import { IShape } from 'rmst-render'

import { ChartRoot } from './ChartRoot'

import { LegendDataItem } from './components/legend'

import LineMain from './chart/LineMain'
import PieMain from './chart/PieMain'
import BarMain from './chart/BarMain'
import CandlestickMain from './chart/CandlestickMain'

export class SeriesManager {
  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr
  }

  elements: IShape[] = []

  seriesInstances: (LineMain | PieMain | BarMain | CandlestickMain)[] = []

  legendData: LegendDataItem[] = []

  afterTasks = []

  render(finalSeries: ICharts.series[]) {
    finalSeries.forEach((seriesItem, index) => {
      switch (seriesItem.type) {
        case 'line': {
          const line = new LineMain(this.cr)
          line.render(seriesItem, index)
          this.seriesInstances.push(line)

          this.elements.push(line.lineElements.mainPolyline)
          this.elements.push(...line.lineElements.arcs)

          if (seriesItem.name) {
            this.legendData.push({ label: seriesItem.name, color: line.color })
          }

          this.afterTasks.push(() => {
            line.afterAppendStage()
          })

          break
        }
        case 'bar': {
          const bar = new BarMain(this.cr)
          bar.render(seriesItem, index)
          this.seriesInstances.push(bar)

          this.elements.push(...bar.backgroundElements)
          this.elements.push(...bar.mainElements)

          this.elements.push(...bar.polarBarElements)

          this.afterTasks.push(() => {
            bar.afterAppendStage()
          })
          break
        }
        case 'pie': {
          const pie = new PieMain(this.cr)
          pie.render(seriesItem)
          pie.onSelected = index => {
            this.onSelect(index, pie)
          }
          pie.onCancelSelect = index => {
            this.onCancelSelect(index, pie)
          }
          this.seriesInstances.push(pie)

          this.legendData.push(...pie.data.map(item => ({ color: item.color, label: item.label })))

          this.elements.push(...pie.pieElements)
          this.elements.push(...pie.labelElements)

          this.afterTasks.push(() => {
            pie.afterAppendStage()
          })

          break
        }
        case 'candlestick': {
          const candlestick = new CandlestickMain(this.cr)
          candlestick.render(seriesItem)
          this.seriesInstances.push(candlestick)

          this.elements.push(...candlestick.elements)

          this.afterTasks.push(() => {
            candlestick.afterAppendStage()
          })

          break
        }
        default: {
          console.log('新图待实现')
        }
      }
    })
  }

  get lineSeriesInstances() {
    return this.seriesInstances.filter(item => item.seriesItem.type === 'line') as LineMain[]
  }

  get pieSeriesInstances() {
    return this.seriesInstances.filter(item => item.seriesItem.type === 'pie') as PieMain[]
  }

  select(legendItem: LegendDataItem) {
    const lineMatchedSeries = this.lineSeriesInstances.filter(item => item.seriesItem.name === legendItem.label)
    const lineNotMatchedSeries = this.lineSeriesInstances.filter(item => item.seriesItem.name !== legendItem.label)

    lineMatchedSeries.forEach(item => {
      item.select()
    })
    lineNotMatchedSeries.forEach(item => {
      item.cancelSelect()
    })

    {
      this.pieSeriesInstances.forEach(item => {
        item.select(legendItem)
      })
    }
  }

  cancelSelect(legendItem: LegendDataItem) {
    this.lineSeriesInstances.forEach(item => {
      item.resetNormal()
    })

    {
      this.pieSeriesInstances.forEach(item => {
        item.cancelSelect(legendItem)
      })
    }
  }

  onSelect(index: number, pie: PieMain) {}
  onCancelSelect(index: number, pie: PieMain) {}

  getAxisTooltipContent(activeIndex: number) {
    const innerHtmlList = this.seriesInstances.map(item => item.getTooltipContent(activeIndex))

    return innerHtmlList.reduce((acc, item) => acc + item, '')
  }
}
