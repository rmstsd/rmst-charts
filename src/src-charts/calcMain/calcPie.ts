// 饼图 计算 和 绘制

import { primaryColor, pieColors } from '../constant.js'

export function calcMain(dataSource, end_angle = Math.PI * 2) {
  const sum = dataSource.reduce((acc, item) => acc + item.value, 0)
  const radianArray = dataSource.map(item => (item.value / sum) * end_angle)

  const finalRadianArray: { startAngle: number; endAngle: number; color: string }[] = []
  radianArray.forEach((item, index) => {
    const lastItem = finalRadianArray[finalRadianArray.length - 1]

    const startAngle = index === 0 ? 0 : lastItem.endAngle
    const endAngle = index === 0 ? item : lastItem.endAngle + item
    const nvItem = { startAngle, endAngle, color: pieColors[index] }

    finalRadianArray.push(nvItem)
  })

  return finalRadianArray
}

export function calcInitRafValue() {
  const aniConfig = { end_angle: 0 }
  const checkStop = () => aniConfig.end_angle === Math.PI * 2

  return { aniConfig, checkStop }
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

  // drawPie()

  const per = Math.PI / 10
  let end_angle = per

  drawBitTask()

  function drawBitTask() {
    setTimeout(() => {
      const array = calcMain(option.series.data, end_angle)
      array.forEach(item => {
        ctx.beginPath()
        ctx.arc(center_x, center_y, radius, item.startAngle, item.endAngle)
        ctx.lineTo(center_x, center_y)
        ctx.fillStyle = item.color
        ctx.fill()
      })

      if (end_angle === Math.PI * 2) return
      // if (end_angle > Math.PI * 2) end_angle = Math.PI * 2
      console.log(1)
      end_angle += per

      // drawBitTask()
    }, 50)
  }

  // function drawPie() {
  //   chartArray.forEach(item => {
  //     ctx.beginPath()
  //     ctx.arc(center_x, center_y, radius, item.startAngle, item.endAngle)
  //     ctx.lineTo(center_x, center_y)
  //     ctx.fillStyle = item.color
  //     ctx.fill()
  //   })
  // }
}
