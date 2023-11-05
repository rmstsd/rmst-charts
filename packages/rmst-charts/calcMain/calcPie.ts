import { Stage } from 'rmst-render'

import { pieColors } from '../constant'
import { calcTotalLineLength, pointToFlatArray } from 'rmst-charts/utils/utils'
import { convertToNormalPoints } from 'rmst-render/utils'
import Legend from 'rmst-charts/components/legend'
import PieMain from 'rmst-charts/pieMain'

function calcMain(dataSource: ICharts.PieSeries['data'], end_angle = 360) {
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
  const data = calcMain(seriesItem.data as ICharts.PieSeries['data'])

  const smallerContainerSize = Math.min(stage.canvasSize.width, stage.canvasSize.height)
  const defaultPercent = '70%'
  const ratioDecimal = parseInt(defaultPercent) / 100

  const [innerRadius, outerRadiusOpt] = seriesItem.radius || []

  const outerRadius = (smallerContainerSize / 2) * ratioDecimal
  const hoverRadius = outerRadius + 5

  const legendInstance = new Legend(data)
  const pieMainInstance = new PieMain(
    stage.center,
    data,
    innerRadius,
    outerRadius,
    hoverRadius,
    seriesItem,
    stage.ctx
  )

  legendInstance.onSelect = index => {
    pieMainInstance.select(index)
  }

  legendInstance.onCancelSelect = index => {
    pieMainInstance.cancelSelect(index)
  }

  function afterAppendStage() {
    pieMainInstance.fakeArc.animateCustomCartoon({
      startValue: 0,
      endValue: 360,
      frameCallback: (currentValue, elapsedTimeRatio) => {
        pieMainInstance.pieElements
          .filter(o => o.data.onlyKey === 'main-pie')
          .forEach(element => {
            element.attr({
              startAngle: element.data.animatedProps.startAngle * elapsedTimeRatio,
              endAngle: element.data.animatedProps.endAngle * elapsedTimeRatio
            })
          })
      }
    })

    pieMainInstance.labelElements.forEach((item, index) => {
      const [exLine, exText] = item.elements

      const points = convertToNormalPoints(exLine.data.points)
      const { totalLineLength, lines, lineLengths } = calcTotalLineLength(points)

      let currIndex = 0
      exLine.animateCustomCartoon({
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

          exLine.attr({ points: pointToFlatArray(_points) })
        }
      })
    })
  }

  return {
    elements: [
      pieMainInstance.fakeArc,
      ...legendInstance.elements,
      ...pieMainInstance.pieElements,
      ...pieMainInstance.labelElements
    ],
    afterAppendStage
  }
}
