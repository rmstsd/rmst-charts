import { useEffect, useRef } from 'react'

import { Stage, Group, Rect, Circle, Text, Line } from 'rmst-render'

const GroupDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<Group>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rect = new Rect({ x: 10, y: 10, width: 100, height: 100, bgColor: 'pink' })
    const arc = new Circle({ x: 200, y: 100, radius: 50, bgColor: 'purple' })

    const g2 = new Group({ draggable: true })
    const rect2 = new Rect({ x: 220, y: 200, width: 100, height: 100, bgColor: 'orange' })
    const line = new Line({
      points: [100, 200, 200, 200, 200, 300],
      lineWidth: 3,
      strokeStyle: 'goldenrod',
      draggable: true
    })

    g2.append([rect2, line])

    const group = new Group({ draggable: true })

    groupRef.current = group
    group.append(rect)
    group.append(arc)
    group.append(g2)

    group.onmousedown = () => {
      console.log('group down')
    }

    group.onmouseenter = () => {
      stage.setCursor('move')
    }

    group.onmouseleave = () => {
      stage.setCursor('auto')
    }

    group.onclick = () => {
      console.log('group.onClick')
    }

    stage.append([group])
  }, [])

  const addToGroup = () => {
    groupRef.current.append(
      new Circle({
        x: 200,
        y: 200,
        radius: 50,
        bgColor: 'cornflowerblue'
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

export default GroupDemo
