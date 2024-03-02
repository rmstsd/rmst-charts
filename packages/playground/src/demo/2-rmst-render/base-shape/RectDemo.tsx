import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, BoxHidden } from 'rmst-render'

const RectDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rects = [
      new Rect({ x: 120, y: 10, width: 80, height: 80, fillStyle: 'purple', cornerRadius: 20 }),
      new Rect({ x: 210, y: 10, width: 120, height: 80, fillStyle: '#a18cd1' })
    ]

    const box = new BoxHidden({
      name: 'outer_box',
      x: 100,
      y: 100,
      width: 180,
      height: 150,
      fillStyle: 'pink',
      cursor: 'wait'
    })
    const inn_rect = new Rect({
      name: 'inn_rect',
      x: 100,
      y: 120,
      width: 80,
      height: 80,
      fillStyle: '#a18cd1',
      cursor: 'pointer'
    })

    box.append(inn_rect)

    const box_2 = new BoxHidden({
      name: 'box_2',
      x: 200,
      y: 150,
      width: 60,
      height: 60,
      fillStyle: 'antiquewhite'
      // cursor: 'text'
    })
    const inn_cir = new Circle({
      name: 'inn_cir',
      x: 220,
      y: 170,
      radius: 16,
      fillStyle: 'purple'
      // cursor: 'move'
    })

    box_2.append(inn_cir)
    box.append(box_2)

    stage.append(rects)
    stage.append(box)

    box.onmouseenter = () => {
      console.log('box enter')
    }

    box.onmouseleave = () => {
      console.log('box leave')
    }

    inn_rect.onmouseenter = () => {
      console.log('inn_rect enter')
    }

    inn_rect.onmouseleave = () => {
      console.log('inn_rect leave')
    }
    // ----

    box_2.onmouseenter = () => {
      console.log('box_2 enter')
    }

    box_2.onmouseleave = () => {
      console.log('box_2 leave')
    }

    inn_cir.onmouseenter = () => {
      console.log('inn_cir enter')
    }

    inn_cir.onmouseleave = () => {
      console.log('inn_cir leave')
    }
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default RectDemo
