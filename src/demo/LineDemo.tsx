// 折线图 demo
import { useEffect } from 'react'
import srcCharts from '../src-charts'

const option = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  series: {
    type: 'line' as const,
    data: [820, 932, 901, 934, 800, 650]
    // smooth: true
  }
}

const Line = () => {
  useEffect(() => {
    const ins = srcCharts.init(document.querySelector('.canvas-container'))

    ins.setOption(option)

    return () => {
      ins.canvasElement.remove()
    }
  }, [])

  return <div className="canvas-container"></div>
}

export default Line
