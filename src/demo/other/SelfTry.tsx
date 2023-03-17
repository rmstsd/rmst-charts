import { useEffect } from 'react'

const SelfTry = () => {
  useEffect(() => {
    const ctx = document.querySelector('canvas')?.getContext('2d')

    // ctx.rect(10, 10, 100, 100)
    // ctx.stroke()

    const path = new Path2D()
    ctx.beginPath()
    path.moveTo(10, 10)
    path.lineTo(100, 10)
    ctx.stroke(path)

    console.log(ctx.isPointInStroke(path, 15, 10))
  }, [])

  return (
    <div>
      <canvas></canvas>
    </div>
  )
}

export default SelfTry
