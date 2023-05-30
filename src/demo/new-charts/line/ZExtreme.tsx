import { useEffect, useRef } from 'react'
import rmstCharts, { IChartInstance } from '@/rmst-charts-new'

const option: ICharts.IOption = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  series: [
    {
      name: 'Step Start',
      type: 'line',
      step: 'start',
      data: [120, 132, 101, 134, 90, 230],
      smooth: true
    },
    {
      name: 'Step Middle',
      type: 'line',
      step: 'middle',
      data: [220, 282, 201, 234, 290, 430]
    },
    {
      name: 'Step End',
      type: 'line',
      step: 'end',
      data: [450, 432, 401, 454, 590, 530],
      animationDuration: 3000,
      lineStyle: {
        width: 10,
        cap: 'round',
        join: 'round'
      },
      symbol: 'none'
    }
  ]
}

const ZExtreme = () => {
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

export default ZExtreme
