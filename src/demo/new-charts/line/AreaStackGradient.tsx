import ChartsTemplate from '@/components/ChartsTemplate'

// 渐变堆叠面积图
const option: ICharts.IOption = {
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    boundaryGap: false
  },
  series: [
    {
      type: 'line',
      stack: 'Total',
      smooth: true,
      lineStyle: { width: 0 },
      areaStyle: {
        // color: [
        //   { offset: 0, color: 'rgb(128, 255, 165)' },
        //   { offset: 1, color: 'rgb(1, 191, 236)' }
        // ]
      },
      data: [140, 232, 101, 264, 90, 340, 250]
    },
    {
      type: 'line',
      stack: 'Total',
      smooth: true,
      lineStyle: { width: 0 },
      areaStyle: {
        // color: [
        //   { offset: 0, color: 'rgb(0, 221, 255)' },
        //   { offset: 1, color: 'rgb(77, 119, 255)' }
        // ]
      },
      data: [120, 282, 111, 234, 220, 340, 310]
    },
    {
      type: 'line',
      stack: 'Total',
      smooth: true,
      lineStyle: { width: 0 },
      areaStyle: {
        // color: [
        //   { offset: 0, color: 'rgb(55, 162, 255)' },
        //   { offset: 1, color: 'rgb(116, 21, 219)' }
        // ]
      },
      data: [320, 132, 201, 334, 190, 130, 220]
    },
    {
      type: 'line',
      stack: 'Total',
      smooth: true,
      lineStyle: { width: 0 },
      areaStyle: {
        // color: [
        //   { offset: 0, color: 'rgb(255, 0, 135)' },
        //   { offset: 1, color: 'rgb(135, 0, 157)' }
        // ]
      },
      data: [220, 402, 231, 134, 190, 230, 120]
    },
    {
      type: 'line',
      stack: 'Total',
      smooth: true,
      lineStyle: { width: 0 },
      areaStyle: {
        color: [
          { offset: 0, color: 'rgba(255, 191, 0, 0.5)' },
          { offset: 1, color: 'rgba(224, 62, 76, 0.5)' }
        ]
      },
      data: [220, 302, 181, 234, 210, 290, 150]
    }
  ]
}

const AreaStackGradient = () => {
  return <ChartsTemplate option={option} />
}

export default AreaStackGradient
