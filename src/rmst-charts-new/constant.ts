import colorAlpha from 'color-alpha'

// 图表距离canvas元素的内边距
export const canvasPaddingTop = 20
export const canvasPaddingRight = 20
export const canvasPaddingBottom = 40
export const canvasPaddingLeft = 50

// export const xAxisPadding = 10      // x轴右端间隙
export const yAxisPadding = 0 // y轴顶端间隙

export const dpr = window.devicePixelRatio

// 蜡烛图相关
export const maxCandleCount = 40 // 最大数量
export const minCandleCount = 10 // 最小数量
export const defaultCandleCount = 20 // 初始化默认显示的数量

// 颜色
export const primaryColor = '#5C7BD9'
export const primaryColorAlpha = colorAlpha(primaryColor, 0.8)

export const pieColors = ['#EE6666', '#73C0DE', '#5470C6', '#91CC75', '#FAC858', 'red', 'purple', 'pink']

export const tickColor = '#555' // 坐标轴颜色 和 刻度颜色
export const splitLineColor = '#E0E6F1'

export const colorPalette = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc'
]
