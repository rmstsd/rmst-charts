namespace ICharts {
  type ICoord = { x: number; y: number } // 坐标

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

  type series = {
    type: 'line' | 'bar' | 'pie'
    data: ({ value: number; name: string } | number)[]
    coordinateSystem?: 'cartesian2d' | 'polar'

    smooth?: boolean // 折线图-平滑曲线

    // 折线图-面积图
    areaStyle?: {
      opacity?: number
      color?: string | object // 对象为渐变色
    }
    step?: 'start' | 'middle' | 'end' // 折线图-阶梯折线图
    showBackground?: boolean // 柱状图-背景色
    radius?: string | string[] // 饼图-半径 百分比 (容器高宽中较小一项）的 20% 长度) '20%' | ['20%', '40%']
    name?: string // 不参与 UI 渲染
    animationDuration?: number // 毫秒 动画速度
    lineStyle?: {
      width?: number
      join?: CanvasLineJoin
      cap?: CanvasLineCap
    }
    symbol?: 'circle' | 'none'

    stack?: 'Total' // 折线图堆叠
  }

  type IOption = {
    xAxis?: {
      data: string[]
      boundaryGap?: boolean
    }
    series: series[]

    // 极坐标系相关
    polar?: any
    radiusAxis?: any
    angleAxis?: {
      type?: 'category'
      data?: any[]
    }
    // 极坐标系相关
  }
}
