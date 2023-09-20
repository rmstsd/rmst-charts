import ChartsTemplate from '@/components/ChartsTemplate'

// 极端的例子
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
  return <ChartsTemplate option={option} />
}

export default ZExtreme
