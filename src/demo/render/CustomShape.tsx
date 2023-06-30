import { useEffect, useRef } from 'react'

import { Circle, Rect, Stage } from '@/rmst-render'

const CustomShape = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const { ctx } = stage

    const d = `
    M 200 200
    A 20 20 0 1 1 220 200
    
    `

    const path = new Path2D(d)

    ctx.lineWidth = 2
    ctx.strokeStyle = 'pink'
    ctx.stroke(path)
  }, [])

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default CustomShape
