import { ChartRoot } from 'rmst-charts/ChartRoot'

class _Chart<T = ICharts.series> {
  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr
  }

  seriesItem: T

  render(seriesItem: T, seriesIndex?: number) {}

  afterAppendStage() {}

  setRange(rangeRatio: { startRatio: number; endRatio: number }) {}
}

export default _Chart
