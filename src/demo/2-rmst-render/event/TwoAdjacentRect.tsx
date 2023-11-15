import { useEffect, useRef } from 'react'
import { Stage, Rect } from 'rmst-render'

// 两个位置相邻
const TwoAdjacentRect = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })
    stageRef.current = stage

    const rect_3 = new Rect({ x: 200, y: 50, width: 100, height: 100, bgColor: 'blue' })
    const rect_4 = new Rect({ x: 200, y: 150, width: 100, height: 100, bgColor: 'pink' })

    rect_3.onEnter = () => {
      setCursor('move')
      console.log('rect_3 enter')
    }
    rect_3.onLeave = () => {
      setCursor('auto')
      console.log('rect_3 leave')
    }

    rect_4.onEnter = () => {
      setCursor('move')
      console.log('rect_4 enter')
    }
    rect_4.onLeave = () => {
      setCursor('auto')
      console.log('rect_4 leave')
    }

    function setCursor(cu) {
      document.querySelector('.cursor').innerHTML = cu
    }

    stage.append([rect_3, rect_4])
  }, [])

  return (
    <>
      <h3>
        相邻时 onEnter onLeave 的触发 <span className="cursor"></span>
      </h3>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default TwoAdjacentRect
