import { useEffect, useRef } from 'react'
import { Rect, Stage } from 'rmst-render'

import { randomColor } from '@/utils'

import DragManagement, { checkShape } from './DragManagement'

const Collision = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage>(null)

  useEffect(() => {
    const stage = new Stage({
      container: containerRef.current
    })
    stageRef.current = stage

    function randomX() {
      return Math.random() * (stage.canvasSize.width - 100)
    }

    function randomY() {
      return Math.random() * (stage.canvasSize.height - 100)
    }

    function createRect(x?, y?, fillStyle?) {
      return new Rect({
        x: x ?? randomX(),
        y: y ?? randomY(),
        width: 100,
        height: 100,
        lineWidth: 3,
        fillStyle: fillStyle ?? randomColor(),
        draggable: true
      })
    }

    const rests = [createRect(10, 10, 'pink'), createRect(50, 50, 'orange'), createRect(), createRect(), createRect()]

    const dragM = new DragManagement()

    rests.forEach(item => {
      dragM.add(item)
    })

    // checkShape(dragM.children)

    stage.append(rests)
  }, [])

  return (
    <>
      <div className="canvas-container" ref={containerRef}></div>
    </>
  )
}

export default Collision
