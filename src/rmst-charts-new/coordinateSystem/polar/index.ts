import { Circle, Stage } from '@/rmst-render'
import { calcPerfectTick } from '../utils'
import { splitLineColor, tickColor } from '@/rmst-charts-new/constant'

const getDataForDraw = (stage: Stage, dataSource: number[]) => {
  const { perfectInterval, perfectMin, intervalCount, tickValues } = calcPerfectTick(dataSource)

  const radiusPer = 30

  const circlesData = tickValues.map((item, index) => ({
    x: stage.center.x,
    y: stage.center.y,
    radius: index * radiusPer,
    strokeStyle: index === tickValues.length - 1 ? tickColor : splitLineColor
  }))

  console.log(tickValues)

  return { circlesData }
}

export type IPolarElements = ReturnType<typeof createPolarElements>
export const createPolarElements = (
  stage: Stage,
  innerOption: ICharts.IOption,
  finalSeries: ICharts.series[]
) => {
  const seriesData = finalSeries.reduce((acc, item) => acc.concat(item.data), []) as number[]

  const { circlesData } = getDataForDraw(stage, seriesData)

  const circleShapes = circlesData.map(
    item =>
      new Circle({
        x: item.x,
        y: item.y,
        radius: item.radius,
        bgColor: 'transparent',
        strokeStyle: item.strokeStyle
      })
  )

  return { circleShapes }
}
