import { useEffect, useRef } from 'react'

import { Stage, Rect, Group, Circle } from 'rmst-render'
import BoxHidden from 'rmst-render/shape/BoxHidden'

const GroupClipAnimate = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    // const group = new Group({
    //   clip: true
    // })

    // const rect1 = new Rect({ x: 120, y: 10, width: 80, height: 80, bgColor: 'purple', cornerRadius: 20 })
    // const rect2 = new Rect({ x: 180, y: 40, width: 120, height: 80, bgColor: '#a18cd1' })
    // group.append([rect1, rect2])

    // stage.append(group)

    // group.animateCartoon(undefined, 3000, 'left-right')

    const box = new BoxHidden({
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      fillStyle: 'pink'
    })

    const arc = new Circle({
      x: 10,
      y: 10,
      radius: 50,
      bgColor: 'purple'
    })

    box.append(arc)

    const rect = new Rect({
      x: 200,
      y: 200,
      width: 200,
      height: 200,
      bgColor: 'orange'
    })

    stage.append(box)
    stage.append(rect)
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default GroupClipAnimate
