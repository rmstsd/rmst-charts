import { Stage } from 'rmst-render'

import { pieColors } from '../constant'

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
  seriesItem = { animationDuration: 1000, ...seriesItem }

  const data = calcMain(seriesItem.data as ICharts.PieSeries['data'])

  const smallerContainerSize = Math.min(stage.canvasSize.width, stage.canvasSize.height)
  const defaultPercent = '70%'
  const ratioDecimal = parseInt(defaultPercent) / 100

  const [innerRadius, outerRadiusOpt] = seriesItem.radius || []

  const outerRadius = (smallerContainerSize / 2) * ratioDecimal

  const legendInstance = new Legend(data)
  const pieMainInstance = new PieMain(stage, data, innerRadius, outerRadius, seriesItem)

  legendInstance.onSelect = index => {
    pieMainInstance.select(index)
  }

  legendInstance.onCancelSelect = index => {
    pieMainInstance.cancelSelect(index)
  }

  return {
    elements: [
      pieMainInstance.fakeArc,
      ...legendInstance.elements,
      ...pieMainInstance.pieElements,
      ...pieMainInstance.labelElements
    ],
    afterAppendStage: () => {
      pieMainInstance.afterAppendStage()
    }
  }
}
