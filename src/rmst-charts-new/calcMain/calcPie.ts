import { measureText } from '@/rmst-charts-new/utils/canvasUtil'
import { Circle, Group, Rect, Line, Text, Path, getPointOnArc, deg2rad } from '@/rmst-render'

import { pieColors } from '../constant'

function calcMain(dataSource: { value: number; name: string }[], end_angle = 360) {
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

export function createRenderElements(stage, seriesItem) {
  const data = calcMain(seriesItem.data)
  const fakeArc = new Circle({
    x: stage.center.x,
    y: stage.center.y,
    radius: 100,
    startAngle: 0,
    endAngle: 0,
    bgColor: 'transparent'
  })

  const elements = data.reduce<Path[]>((acc, item, index) => {
    const width = 40
    const height = 20

    const gap = 10
    const x = 10
    const y = 10 + (height + gap) * index

    const { textWidth, textHeight } = measureText(stage.ctx, item.label)

    const legendRect = new Rect({ x, y, width, height, bgColor: item.color })
    const legendText = new Text({ x: x + width + 5, y, content: item.label, color: item.color, fontSize: 16 })
    const legendGroup = new Group({ onlyKey: 'legend' })
    legendGroup.append([legendRect, legendText])

    const radius = 100

    // 圆弧中心点坐标
    const radianCenterPoint = getPointOnArc(
      stage.center.x,
      stage.center.y,
      radius,
      (item.startAngle + item.endAngle) / 2
    )

    const extendLineLength = 15

    const alpha = (deg2rad(item.startAngle) + deg2rad(item.endAngle)) / 2
    const x_end = (radius + extendLineLength) * Math.cos(alpha) + stage.center.x
    const y_end = (radius + extendLineLength) * Math.sin(alpha) + stage.center.y

    const extendLine_1_end = [x_end, y_end]
    const extendLine_1 = new Line({
      onlyKey: 'extend-line_1',
      points: [radianCenterPoint.x, radianCenterPoint.y, radianCenterPoint.x, radianCenterPoint.y],
      fillStyle: item.color,
      bgColor: item.color,
      extraData: extendLine_1_end,
      lineWidth: 2
    })

    const isCenterRight = x_end > stage.center.x
    const extendLine_2_x_end = isCenterRight ? x_end + extendLineLength : x_end - extendLineLength
    const extendLine_2_end = [extendLine_2_x_end, y_end]
    const extendLine_2 = new Line({
      onlyKey: 'extend-line_2',
      points: [x_end, y_end, x_end, y_end],
      fillStyle: item.color,
      bgColor: item.color,
      extraData: extendLine_2_end,
      lineWidth: 2
    })

    const labelText = new Text({
      x: isCenterRight ? extendLine_2_x_end + 5 : extendLine_2_x_end - textWidth - 5,
      y: y_end - textHeight / 2,
      content: item.label,
      color: '#333',
      fontSize: 16
    })

    const arc = new Circle({
      onlyKey: 'main-pie',
      x: stage.center.x,
      y: stage.center.y,
      radius,
      startAngle: 0,
      endAngle: 0,
      bgColor: item.color
    })

    function onPieActiveEnter() {
      arc.animate({ radius: 105, shadowBlur: 20 }, 200)
      stage.setCursor('pointer')
    }
    function onPieActiveLeave() {
      arc.animate({ radius: 100, shadowBlur: 0 }, 200)
      stage.setCursor('auto')
    }

    legendGroup.onEnter = onPieActiveEnter
    legendGroup.onLeave = onPieActiveLeave

    arc.onEnter = onPieActiveEnter
    arc.onLeave = onPieActiveLeave

    labelText.onEnter = onPieActiveEnter
    labelText.onLeave = onPieActiveLeave

    extendLine_1.onEnter = onPieActiveEnter
    extendLine_1.onLeave = onPieActiveLeave

    extendLine_2.onEnter = onPieActiveEnter
    extendLine_2.onLeave = onPieActiveLeave

    return acc.concat([legendGroup, extendLine_1, extendLine_2, labelText, arc])
  }, [])

  elements.push(fakeArc)

  function afterAppendStage() {
    const extendLine_2s = elements.filter(o => o.data.onlyKey === 'extend-line_2')

    elements
      .filter(o => o.data.onlyKey === 'extend-line_1')
      .forEach((item, index) => {
        item
          .animate({ points: [item.data.points[0], item.data.points[1], ...item.data.extraData] }, 300)
          .then(() => {
            const extendLine_2sItem = extendLine_2s[index]
            extendLine_2sItem.animate(
              {
                points: [
                  extendLine_2sItem.data.points[0],
                  extendLine_2sItem.data.points[1],
                  ...extendLine_2sItem.data.extraData
                ]
              },
              300
            )
          })
      })

    fakeArc.animate({
      endAngle: 360,
      animateCallback(prop) {
        const data = calcMain(seriesItem.data, prop.endAngle)

        elements
          .filter(o => o.data.onlyKey === 'main-pie')
          .forEach((element, index) => {
            const curr = data[index]

            element.attr({ startAngle: curr.startAngle, endAngle: curr.endAngle })
          })
      }
    })
  }

  return { elements, afterAppendStage }
}
