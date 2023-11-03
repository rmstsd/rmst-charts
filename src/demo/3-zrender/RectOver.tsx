import { useEffect } from 'react'
import * as zrender from 'zrender'

const RectOver = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const rect_1 = new zrender.Rect({
      cursor: 'auto',
      shape: { x: 10, y: 10, width: 100, height: 100 },
      style: { fill: 'pink' }
    })

    rect_1.onmouseover = () => {
      serCursor('move')
      console.log('rect_1 over')
    }
    rect_1.onmouseout = () => {
      serCursor('auto')
      console.log('rect_1 out')
    }

    const rect_2 = new zrender.Rect({
      cursor: 'auto',
      shape: { x: 50, y: 50, width: 100, height: 100 },
      style: { fill: '#ddd', opacity: 0.8 }
    })

    rect_2.onmouseover = () => {
      serCursor('move')
      console.log('rect_2 over')
    }
    rect_2.onmouseout = () => {
      serCursor('auto')
      console.log('rect_2 out')
    }

    zr.add(rect_1)
    zr.add(rect_2)

    function serCursor(c) {
      document.querySelector('.cursor').innerHTML = c
    }
  }, [])

  return (
    <>
      <div className="cursor"></div>
      <div className="canvas-container"></div>
    </>
  )
}

export default RectOver
