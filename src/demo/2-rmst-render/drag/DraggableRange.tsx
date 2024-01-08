import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle } from 'rmst-render'

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
      draggable: true
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

      const ans = boundary(
        nx,
        ny,
        { min: rect_range.data.x + _radius, max: rect_range.data.x + rect_range.data.width - _radius },
        { min: rect_range.data.y + _radius, max: rect_range.data.y + rect_range.data.height - _radius }
      )

      inner_arc.attrSync({ x: ans.x, y: ans.y })
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

interface BoundaryRange {
  min: number
  max: number
}
function boundary(nx: number, ny: number, x_range: BoundaryRange, y_range: BoundaryRange) {
  if (nx < x_range.min) {
    nx = x_range.min
  }

  if (nx > x_range.max) {
    nx = x_range.max
  }

  if (ny < y_range.min) {
    ny = y_range.min
  }

  if (ny > y_range.max) {
    ny = y_range.max
  }

  return { x: nx, y: ny }
}
