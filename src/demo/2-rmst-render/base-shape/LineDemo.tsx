import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text, Line, AbstractUi } from 'rmst-render'

const LineDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({ container: canvasRef.current })

    const line = new Line({
      points: [300, 80, 200, 150, 100, 100, 20, 20],
      bgColor: 'pink',
      lineWidth: 2,
      // clip: true,
      smooth: true
    })

    const line2 = new Line({
      points: [0, 0, 100, 100, 200, 100, 300, 300],
      lineWidth: 5,
      strokeStyle: '#45eeb8'
      // closed: true
    })

    line2.onmouseenter = () => {
      line2.attr({ lineWidth: 10 })
      stage.setCursor('pointer')
    }

    line2.onmouseleave = () => {
      line2.attr({ lineWidth: 5 })
      stage.setCursor('auto')
    }

    stage.append([line2])

    return

    const mainPath = new Path2D()

    mainPath.moveTo(20, 20)
    mainPath.lineTo(100, 100)
    mainPath.lineTo(200, 150)
    mainPath.lineTo(300, 80)

    mainPath.lineTo(300, 120)
    mainPath.lineTo(200, 200)
    mainPath.lineTo(100, 120)
    mainPath.lineTo(20, 40)

    mainPath.closePath()

    stage.ctx.stroke(mainPath)
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default LineDemo
