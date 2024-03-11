import { useEffect, useRef } from 'react'

import { Rect, Stage } from 'rmst-render'

const Animate = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  const rectRef = useRef<Rect>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    stage.onmousemove = evt => {
      const ii = 100
      const idx = Math.floor(evt.x / ii)

      const x = idx * ii

      // rect.animateCartoon({ x }, { duration: 500 })
    }

    const rect = new Rect({ x: 0, y: 50, width: 100, height: 60, fillStyle: 'purple', shadowColor: 'red' })

    rectRef.current = rect

    stage.append([rect])

    rect.animateCartoon({ x: 200 }, { duration: 2000 })

    setTimeout(() => {
      rect.animateCartoon({ height: 200 }, { duration: 1000 })
    }, 500)
  }, [])

  const cc = x => {
    const rect = rectRef.current

    rect.animateCartoon({ x })
  }

  return (
    <>
      {/* <button onClick={() => cc(100)}>cc 100</button>
      <button onClick={() => cc(200)}>cc 200</button>
      <button onClick={() => cc(300)}>cc 300</button>
      <button onClick={() => cc(400)}>cc 400</button>
      <button onClick={() => cc(500)}>cc 500</button>
      <button onClick={() => cc(600)}>cc 600</button>
      <button onClick={() => cc(700)}>cc 700</button> */}
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default Animate
