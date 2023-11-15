import { useEffect, useRef } from 'react'
import { Stage, Rect } from 'rmst-render'

const Single = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })
    stageRef.current = stage

    const rect_1 = new Rect({
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      bgColor: 'blueviolet',
      draggable: true,
      cursor: 'move'
    })

    rect_1.onClick = () => {
      console.log('rect_1')
    }
    rect_1.onEnter = () => {
      console.log('rect_1 enter')
    }
    rect_1.onMove = () => {
      // console.log('rect_1 move')
    }
    rect_1.onLeave = () => {
      console.log('rect_1 leave')
    }

    stage.append([rect_1])
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default Single
