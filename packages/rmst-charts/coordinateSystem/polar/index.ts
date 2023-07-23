import { Circle, Line, Stage, Text, getPointOnArc } from 'rmst-render'

import { calcPerfectTick } from '../utils'
import { splitLineColor, tickColor } from '../../constant'
import { measureText } from '../../utils/canvasUtil'
import { pointToFlatArray } from '../../utils/utils'

const getDataForDraw = (stage: Stage, innerOption: ICharts.IOption, dataSource: number[]) => {
  const { perfectInterval, perfectMin, intervalCount, tickValues } = calcPerfectTick(dataSource, true)

  const center_x = stage.center.x
  const center_y = stage.center.y

  const maxRadius = stage.canvasSize.height / 2
  const radiusPer = maxRadius / tickValues.length

  const circlesData = tickValues.map((item, index) => ({
    x: center_x,
    y: center_y,
    radius: index * radiusPer,
    strokeStyle: index === tickValues.length - 1 ? tickColor : splitLineColor
  }))

  const outerCircle = circlesData.at(-1)

  const lineAxis = {
    start: { x: center_x, y: center_y },
    end: { x: center_x, y: center_y - outerCircle.radius }
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

  const { angleAxis } = innerOption
  const anglePer = 360 / angleAxis.data.length

  // 外圈刻度
  const outerTicks = angleAxis.data.map((item, index) => {
    const radianCenterPoint = getPointOnArc(
      stage.center.x,
      stage.center.y,
      outerCircle.radius,
      0 + index * anglePer
    )

    const tickAngle = index * anglePer
    const nextTickAngle = index === angleAxis.data.length - 1 ? 360 : (index + 1) * anglePer

    const radianExtendPoint = getPointOnArc(
      stage.center.x,
      stage.center.y,
      outerCircle.radius + 10,
      tickAngle
    )

    const radianTextPoint = getPointOnArc(
      stage.center.x,
      stage.center.y,
      outerCircle.radius + 15,
      (tickAngle + nextTickAngle) / 2
    )

    return {
      start: { x: radianCenterPoint.x, y: radianCenterPoint.y },
      end: { x: radianExtendPoint.x, y: radianExtendPoint.y },
      text: { x: radianTextPoint.x, y: radianTextPoint.y, value: String(item) }
    }
  })

  const radianAngles = angleAxis.data.map((item, index) => {
    return {
      startAngle: index * anglePer,
      endAngle: index === angleAxis.data.length - 1 ? 360 : (index + 1) * anglePer
    }
  })

  return {
    circlesData,
    lineAxis,
    ticks,
    outerTicks,
    radianAngles,
    tickConstant: { min: perfectMin, realInterval: perfectInterval, tickInterval }
  }
}

export type IPolarElements = ReturnType<typeof createPolarElements>
export const createPolarElements = (
  stage: Stage,
  innerOption: ICharts.IOption,
  finalSeries: ICharts.series[]
) => {
  const seriesData = finalSeries.reduce((acc, item) => acc.concat(item.data), []) as number[]

  const polarAxisData = getDataForDraw(stage, innerOption, seriesData)

  const circleShapes = polarAxisData.circlesData.map(
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
    points: pointToFlatArray([polarAxisData.lineAxis.start, polarAxisData.lineAxis.end]),
    bgColor: tickColor
  })

  const tickShapes = polarAxisData.ticks.map(item => {
    return new Line({
      points: [item.start.x, item.start.y, item.end.x, item.end.y],
      bgColor: tickColor
    })
  })

  const textShapes = polarAxisData.ticks.map(item => {
    return new Text({ x: item.text.x, y: item.text.y, content: String(item.text.value), color: tickColor })
  })

  const outerTickShapes = polarAxisData.outerTicks.map(
    item =>
      new Line({
        points: pointToFlatArray([item.start, item.end]),
        bgColor: tickColor
      })
  )

  const outerTickTextShapes = polarAxisData.outerTicks.map(
    item => new Text({ x: item.text.x, y: item.text.y, content: item.text.value, color: tickColor })
  )

  return {
    circleShapes,
    lineAxisShape,
    tickShapes,
    textShapes,
    polarAllShapes: [
      ...circleShapes,
      lineAxisShape,
      ...tickShapes,
      ...textShapes,
      ...outerTickShapes,
      ...outerTickTextShapes
    ],
    polarAxisData
  }
}
