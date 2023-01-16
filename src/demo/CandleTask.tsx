import { useEffect } from 'react'

import { initDraw } from '../../old-charts/candle-task'

const CandleTask = () => {
  useEffect(() => {
    initDraw()
  }, [])

  return (
    <div>
      <section className="operation">
        <button className="gen-draw">产生随机数据 并绘制</button>
        总数量: <input type="number" defaultValue="100" style={{ width: 50 }} /> 数据中的最小值:
        <input type="number" className="min-input" defaultValue="100" style={{ width: 50 }} /> 数据中的最大值:
        <input type="number" className="max-input" defaultValue="500" style={{ width: 50 }} />
      </section>

      <hr />

      <div
        className="canvas-container"
        style={{
          width: 600,
          height: 350,
          boxShadow: '0px 0px 0 1px #c3c0c0',
          position: 'relative',
          margin: '10px 0'
        }}
      ></div>
    </div>
  )
}

export default CandleTask
