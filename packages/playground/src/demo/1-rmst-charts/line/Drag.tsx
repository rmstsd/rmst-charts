import ChartsTemplate from '@/components/ChartsTemplate'

const length = 100

const xData = Array.from({ length }, (_, index) => Math.random().toString(36).slice(3, 6) + '-' + index)
const data = Array.from({ length }, () => Math.floor(Math.random() * 400 + 100))

const option = {
  xAxis: {
    data: xData
  },
  series: [
    {
      type: 'line',
      data,
      animation: false
    }
  ],
  dataZoom: [
    {
      type: 'slider',
      start: 20,
      end: 50
    }
  ]
}

const Drag = () => {
  return <ChartsTemplate option={option} />
}

export default Drag
