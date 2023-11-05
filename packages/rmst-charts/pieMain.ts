import { Circle, Group, Line, Text, deg2rad, getPointOnArc, measureText } from 'rmst-render'
import { pointToFlatArray } from './utils/utils'
import { tickColor } from './constant'

class PieMain {
  hoverIndex: number

  hoverRadius: number
  outerRadius: number

  pieElements: Circle[]
  labelElements: Group[]

  fakeArc: Circle

  center: ICoord

  seriesItem

  ctx

  constructor(center: ICoord, data, innerRadius, outerRadius, hoverRadius, seriesItem, ctx) {
    this.ctx = ctx
    this.outerRadius = outerRadius
    this.hoverRadius = hoverRadius

    this.seriesItem = seriesItem
    this.center = center

    this.fakeArc = new Circle({
      x: center.x,
      y: center.y,
      radius: outerRadius,
      startAngle: 0,
      endAngle: 0,
      bgColor: 'transparent'
    })

    this.pieElements = data.map((item, index) => {
      const arc = new Circle({
        onlyKey: 'main-pie',
        x: center.x,
        y: center.y,
        radius: outerRadius,
        innerRadius: innerRadius ? outerRadius * 0.5 : undefined,
        startAngle: 0,
        endAngle: 0,
        bgColor: item.color,
        cursor: 'pointer',
        animatedProps: { startAngle: item.startAngle, endAngle: item.endAngle }
      })

      arc.onEnter = () => {
        this.select(index)

        this.onSelected(index)
      }
      arc.onLeave = () => {
        this.cancelSelect(index)

        this.onCancelSelect(index)
      }

      return arc
    })

    this.labelElements = data.map(item => this.createLabel(item))
  }

  createLabel(item) {
    // 圆弧中心点坐标
    const radianCenterPoint = getPointOnArc(
      this.center.x,
      this.center.y,
      this.outerRadius,
      (item.startAngle + item.endAngle) / 2
    )

    const extendLineLength = 15

    const alpha = (deg2rad(item.startAngle) + deg2rad(item.endAngle)) / 2

    const { center, outerRadius } = this

    const extendLineSecondPoint_x = (outerRadius + extendLineLength) * Math.cos(alpha) + center.x
    const extendLineSecondPoint_y = (outerRadius + extendLineLength) * Math.sin(alpha) + center.y

    const isInRight = extendLineSecondPoint_x > center.x
    const extendLineThirdPoint_x = isInRight
      ? extendLineSecondPoint_x + extendLineLength
      : extendLineSecondPoint_x - extendLineLength

    const extendLineThirdPoint_y = extendLineSecondPoint_y

    const extendLine_2_x_end = isInRight
      ? extendLineSecondPoint_x + extendLineLength
      : extendLineSecondPoint_x - extendLineLength

    const extendLinePoints = [
      { x: radianCenterPoint.x, y: radianCenterPoint.y },
      { x: extendLineSecondPoint_x, y: extendLineSecondPoint_y },
      { x: extendLineThirdPoint_x, y: extendLineThirdPoint_y }
    ]

    const extendLine = new Line({
      onlyKey: 'extend-line',
      points: pointToFlatArray(extendLinePoints),
      fillStyle: item.color,
      bgColor: item.color,
      lineWidth: this.seriesItem.labelLine?.lineStyle?.width || 2
    })

    const { textWidth, textHeight } = measureText(this.ctx, item.label, 14)
    const labelText = new Text({
      onlyKey: 'label-text',
      x: isInRight ? extendLine_2_x_end + 5 : extendLine_2_x_end - 5,
      y: extendLineSecondPoint_y - textHeight / 2,
      content: item.label,
      color: tickColor,
      textAlign: isInRight ? 'left' : 'right'
    })

    const group = new Group()

    group.append([extendLine, labelText])

    return group
  }

  select(index: number) {
    this.pieElements[index].animateCartoon({ radius: this.hoverRadius, shadowBlur: 20 }, 200)
  }

  cancelSelect(index: number) {
    this.pieElements[index].animateCartoon({ radius: this.outerRadius, shadowBlur: 20 }, 200)
  }

  onSelected = (index: number) => {}
  onCancelSelect = (index: number) => {}
}

export default PieMain
