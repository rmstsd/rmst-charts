import { ChartRoot } from './ChartRoot'

const rmstCharts = {
  init: (canvasContainer: HTMLElement) => {
    return new ChartRoot(canvasContainer)
  }
}

export default rmstCharts

export { ChartRoot }
