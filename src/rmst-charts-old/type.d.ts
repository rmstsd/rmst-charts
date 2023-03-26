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
    smooth?: boolean
    areaStyle?: {}
    step?: 'start' | 'middle' | 'end' // 折线图-阶梯折线图
  }

  type IOption = {
    xAxis?: {
      data: string[]
      boundaryGap?: boolean
    }
    series: series[]
  }
}
