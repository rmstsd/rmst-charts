import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text, Line, calcSmoothPath2D, Path } from '@/rmst-render'

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

    stage.append([line])

    // line.animateCartoon(undefined, 1000, 'left-right')

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
