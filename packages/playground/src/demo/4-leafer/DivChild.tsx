import { Box, Cursor, DragEvent, Leafer, Line, Rect, PointerEvent, Group } from 'leafer-ui'
import { useEffect } from 'react'

const DivChild = () => {
  useEffect(() => {
    const leafer = new Leafer({
      view: document.querySelector('.canvas-container'),
      wheel: { zoomMode: true },
      // hittable: false,
      pointer: { hitRadius: 0 }
    })

    const outer_box = new Group({ zIndex: 2, cursor: 'move' })
    const inner_rect = new Rect({ x: 0, y: 50, width: 100, height: 100, fill: '#32cd79' })
    outer_box.add(inner_rect)

    const rect_2 = new Rect({ x: 50, y: 80, width: 100, height: 100, fill: 'red', cursor: 'pointer' })

    leafer.add(outer_box)
    leafer.add(rect_2)

    outer_box.on(PointerEvent.ENTER, () => {
      console.log('outer_box enter')
    })
    outer_box.on(PointerEvent.LEAVE, () => {
      console.log('outer_box leave')
    })

    inner_rect.on(PointerEvent.ENTER, () => {
      console.log('inner_rect enter')
    })
    inner_rect.on(PointerEvent.LEAVE, () => {
      console.log('inner_rect leave')
    })
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default DivChild
