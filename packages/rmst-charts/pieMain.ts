import { Circle, Group, Line, Stage, Text, deg2rad, getPointOnArc, measureText, Animator } from 'rmst-render'
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

  constructor(stage: Stage, data, innerRadius, outerRadius, seriesItem) {
    const { center, ctx } = stage

    this.ctx = ctx
    this.outerRadius = outerRadius
    this.hoverRadius = outerRadius + 6

    this.seriesItem = seriesItem
    this.center = center

    this.fakeArc = new Circle({
      x: center.x,
      y: center.y,
      radius: outerRadius,
      startAngle: 0,
      endAngle: 0,
      fillStyle: 'transparent'
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
        fillStyle: item.color,
        cursor: 'pointer',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0,
        animatedProps: { startAngle: item.startAngle, endAngle: item.endAngle }
      })

      arc.onmouseenter = () => {
        this.select(index)

        this.onSelected(index)
      }
      arc.onmouseleave = () => {
        this.cancelSelect(index)

        this.onCancelSelect(index)
      }

      return arc
    })

    this.labelElements = data.map((item, idx) => this.createLabel(item, idx))
  }

  createLabel(item, idx) {
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
      strokeStyle: item.color,
      lineWidth: this.seriesItem.labelLine?.lineStyle?.width || 2,
      cursor: 'pointer',
      percent: 0
    })

    const { textWidth, textHeight } = measureText(this.ctx, item.label, 14)
    const labelText = new Text({
      onlyKey: 'label-text',
      x: isInRight ? extendLine_2_x_end + 5 : extendLine_2_x_end - 5,
      y: extendLineSecondPoint_y - textHeight / 2,
      content: item.label,
      fillStyle: tickColor,
      textAlign: isInRight ? 'left' : 'right',
      cursor: 'pointer'
    })

    const group = new Group()

    group.onmouseenter = () => {
      this.select(idx)
    }

    group.onmouseleave = () => {
      this.cancelSelect(idx)
    }

    group.append([extendLine, labelText])

    return group
  }

  afterAppendStage() {
    const ani = new Animator({ value: 0 }, { value: 360 }, { easing: 'cubicInOut' })
    ani.start()
    ani.onUpdate = (_, elapsedTimeRatio) => {
      this.pieElements
        .filter(o => o.data.onlyKey === 'main-pie')
        .forEach(element => {
          element.attr({
            startAngle: element.data.animatedProps.startAngle * elapsedTimeRatio,
            endAngle: element.data.animatedProps.endAngle * elapsedTimeRatio
          })
        })
    }

    this.labelElements.forEach((item, index) => {
      const [exLine, exText] = item.children as unknown as [Line, Text]

      exLine.animateCartoon({ percent: 1 }, { duration: this.seriesItem.animationDuration, easing: 'cubicInOut' })

      // 颜色过渡
      // exText
    })
  }

  select(index: number) {
    const item = this.pieElements[index]
    item.pinTop()
    item.animateCartoon({ radius: this.hoverRadius, shadowBlur: 15 }, { duration: 200 })
  }

  cancelSelect(index: number) {
    this.pieElements[index].animateCartoon({ radius: this.outerRadius, shadowBlur: 0 }, { duration: 200 })
  }

  onSelected = (index: number) => {}
  onCancelSelect = (index: number) => {}
}

export default PieMain
