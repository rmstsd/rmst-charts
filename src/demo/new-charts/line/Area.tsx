import ChartsTemplate from '@/components/ChartsTemplate'

// 基础面积图
const option: ICharts.IOption = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f'],
    boundaryGap: false
  },
  series: {
    type: 'line' as const,
    data: [620, 932, 901, 934, 800, 800],
    areaStyle: {}
    // smooth: true
  }
}

const Area = () => {
  return <ChartsTemplate option={option} />
}

export default Area
