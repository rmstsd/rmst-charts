import { useEffect } from 'react'

import srcCharts from '@/rmst-charts-new'
import { Rect } from '@/rmst-render'

const Translation = () => {
  useEffect(() => {
    const { stage } = srcCharts.init(document.querySelector('.canvas-container'))

    const { ctx } = stage

    const rect = new Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      bgColor: 'pink'
    })

    stage.append(rect)

    setTimeout(() => {
      ctx.translate(10, 10)

      stage.renderStage()
    }, 2000)
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default Translation
