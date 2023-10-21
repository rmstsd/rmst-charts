import { useEffect, useRef } from 'react'

import { Stage, Rect, Group } from 'rmst-render'

const GroupClipAnimate = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const group = new Group({
      clip: true
    })

    const rect1 = new Rect({ x: 120, y: 10, width: 80, height: 80, bgColor: 'purple', cornerRadius: 20 })
    const rect2 = new Rect({ x: 180, y: 40, width: 120, height: 80, bgColor: '#a18cd1' })

    group.append([rect1, rect2])

    stage.append(group)

    group.animateCartoon(undefined, 3000, 'left-right')
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default GroupClipAnimate
