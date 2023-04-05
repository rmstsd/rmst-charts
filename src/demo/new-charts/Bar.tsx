// 柱状图
import { useEffect, useRef } from 'react'
import srcCharts, { IChartInstance } from '@/rmst-charts-new'

const option = {
  xAxis: {
    data: ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27']
    // boundaryGap: false
  },
  series: {
    type: 'bar' as const,
    data: [190, 210, 300, 450]
  }
}

const Bar = () => {
  const insRef = useRef<IChartInstance>()

  useEffect(() => {
    const ins = srcCharts.init(document.querySelector('.canvas-container'))
    insRef.current = ins

    ins.setOption(option)
  }, [])

  const setOption = () => {
    insRef.current.setOption(option)
  }

  return (
    <>
      <button onClick={setOption}>setOption</button>
      <hr />
      <div className="canvas-container"></div>
    </>
  )
}

export default Bar
