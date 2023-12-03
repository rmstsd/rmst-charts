import { useEffect, useRef } from 'react'

import { Circle, Rect, Stage } from 'rmst-render'

const Animate = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rect = new Rect({
      x: 200,
      y: 50,
      width: 100,
      height: 60,
      fillStyle: 'purple',
      shadowColor: 'red'
    })

    stage.append([rect])

    rect.animateCartoon({ x: 300 }, { duration: 3000 })

    setTimeout(() => {
      rect.animateCartoon({ height: 200 }, { duration: 1000 })
    }, 500)
  }, [])

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default Animate
