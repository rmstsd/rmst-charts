import { useEffectStage } from '@/utils/hooks'
import { useRef } from 'react'
import { Image } from 'rmst-render'

import zyJpg from '@/assets/zy.jpg'

export default function ImageDemo() {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffectStage(canvasRef, stage => {
    const image = new Image({
      x: 100,
      y: 100,
      width: 130,
      height: 100,
      src: zyJpg
    })

    stage.append(image)
  })

  return <div className="canvas-container" ref={canvasRef}></div>
}
