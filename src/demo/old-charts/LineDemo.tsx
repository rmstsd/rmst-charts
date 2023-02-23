// 折线图
import { useEffect } from 'react'
import srcCharts from '../../rmst-charts-old'

const option = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  series: {
    type: 'line' as const,
    data: [600, 932, 901, 934, 800, 800]
    // smooth: true
  }
}

const LineDemo = () => {
  useEffect(() => {
    const ins = srcCharts.init(document.querySelector('.canvas-container'))

    ins.setOption(option)

    return () => {
      ins.canvasElement.remove()
    }
  }, [])

  return (
    <>
      <div className="canvas-container"></div>
    </>
  )
}

export default LineDemo
