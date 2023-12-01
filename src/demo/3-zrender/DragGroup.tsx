import { useEffect } from 'react'
import * as zrender from 'zrender'

const DragGroup = () => {
  useEffect(() => {
    const zr = zrender.init(document.querySelector('.canvas-container'), {})

    const rect_1 = new zrender.Rect({
      cursor: 'auto',
      shape: { x: 10, y: 10, width: 50, height: 50 },
      style: { fill: 'red' }
      // draggable: true
    })

    const rect_2 = new zrender.Rect({
      cursor: 'auto',
      shape: { x: 80, y: 10, width: 50, height: 50 },
      style: { fill: 'pink' },
      draggable: true
    })

    const gr = new zrender.Group({
      draggable: true
    })

    rect_1.onmousedown = evt => {
      console.log('rect_1', evt)
    }
    rect_2.onmousedown = evt => {
      console.log('rect_2', evt)
    }
    gr.onmousedown = evt => {
      console.log('gr', evt)
    }

    // rect_1.onclick = () => {
    //   console.log('rect_1 click')
    // }
    // rect_2.onclick = () => {
    //   console.log('rect_2 click')
    // }
    // gr.onclick = () => {
    //   console.log('gr click')
    // }

    gr.add(rect_1)
    gr.add(rect_2)

    zr.add(gr)
  }, [])

  return <div className="canvas-container"></div>
}

export default DragGroup
