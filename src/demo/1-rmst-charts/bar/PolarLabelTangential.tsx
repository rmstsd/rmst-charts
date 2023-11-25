import ChartsTemplate from '@/components/ChartsTemplate'

// 极坐标柱状图标签  https://echarts.apache.org/examples/zh/editor.html?c=bar-polar-label-tangential
// radiusAxis 极坐标系的径向轴
// 实现时间: 后实现的

const option: ICharts.IOption = {
  polar: {},
  angleAxis: {
    startAngle: 45
  },
  radiusAxis: {
    type: 'category',
    data: ['a', 'b', 'c', 'd']
  },
  series: [
    {
      type: 'bar',
      data: [1, 2, 3, 4],
      coordinateSystem: 'polar'
    }
  ]
}

const PolarLabelTangential = () => {
  return <ChartsTemplate option={option} />
}

export default PolarLabelTangential
