import { useEffect, useRef } from 'react'
import { Stage, Rect, Circle, Text, Line } from 'rmst-render'

const Over = () => {
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
      draggable: true
    })

    const rect_2 = new Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      bgColor: 'pink',
      draggable: true
    })

    rect_1.onClick = () => {
      console.log('rect_1')
    }
    rect_1.onEnter = () => {
      console.log('rect_1 enter')
    }
    rect_1.onLeave = () => {
      console.log('rect_1 leave')
    }

    rect_2.onClick = () => {
      console.log('rect_2')
    }
    rect_2.onEnter = () => {
      console.log('rect_2 enter')
    }
    rect_2.onLeave = () => {
      console.log('rect_2 leave')
    }

    stage.append([rect_1, rect_2])
  }, [])

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default Over
