import ChartsTemplate from '@/components/ChartsTemplate'

// 极坐标柱状图标签  https://echarts.apache.org/examples/zh/editor.html?c=bar-polar-label-radial
// angleAxis 极坐标系的角度轴

const option: ICharts.IOption = {
  polar: {},
  radiusAxis: {},
  angleAxis: {
    type: 'category',
    data: ['a', 'b', 'c', 'd']
  },
  series: [
    {
      type: 'bar' as const,
      data: [20, 12.2, 24.4, 33.6],
      coordinateSystem: 'polar'
    }
  ]
}

const PolarLabelRadial = () => {
  return <ChartsTemplate option={option} />
}

export default PolarLabelRadial
