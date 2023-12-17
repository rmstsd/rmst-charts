import ChartsTemplate from '@/components/ChartsTemplate'

// 堆叠面积图
const option: ICharts.IOption = {
  xAxis: {
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    boundaryGap: false
  },
  series: [
    {
      name: 'Email',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      data: [120, 132, 101, 134, 90, 230, 210],
      symbolSize: 20
    },
    {
      name: 'Union Ads',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      data: [220, 182, 191, 234, 290, 330, 310],
      symbolSize: 20
    },
    {
      name: 'Video Ads',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      data: [150, 232, 201, 154, 190, 330, 410],
      symbolSize: 20
    },
    {
      name: 'Direct',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      data: [320, 332, 301, 334, 390, 330, 320],
      symbolSize: 20
    },
    {
      name: 'Search Engine',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      data: [400, 600, 800, 700, 400, 500, 300],
      symbolSize: 20
    }
  ]
}

const AreaStack = () => {
  return <ChartsTemplate option={option} />
}

export default AreaStack
