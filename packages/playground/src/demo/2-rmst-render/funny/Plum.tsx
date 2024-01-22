import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text, Line } from 'rmst-render'

function getEndPoint(lineDesc) {
  const { start, length, theta } = lineDesc
  const end = {
    x: start.x + length * Math.cos(theta),
    y: start.y + length * Math.sin(theta)
  }
  return end
}

const Plum = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const btn = document.querySelector('.dd-rr-aa-ww') as HTMLButtonElement

    btn.onclick = () => {
      stage.removeAllShape()

      ddd(line)
    }

    const Width = stage.canvasSize.width
    const Height = stage.canvasSize.height

    const line = {
      start: { x: Width / 2, y: Height },
      length: 20,
      theta: -Math.PI / 2
    }

    const maxDepth = 15

    ddd(line)

    async function ddd(line, depth = 0) {
      if (depth > maxDepth) {
        return
      }

      const lineShape = new Line({
        points: [line.start.x, line.start.y, line.start.x, line.start.y],
        strokeStyle: '#aaa'
      })
      stage.append(lineShape)

      const end = getEndPoint(line)

      await lineShape.animateCartoon(
        { points: [line.start.x, line.start.y, end.x, end.y] },
        { easing: 'cubicOut', duration: 100 }
      )

      if (Math.random() < 0.5 || depth < 3) {
        ddd(
          { start: end, length: line.length + Math.random() * -10 + 5, theta: line.theta - Math.random() * 0.4 },
          depth + 1
        )
      }
      if (Math.random() < 0.5 || depth < 3) {
        ddd(
          { start: end, length: line.length + Math.random() * -10 + 5, theta: line.theta + Math.random() * 0.4 },
          depth + 1
        )
      }
    }
  }, [])
  return (
    <>
      <button className="dd-rr-aa-ww">画</button>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default Plum
