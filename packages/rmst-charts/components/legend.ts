import { Group, Rect, Text } from 'rmst-render'

class Legend {
  constructor(data: ICharts.series['data']) {
    this.elements = data.map((item, index) => {
      const width = 40
      const height = 20

      const gap = 10
      const x = 10
      const y = 10 + (height + gap) * index

      const legendRect = new Rect({ x, y, width, height, bgColor: item.color })
      const legendText = new Text({
        x: x + width + 5,
        y,
        content: item.label,
        color: item.color,
        fontSize: 14
      })
      const legendGroup = new Group({ cursor: 'pointer' })
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
