import ChartsTemplate from '@/components/ChartsTemplate'

// 极坐标柱状图标签  https://echarts.apache.org/examples/zh/editor.html?c=bar-polar-label-tangential
// radiusAxis 极坐标系的径向轴

const option: ICharts.IOption = {
  polar: {},
  angleAxis: { max: 4 },
  radiusAxis: {
    type: 'category',
    data: ['a', 'b', 'c', 'd']
  },
  series: [
    {
      type: 'bar' as const,
      data: [2, 1.2, 2.4, 3.8],
      coordinateSystem: 'polar'
    }
  ]
}

const PolarLabelTangential = () => {
  return <ChartsTemplate option={option} />
}

export default PolarLabelTangential
