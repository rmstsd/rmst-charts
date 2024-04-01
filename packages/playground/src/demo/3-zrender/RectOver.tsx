import { useEffect } from 'react'
import * as zrender from 'zrender'

const RectOver = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const rect_1 = new zrender.Rect({
      cursor: 'auto',
      shape: { x: 50, y: 50, width: 100, height: 100 },
      style: { fill: 'pink' }
    })

    const g = new zrender.Group({})

    // rect_1.onmouseover = () => {
    //   serCursor('move')
    //   console.log('rect_1 over')
    // }
    // rect_1.onmousemove = () => {
    //   serCursor('move')
    //   console.log('rect_1 move')
    // }
    // rect_1.onmouseout = () => {
    //   serCursor('auto')
    //   console.log('rect_1 out')
    // }

    const rect_2 = new zrender.Rect({
      cursor: 'auto',
      shape: { x: 50, y: 150, width: 100, height: 100 },
      style: { fill: '#ddd', opacity: 0.8 }
    })

    rect_2.onmouseover = () => {
      serCursor('move')
      console.log('rect_2 over')
    }
    rect_2.onmousemove = () => {
      serCursor('move')
      console.log('rect_2 move')
    }
    rect_2.onmouseout = () => {
      serCursor('auto')
      console.log('rect_2 out')
    }

    const rect_3 = new zrender.Rect({
      cursor: 'auto',
      shape: { x: 200, y: 50, width: 100, height: 100 },
      style: { fill: 'pink' }
    })

    rect_3.onmouseover = () => {
      serCursor('move')
      console.log('rect_3 over')
    }
    rect_3.onmouseout = () => {
      serCursor('auto')
      console.log('rect_3 out')
    }

    const rect_4 = new zrender.Rect({
      cursor: 'auto',
      shape: { x: 200, y: 120, width: 100, height: 100 },
      style: { fill: '#ddd', opacity: 0.8 }
    })

    rect_4.onmouseover = () => {
      serCursor('move')
      console.log('rect_4 over')
    }
    rect_4.onmouseout = () => {
      serCursor('auto')
      console.log('rect_4 out')
    }

    zr.add(rect_1)
    // zr.add(rect_2)
    // zr.add(rect_3)
    // zr.add(rect_4)

    function serCursor(c) {
      document.querySelector('.cursor').innerHTML = c
    }
  }, [])

  return (
    <>
      <div className="cursor">1</div>
      <div className="canvas-container"></div>
    </>
  )
}

export default RectOver
