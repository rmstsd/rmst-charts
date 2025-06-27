import { useEffectStage } from '@/utils/hooks'
import { useRef } from 'react'
import { Stage, Rect, Circle, Text, Ellipse } from 'rmst-render'

const EllipseDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffectStage(canvasRef, stage => {
    const ell = new Ellipse({
      width: 400,
      height: 200,
      x: 100,
      y: 100,
      fillStyle: 'orange',
      lineWidth: 2,
      strokeStyle: 'red',
      cursor: 'move'
    })

    stage.append(ell)

    setTimeout(() => {
      ell.attr({ x: 200, y: 200 })
    }, 1000)
  })

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default EllipseDemo
