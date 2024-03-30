import { useEffect, useRef, useState } from 'react'
import { Stage, Rect, Circle } from 'rmst-render'

const Single = () => {
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
      fillStyle: 'blueviolet',
      draggable: true,
      cursor: 'move'
    })

    rect_1.on('click', () => {
      console.log('on-click 1')
    })

    rect_1.on('click', () => {
      console.log('on-click 2')
    })

    rect_1.onclick = () => {
      console.log('onclick rect_1')
    }
    rect_1.onmouseenter = () => {
      console.log('rect_1 enter')
      setLogs(state => state.concat('rect_1 enter'))
    }
    rect_1.onmousemove = () => {
      // console.log('rect_1 move')
    }
    rect_1.onmouseleave = () => {
      console.log('rect_1 leave')
      setLogs(state => state.concat('rect_1 leave'))
    }

    const r2 = new Rect({
      x: 180,
      y: 180,
      width: 70,
      height: 70,
      fillStyle: 'pink',
      draggable: true,
      cursor: 'move',
      rotate: 30
    })

    stage.append([r2, rect_1])
  }, [])

  const [logs, setLogs] = useState([])

  return (
    <>
      <h3>单个图形 onEnter onLeave 的触发</h3>

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

export default Single
