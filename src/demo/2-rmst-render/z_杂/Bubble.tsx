import colorAlpha from 'color-alpha'
import { useEffect, useRef } from 'react'

import { Stage, Circle } from 'rmst-render'

const Bubble = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage>(null)

  useEffect(() => {
    const stage = new Stage({
      container: containerRef.current
    })
    stageRef.current = stage

    createBubble()

    setInterval(() => {
      createBubble()
    }, 100)
  }, [])

  async function createBubble() {
    const stage = stageRef.current

    const radius = 25

    const x = radius + Math.random() * (stage.canvasSize.width - radius * 2)
    const y = radius + Math.random() * (stage.canvasSize.height - radius * 2)

    const r = Math.round(255 * Math.random())
    const g = Math.round(255 * Math.random())
    const b = Math.round(255 * Math.random())

    const fillStyle = `rgb(${r},${g},${b})`
    const targetColor = colorAlpha(fillStyle, 0)

    const bubble = new Circle({ x, y, fillStyle, radius, cursor: 'pointer' })
    stage.append(bubble)

    await bubble.animateCartoon({ x: 100, fillStyle: targetColor }, { duration: 2000 })
    bubble.remove()
  }

  return (
    <>
      {/* <button onClick={createBubble}>createBubble</button>
      <button
        onClick={() => {
          console.log(stageRef.current.children)
        }}
      >
        ccc
      </button> */}

      <div className="canvas-container" ref={containerRef}></div>
    </>
  )
}

export default Bubble
