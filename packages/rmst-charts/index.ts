import { ChartRoot } from './ChartRoot'

const rmstCharts = {
  init: (canvasContainer: HTMLElement) => {
    return new ChartRoot(canvasContainer)
  }
}

export type IChartInstance = {
  setOption: (option: ICharts.IOption) => void
}

export default rmstCharts
