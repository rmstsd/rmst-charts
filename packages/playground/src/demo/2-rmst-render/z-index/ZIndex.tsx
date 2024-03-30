import colorAlpha from 'color-alpha'
import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, BoxHidden, Group, Text } from 'rmst-render'

const useRefState = <T,>(t: T) => {
  const ref = useRef<T>(t)

  return ref.current
}

const ZIndex = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  const rect_1 = useRefState(
    new Rect({ x: 0, y: 0, width: 100, height: 100, fillStyle: 'pink', cursor: 'pointer', zIndex: 1 })
  )
  const rect_2 = useRefState(new Rect({ x: 50, y: 50, width: 100, height: 100, fillStyle: 'purple', cursor: 'move' }))

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const group = new Group({ zIndex: 4 })
    const circle_1 = new Circle({ name: '1', x: 170, y: 100, radius: 40, fillStyle: 'blue', cursor: 'crosshair' })
    const circle_2 = new Circle({
      name: '2',
      x: 230,
      y: 100,
      radius: 40,
      fillStyle: colorAlpha('red', 0.8),
      cursor: 'e-resize'
    })
    const text = new Text({ x: 230, y: 100, content: 'qwer', cursor: 'text' })
    group.append(circle_1, circle_2, text)

    const bh = new BoxHidden({
      x: 210,
      y: 120,
      width: 100,
      height: 100,
      fillStyle: 'orange',
      cursor: 'help',
      zIndex: 3
    })
    const circle_3 = new Circle({ name: '3', x: 260, y: 110, radius: 40, fillStyle: 'greenyellow', cursor: 'wait' })
    bh.append(circle_3)

    stage.append(rect_1, rect_2, group, bh)
  }, [])

  return (
    <div>
      <button onClick={() => rect_1.attr({ zIndex: 0 })}>z 0</button>

      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default ZIndex
