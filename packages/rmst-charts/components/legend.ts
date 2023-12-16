import { ChartRoot } from 'rmst-charts/ChartRoot'
import { Group, Rect, Text } from 'rmst-render'

export interface LegendDataItem {
  color: string
  label: string
}

const defaultLegendCfg: ICharts.IOption['legend'] = { orient: 'horizontal', left: 'center' }
class Legend {
  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr
  }

  render(data: LegendDataItem[]) {
    const { cr } = this

    const legendConfig = { ...cr.legend, ...defaultLegendCfg }

    this.elements = data.map((item, index) => {
      const width = 40
      const height = 20

      const gap = 10
      const x = 10
      const y = 10 + (height + gap) * index

      const legendRect = new Rect({
        x,
        y,
        width,
        height,
        fillStyle: item.color,
        cursor: 'pointer',
        cornerRadius: 4
      })
      const legendText = new Text({
        x: x + width + 5,
        y: y + 3,
        content: item.label,
        fillStyle: item.color,
        fontSize: 14,
        cursor: 'pointer'
      })
      const legendGroup = new Group({ name: 'legend-Group' })
      legendGroup.append([legendRect, legendText])

      legendGroup.onmouseenter = () => {
        this.onSelect(index, item)
      }

      legendGroup.onmouseleave = () => {
        this.onCancelSelect(index, item)
      }

      return legendGroup
    })
  }

  elements: Group[]

  onSelect(index: number, legendItem: LegendDataItem) {}
  onCancelSelect(index: number, legendItem: LegendDataItem) {}
}

export default Legend
