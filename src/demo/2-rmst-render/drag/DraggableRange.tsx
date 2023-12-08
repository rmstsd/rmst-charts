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
      fillStyle: 'pink'
    })

    let x
    let y
    inner_arc.ondragstart = evt => {
      x = evt.x - inner_arc.data.x
      y = evt.y - inner_arc.data.y
    }

    inner_arc.ondrag = evt => {
      const _radius = inner_arc.data.radius

      let nx = evt.x - x
      let ny = evt.y - y

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
    inner_arc.ondragend = evt => {}

    stage.append([rect_range, inner_arc])
  }, [])

  return (
    <>
      <h3>只能在紫色矩形内拖拽</h3>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default DraggableRange
