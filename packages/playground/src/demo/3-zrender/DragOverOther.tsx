import { useEffect } from 'react'
import * as zrender from 'zrender'

const DragOverOther = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const rect_1 = new zrender.Rect({
      cursor: 'pointer',
      shape: { x: 10, y: 10, width: 50, height: 50 },
      style: { fill: 'red', shadowColor: 'rgba(0, 0, 0, 0.8)', shadowBlur: 0 },
      draggable: true
    })

    rect_1.onmouseover = () => {
      rect_1.animateTo({ style: { shadowBlur: 10 } }, { duration: 300 })
    }
    rect_1.onmouseout = () => {
      rect_1.animateTo({ style: { shadowBlur: 0 } }, { duration: 300 })
    }

    const rect_2 = new zrender.Rect({
      cursor: 'move',
      shape: { x: 80, y: 10, width: 50, height: 50 },
      style: { fill: 'pink', shadowColor: 'rgba(0, 0, 0, 0.8)', shadowBlur: 0 },
      draggable: true
    })

    rect_2.onmouseover = () => {
      rect_2.animateTo({ style: { shadowBlur: 10 } }, { duration: 300 })
    }
    rect_2.onmouseout = () => {
      rect_2.animateTo({ style: { shadowBlur: 0 } }, { duration: 300 })
    }

    zr.add(rect_1)
    zr.add(rect_2)
  }, [])

  return <div className="canvas-container"></div>
}

export default DragOverOther
