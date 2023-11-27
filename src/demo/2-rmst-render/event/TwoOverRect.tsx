import { useEffect, useRef, useState } from 'react'
import { Stage, Rect } from 'rmst-render'

// 两个产生覆盖
const TwoOverRect = () => {
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
    const rect_2 = new Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      bgColor: 'pink',
      draggable: true,
      cursor: 'pointer'
    })

    rect_1.onclick = () => {
      console.log('rect_1')
    }

    rect_1.onmouseenter = () => {
      console.log('rect_1 enter')
      setLogs(state => state.concat('rect_1 enter'))
    }
    rect_1.onmouseleave = () => {
      console.log('rect_1 leave')
      setLogs(state => state.concat('rect_1 leave'))
    }

    rect_2.onclick = () => {
      console.log('rect_2')
    }
    rect_2.onmouseenter = () => {
      console.log('rect_2 enter')
      setLogs(state => state.concat('rect_2 enter'))
    }
    rect_2.onmouseleave = () => {
      console.log('rect_2 leave')
      setLogs(state => state.concat('rect_2 leave'))
    }

    stage.append([rect_1, rect_2])
  }, [])

  const [logs, setLogs] = useState([])

  return (
    <>
      <h3>覆盖时 onEnter onLeave 的触发 与 dom 行为一致</h3>

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

export default TwoOverRect
