import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text, Line } from '@/rmst-render'

const LineDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({ container: canvasRef.current })

    const line = new Line({
      points: [20, 20, 100, 100, 200, 150, 300, 80],
      bgColor: 'pink',
      lineWidth: 20,
      clip: true
    })

    stage.append([line])

    line.animate(undefined, 1000, 'left-right')
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default LineDemo
