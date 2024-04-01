import { useEffect, useRef } from 'react'

import { Rect, Stage, deg2rad } from 'rmst-render'

const Rotate = () => {
  const stageRef = useRef<Stage>(null)

  useEffect(() => {
    const stage = new Stage({ container: document.querySelector('.canvas-container') })
    stageRef.current = stage

    const { ctx } = stage

    ctx.translate(100, 100)

    const rect = new Rect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fillStyle: 'red',
      cursor: 'pointer'
    })

    rect.onclick = () => {
      console.log('c')
    }

    stage.append(rect)

    ctx.rotate(deg2rad(30))
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default Rotate
