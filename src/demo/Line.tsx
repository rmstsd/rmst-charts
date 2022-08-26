import { useEffect } from 'react'
import tCharts from '../src-charts'

const option = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  series: {
    type: 'line',
    data: [820, 932, 901, 934, 800, 650]
    // smooth: true
  }
}

const Line = () => {
  useEffect(() => {
    const ins = tCharts.init(document.querySelector('.canvas-container'))

    ins.setOption(option)

    return () => {
      ins.canvasElement.remove()
    }
  }, [])

  return <div className="canvas-container"></div>
}

export default Line
