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

    const rect_range = new Rect({
      x: 50,
      y: 50,
      width: 300,
      height: 300,
      strokeStyle: 'purple'
    })
    const inner_arc = new Circle({
      x: 100,
      y: 100,
      radius: 50,
      fillStyle: 'pink',
      draggable: true,
      cusSetCoord: ({ x, y, dx, dy }) => {
        const _radius = inner_arc.data.radius

        let nx = inner_arc.data.x + dx
        let ny = inner_arc.data.y + dy

        const left = rect_range.data.x + _radius
        if (nx < left) {
          nx = left
        }

        const right = rect_range.data.x + rect_range.data.width - _radius
        if (nx > right) {
          nx = right
        }

        const top = rect_range.data.y + _radius
        if (ny < top) {
          ny = top
        }

        const bottom = rect_range.data.y + rect_range.data.height - _radius
        if (ny > bottom) {
          ny = bottom
        }

        inner_arc.attr({ x: nx, y: ny })
      }
    })

    stage.append([rect_range, inner_arc])
  }, [])

  return (
    <>
      <h2>只能在紫色矩形内拖拽</h2>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default DraggableRange
