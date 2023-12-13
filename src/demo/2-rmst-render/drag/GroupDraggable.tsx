import { useEffect, useRef } from 'react'

import { Stage, Group, Rect, Circle, Text, Line } from 'rmst-render'

const GroupDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  const outerGroupRef = useRef<Group>()
  const innerGroupRef = useRef<Group>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const outerGroup = new Group({
      name: 'outer group',
      draggable: true
    })
    outerGroupRef.current = outerGroup

    const rect_1 = new Rect({
      name: 'pink',
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      fillStyle: 'pink'
    })

    const rect_2 = new Rect({
      name: 'blueviolet',
      x: 150,
      y: 10,
      width: 100,
      height: 100,
      fillStyle: 'blueviolet',
      draggable: true
    })

    const innerGroup = new Group({
      name: 'innerGroup',
      draggable: true
    })
    innerGroupRef.current = innerGroup
    const arc_1 = new Circle({
      name: 'red',
      x: 100,
      y: 200,
      radius: 50,
      fillStyle: 'red'
    })
    const arc_2 = new Circle({
      name: 'orange',
      x: 250,
      y: 200,
      radius: 50,
      fillStyle: 'orange'
    })

    innerGroup.append([arc_1, arc_2])

    outerGroup.append([rect_1, rect_2, innerGroup])

    stage.append([outerGroup])
  }, [])

  const addToOuterGroup = () => {
    outerGroupRef.current.append(
      new Rect({
        name: 'tan',
        x: 300,
        y: 10,
        width: 100,
        height: 100,
        fillStyle: 'tan',
        draggable: false
      })
    )
  }

  const addToInnerGroup = () => {
    innerGroupRef.current.append(
      new Circle({
        x: 450,
        y: 300,
        radius: 50,
        fillStyle: 'cornflowerblue',
        draggable: true
      })
    )
  }

  return (
    <>
      <h3>Group 元素拖拽 (组内还有组), 对最近的祖先元素进行拖拽 </h3>
      <button onClick={addToOuterGroup}>向 outer组 添加 draggable: false 的元素</button>
      <button onClick={addToInnerGroup} className="ml-2">
        向 inner组 添加 draggable: true 元素
      </button>

      <div className="canvas-container mt-2" ref={canvasRef}></div>
    </>
  )
}

export default GroupDemo
