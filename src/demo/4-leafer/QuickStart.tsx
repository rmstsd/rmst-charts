import { Cursor, DragEvent, Leafer, Rect } from 'leafer-ui'
import { useEffect } from 'react'

const QuickStart = () => {
  useEffect(() => {
    const leafer = new Leafer({
      view: document.querySelector('.canvas-container'),
      wheel: { zoomMode: true },
      // hittable: false,
      pointer: { hitRadius: 0 }
    })

    const rect = new Rect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#32cd79',
      cursor: 'move'
    })

    let x
    let y

    rect.on(DragEvent.START, evt => {
      x = evt.x - rect.x
      y = evt.y - rect.y
    })
    rect.on(DragEvent.DRAG, evt => {
      const nx = Math.min(evt.x - x, 300)
      const ny = evt.y - y

      rect.x = nx
      rect.y = ny
    })
    rect.on(DragEvent.END, evt => {
      console.log('END')
    })

    leafer.add(rect)

    console.log(rect)

    console.log(leafer.toJSON())
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default QuickStart
