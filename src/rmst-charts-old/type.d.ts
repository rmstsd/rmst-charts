type ICoord = { x: number; y: number } // 坐标
namespace ICharts {
  type IRenderTree = {
    xAxis: {
      axis: { start: ICoord; end: ICoord; xAxisInterval: number }
      ticks: { start: ICoord; end: ICoord; text: ICoord & { value: string | number } }[]
    }
    yAxis: {
      axis: { start: ICoord; end: ICoord }
      ticks: { start: ICoord; end: ICoord; text: ICoord & { value: string | number } }[]
      tickConstant: { min: number; realInterval: number; tickInterval: number }
    }
    chartArray: ICoord[]
  }

  interface BaseSeries {
    name?: string
    animationDuration?: number
    coordinateSystem?: 'polar' | 'cartesian2d'
  }

  interface LineSeries extends BaseSeries {
    type: 'line'
    data: number[]
    smooth?: boolean
    step?: 'start' | 'middle' | 'end' // 折线图-阶梯折线图
    showBackground?: boolean // 柱状图-背景色
    symbol?: 'circle' | 'none'
    stack?: 'Total' // 折线图堆叠
    // 折线图-面积图
    areaStyle?: {
      opacity?: number
      color?: string | object // 对象为渐变色
    }
    lineStyle?: {
      width?: number
      join?: CanvasLineJoin
      cap?: CanvasLineCap
    }
  }

  interface BarSeries extends BaseSeries {
    type: 'bar'
    data: number[]
    showBackground?: boolean
  }

  interface PieSeries extends BaseSeries {
    type: 'pie'
    data: { value: number; name: string }[]
    radius?: string | string[] // 饼图-半径 百分比 (容器高宽中较小一项）的 20% 长度) '20%' | ['20%', '40%']
    labelLine?: {
      lineStyle?: {
        width?: number
      }
    }
  }

  type series = PieSeries | BarSeries | LineSeries

  type IOption = {
    xAxis?: {
      data: string[]
      boundaryGap?: boolean
    }
    series: series[]
    animationDuration?: number // ms

    // 极坐标系相关 ↓
    polar?: any
    radiusAxis?: { type?: 'category'; data?: any[] }
    angleAxis?: {
      type?: 'category'
      data?: any[]
      startAngle?: number
    }
    // 极坐标系相关 ↑

    legend?: {
      orient: 'vertical' | 'horizontal'
      left: 'left' | 'center' | 'right'
    }
  }
}
