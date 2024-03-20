// 聚合图

import ChartsTemplate from '@/components/ChartsTemplate'

const option: ICharts.IOption = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
  },
  series: [
    {
      name: 'Apple',
      type: 'bar',
      stack: 'sign',
      data: [100, 732, 701, 734, 1090, 1130, 1120]
    },
    {
      name: 'Banana',
      type: 'bar',
      stack: 'sign',
      data: [100, 132, 101, 134, 290, 230, 220]
    },
    {
      name: 'Orange',
      type: 'bar',
      stack: 'sign',
      data: [100, 72, 71, 74, 190, 130, 110]
    },
    {
      name: 'Pineapple',
      type: 'bar',
      stack: 'sign',
      data: [100, 82, 91, 84, 109, 110, 120]
    }
  ]
}

const Combine = () => {
  return <ChartsTemplate option={option} />
}

export default Combine
