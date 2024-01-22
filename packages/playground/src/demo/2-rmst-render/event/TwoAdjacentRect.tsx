import { useEffect, useRef, useState } from 'react'
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

    const rect_3 = new Rect({ x: 200, y: 50, width: 100, height: 100, fillStyle: 'blue', cursor: 'move' })
    const rect_4 = new Rect({ x: 200, y: 150, width: 100, height: 100, fillStyle: 'pink', cursor: 'pointer' })

    rect_3.onmouseenter = () => {
      console.log('rect_3 enter')
      setLogs(state => state.concat('rect_3 enter'))
    }
    rect_3.onmouseleave = () => {
      console.log('rect_3 leave')
      setLogs(state => state.concat('rect_3 leave'))
    }

    rect_4.onmouseenter = () => {
      console.log('rect_4 enter')
      setLogs(state => state.concat('rect_4 enter'))
    }
    rect_4.onmouseleave = () => {
      console.log('rect_4 leave')
      setLogs(state => state.concat('rect_4 leave'))
    }

    stage.append([rect_3, rect_4])
  }, [])

  const [logs, setLogs] = useState([])

  return (
    <>
      <h3>相邻时 onEnter onLeave 的触发 与 dom 行为一致</h3>

      <div className="flex gap-2">
        <div className="canvas-container" ref={canvasRef}></div>

        <div>
          {logs.map((item, idx) => (
            <div key={idx}>{item}</div>
          ))}
        </div>
      </div>
    </>
  )
}

export default TwoAdjacentRect
