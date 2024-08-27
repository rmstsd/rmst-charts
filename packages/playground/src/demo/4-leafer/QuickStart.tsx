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

    const start_x = 5
    const start_y = 5

    const gap = 5

    const rectSize = 17
    const width = rectSize
    const height = rectSize

    let curRow = 0
    let curColumn = 0

    const rects = Array.from({ length: 4000 }, _ => {
      let x = calcX()

      if (x + width > leafer.width) {
        curRow += 1
        curColumn = 0

        x = calcX()
      }

      const y = start_y + (height + gap) * curRow

      curColumn += 1

      return new Rect({ x, y, width: rectSize, height: rectSize, fill: '#32cd79', cursor: 'move', zIndex: 10 })

      function calcX() {
        return start_x + (width + gap) * curColumn
      }
    })

    rects.forEach(item => {
      leafer.add(item)
    })
  }, [])

  return <div className="canvas-container" style={{ width: '100%', height: 1000 }}></div>
}

export default QuickStart
