import { randomColor } from '@/utils'
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

    const timer = setInterval(() => {
      createBubble()
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [])

  async function createBubble() {
    const stage = stageRef.current

    const radius = 25
    const maxRadius = 50

    function randomX() {
      return maxRadius + Math.random() * (stage.canvasSize.width - maxRadius * 2)
    }

    function randomY() {
      return maxRadius + Math.random() * (stage.canvasSize.height - maxRadius * 2)
    }

    const fillStyle = randomColor()
    const targetColor = colorAlpha(fillStyle, 0)

    const bubble = new Circle({ x: randomX(), y: randomY(), fillStyle, radius, cursor: 'pointer' })
    stage.append(bubble)

    await bubble.animateCartoon(
      { x: randomX(), y: randomY(), radius: maxRadius, fillStyle: targetColor },
      { duration: 1000 }
    )
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
