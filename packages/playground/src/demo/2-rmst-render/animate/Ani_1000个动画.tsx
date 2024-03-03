import { Button, Input, InputNumber } from 'antd'
import { useEffect, useRef, useState } from 'react'

import { Stage, Rect } from 'rmst-render'

const Ani_1000个动画 = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })
    stageRef.current = stage

    renderRects()

    return () => {
      stageRef.current.dispose()
    }
  }, [])

  const [count, setCount] = useState(5000)
  const confirm = () => {
    stageRef.current.removeAllShape()
    renderRects()
  }

  function renderRects() {
    const stage = stageRef.current
    const start_x = 5
    const start_y = 5

    const gap = 5

    const rectSize = 17
    const width = rectSize
    const height = rectSize

    let curRow = 0
    let curColumn = 0

    const rects = Array.from({ length: count }, _ => {
      let x = calcX()

      if (x + width > stage.canvasSize.width) {
        curRow += 1
        curColumn = 0

        x = calcX()
      }

      const y = start_y + (height + gap) * curRow

      curColumn += 1

      return new Rect({ x, y, width, height, fillStyle: 'pink', cursor: 'move', draggable: true })

      function calcX() {
        return start_x + (width + gap) * curColumn
      }
    })

    stage.append(rects)

    rects.forEach(item => {
      exec()

      async function exec() {
        await item.animateCartoon({ width: width - 10, height: height - 10 })
        await item.animateCartoon({ width, height })

        exec()
      }
    })
  }

  return (
    <div>
      <InputNumber value={count} onChange={value => setCount(value)} />
      <Button onClick={confirm}>确定</Button>

      <h3>{count} 个动画同时执行, 自测极限是 5000个不掉帧. (调整浏览器缩放查看全部图形) </h3>
      <div className="canvas-container" ref={canvasRef} style={{ width: 2000, height: 1500 }}></div>
    </div>
  )
}

export default Ani_1000个动画
