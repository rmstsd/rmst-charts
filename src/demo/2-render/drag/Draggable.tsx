import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text, Line } from 'rmst-render'

const Draggable = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })
    stageRef.current = stage

    const rect = new Rect({
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      bgColor: 'blueviolet',
      draggable: true
    })
    const arc = new Circle({
      x: 100,
      y: 100,
      radius: 50,
      bgColor: 'pink',
      draggable: true
    })

    const line = new Line({
      points: [100, 200, 200, 200, 200, 300],
      lineWidth: 3,
      strokeStyle: 'goldenrod',
      draggable: true
    })

    rect.onClick = () => {
      console.log('rect')
    }
    arc.onClick = () => {
      console.log('arc')
    }

    line.onClick = () => {
      console.log('line')
    }

    stage.append([rect, arc, line])
  }, [])

  const addToStage = () => {
    stageRef.current.append(
      new Circle({
        x: 200,
        y: 200,
        radius: 50,
        bgColor: 'cornflowerblue',
        draggable: true
      })
    )
  }

  return (
    <>
      <button onClick={addToStage}>向舞台添加元素</button>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default Draggable
