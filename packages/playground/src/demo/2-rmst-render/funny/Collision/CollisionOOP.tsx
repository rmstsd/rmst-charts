import { useEffect, useRef, useState } from 'react'
import { Stage } from 'rmst-render'

import { DragRect } from './ClassOOP'

function eachOtherSubscribe(list: DragRect[], cb) {
  if (list.length < 2) {
    console.log('至少要有两个')
    return
  }

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      list[i].subscribe(
        list[j],
        function onCollision(self, other) {
          console.log('onCollision')

          cb?.('onCollision')

          self.select()
          other.select()
        },
        function offCollision(self, other) {
          console.log('offCollision')
          cb?.('offCollision')

          self.cancelSelect()
          other.cancelSelect()
        },
        { isEachOther: true }
      )
    }
  }
}

const CollisionOOP = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage>(null)

  useEffect(() => {
    const stage = new Stage({
      container: containerRef.current
    })
    stageRef.current = stage

    const rect_1 = new DragRect(10, 10, 'pink')
    const rect_2 = new DragRect(50, 50, 'orange')
    const rect_3 = new DragRect(200, 200, 'burlywood')
    const rect_4 = new DragRect(250, 280, 'navajowhite')

    const dragRects = [rect_1, rect_2, rect_3, rect_4]

    stage.append(dragRects.map(item => item.element))

    eachOtherSubscribe(dragRects, log => {
      setLogs(state => state.concat(log))
    })
  }, [])

  const [logs, setLogs] = useState([])

  return (
    <div className="flex">
      <div className="canvas-container" ref={containerRef}></div>

      <div className="p-2">
        {logs.map((item, idx) => (
          <div key={idx}>{item}</div>
        ))}
      </div>
    </div>
  )
}

export default CollisionOOP
