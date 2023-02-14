import LineDemo from './demo/LineDemo'
import BarDemo from './demo/BarDemo'
import PieDemo from './demo/PieDemo'
import ArcAnimate from './demo/ArcAnimate'
import CandleTask from './demo/CandleTask'

import BaseRenderDemo from './demo/BaseRenderDemo'

const dirTree = [
  {
    label: 'charts',
    value: 'charts',
    children: [
      { value: 'line', label: '折线图', ChartComponent: LineDemo },
      { value: 'bar', label: '柱状图', ChartComponent: BarDemo },
      { value: 'pie', label: '饼图', ChartComponent: PieDemo },
      { value: 'arcAnimate', label: 'arcAnimate', ChartComponent: ArcAnimate },
      { value: 'candleTask', label: 'k线图', ChartComponent: CandleTask }
    ]
  },
  {
    label: '基础图形',
    value: 'baseRender',
    children: [{ value: 'baseRender', label: '基础图形', ChartComponent: BaseRenderDemo }]
  }
]

function App() {
  const [mainIndex, childIndex] = (location.hash.slice(1) || '0_0').split('_').map(Number)
  const ChartComponent = dirTree[mainIndex].children[childIndex].ChartComponent

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        {dirTree.map((item, index) => (
          <button
            key={item.value}
            onClick={() => {
              location.hash = `${index}_0`
              location.reload()
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <hr />

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        {dirTree[mainIndex].children.map((item, index) => (
          <button
            key={item.value}
            onClick={() => {
              location.hash = `${mainIndex}_${index}`
              location.reload()
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <hr />

      <ChartComponent />
    </div>
  )
}

export default App
