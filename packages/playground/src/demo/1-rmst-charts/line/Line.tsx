import ChartsTemplate from '@/components/ChartsTemplate'

// 基础折线图
const option: ICharts.IOption = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  series: [
    {
      type: 'line',
      data: [620, 932, 901, 934, 800, 1001]
      // data: [0.1, 0.2, 0.3, 0.2, 0.1]
      // smooth: true
    }
  ]
}

const Line = () => {
  return <ChartsTemplate option={option} />
}

export default Line
