import { useEffect, useRef } from 'react'

import { Stage, Circle } from 'rmst-render'

const Ani_300个动画 = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const arc = new Circle({
      x: 100,
      y: 100,
      radius: 50,
      fillStyle: 'purple'
    })

    const arc_2 = new Circle({
      x: 400,
      y: 100,
      radius: 50,
      fillStyle: 'purple'
    })
    stage.append([arc, arc_2])

    arc.animateCartoon({ radius: 100 })

    arc_2.animateCartoon({ radius: 100 })
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default Ani_300个动画
