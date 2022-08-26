namespace Chants {
  type ICoord = { x: number; y: number } // 坐标

  type IRenderTree = {
    xAxis: {
      axis: { start: ICoord; end: ICoord; xAxisInterval: number }
      ticks: { start: ICoord; end: ICoord; text: ICoord & { value: string } }[]
    }
    yAxis: {
      axis: { start: ICoord; end: ICoord }
      ticks: { start: ICoord; end: ICoord; text: ICoord & { value: string } }[]
      tickConstant: { min: number; realInterval: number; tickInterval: number }
    }
    chartArray: ICoord[]
  }
}
