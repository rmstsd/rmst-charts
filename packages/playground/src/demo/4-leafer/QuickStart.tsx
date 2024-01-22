import { Box, Cursor, DragEvent, Leafer, Line, Rect } from 'leafer-ui'
import { useEffect } from 'react'
import anime from 'animejs'

const QuickStart = () => {
  useEffect(() => {
    const leafer = new Leafer({
      view: document.querySelector('.canvas-container'),
      wheel: { zoomMode: true },
      // hittable: false,
      pointer: { hitRadius: 0 }
    })

    const rects = Array.from(
      { length: 1000 },
      (_, index) =>
        new Rect({
          draggable: true,
          x: 10 + index * 20,
          y: 10,
          width: 15,
          height: 15,
          fill: '#32cd79',
          cursor: 'move',
          zIndex: 10
        })
    )

    rects.forEach(item => {
      leafer.add(item)
    })

    rects.forEach(rect => {
      anime({
        targets: rect,
        y: rect.y + 100,
        cornerRadius: 0,
        easing: 'easeInOutQuad'
      })
    })
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default QuickStart
