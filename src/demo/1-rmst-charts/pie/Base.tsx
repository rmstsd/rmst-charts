import ChartsTemplate from '@/components/ChartsTemplate'

// 基础饼图
const option: ICharts.IOption = {
  series: [
    {
      type: 'pie',
      data: [
        { value: 1, name: 'pie-1' },
        { value: 2, name: 'pie-2' },
        { value: 3, name: 'pie-3' },
        { value: 4, name: 'pie-4' },
        { value: 5, name: 'pie-5' }
      ]
    }
  ]
}

const Base = () => {
  return <ChartsTemplate option={option} />
}

export default Base
