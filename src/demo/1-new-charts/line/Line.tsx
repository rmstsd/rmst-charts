import ChartsTemplate from '@/components/ChartsTemplate'

// 基础折线图
const option: ICharts.IOption = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  series: [
    {
      type: 'line' as const,
      data: [620, 932, 901, 934, 800, 800]
      // smooth: true
    }
  ]
}

const Line = () => {
  return <ChartsTemplate option={option} />
}

export default Line
