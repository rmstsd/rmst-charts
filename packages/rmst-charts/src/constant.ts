import colorAlpha from 'color-alpha'

// 图表距离canvas元素的内边距
export const canvasPaddingTop = 50
export const canvasPaddingRight = 20
export const canvasPaddingBottom = 40
export const canvasPaddingLeft = 50

export const dataZoomHeight = 40 // 区域缩放高度

// export const xAxisPadding = 10      // x轴右端间隙
export const yAxisPadding = 0 // y轴顶端间隙

// 蜡烛图相关
export const maxCandleCount = 40 // 最大数量
export const minCandleCount = 10 // 最小数量
export const defaultCandleCount = 20 // 初始化默认显示的数量

export const colorPalette = [
  '#0052D9',
  '#029CD4',
  '#2BA471',
  '#F5BA18',
  '#E37318',
  '#D54941',
  '#E851B3',
  '#8E56DD',
  '#E851B3'
]

// 颜色
export const primaryColor = colorPalette[0]
export const primaryColorAlpha = colorAlpha(primaryColor, 0.8)

export const tickColor = '#86909C' // 坐标轴颜色 和 刻度颜色
export const splitLineColor = '#E5E6EB' // Y 轴横向长横线颜色

export const candlestickRed = '#ED589D'
export const candlestickGreen = '#14D460'
