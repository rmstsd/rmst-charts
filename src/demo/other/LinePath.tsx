import { useEffect } from 'react'

import srcCharts from '@/rmst-charts-new'

const LinePath = () => {
  useEffect(() => {
    const { stage } = srcCharts.init(document.querySelector('.canvas-container'))

    const { ctx } = stage

    ctx.save()

    // Create circular clipping region
    ctx.beginPath()
    ctx.arc(100, 75, 50, 0, Math.PI * 2)
    ctx.clip()

    // Draw stuff that gets clipped
    ctx.fillStyle = 'blue'
    ctx.fillRect(0, 0, 300, 300)
    ctx.fillStyle = 'orange'
    ctx.fillRect(0, 0, 100, 100)

    ctx.restore()
    ctx.fillStyle = 'pink'
    ctx.fillRect(100, 75, 100, 100)
  }, [])

  return (
    <div>
      刮刮乐 与折线图
      <div className="canvas-container"></div>
    </div>
  )
}

export default LinePath
