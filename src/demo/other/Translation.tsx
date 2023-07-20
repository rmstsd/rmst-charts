import { useEffect, useRef } from 'react'

import { Rect, Stage } from 'rmst-render'

const Translation = () => {
  const stageRef = useRef<Stage>(null)

  useEffect(() => {
    const stage = new Stage({ container: document.querySelector('.canvas-container') })
    stageRef.current = stage

    const rect = new Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      bgColor: 'pink'
    })

    stage.append(rect)
  }, [])

  return (
    <div>
      <button
        onClick={() => {
          stageRef.current.ctx.clearRect(0, 0, 1000, 1000)
          stageRef.current.ctx.transform(1, 0, 0, 1, 10, 10)

          stageRef.current.renderStage()
        }}
      >
        transform
      </button>

      <button
        onClick={() => {
          stageRef.current.ctx.clearRect(0, 0, 1000, 1000)
          stageRef.current.ctx.setTransform(1, 0, 0, 1, 10, 10) // 会影响到为了解决模糊而设置的 ctx.scale(dpr, dpr)

          stageRef.current.renderStage()
        }}
      >
        setTransform
      </button>

      <button
        onClick={() => {
          const rect = new Rect({
            x: 10,
            y: 10,
            width: 100,
            height: 100,
            bgColor: 'rgba(0, 0, 0, 0.5)'
          })

          stageRef.current.append(rect)
        }}
      >
        append
      </button>

      <div className="canvas-container"></div>
    </div>
  )
}

export default Translation
