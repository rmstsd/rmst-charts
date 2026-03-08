import { useEffectStage } from '@/utils/hooks'
import { useEffect, useRef } from 'react'
import { Rect } from 'rmst-render'
import { findHover_v2 } from 'rmst-render/_stage/findHover'

export default function MyTest() {
  const ref = useRef<HTMLDivElement>(null)
  useEffectStage(ref, stage => {
    const container = ref.current

    container.onmousemove = evt => {
      stage.removeAllChildren()

      const rect = new Rect({
        x: 44,
        y: 44,
        width: 100,
        height: 100,
        fillStyle: 'red',
        cursor: 'pointer'
      })
      stage.append(rect)

      const rec2 = new Rect({
        x: 160,
        y: 44,
        width: 100,
        height: 100,
        fillStyle: 'beige',
        cursor: 'pointer'
      })

      stage.append(rec2)

      const hovered = findHover_v2(stage, evt.offsetX, evt.offsetY)
      console.log(hovered)
    }
  })

  return (
    <div>
      <div
        ref={ref}
        className="ca-container  relative border"
        style={{ width: 400, height: 400, resize: 'both', overflow: 'hidden' }}
      ></div>
    </div>
  )
}
