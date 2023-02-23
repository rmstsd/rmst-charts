import { useEffect, useRef } from 'react'

import Circle from '../../rmst-render/Circle'
import Rect from '../../rmst-render/Rect'
import Stage from '../../rmst-render/Stage'
import Text from '../../rmst-render/Text'

const BaseRenderDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rects = [
      new Rect({ x: 120, y: 10, width: 80, height: 80, bgColor: 'purple' }),
      new Rect({ x: 210, y: 10, width: 120, height: 80, bgColor: '#a18cd1' })
    ]

    const arcs = [
      new Circle({ x: 60, y: 60, radius: 50, bgColor: 'pink' }),
      new Circle({ x: 400, y: 60, radius: 50, startsAngle: 30, endAngle: 70, bgColor: '#fcb69f' }),
      new Circle({ x: 500, y: 60, radius: 50, startAngle: 100, endAngle: 150, bgColor: '#c2e9fb' }),
      new Circle({ x: 560, y: 60, radius: 50, startAngle: 190, endAngle: 240, bgColor: '#764ba2' }),
      new Circle({ x: 100, y: 170, radius: 50, startAngle: 0, endAngle: 160, bgColor: '#2575fc' }),
      new Circle({ x: 240, y: 170, radius: 50, startAngle: 240, endAngle: 300, bgColor: '#ff0844' })
    ]

    const texts = [
      new Text({ x: 0, y: 0, content: '人美声甜', color: '#333', fontSize: 16 }),
      new Text({ x: 210, y: 10, content: '君不见黄河之水天上来', color: '#333', fontSize: 16 })
    ]

    const shapeArray = [...rects, ...arcs, ...texts]

    stage.append(shapeArray)

    console.log(shapeArray)

    // 注册鼠标事件
    shapeArray.forEach(item => {
      item.onEnter = () => {
        stage.canvasElement.style.cursor = 'pointer'
        console.log('onEnter', item.constructor.name)
      }

      item.onLeave = () => {
        stage.canvasElement.style.cursor = null
        console.log('onLeave', item.constructor.name)
      }
    })
  }, [])

  return <div className="canvas-container" ref={canvasRef}></div>
}

export default BaseRenderDemo
