import ChartsTemplate from '@/components/ChartsTemplate'

// 折线图堆叠
const option: ICharts.IOption = {
  xAxis: {
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  series: [
    {
      name: 'Email',
      type: 'line',
      stack: 'sign',
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: 'Union Ads',
      type: 'line',
      stack: 'sign',
      data: [220, 182, 191, 234, 290, 330, 310]
    },
    {
      name: 'Video Ads',
      type: 'line',
      stack: 'sign',
      data: [150, 232, 201, 154, 190, 330, 410]
    },
    {
      name: 'Direct',
      type: 'line',
      stack: 'sign',
      data: [320, 332, 301, 334, 390, 330, 320]
    },
    {
      name: 'Search Engine',
      type: 'line',
      stack: 'sign',
      data: [820, 932, 901, 600, 500, 400, 500]
    }
  ]
}

const Stack = () => {
  return <ChartsTemplate option={option} />
}

export default Stack
