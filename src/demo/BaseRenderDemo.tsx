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
    graphArray.forEach(item => {
      item.onClick = () => {
        console.log('onClick', item.data.onlyId)
        item.remove()
      }

      item.onEnter = () => {
        stage.canvasElement.style.cursor = 'pointer'
        console.log('onEnter', item.data.onlyId)
      }

      item.onMove = () => {
        console.log('onMove', item.data.onlyId)
      }
      item.onLeave = () => {
        stage.canvasElement.style.cursor = null
        console.log('onLeave', item.data.onlyId)
      }
    })

    stage.append(graphArray)

    console.log(graphArray)
  }, [])

  return <div className="canvas-container" ref={canvasRef}></div>
}

export default BaseRenderDemo
