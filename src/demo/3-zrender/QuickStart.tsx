import { useEffect } from 'react'
import * as zrender from 'zrender'

const QuickStart = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const rect = new zrender.Rect({
      cursor: 'auto',
      shape: {
        x: 10,
        y: 10,
        width: 100,
        height: 100
      },
      style: {
        fill: 'red'
      }
    })

    rect.animateTo({
      shape: { x: 100 }
    })

    zr.add(rect)
  }, [])

  return <div className="canvas-container"></div>
}

export default QuickStart
