import { useEffect, useRef } from 'react'

import { Stage, Rect } from 'rmst-render'

const length = 1000

const Ani_1000个动画 = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const start_x = 5
    const start_y = 5

    const gap = 5

    const rectSize = 17
    const width = rectSize
    const height = rectSize

    let curRow = 0
    let curColumn = 0

    const rects = Array.from({ length }, _ => {
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

    rects.forEach(async item => {
      await item.animateCartoon({ width: width - 10, height: height - 10 })
      await item.animateCartoon({ width, height })
    })
  }, [])

  return (
    <div>
      <h3>{length} 个动画同时执行</h3>
      <div className="canvas-container" ref={canvasRef} style={{ width: 900, height: 600 }}></div>
    </div>
  )
}

export default Ani_1000个动画
