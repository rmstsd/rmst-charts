import { Group, Rect, Text } from 'rmst-render'

class Legend {
  constructor(data: ICharts.series['data']) {
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
      const legendGroup = new Group({})
      legendGroup.append([legendRect, legendText])

      legendGroup.onmouseenter = () => {
        this.onSelect(index)
      }

      legendGroup.onmouseleave = () => {
        this.onCancelSelect(index)
      }

      return legendGroup
    })
  }

  elements: Group[]

  onSelect(index: number) {}
  onCancelSelect(index: number) {}
}

export default Legend
