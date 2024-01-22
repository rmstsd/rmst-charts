import ChartsTemplate from '@/components/ChartsTemplate'

// 带背景色的柱状图
const option: ICharts.IOption = {
  xAxis: {
    data: ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27']
  },
  series: [
    {
      type: 'bar',
      showBackground: true,
      data: [190, 210, 300, 450]
    }
  ]
}

const Base = () => {
  return <ChartsTemplate option={option} />
}

export default Base
