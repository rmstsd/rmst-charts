import { Circle, Line, Stage, Text } from '@/rmst-render'
import { calcPerfectTick } from '../utils'
import { splitLineColor, tickColor } from '@/rmst-charts-new/constant'
import { measureText } from '@/rmst-charts-new/utils/canvasUtil'
import { pointToFlatArray } from '@/rmst-charts-new/utils/utils'

const getDataForDraw = (stage: Stage, dataSource: number[]) => {
  const { perfectInterval, perfectMin, intervalCount, tickValues } = calcPerfectTick(dataSource)

  const center_x = stage.center.x
  const center_y = stage.center.y

  const radiusPer = 30

  const circlesData = tickValues.map((item, index) => ({
    x: center_x,
    y: center_y,
    radius: index * radiusPer,
    strokeStyle: index === tickValues.length - 1 ? tickColor : splitLineColor
  }))

  const lineAxis = {
    start: { x: center_x, y: center_y },
    end: { x: center_x, y: center_y - circlesData.at(-1).radius }
  }

  const tickInterval = (lineAxis.start.y - lineAxis.end.y) / intervalCount
  const ticks = tickValues.map((tickValue, index) => {
    const y = center_y - index * tickInterval
    const end_x = center_x - 6
    const { textWidth, textHeight } = measureText(stage.ctx, String(tickValue))

    return {
      start: { x: center_x, y },
      end: { x: end_x, y },
      text: { x: end_x - textWidth - 2, y: y - textHeight / 2, value: tickValue }
    }
  })

  console.log(ticks)

  return { circlesData, lineAxis, ticks }
}

export type IPolarElements = ReturnType<typeof createPolarElements>
export const createPolarElements = (
  stage: Stage,
  innerOption: ICharts.IOption,
  finalSeries: ICharts.series[]
) => {
  const seriesData = finalSeries.reduce((acc, item) => acc.concat(item.data), []) as number[]

  const { circlesData, lineAxis, ticks } = getDataForDraw(stage, seriesData)

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

  const lineAxisShape = new Line({
    points: pointToFlatArray([lineAxis.start, lineAxis.end]),
    bgColor: tickColor
  })

  const tickShapes = ticks.map(item => {
    return new Line({
      points: [item.start.x, item.start.y, item.end.x, item.end.y],
      bgColor: tickColor
    })
  })

  const textShapes = ticks.map(item => {
    return new Text({ x: item.text.x, y: item.text.y, content: String(item.text.value), color: tickColor })
  })

  return {
    circleShapes,
    lineAxisShape,
    tickShapes,
    textShapes,
    polarAllShapes: [...circleShapes, lineAxisShape, ...tickShapes, ...textShapes]
  }
}
