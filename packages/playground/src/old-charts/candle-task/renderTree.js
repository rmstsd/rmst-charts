// @ts-check

export const renderTree = {
  xAxis: {
    axis: { start: [], end: [], xAxisInterval: 10 },
    ticks: [{ start: [], end: [], text: { x: 0, y: 0, value: '' } }]
  },
  yAxis: {
    axis: { start: [], end: [] },
    ticks: [{ start: [], end: [], text: { x: 0, y: 0, value: 100 } }],
    tickConstant: { min: 100, realInterval: 100, tickInterval: 70 }
  },
  candleArray: [
    {
      topLine: { start: [40, 272], end: [40, 38] },
      centerRect: { x: 29, y: 38, width: 21, height: 143 },
      bottomLine: { start: [40, 311], end: [40, 182] },
      isRise: true // 涨跌
    }
  ],
  assistLine: {
    visible: false,
    vertical: { start: [], end: [] },
    horizontal: { start: [], end: [], text: '' }
  }
}
