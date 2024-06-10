import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text } from 'rmst-render'

const TextDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasRef2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const texts = [
      new Text({ x: 100, y: 60, content: '人美声甜', fillStyle: '#333', cursor: 'pointer' }),
      new Text({
        x: 210,
        y: 10,
        content: '君不见黄河之水天上来',
        fillStyle: '#333',
        cursor: 'move',
        textAlign: 'center'
      })
      // new Circle({ x: 210, y: 10, radius: 2, fillStyle: 'red' })
    ]

    stage.append(texts)
  }, [])

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default TextDemo
