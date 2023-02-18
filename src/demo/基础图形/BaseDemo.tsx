import { useEffect, useRef } from 'react'

import Circle from '../../rmst-render/Circle'
import Rect from '../../rmst-render/Rect'
import Stage from '../../rmst-render/Stage'

const BaseRenderDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const graphArray = [
      new Circle({ x: 60, y: 60, radius: 50, bgColor: 'pink' }),
      new Rect({ x: 120, y: 10, width: 80, height: 80, bgColor: 'purple' }),
      new Rect({ x: 210, y: 10, width: 120, height: 80, bgColor: '#a18cd1' }),
      new Circle({ x: 400, y: 60, radius: 50, startAngle: 30, endAngle: 60, bgColor: '#fcb69f' })
    ]

    // 注册鼠标事件
    graphArray.forEach(item => {
      item.onClick = () => {
        console.log('onClick', item.constructor.name)
        item.remove()
      }

      item.onEnter = () => {
        stage.canvasElement.style.cursor = 'pointer'
        console.log('onEnter', item.constructor.name)
      }

      // item.onMove = () => {
      //   console.log('onMove', item.data.onlyId)
      // }

      item.onLeave = () => {
        stage.canvasElement.style.cursor = null
        console.log('onLeave', item.constructor.name)
      }
    })

    stage.append(graphArray)

    console.log(graphArray)
  }, [])

  return <div className="canvas-container" ref={canvasRef}></div>
}

export default BaseRenderDemo
