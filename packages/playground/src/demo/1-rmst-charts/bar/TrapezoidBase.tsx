import ChartsTemplate from '@/components/ChartsTemplate'

// 基础柱状图
const option: ICharts.IOption = {
  xAxis: {
    data: ['a', 'b', 'c', 'd']
  },
  series: [
    {
      type: 'bar',
      data: [666, 78, 88, 600],
      itemStyle: {
        shortLength: '70%'
      }
    }
  ]
}

const TrapezoidBase = () => {
  return <ChartsTemplate option={option} />
}

export default TrapezoidBase
