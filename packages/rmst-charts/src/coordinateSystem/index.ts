/**
  coordinateSystem: 坐标系，可选:
  'cartesian2d' 使用二维的直角坐标系（也称笛卡尔坐标系），通过 xAxisIndex, yAxisIndex指定相应的坐标轴组件。
  'polar' 使用极坐标系，通过 polarIndex 指定相应的极坐标组件
*/

import { Stage } from 'rmst-render'

import { createPolarElements, IPolarElements } from './polar'
import { createCartesian2dElements, ICartesian2dElements } from './cartesian2d'

export type ICoordinateSystemElements = ReturnType<typeof createCoordinateSystemElements>
export const createCoordinateSystemElements = (
  stage: Stage,
  innerOption: ICharts.IOption,
  finalSeries: ICharts.series[]
) => {
  const hasCartesian2d = finalSeries.some(item => item.coordinateSystem === 'cartesian2d')
  let cartesian2d = {} as ICartesian2dElements

  if (hasCartesian2d) {
    cartesian2d = createCartesian2dElements(stage, innerOption, finalSeries)
  }

  const hasPolar = finalSeries.some(item => item.coordinateSystem === 'polar')
  let polar = {} as IPolarElements

  if (hasPolar) {
    polar = createPolarElements(stage, innerOption, finalSeries)
  }

  return { hasCartesian2d, cartesian2d, hasPolar, polar }
}
