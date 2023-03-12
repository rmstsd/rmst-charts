import { useEffect, useRef } from 'react'

import { Stage, Group, Rect, Circle, Text } from '@/rmst-render'

const GroupDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<Group>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rect = new Rect({ x: 10, y: 10, width: 100, height: 100, bgColor: 'pink' })
    const arc = new Circle({ x: 200, y: 100, radius: 50, bgColor: 'purple' })

    const group = new Group({
      draggable: true
    })
    groupRef.current = group
    group.append(rect)
    group.append(arc)

    group.onDown = () => {
      console.log('group down')
    }

    group.onEnter = () => {
      stage.setCursor('move')
    }

    group.onLeave = () => {
      stage.setCursor('auto')
    }

    group.onClick = () => {
      console.log('group.onClick')
    }

    stage.append(group)
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
