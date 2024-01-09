import { useEffect, useRef } from 'react'

import { Rect, Stage } from 'rmst-render'

const Rotate = () => {
  const stageRef = useRef<Stage>(null)

  useEffect(() => {
    const stage = new Stage({ container: document.querySelector('.canvas-container') })
    stageRef.current = stage

    const { ctx } = stage

    // console.log(ctx.getContextAttributes())
    // console.log(ctx.getTransform())

    ctx.translate(100, 100)

    const rect = new Rect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fillStyle: 'red'
    })

    rect.onclick = () => {
      console.log('c')
    }

    stage.append(rect)
    ctx.resetTransform()

    // ctx.rotate(deg2rad(30))

    // ctx.strokeRect(-50, -50, 100, 100)

    // // ctx.setTransform(1, 0, 0, 1, 0, 0)

    // ctx.resetTransform()

    // ctx.strokeStyle = 'red'
    // ctx.strokeRect(0, 0, 100, 100)
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default Rotate
