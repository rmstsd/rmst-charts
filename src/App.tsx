import { useState } from 'react'

import LineDemo from './demo/LineDemo'
import BarDemo from './demo/BarDemo'
import PieDemo from './demo/PieDemo'

import ArcAnimate from './demo/ArcAnimate'

const chartMap = {
  Line: LineDemo,
  Bar: BarDemo,
  Pie: PieDemo,
  ArcAnimate
}

function App() {
  const chartType = location.hash.slice(1) || 'Line'

  const ChartComponent = chartMap[chartType]

  const buttons = [
    { value: 'Line', label: '折线图' },
    { value: 'Bar', label: '柱状图' },
    { value: 'Pie', label: '饼图' },
    { value: 'ArcAnimate', label: 'arcAnimate' }
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
