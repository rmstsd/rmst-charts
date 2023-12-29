import _Chart from './_chart'

class CandlestickMain extends _Chart<ICharts.CandlestickSeries> {
  render(seriesItem: ICharts.CandlestickSeries) {
    this.seriesItem = seriesItem
  }

  afterAppendStage() {}
}

export default CandlestickMain
