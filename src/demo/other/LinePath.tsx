import { useEffect } from 'react'

import srcCharts from '@/rmst-charts-new'

const LinePath = () => {
  useEffect(() => {
    const { stage } = srcCharts.init(document.querySelector('.canvas-container'))

    const { ctx } = stage

    ctx.moveTo(100, 100)
    ctx.lineTo(200, 200)
    ctx.lineTo(300, 40)
    ctx.lineTo(400, 120)

    const gradient = ctx.createLinearGradient(100, 0, 400, 0)

    gradient.addColorStop(0, 'pink')
    gradient.addColorStop(0.339999999999999999, 'pink')
    gradient.addColorStop(0.34, 'blue')
    gradient.addColorStop(1, 'blue')

    ctx.strokeStyle = gradient
    ctx.lineWidth = 50
    ctx.lineCap = 'square'
    // ctx.lineJoin = 'round'
    ctx.stroke()

    ctx.beginPath()

    ctx.fillStyle = 'red'
    ctx.fillRect(100, 100, 2, 2)
    ctx.fillRect(300, 40, 2, 2)
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default LinePath
