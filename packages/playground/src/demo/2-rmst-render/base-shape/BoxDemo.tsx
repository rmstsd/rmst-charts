import { useEffectStage } from '@/utils/hooks'
import OpenColor from 'open-color'
import { useRef } from 'react'
import { Box, Ellipse } from 'rmst-render'

const BoxDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffectStage(canvasRef, stage => {
    const ell = new Box({
      width: 400,
      height: 200,
      x: 100,
      y: 100,
      fillStyle: 'orange',
      lineWidth: 10,
      strokeStyle: OpenColor.blue[6],
      cursor: 'move',
      draggable: true,
      children: [
        new Ellipse({
          x: -40,
          y: -30,
          width: 150,
          height: 100,
          fillStyle: 'red',
          draggable: true
        })
      ]
    })

    stage.append(ell)
  })

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default BoxDemo
