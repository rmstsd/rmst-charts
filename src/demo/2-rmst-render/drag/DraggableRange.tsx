import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text, Line } from 'rmst-render'

const DraggableRange = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })
    stageRef.current = stage

    const rect = new Rect({
      x: 50,
      y: 50,
      width: 300,
      height: 300,
      strokeStyle: 'purple'
    })
    const arc = new Circle({
      x: 100,
      y: 100,
      radius: 50,
      bgColor: 'pink',
      draggable: true,
      draggableControl: ({ mouseCoord, shapeCoord }) => {
        const _radius = arc.data.radius
        const left = rect.data.x + _radius
        if (shapeCoord.x < left) {
          shapeCoord.x = left
        }

        const right = rect.data.x + rect.data.width - _radius
        if (shapeCoord.x > right) {
          shapeCoord.x = right
        }

        const top = rect.data.y + _radius
        if (shapeCoord.y < top) {
          shapeCoord.y = top
        }

        const bottom = rect.data.y + rect.data.height - _radius
        if (shapeCoord.y > bottom) {
          shapeCoord.y = bottom
        }

        return shapeCoord
      }
    })

    const dRect = new Rect({
      x: 100,
      y: 110,
      width: 100,
      height: 60,
      fillStyle: 'orange',
      draggable: true
    })

    stage.append([rect, arc, dRect])
  }, [])

  return (
    <>
      <h2>只能在紫色矩形内拖拽</h2>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default DraggableRange
