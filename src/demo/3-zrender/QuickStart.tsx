import { useEffect } from 'react'
import * as zrender from 'zrender'

const QuickStart = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const rect_1 = new zrender.Rect({
      name: '1',
      cursor: 'auto',
      shape: {
        x: 80,
        y: 120,
        width: 50,
        height: 50
      },
      style: {
        fill: 'blue'
      }
    })

    const rect_2 = new zrender.Rect({
      name: '2',
      cursor: 'auto',
      shape: {
        x: 100,
        y: 100,
        width: 100,
        height: 100
      },
      style: {
        fill: 'pink',
        stroke: 'purple',
        lineWidth: 10,
        opacity: 0.9
        // shadowBlur: 40,
        // shadowColor: '#333'
      }
    })

    zr.add(rect_1)
    zr.add(rect_2)
  }, [])

  return <div className="canvas-container"></div>
}

export default QuickStart
