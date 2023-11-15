import { useEffect } from 'react'
import * as zrender from 'zrender'

const QuickStart = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const bc = new zrender.BezierCurve({
      shape: {
        x1: 100,
        y1: 100,
        x2: 300,
        y2: 300,
        cpx1: 10,
        cpy1: 400,
        cpx2: 600,
        cpy2: 100,
        percent: 1
      },
      style: {
        fill: 'none',
        stroke: 'orange'
      }
    })

    bc.onclick = () => {
      console.log('c click')
    }

    const boundRect = bc.getBoundingRect()
    console.log(boundRect)

    const rect = new zrender.Rect({
      cursor: 'auto',
      shape: {
        x: boundRect.x,
        y: boundRect.y,
        width: boundRect.width,
        height: boundRect.height
      },
      style: {
        fill: 'none',
        stroke: 'red'
      }
    })

    zr.add(bc)
    zr.add(rect)

    console.log(rect)
  }, [])

  return <div className="canvas-container"></div>
}

export default QuickStart
