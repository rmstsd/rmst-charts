// 饼图 - 环形图
import { useEffect, useRef } from 'react'
import rmstCharts, { IChartInstance } from '@/rmst-charts-new'

const option = {
  series: {
    type: 'pie' as const,
    radius: ['40%', '70%'],
    data: [
      { value: 1, name: 'pie-1' },
      { value: 2, name: 'pie-2' },
      { value: 3, name: 'pie-3' },
      { value: 4, name: 'pie-4' },
      { value: 5, name: 'pie-5' }
    ]
  }
}

const Ring = () => {
  const insRef = useRef<IChartInstance>()
  useEffect(() => {
    const ins = rmstCharts.init(document.querySelector('.canvas-container'))
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

export default Ring
