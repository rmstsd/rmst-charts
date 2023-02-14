import { useEffect, useRef } from 'react'

import Circle from '../src-baseRender/Circle'
import Rect from '../src-baseRender/Rect'
import Stage from '../src-baseRender/Stage'

const BaseRenderDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const graphArray = [
      new Circle({ x: 100, y: 100, radius: 50, bgColor: 'pink', onlyId: 0 }),
      new Circle({ x: 300, y: 100, radius: 50, bgColor: 'purple', onlyId: 1 }),
      new Rect({ x: 20, y: 200, width: 100, height: 50, bgColor: 'pink', onlyId: 2 }),
      new Rect({ x: 20, y: 300, width: 100, height: 50, bgColor: 'purple', onlyId: 3 })
    ]

    // 注册鼠标事件
    graphArray.forEach(circleItem => {
      circleItem.onClick = () => {
        console.log('onClick', circleItem.data.onlyId)
      }

      circleItem.onEnter = () => {
        stage.canvasElement.style.cursor = 'pointer'
        console.log('onEnter', circleItem.data.onlyId)
      }

      circleItem.onMove = () => {
        console.log('onMove', circleItem.data.onlyId)
      }
      circleItem.onLeave = () => {
        stage.canvasElement.style.cursor = null
        console.log('onLeave', circleItem.data.onlyId)
      }
    })

    stage.append(graphArray)
  }, [])

  return <div className="canvas-container" ref={canvasRef}></div>
}

export default BaseRenderDemo
