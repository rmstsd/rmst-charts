import { useEffect, useRef } from 'react'
import { Stage, Circle } from 'rmst-render'

const SoundingBox = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const c = new Circle({ x: 100, y: 100, radius: 50, fillStyle: 'orange' })

    stage.append(c)
  }, [])

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default SoundingBox
