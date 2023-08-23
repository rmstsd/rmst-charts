import { Stage } from 'rmst-render'
import { createXAxisElements } from './calcXAxis'
import { createYAxisElements } from './calcYAxis'

export type ICartesian2dElements = ReturnType<typeof createCartesian2dElements>
export const createCartesian2dElements = (
  stage: Stage,
  innerOption: ICharts.IOption,
  finalSeries: ICharts.series[]
) => {
  const xAxisShape = createXAxisElements(stage, innerOption)
  const yAxisShape = createYAxisElements(stage, finalSeries)

  return {
    cartesian2dAllShapes: [
      xAxisShape.xAxisLine,
      ...xAxisShape.ticksLines,
      ...xAxisShape.tickTexts,

      yAxisShape.yAxisLine,
      ...yAxisShape.ticksLines,
      ...yAxisShape.tickTexts
    ],
    cartesian2dAxisData: {
      xAxisData: xAxisShape.xAxisData,
      yAxisData: yAxisShape.yAxisData
    }
  }
}
