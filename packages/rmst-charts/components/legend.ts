import { ChartRoot } from 'rmst-charts/ChartRoot'
import { Group, Rect, Text, measureText } from 'rmst-render'

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

    const { stage } = cr

    const legendConfig = { ...defaultLegendCfg, ...cr.option.legend }

    const fontSize = 14

    const width = 35
    const height = 18

    const itemGap = 16
    const textGap = 5

    const x = 10
    const y = 10

    const totalWidth =
      data.reduce((acc, item) => acc + width + textGap + measureText(item.label, fontSize).textWidth, 0) +
      itemGap * (data.length - 1)

    const horizontalX = stage.canvasSize.width / 2 - totalWidth / 2

    const elements = []

    const isVertical = legendConfig.orient === 'vertical'

    let prevX = horizontalX

    data.forEach((item, index) => {
      const verticalY = y + (height + itemGap) * index

      const { textWidth } = measureText(item.label, fontSize)

      const horizontalItemWidth = width + itemGap + textWidth

      const rectX = isVertical ? x : prevX
      prevX = rectX + horizontalItemWidth
      const legendRect = new Rect({
        x: rectX,
        y: isVertical ? verticalY : y,
        width,
        height,
        fillStyle: item.color,
        cursor: 'pointer',
        cornerRadius: 4
      })
      const legendText = new Text({
        x: isVertical ? x + width + textGap : rectX + width + textGap,
        y: isVertical ? verticalY + 3 : y + 3,
        content: item.label,
        fillStyle: item.color,
        fontSize,
        cursor: 'pointer'
      })
      const legendGroup = new Group({ name: 'legend-Group' })
      legendGroup.append([legendRect, legendText])

      legendGroup.onmouseenter = () => {
        this.onSelect(item, index)
      }

      legendGroup.onmouseleave = () => {
        this.onCancelSelect(item, index)
      }

      elements.push(legendGroup)
    })

    this.elements = elements
  }

  elements: Group[]

  onSelect(legendItem: LegendDataItem, index: number) {}
  onCancelSelect(legendItem: LegendDataItem, index: number) {}
}

export default Legend
