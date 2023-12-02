import { useEffect, useRef } from 'react'

import { Circle, Rect, Stage } from 'rmst-render'

const Animate = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const arc = new Circle({
      x: 100,
      y: 100,
      radius: 50,
      fillStyle: 'pink'
    })

    const sector = new Circle({
      x: 450,
      y: 100,
      startAngle: 0,
      endAngle: 0,
      radius: 50,
      fillStyle: 'pink'
    })
    sector.onmouseenter = () => {
      stage.setCursor('pointer')
    }

    sector.onmouseleave = () => {
      stage.setCursor('auto')
    }

    const rect = new Rect({
      x: 200,
      y: 50,
      width: 100,
      height: 60,
      fillStyle: 'purple'
    })

    stage.append([arc, rect, sector])

    arc.animateCartoon({ radius: 100 }).then(() => {
      arc.animateCartoon({ radius: 50 })
    })
    rect.animateCartoon({ x: 200 + 100, height: 200 }).then(() => {
      rect.animateCartoon({ x: 200 })
    })
    sector.animateCartoon({ endAngle: 100 })
  }, [])

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default Animate
