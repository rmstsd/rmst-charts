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
      width: 200,
      height: 200,
      fill: '#32cd79',
      draggable: true,
      cursor: 'move'
    })

    rect.on(DragEvent.DRAG, evt => {
      // console.log(leafer.toJSON())

      console.log(evt)
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
