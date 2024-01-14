import colorAlpha from 'color-alpha'
import { useEffect, useRef } from 'react'
import { Stage, Circle, Rect, ICursor } from 'rmst-render'
import { randomCircleX, randomColor } from '@/utils'

const SoundingBox = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const c2Ref = useRef<Circle>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    function createSbCircle(x?, y?, fillStyle?, cursor?: ICursor) {
      const radius = 50
      const circle = new Circle({
        x: x ?? randomCircleX(stage.canvasSize.width, radius),
        y: y ?? randomCircleX(stage.canvasSize.height, radius),
        radius,
        fillStyle: fillStyle ?? 'orange',
        draggable: true,
        cursor
      })

      return circle
    }

    const cc_1 = createSbCircle(100, 100, colorAlpha('pink', 0.9), 'move')
    const cc_2 = createSbCircle(150, 150, colorAlpha('orange', 0.9), 'pointer')
    const cc_3 = createSbCircle(200, 200, colorAlpha('violet', 0.9), 'crosshair')

    stage.append(cc_1, cc_2, cc_3)

    c2Ref.current = cc_2
  }, [])

  const up1 = () => {
    c2Ref.current.attrDirty({ y: 100 })
  }

  const up1_1 = () => {
    if (c2Ref.current.data.y === 150) {
      c2Ref.current.attrDirty({ y: 100 })
    } else {
      c2Ref.current.attrDirty({ y: 150 })
    }
  }

  const up2 = () => {
    if (c2Ref.current.data.radius === 80) {
      c2Ref.current.attrDirty({ radius: 50 })
    } else {
      c2Ref.current.attrDirty({ radius: 80 })
    }
  }

  return (
    <>
      <h3>脏矩形更新</h3>
      <div className="flex gap-2 mb-2">
        <button onClick={up1}>更新 橙色圆形 的 y: 150 {'->'} 100</button>
        <button onClick={up1_1}>更新 橙色圆形 的 y: 150 {'<->'} 100</button>
        <button onClick={up2}>更新 橙色圆形 的 radius 80: {'<->'} 50</button>
      </div>

      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default SoundingBox
