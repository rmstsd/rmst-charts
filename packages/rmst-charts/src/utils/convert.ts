import { ICartesian2dElements } from '../coordinateSystem/cartesian2d'

export const detectNear = (tickCount: number, offsetVal: number) => {
  const offsetRatio = tickCount - Math.floor(tickCount)

  if (offsetRatio < offsetVal || offsetRatio > 1 - offsetVal) {
    return { isNear: true, nearValue: Math.round(tickCount) }
  }

  return { isNear: false }
}

// 在鼠标移动过程中 计算图表坐标系中 y轴的真实刻度值 (鼠标位置 -> canvas坐标)
export function getYTickFromOffsetY(
  offsetY: number,
  yAxis_start_y: number,
  tickInterval: number,
  realInterval: number,
  realMin: number,
  yTicks: ICartesian2dElements['cartesian2dAxisData']['yAxisData']['ticks']
) {
  const tickCount = (yAxis_start_y - offsetY) / tickInterval

  const neared = detectNear((yAxis_start_y - offsetY) / tickInterval, 0.05)
  if (neared.isNear) {
    const targetTick = yTicks[neared.nearValue]

    return {
      assistY: targetTick.start.y,
      realTickValue: targetTick.text.value
    }
  }

  const realTickValue = Number((tickCount * realInterval + realMin).toFixed())
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
