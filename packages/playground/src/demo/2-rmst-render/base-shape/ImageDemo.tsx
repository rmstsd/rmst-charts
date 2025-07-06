import { useEffectStage } from '@/utils/hooks'
import { useEffect, useRef } from 'react'
import { Rect, RmstImage as RtImage } from 'rmst-render'
import { translate } from 'transformation-matrix'

import testJpg from '@/assets/test.jpg'
import zyJpg from '@/assets/zy.jpg'

export default function ImageDemo() {
  const canvasRef = useRef<HTMLDivElement>(null)

  const stage = useEffectStage(canvasRef, stage => {
    const image = new RtImage({
      x: 50,
      y: 0,
      width: 80,
      height: 100,
      src: testJpg,
      lineWidth: 2,
      strokeStyle: 'red',
      objectFit: 'contain'
    })
    const image2 = new RtImage({
      x: 200,
      y: 50,
      width: 130,
      height: 50,
      src: zyJpg,
      lineWidth: 2,
      strokeStyle: 'red',
      objectFit: 'contain'
    })

    stage.append(image, image2)
  })

  return (
    <div>
      <button
        onClick={() => {
          stage.render()
        }}
      >
        重绘
      </button>
      <hr />
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )

  useEffect(() => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const image = new Image()
    image.src = zyJpg
    image.onload = () => {
      ctx.setTransform(translate(100, 100))
      ctx?.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, 500, 200)
    }
  }),
    []

  return <canvas width={800} height={800} className="border"></canvas>
}
