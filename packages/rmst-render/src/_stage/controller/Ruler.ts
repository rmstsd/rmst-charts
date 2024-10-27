import { createLinePath2D, Stage } from '../..'

class Ruler {
  constructor(private stage: Stage) {}

  drawRuler() {
    const { ctx, camera, canvasSize } = this.stage

    const gap = getGap(camera.scale)
    const xTicksData = calcTicks(canvasSize.width, camera.tx, camera.scale, gap)
    const yTicksData = calcTicks(canvasSize.height, camera.ty, camera.scale, gap)

    for (const item of xTicksData) {
      const path2d = createLinePath2D({ points: [item.coord, 0, item.coord, tickSize], percent: 1 })
      ctx.beginPath()
      ctx.strokeStyle = tickColor
      ctx.stroke(path2d)
      ctx.fillStyle = tickColor
      ctx.fillText(item.text, item.coord + 5, 0)
    }

    for (const item of yTicksData) {
      const path2d = createLinePath2D({ points: [0, item.coord, tickSize, item.coord], percent: 1 })
      ctx.beginPath()
      ctx.strokeStyle = tickColor
      ctx.stroke(path2d)

      ctx.save()

      ctx.translate(0, item.coord)
      ctx.rotate((Math.PI / 180) * -90)
      ctx.translate(0, -item.coord)

      ctx.fillStyle = tickColor
      ctx.fillText(item.text, 5, item.coord)
      ctx.restore()
    }
  }
}

export default Ruler

const tickSize = 12
const tickColor = '#444'

function getGap(zoom: number) {
  const zooms = [0.02, 0.03, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
  const gaps = [5000, 2500, 1000, 500, 200, 100, 50, 20, 10]

  let i = 0
  while (i < zooms.length && zooms[i] < zoom) {
    i++
  }
  return gaps[i - 1] || 10000
}

const calcTicks = (canvasSize: number, translate: number, scale: number, gap: number) => {
  const startXRealTick = -(translate / scale)
  const xStartValue = Math.floor(startXRealTick / gap) * gap
  const xTickCount = Math.ceil(canvasSize / scale / gap)
  const xTicks = [xStartValue]
  for (let i = 0; i < xTickCount; i++) {
    const cur = xTicks.at(-1) + gap
    xTicks.push(cur)
  }
  const xTicksData = xTicks.map(item => ({ coord: item * scale + translate, text: item.toString() }))

  return xTicksData
}
