import ChartsTemplate from '@/components/ChartsTemplate'

// 折线图堆叠
const option = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  series: [
    {
      type: 'line' as const,
      data: [620, 932, 901, 934, 800, 800]
      // smooth: true
    },
    {
      type: 'line' as const,
      data: [100, 200, 400, 500, 150, 423]
      // smooth: true
    }
  ]
}

const Stack = () => {
  return <ChartsTemplate option={option} />
}

export default Stack
