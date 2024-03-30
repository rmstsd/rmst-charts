import { useEffect, useRef } from 'react'

import srcCharts from 'rmst-charts'
import { Circle, calcAllControlPoint } from 'rmst-render'

const LinePath = ({ ver }) => {
  const containerRef = useRef()

  useEffect(() => {
    const { stage } = srcCharts.init(containerRef.current)

    const { ctx } = stage

    // ctx.moveTo(100, 100)
    // ctx.lineTo(200, 200)
    // ctx.lineTo(300, 40)
    // ctx.lineTo(400, 120)

    // const gradient = ctx.createLinearGradient(100, 0, 400, 0)

    // gradient.addColorStop(0, 'pink')
    // gradient.addColorStop(0.339999999999999999, 'pink')
    // gradient.addColorStop(0.34, 'blue')
    // gradient.addColorStop(1, 'blue')

    // ctx.strokeStyle = gradient
    // ctx.lineWidth = 50
    // ctx.lineCap = 'square'
    // // ctx.lineJoin = 'round'
    // ctx.stroke()

    // ctx.beginPath()

    // ctx.fillStyle = 'red'
    // ctx.fillRect(100, 100, 2, 2)
    // ctx.fillRect(300, 40, 2, 2)

    const points = [
      { x: 102, y: 50 },
      { x: 207, y: 100 },
      { x: 312, y: 150 },
      { x: 417, y: 84 },
      { x: 522, y: 215 },
      { x: 627, y: 215 }
    ]

    console.log('points', points)
    const [start] = points

    const allPoints = calcAllControlPoint(points, ver)
    console.log('allControlPoint', allPoints)

    const arcs = points.map(item => new Circle({ x: item.x, y: item.y, radius: 3, fillStyle: 'red' }))
    stage.append(arcs)

    let timer

    const cps = allPoints.reduce((acc, item) => acc.concat(item.cp1, item.cp2), [])
    const arcscps = cps.map(item => {
      const cpItem = new Circle({ x: item.x, y: item.y, radius: 3, fillStyle: 'blue', draggable: true })

      cpItem.ondrag = () => {
        cancelAnimationFrame(timer)

        timer = requestAnimationFrame(() => {
          drawQx()
        })
      }

      return cpItem
    })
    stage.append(arcscps)

    drawQx()
    function drawQx() {
      const path2D = new Path2D()
      path2D.moveTo(start.x, start.y)
      allPoints.forEach(item => {
        path2D.bezierCurveTo(item.cp1.x, item.cp1.y, item.cp2.x, item.cp2.y, item.end.x, item.end.y)
      })

      ctx.stroke(path2D)
    }
  }, [])

  return (
    <div>
      <span className="ver">{ver}</span>
      <div className="canvas-container" ref={containerRef}></div>
    </div>
  )
}

export default function Test() {
  return (
    <>
      <LinePath ver="old"></LinePath>
      <LinePath ver="new"></LinePath>
    </>
  )
}
