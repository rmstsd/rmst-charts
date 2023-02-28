import { useEffect, useRef } from 'react'
import Circle from '../../rmst-render/Circle'
import Group from '../../rmst-render/Group'
import Rect from '../../rmst-render/Rect'
import Stage from '../../rmst-render/Stage'

const Draggable = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<Group>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rect = new Rect({ x: 10, y: 10, width: 100, height: 100, bgColor: 'red' })
    const arc = new Circle({
      x: 200,
      y: 100,
      radius: 50,
      bgColor: 'pink'
      //  draggable: true
    })

    arc.onDown = () => {
      console.log('arc down')
    }

    arc.onUp = () => {
      console.log('arc up')
    }

    stage.append(arc)
  }, [])

  const addToGroup = () => {
    groupRef.current.append(
      new Circle({
        x: 200,
        y: 200,
        radius: 50,
        bgColor: 'pink'
      })
    )

    console.log(groupRef.current)
  }

  return (
    <>
      <button onClick={addToGroup}>向组添加元素</button>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default Draggable
