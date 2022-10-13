// 饼图 计算 和 绘制

import { pieColors } from '../constant.js'
import { measureText, setCtxFontSize } from '../utils/canvasUtil.js'
import { fillRoundRect } from '../utils/drawHelpers.js'

export function calcMain(dataSource: { value: number; name: string }[], end_angle = Math.PI * 2) {
  const sum = dataSource.reduce((acc, item) => acc + item.value, 0)
  const radianArray = dataSource.map(item => (item.value / sum) * end_angle)

  const finalRadianArray: { startAngle: number; endAngle: number; color: string }[] = []
  radianArray.forEach((item, index) => {
    const lastItem = finalRadianArray[finalRadianArray.length - 1]

    const startAngle = index === 0 ? 0 : lastItem.endAngle
    const endAngle = index === 0 ? item : lastItem.endAngle + item
    const nvItem = { startAngle, endAngle, color: pieColors[index], label: dataSource[index].name }

    finalRadianArray.push(nvItem)
  })

  return finalRadianArray
}

export function drawMain(
  ctx: CanvasRenderingContext2D,
  chartArray,
  { renderTree, option }: { renderTree: ICharts.IRenderTree; option: ICharts.IOption },
  offsetWidth,
  offsetHeight
) {
  const center_x = offsetWidth / 2
  const center_y = offsetHeight / 2

  const radius = 100

  const per = Math.PI / 30
  let end_angle = 0

  drawBitTask()

  function drawBitTask() {
    console.log('drawBitTask pie')

    requestAnimationFrame(() => {
      if (end_angle === Math.PI * 2) return

      end_angle += per
      if (end_angle > Math.PI * 2) end_angle = Math.PI * 2

      ctx.clearRect(center_x - radius - 1, center_y - radius - 1, radius * 2 + 2, radius * 2 + 2)

      const array = calcMain(option.series.data, end_angle)
      array.forEach(item => {
        ctx.beginPath()
        ctx.arc(center_x, center_y, radius, item.startAngle, item.endAngle)
        ctx.lineTo(center_x, center_y)
        ctx.fillStyle = item.color
        ctx.fill()
      })

      drawBitTask()
    })
  }

  setCtxFontSize(ctx, 12)
  drawLegend()
  setCtxFontSize(ctx, 14)

  // 绘制图例
  function drawLegend() {
    const padding = 10
    const width = 26
    const height = 12

    chartArray.forEach((item, index) => {
      const y = padding + height * index + index * 10
      ctx.fillStyle = item.color

      fillRoundRect(ctx, padding, y, width, height, 3)

      const { textHeight } = measureText(ctx, item.label)

      ctx.fillText(item.label, padding + width + 5, y + height / 2 - textHeight / 2 + textHeight)
    })
  }
}

// canvas 的 mousemove 事件
export function canvasMousemove(evt) {}
