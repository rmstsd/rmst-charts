/**
  coordinateSystem: 坐标系，可选:
  'cartesian2d' 使用二维的直角坐标系（也称笛卡尔坐标系），通过 xAxisIndex, yAxisIndex指定相应的坐标轴组件。
  'polar' 使用极坐标系，通过 polarIndex 指定相应的极坐标组件
*/

import { Stage } from '@/rmst-render'
import { createXAxisElements, IXAxisElements } from './cartesian2d/calcXAxis'
import { createYAxisElements, IYAxisElements } from './cartesian2d/calcYAxis'

const createCartesian2dElements = () => {}

const createPolarElements = () => {}

export type ICoordinateSystemElements = ReturnType<typeof createCoordinateSystemElements>
export const createCoordinateSystemElements = (
  stage: Stage,
  innerOption: ICharts.IOption,
  finalSeries: ICharts.series[]
) => {
  const hasCartesian2d = finalSeries.some(item => item.coordinateSystem === 'cartesian2d')
  const cartesian2d = {} as { XAxisShape: IXAxisElements; YAxisShape: IYAxisElements }
  if (hasCartesian2d) {
    cartesian2d.XAxisShape = createXAxisElements(stage, innerOption)
    cartesian2d.YAxisShape = createYAxisElements(stage, finalSeries)
  }

  const hasPolar = finalSeries.some(item => item.coordinateSystem === 'polar')
  const polar = {}
  if (hasPolar) {
    polar
  }

  return { hasCartesian2d, cartesian2d, hasPolar, polar }
}
