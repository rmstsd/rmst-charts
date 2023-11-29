import { useEffect } from 'react'
import * as zrender from 'zrender'

const DragGroup = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const rect = new zrender.Rect({
      cursor: 'auto',
      shape: {
        x: 10,
        y: 10,
        width: 50,
        height: 50
      },
      style: {
        fill: 'red'
      }
    })

    const rect2 = new zrender.Rect({
      cursor: 'auto',
      shape: {
        x: 80,
        y: 10,
        width: 50,
        height: 50
      },
      style: {
        fill: 'pink'
      }
    })

    const gr = new zrender.Group({
      draggable: true
    })

    gr.add(rect)
    gr.add(rect2)

    zr.add(gr)
  }, [])

  return <div className="canvas-container"></div>
}

export default DragGroup
