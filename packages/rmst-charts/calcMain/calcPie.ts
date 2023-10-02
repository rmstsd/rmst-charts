import {
  Circle,
  Group,
  Rect,
  Line,
  Text,
  AbstractUi,
  getPointOnArc,
  deg2rad,
  Stage,
  measureText
} from 'rmst-render'

import { pieColors, tickColor } from '../constant'
import { calcTotalLineLength, pointToFlatArray } from 'rmst-charts/utils/utils'
import { convertToNormalPoints } from 'rmst-render/utils'

type PieDataSourceItem = { value: number; name: string }
function calcMain(dataSource: PieDataSourceItem[], end_angle = 360) {
  const sum = dataSource.reduce((acc, item) => acc + item.value, 0)
  const radianArray = dataSource.map(item => (item.value / sum) * end_angle)

  const finalRadianArray: { startAngle: number; endAngle: number; color: string; label: string }[] = []
  radianArray.forEach((item, index) => {
    const lastItem = finalRadianArray[finalRadianArray.length - 1]

    const startAngle = index === 0 ? 0 : lastItem.endAngle
    const endAngle = index === 0 ? item : lastItem.endAngle + item
    const nvItem = { startAngle, endAngle, color: pieColors[index], label: dataSource[index].name }

    finalRadianArray.push(nvItem)
  })

  return finalRadianArray
}

export function createRenderElements(stage: Stage, seriesItem: ICharts.PieSeries) {
  const data = calcMain(seriesItem.data as PieDataSourceItem[])

  const smallerContainerSize = Math.min(stage.canvasSize.width, stage.canvasSize.height)
  const defaultPercent = '70%'
  const ratioDecimal = parseInt(defaultPercent) / 100

  const [innerRadius, outerRadiusOpt] = seriesItem.radius || []

  const outerRadius = (smallerContainerSize / 2) * ratioDecimal
  const hoverRadius = outerRadius + 5

  const fakeArc = new Circle({
    x: stage.center.x,
    y: stage.center.y,
    radius: outerRadius,
    startAngle: 0,
    endAngle: 0,
    bgColor: 'transparent'
  })

  const elements = data.reduce<AbstractUi[]>((acc, item, index) => {
    const width = 40
    const height = 20

    const gap = 10
    const x = 10
    const y = 10 + (height + gap) * index

    const { textWidth, textHeight } = measureText(stage.ctx, item.label, 14)

    const legendRect = new Rect({ x, y, width, height, bgColor: item.color })
    const legendText = new Text({ x: x + width + 5, y, content: item.label, color: item.color, fontSize: 14 })
    const legendGroup = new Group({ onlyKey: 'legend' })
    legendGroup.append([legendRect, legendText])

    // 圆弧中心点坐标
    const radianCenterPoint = getPointOnArc(
      stage.center.x,
      stage.center.y,
      outerRadius,
      (item.startAngle + item.endAngle) / 2
    )

    const extendLineLength = 15

    const alpha = (deg2rad(item.startAngle) + deg2rad(item.endAngle)) / 2

    const extendLineSecondPoint_x = (outerRadius + extendLineLength) * Math.cos(alpha) + stage.center.x
    const extendLineSecondPoint_y = (outerRadius + extendLineLength) * Math.sin(alpha) + stage.center.y

    const isInRight = extendLineSecondPoint_x > stage.center.x
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
      lineWidth: seriesItem.labelLine?.lineStyle?.width || 2
    })

    const labelText = new Text({
      onlyKey: 'label-text',
      x: isInRight ? extendLine_2_x_end + 5 : extendLine_2_x_end - 5,
      y: extendLineSecondPoint_y - textHeight / 2,
      content: item.label,
      color: tickColor,
      textAlign: isInRight ? 'left' : 'right'
    })

    const arc = new Circle({
      onlyKey: 'main-pie',
      x: stage.center.x,
      y: stage.center.y,
      radius: outerRadius,
      innerRadius: innerRadius ? outerRadius * 0.5 : undefined,
      startAngle: 0,
      endAngle: 0,
      bgColor: item.color,
      animatedProps: { startAngle: item.startAngle, endAngle: item.endAngle }
    })

    function onPieActiveEnter() {
      arc.animateCartoon({ radius: hoverRadius, shadowBlur: 20 }, 200)
      stage.setCursor('pointer')
    }
    function onPieActiveLeave() {
      arc.animateCartoon({ radius: outerRadius, shadowBlur: 0 }, 200)
      stage.setCursor('auto')
    }

    arc.onEnter = onPieActiveEnter
    arc.onLeave = onPieActiveLeave

    extendLine.onEnter = onPieActiveEnter
    extendLine.onLeave = onPieActiveLeave

    labelText.onEnter = onPieActiveEnter
    labelText.onLeave = onPieActiveLeave

    legendGroup.onEnter = onPieActiveEnter
    legendGroup.onLeave = onPieActiveLeave

    return acc.concat([legendGroup, extendLine, labelText, arc])
  }, [])

  elements.push(fakeArc)

  function afterAppendStage() {
    elements
      .filter(o => o.data.onlyKey === 'extend-line')
      .forEach((item, index) => {
        const points = convertToNormalPoints(item.data.points)
        const { totalLineLength, lines, lineLengths } = calcTotalLineLength(points)

        let currIndex = 0
        item.animateCustomCartoon({
          startValue: 0,
          endValue: totalLineLength,
          totalTime: seriesItem.animationDuration,
          frameCallback: elapsedLength => {
            let tempL = 0

            for (let i = 0; i < lineLengths.length; i++) {
              tempL += lineLengths[i]
              if (tempL >= elapsedLength) {
                currIndex = i
                break
              }
            }

            const lastOnePoint = (() => {
              const currLine = lines[currIndex]

              const currLineElapsedLength =
                elapsedLength - lineLengths.slice(0, currIndex).reduce((acc, item) => acc + item, 0)

              const ratio = currLineElapsedLength / lineLengths[currIndex]

              // currLineElapsedLength / lineLengths[currIndex] = x - x1 /  x2 - x1

              const x = ratio * (currLine.end.x - currLine.start.x) + currLine.start.x
              const y = ratio * (currLine.end.y - currLine.start.y) + currLine.start.y

              return { x, y }
            })()

            const _points = points.slice(0, currIndex + 1).concat(lastOnePoint)

            item.attr({ points: pointToFlatArray(_points) })
          }
        })
      })

    elements
      .filter(o => o.data.onlyKey === 'label-text')
      .forEach((item, index) => {
        // 待实现颜色过渡
        // item.animateCartoon({ color: 'red' })
      })

    fakeArc.animateCustomCartoon({
      startValue: 0,
      endValue: 360,
      frameCallback: (currentValue, elapsedTimeRatio) => {
        elements
          .filter(o => o.data.onlyKey === 'main-pie')
          .forEach(element => {
            element.attr({
              startAngle: element.data.animatedProps.startAngle * elapsedTimeRatio,
              endAngle: element.data.animatedProps.endAngle * elapsedTimeRatio
            })
          })
      }
    })
  }

  return { elements, afterAppendStage }
}
