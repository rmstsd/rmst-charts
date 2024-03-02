import { Box, Cursor, DragEvent, Leafer, Line, Rect, PointerEvent } from 'leafer-ui'
import { useEffect } from 'react'

const DivChild = () => {
  useEffect(() => {
    const leafer = new Leafer({
      view: document.querySelector('.canvas-container'),
      wheel: { zoomMode: true },
      // hittable: false,
      pointer: { hitRadius: 0 }
    })

    const outer_box = new Box({
      cursor: 'move',
      draggable: true,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      fill: 'pink'
    })
    const inner_rect = new Rect({
      draggable: true,
      x: 0,
      y: 50,
      width: 50,
      height: 50,
      fill: '#32cd79'
    })

    outer_box.add(inner_rect)

    leafer.add(outer_box)

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
