import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text } from 'rmst-render'
import BoxHidden from 'rmst-render/shape/BoxHidden'

const RectDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rects = [
      new Rect({ x: 120, y: 10, width: 80, height: 80, fillStyle: 'purple', cornerRadius: 20 }),
      new Rect({ x: 210, y: 10, width: 120, height: 80, fillStyle: '#a18cd1' })
    ]

    const box = new BoxHidden({ x: 100, y: 100, width: 80, height: 150, fillStyle: 'pink' })
    const inn_rect = new Rect({
      x: 120,
      y: 120,
      width: 120,
      height: 120,
      fillStyle: '#a18cd1',
      cursor: 'pointer'
    })

    box.append(inn_rect)

    stage.append(rects)
    stage.append(box)

    box.animateCartoon({ width: 180 }, { duration: 10000 })

    // 注册鼠标事件
    rects.forEach(item => {
      item.onmouseenter = () => {
        stage.setCursor('pointer')
        console.log('onEnter', item.constructor.name)
      }

      item.onmouseleave = () => {
        stage.setCursor('auto')
        console.log('onLeave', item.constructor.name)
      }

      item.onclick = () => {
        console.log('c')
      }
    })
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default RectDemo
