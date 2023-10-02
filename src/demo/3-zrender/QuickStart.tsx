import { useEffect } from 'react'
import * as zrender from 'zrender'

const QuickStart = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const circle = new zrender.Circle({
      shape: {
        cx: 150,
        cy: 50,
        r: 40
      },
      style: {
        fill: 'none',
        stroke: '#F00'
      }
    })
    zr.add(circle)

    console.log(zr)
  }, [])

  return <div className="canvas-container"></div>
}

export default QuickStart
