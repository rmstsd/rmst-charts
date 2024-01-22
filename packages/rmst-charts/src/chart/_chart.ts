import { ChartRoot } from '../ChartRoot'

class _Chart<T = ICharts.series> {
  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr
  }

  seriesItem: T

  render(seriesItem: T, seriesIndex?: number) {}

  afterAppendStage() {}
}

export default _Chart
