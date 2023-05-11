import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text } from '@/rmst-render'

const TextDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasRef2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const texts = [
      new Text({ x: 0, y: 0, content: '人美声甜', color: '#333' }),
      new Text({ x: 210, y: 10, content: '君不见黄河之水天上来', color: '#333' })
    ]

    stage.append(texts)

    // 注册鼠标事件
    texts.forEach(item => {
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
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default TextDemo
