import LineDemo from './demo/LineDemo'
import BarDemo from './demo/BarDemo'
import PieDemo from './demo/PieDemo'

import ArcAnimate from './demo/ArcAnimate'
import CandleTask from './demo/CandleTask'

const chartMap = {
  Line: LineDemo,
  Bar: BarDemo,
  Pie: PieDemo,
  ArcAnimate,
  CandleTask
}

function App() {
  const chartType = location.hash.slice(1) || 'Line'

  const ChartComponent = chartMap[chartType]

  const buttons = [
    { value: 'Line', label: '折线图' },
    { value: 'Bar', label: '柱状图' },
    { value: 'Pie', label: '饼图' },
    { value: 'ArcAnimate', label: 'arcAnimate' },
    { value: 'CandleTask', label: 'k线图' }
  ]

  return (
    <div className="App">
      <aside style={{ display: 'flex', gap: 3 }}>
        {buttons.map(item => (
          <button
            key={item.value}
            onClick={() => {
              location.hash = item.value
              location.reload()
            }}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <hr />

      <ChartComponent />
    </div>
  )
}

export default App
