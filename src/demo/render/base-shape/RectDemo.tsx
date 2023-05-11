import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text } from '@/rmst-render'

const RectDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rects = [
      // new Rect({ x: 120, y: 10, width: 80, height: 80, bgColor: 'purple', cornerRadius: 20 }),
      new Rect({ x: 210, y: 10, width: 120, height: 80, bgColor: '#a18cd1', clip: true })
    ]

    stage.append(rects)

    rects[0].animate(undefined, 1000, 'left-right')

    // 注册鼠标事件
    rects.forEach(item => {
      item.onEnter = () => {
        stage.setCursor('pointer')
        console.log('onEnter', item.constructor.name)
      }

      item.onLeave = () => {
        stage.setCursor('auto')
        console.log('onLeave', item.constructor.name)
      }

      item.onClick = () => {
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
