import ChartsTemplate from '@/components/ChartsTemplate'

// 极坐标柱状图标签  https://echarts.apache.org/examples/zh/editor.html?c=bar-polar-label-tangential
// radiusAxis 极坐标系的径向轴
// 后实现

const option: ICharts.IOption = {
  polar: {},
  angleAxis: {},
  radiusAxis: {
    type: 'category',
    data: ['a', 'b', 'c', 'd', 'e']
  },
  series: [
    {
      type: 'bar' as const,
      data: [1, 2, 3, 4, 5],
      coordinateSystem: 'polar'
    }
  ]
}

const PolarLabelTangential = () => {
  return <ChartsTemplate option={option} />
}

export default PolarLabelTangential
