// 柱状图
import { useEffect } from 'react'
import srcCharts from '../src-charts'

const option = {
  xAxis: {
    data: ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27']
  },
  series: {
    type: 'bar' as const,
    data: [200, 210, 300, 303]
  }
}

const BarDemo = () => {
  useEffect(() => {
    const ins = srcCharts.init(document.querySelector('.canvas-container'))

    ins.setOption(option)

    return () => {
      ins.canvasElement.remove()
    }
  }, [])

  return <div className="canvas-container"></div>
}

export default BarDemo
