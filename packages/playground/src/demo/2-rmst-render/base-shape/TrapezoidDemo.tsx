import { useEffect, useRef } from 'react'
import { Stage, Trapezoid } from 'rmst-render'

const TrapezoidDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const tt = new Trapezoid({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      shortLength: '50%',
      fillStyle: 'pink'
    })

    const tt2 = new Trapezoid({
      x: 300,
      y: 100,
      width: 100,
      height: 200,
      shortLength: '60%',
      fillStyle: 'purple'
    })

    stage.append(tt, tt2)
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default TrapezoidDemo
