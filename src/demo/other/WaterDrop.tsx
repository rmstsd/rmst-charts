import { useEffect } from 'react'

import srcCharts from '@/rmst-charts-new'
import { Rect, deg2rad, drawArcPoint, getPointOnArc } from '@/rmst-render'

const WaterDrop = () => {
  useEffect(() => {
    const { stage } = srcCharts.init(document.querySelector('.canvas-container'))

    const { ctx } = stage

    const path = new Path2D(
      'M-0.5421 -0.8857 A0.6 0.6 0 1 1 0.5421 -0.8857 C0.3878 -0.5605 0 -0.42 0 0 C0 -0.42 -0.3878 -0.5605 -0.5421 -0.8857Z'
    )

    ctx.transform(25, 0, 0, 25, 100, 100)
    ctx.fillStyle = 'pink'
    ctx.fill(path)

    return

    const sharp = { x: 100, y: 170 }

    const cx = 100,
      cy = 100,
      radius = 50
    const startAngle = 170
    const endAngle = 10

    const left_p = getPointOnArc(cx, cy, radius, startAngle)
    const right_p = getPointOnArc(cx, cy, radius, endAngle)

    drawArcPoint(ctx, left_p.x, left_p.y, 'red')
    drawArcPoint(ctx, right_p.x, right_p.y, 'blue')

    ctx.beginPath()
    ctx.arc(cx, cy, radius, deg2rad(startAngle), deg2rad(endAngle))
    ctx.stroke()

    ctx.beginPath()

    drawArcPoint(ctx, sharp.x, sharp.y)

    const left_cp1 = { x: left_p.x, y: 140 }
    const left_cp2 = { x: cx, y: 150 }

    const right_cp1 = { x: right_p.x, y: 140 }
    const right_cp2 = { x: cx, y: 150 }

    drawArcPoint(ctx, left_cp1.x, left_cp1.y)
    drawArcPoint(ctx, left_cp2.x, left_cp2.y)

    ctx.moveTo(left_p.x, left_p.y)
    ctx.bezierCurveTo(left_cp1.x, left_cp1.y, left_cp2.x, left_cp2.y, sharp.x, sharp.y)
    ctx.stroke()

    drawArcPoint(ctx, right_cp1.x, right_cp1.y)
    drawArcPoint(ctx, right_cp2.x, right_cp2.y)

    ctx.beginPath()
    ctx.moveTo(right_p.x, right_p.y)
    ctx.bezierCurveTo(right_cp1.x, right_cp1.y, right_cp2.x, right_cp2.y, sharp.x, sharp.y)
    ctx.stroke()
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default WaterDrop

const path = (
  <path d="M-0.5421 -0.8857 A0.6 0.6 0 1 1 0.5421 -0.8857 C0.3878 -0.5605 0 -0.42 0 0 C0 -0.42 -0.3878 -0.5605 -0.5421 -0.8857 Z"></path>
)
