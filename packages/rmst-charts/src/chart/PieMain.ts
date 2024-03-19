import { Circle, Group, Line, Text, Animator } from 'rmst-render'
import { pointToFlatArray, deg2rad, getPointOnArc, measureText } from 'rmst-render'

import { colorPalette, tickColor } from '../constant'
import { LegendDataItem } from '../components/legend'
import _Chart from './_chart'

type pieDataItem = { startAngle: number; endAngle: number; color: string; label: string }
function calcPieData(dataSource: ICharts.PieSeries['data'], end_angle = 360) {
  const sum = dataSource.reduce((acc, item) => acc + item.value, 0)
  const radianArray = dataSource.map(item => (item.value / sum) * end_angle)

  const finalArray: pieDataItem[] = []
  radianArray.forEach((item, index) => {
    const lastItem = finalArray[finalArray.length - 1]

    const startAngle = index === 0 ? 0 : lastItem.endAngle
    const endAngle = index === 0 ? item : lastItem.endAngle + item
    const nvItem = { startAngle, endAngle, color: colorPalette[index], label: dataSource[index].name }

    finalArray.push(nvItem)
  })

  return finalArray
}

class PieMain extends _Chart<ICharts.PieSeries> {
  pieElements: Circle[]
  labelElements: Group[]

  data: pieDataItem[]

  hoverIndex: number

  hoverRadius: number
  outerRadius: number

  fakeArc: Circle

  center: ICoord

  render(seriesItem: ICharts.PieSeries) {
    seriesItem = { animationDuration: 500, ...seriesItem }

    this.seriesItem = seriesItem

    const data = calcPieData(seriesItem.data)

    this.data = data
    const { canvasSize, center } = this.cr.stage

    const smallerContainerSize = Math.min(canvasSize.width, canvasSize.height)
    const defaultPercent = '70%'
    const ratioDecimal = parseInt(defaultPercent) / 100

    const [innerRadius, outerRadiusOpt] = seriesItem.radius || []

    const outerRadius = (smallerContainerSize / 2) * ratioDecimal
    this.outerRadius = outerRadius
    this.hoverRadius = outerRadius + 6

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
        name: 'main-pie',
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
        shadowBlur: 0
      })

      arc.onmouseenter = () => {
        this.select(undefined, index)

        this.onSelected(index)
      }
      arc.onmouseleave = () => {
        this.cancelSelect(undefined, index)

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
      name: 'extend-line',
      points: pointToFlatArray(extendLinePoints),
      strokeStyle: item.color,
      lineWidth: this.seriesItem.labelLine?.lineStyle?.width || 2,
      cursor: 'pointer',
      percent: 0
    })

    const { textWidth, textHeight } = measureText(item.label, 14)
    const labelText = new Text({
      name: 'label-text',
      x: isInRight ? extendLine_2_x_end + 5 : extendLine_2_x_end - 5,
      y: extendLineSecondPoint_y - textHeight / 2,
      content: item.label,
      fillStyle: tickColor,
      textAlign: isInRight ? 'left' : 'right',
      cursor: 'pointer',
      opacity: 0
    })

    const group = new Group()

    group.onmouseenter = () => {
      this.select(undefined, idx)
    }

    group.onmouseleave = () => {
      this.cancelSelect(undefined, idx)
    }

    group.append([extendLine, labelText])

    return group
  }

  afterAppendStage() {
    const ani = new Animator(
      { value: 0 },
      { value: 360 },
      { duration: this.seriesItem.animationDuration, easing: 'quadraticInOut' }
    )
    ani.start()
    ani.onUpdate = ({ value }, elapsedTimeRatio) => {
      const frameData = calcPieData(this.seriesItem.data, value)

      this.pieElements.forEach((element, index) => {
        const frameItem = frameData[index]
        element.attr({ startAngle: frameItem.startAngle, endAngle: frameItem.endAngle })
      })
    }

    this.labelElements.forEach(item => {
      const [exLine, exText] = item.children as unknown as [Line, Text]

      exLine.animateCartoon({ percent: 1 }, { duration: this.seriesItem.animationDuration, easing: 'quadraticInOut' })
      exText.animateCartoon({ opacity: 1 }, { duration: this.seriesItem.animationDuration, easing: 'quadraticInOut' })
    })
  }

  select(legendItem: LegendDataItem, index?: number) {
    const _index = index ?? this.seriesItem.data.findIndex(item => item.name === legendItem.label)
    const item = this.pieElements[_index]
    item.pinTop()
    item.animateCartoon({ radius: this.hoverRadius, shadowBlur: 15 }, { duration: 200 })
  }

  cancelSelect(legendItem: LegendDataItem, index?: number) {
    const _index = index ?? this.seriesItem.data.findIndex(item => item.name === legendItem.label)
    this.pieElements[_index].animateCartoon({ radius: this.outerRadius, shadowBlur: 0 }, { duration: 200 })
  }

  onSelected = (index: number) => {}
  onCancelSelect = (index: number) => {}
}

export default PieMain
