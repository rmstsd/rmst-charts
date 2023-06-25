// 曲线矩形
import { useEffect } from 'react'

import srcCharts from '@/rmst-charts-new'

const CurveRect = () => {
  useEffect(() => {
    const { stage } = srcCharts.init(document.querySelector('.canvas-container'))

    const { ctx } = stage
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default CurveRect
