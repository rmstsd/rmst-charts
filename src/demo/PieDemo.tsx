// 饼图
import { useEffect } from 'react'
import srcCharts from '../src-charts'

const option = {
  series: {
    type: 'pie' as const,
    data: [
      { value: 1, name: 'Search Engine' },
      { value: 2, name: 'Direct' },
      { value: 3, name: 'Email' },
      { value: 4, name: 'Union Ads' },
      { value: 5, name: 'Video Ads' }
    ]
  }
}
const PieDemo = () => {
  useEffect(() => {
    const ins = srcCharts.init(document.querySelector('.canvas-container'))

    ins.setOption(option)

    return () => {
      ins.canvasElement.remove()
    }
  }, [])

  return <div className="canvas-container"></div>
}

export default PieDemo
