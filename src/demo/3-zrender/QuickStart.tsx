import { useEffect } from 'react'
import * as zrender from 'zrender'

const QuickStart = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const line_q = new zrender.BezierCurve({
      shape: {
        x1: 100,
        y1: 100,
        x2: 300,
        y2: 100
      }
    })

    const sub = line_q.getBoundingRect()

    console.log({ ...sub })

    const rect_1 = new zrender.Rect({
      shape: { ...sub },
      style: {
        stroke: 'red',
        fill: 'none'
      }
    })

    zr.add(rect_1)
    zr.add(line_q)
  }, [])

  return <div className="canvas-container"></div>
}

export default QuickStart
