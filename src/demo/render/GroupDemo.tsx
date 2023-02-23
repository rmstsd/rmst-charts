import { useEffect, useRef } from 'react'
import Circle from '../../rmst-render/Circle'
import Group from '../../rmst-render/Group'
import Rect from '../../rmst-render/Rect'
import Stage from '../../rmst-render/Stage'

const GroupDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rect = new Rect({ x: 10, y: 10, width: 100, height: 100, bgColor: 'red' })
    const arc = new Circle({ x: 200, y: 100, radius: 50, bgColor: 'blue' })

    const group = new Group()
    group.append(rect)
    group.append(arc)

    group.onEnter = () => {
      console.log('enter')
    }

    group.onLeave = () => {
      console.log('onLeave')
    }

    group.onClick = () => {
      console.log('g')
    }

    stage.append(group)
  }, [])

  return <div className="canvas-container" ref={canvasRef}></div>
}

export default GroupDemo
