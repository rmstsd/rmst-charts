// @ts-check

// 在鼠标移动过程中 计算鼠标在那个蜡烛上, 返回索引
export function getActiveIndexFromOffsetX(offsetX, xAxis_start_x, xAxisInterval) {
  // 除以的是 半个刻度的距离px
  const tickCount = (offsetX - xAxis_start_x) / (xAxisInterval / 2)
  const index = Math.floor(tickCount / 2)
  return index
}

// 在鼠标移动过程中 计算图表坐标系中 y轴的真实刻度值
export function getYTickFromOffsetY(offsetY, yAxis_start_y, tickInterval, realInterval, min, yTicks) {
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

  const realTickValue = (tickCount * realInterval + min).toFixed(2)
  return { assistY: offsetY, realTickValue }
}

// 初始化的时候 把真实数据(价格)转换成canvas中的像素位置
export function getCanvasPxFromRealNumber(realNumber, yAxis_start_y, min, realInterval, tickInterval) {
  const tickCount = (realNumber - min) / realInterval
  const tickDistance = tickCount * tickInterval
  return yAxis_start_y - tickDistance
}
