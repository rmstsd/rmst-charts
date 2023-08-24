// 在鼠标移动过程中 计算鼠标在那个蜡烛上, 返回索引
export function getActiveIndexFromOffsetX(offsetX: number, xAxis_start_x: number, xAxisInterval: number) {
  // 除以的是 半个刻度的距离px
  const tickCount = (offsetX - xAxis_start_x) / (xAxisInterval / 2)
  const index = Math.floor(tickCount / 2)
  return index
}

// 在鼠标移动过程中 计算图表坐标系中 y轴的真实刻度值 (鼠标位置 -> canvas坐标)
export function getYTickFromOffsetY(
  offsetY: number,
  yAxis_start_y: number,
  tickInterval: number,
  realInterval: number,
  realMin: number,
  yTicks: number
) {
  const tickCount = (yAxis_start_y - offsetY) / tickInterval
  const offsetRatio = tickCount - Math.floor(tickCount)

  const offsetVal = 0.05 // 比例

  // 吸附功能
  if (offsetRatio < offsetVal || offsetRatio > 1 - offsetVal) {
    const index = Math.round(tickCount)
    const targetTick = yTicks[index]

    return {
      assistY: targetTick.start[1],
      realTickValue: targetTick.text.value.toFixed(2)
    }
  }

  const realTickValue = (tickCount * realInterval + realMin).toFixed(2)
  return { assistY: offsetY, realTickValue }
}

// 初始化的时候 把真实数据(价格)转换成canvas中的像素位置 (2d坐标系, 转换出的是 canvas 坐标)
export function getCanvasPxFromRealNumber(
  realNumber: number,
  yAxis_start_y: number,
  realMin: number,
  realInterval: number,
  tickInterval: number
) {
  const tickDistance = getCanvasDistanceFromRealNumber(realNumber, realMin, realInterval, tickInterval)
  return yAxis_start_y - tickDistance
}

// 将真实数据转换成 canvas 的绘图数据, 转换出的是距离, 而不是坐标
export function getCanvasDistanceFromRealNumber(
  realNumber: number,
  realMin: number,
  realInterval: number,
  tickInterval: number
) {
  const tickCount = (realNumber - realMin) / realInterval
  const tickDistance = tickCount * tickInterval
  return tickDistance
}
