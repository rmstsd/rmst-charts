import { useState } from 'react'

import LineDemo from './demo/LineDemo'
import BarDemo from './demo/BarDemo'
import PieDemo from './demo/PieDemo'

import ArcAnimate from './demo/ArcAnimate'

const chartMap = {
  Line: LineDemo,
  Bar: BarDemo,
  Pie: PieDemo
}

function App() {
  const [bool, update] = useState(true)

  const chartType = location.hash.slice(1) || 'Line'

  const ChartComponent = chartMap[chartType]

  return (
    <div className="App">
      <aside>
        <button
          onClick={() => {
            location.hash = 'Line'
            update(!bool)
          }}
        >
          折线图
        </button>
        <button
          onClick={() => {
            location.hash = 'Bar'
            update(!bool)
          }}
        >
          柱状图
        </button>
        <button
          onClick={() => {
            location.hash = 'Pie'
            update(!bool)
          }}
        >
          饼图
        </button>
      </aside>

      <hr />

      {/* <ChartComponent /> */}

      <ArcAnimate />
    </div>
  )
}

export default App
