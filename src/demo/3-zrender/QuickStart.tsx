import { useEffect } from 'react'
import * as zrender from 'zrender'

const QuickStart = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const rect_1 = new zrender.Rect({
      name: '1',
      cursor: 'auto',
      shape: {
        x: 100,
        y: 100,
        width: 100,
        height: 100
      },
      style: {
        fill: 'pink',
        shadowBlur: 40,
        shadowColor: '#333'
      }
    })

    const rect_2 = new zrender.Rect({
      name: '2',
      cursor: 'auto',
      shape: {
        x: 200,
        y: 100,
        width: 100,
        height: 100
      },
      style: {
        fill: '#fff',
        // shadowBlur: 40,
        shadowColor: 'orange'
      }
    })

    zr.add(rect_1)
    zr.add(rect_2)

    console.log(zr)

    setTimeout(() => {
      rect_1.attr({ z: 20 })
    }, 1000)
  }, [])

  return <div className="canvas-container"></div>
}

export default QuickStart
