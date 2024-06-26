import { useEffect } from 'react'
import { getPathBBox } from '@antv/util'

export default function BBox() {
  useEffect(() => {
    const d = 'M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80'

    const pathBBox = getPathBBox(d)
    console.log(pathBBox)

    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    const path = new Path2D(d)

    const lineWidth = 8
    ctx.lineWidth = lineWidth

    ctx.stroke(path)

    ctx.strokeStyle = 'red'

    ctx.lineWidth = 1
    ctx.strokeStyle = 'orange'
    const half = lineWidth / 2 + 2
    ctx.strokeRect(pathBBox.x - half, pathBBox.y - half, pathBBox.width + 2 * half, pathBBox.height + 2 * half)
  }, [])

  return (
    <div>
      <canvas></canvas>
    </div>
  )
}
