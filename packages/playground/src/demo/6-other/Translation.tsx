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
      fillStyle: 'pink'
    })

    stage.append(rect)
  }, [])

  return (
    <div>
      <button
        onClick={() => {
          const rect = new Rect({
            x: 10,
            y: 10,
            width: 100,
            height: 100,
            fillStyle: 'rgba(0, 0, 0, 0.5)'
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
