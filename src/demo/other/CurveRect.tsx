// 曲线矩形
import { useEffect } from 'react'

import srcCharts from 'rmst-charts'
import { calcAllControlPoint, calcSmoothPath2D } from 'rmst-render'

const CurveRect = () => {
  useEffect(() => {
    const { stage } = srcCharts.init(document.querySelector('.canvas-container'))

    const { ctx } = stage

    const points = [
      { x: 100, y: 100 },
      { x: 200, y: 150 },
      { x: 300, y: 50 },
      { x: 400, y: 150 },
      { x: 500, y: 180 }
    ]

    const points_2 = [
      { x: 100, y: 150 },
      { x: 200, y: 200 },
      { x: 300, y: 150 },
      { x: 400, y: 250 },
      { x: 500, y: 250 }
    ].reverse()

    const allPoints_1 = calcAllControlPoint(points)
    const path2D = new Path2D()
    path2D.moveTo(points[0].x, points[0].y)
    allPoints_1.forEach(item => {
      path2D.bezierCurveTo(item.cp1.x, item.cp1.y, item.cp2.x, item.cp2.y, item.end.x, item.end.y)
    })
    path2D.lineTo(points_2[0].x, points_2[0].y)

    const allPoints_2 = calcAllControlPoint(points_2)
    const path2D_2 = new Path2D()
    path2D_2.moveTo(points_2[0].x, points_2[0].y)
    allPoints_2.forEach(item => {
      path2D_2.bezierCurveTo(item.cp1.x, item.cp1.y, item.cp2.x, item.cp2.y, item.end.x, item.end.y)
    })
    path2D_2.lineTo(points[0].x, points[0].y)

    path2D_2.addPath(path2D)

    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, 'red')
    gradient.addColorStop(1, 'blue')

    ctx.fillStyle = gradient
    ctx.stroke(path2D_2)
    ctx.fill(path2D_2)

    ctx.beginPath()

    ctx.lineWidth = 0
    ctx.strokeRect(0, 0, 100, 100)
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default CurveRect
