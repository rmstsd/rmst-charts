import { Box, Cursor, DragEvent, Leafer, Line, Rect } from 'leafer-ui'
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
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: '#32cd79',
      cursor: 'move',
      zIndex: 10
    })

    const box = new Box({
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      stroke: 'red'
      // overflow: 'hide'
    })

    const rect_2 = new Rect({
      x: 70,
      y: 70,
      width: 100,
      height: 100,
      fill: 'pink',
      cursor: 'move',
      zIndex: 2
    })

    box.add(rect)

    leafer.add(box)
    leafer.add(rect_2)
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default QuickStart
