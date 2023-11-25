import { useEffect, useRef, useState } from 'react'
import rmstCharts, { IChartInstance } from 'rmst-charts'

const ChartsTemplate: React.FC<{ option: ICharts.IOption }> = ({ option }) => {
  const insRef = useRef<IChartInstance>()
  const containerRef = useRef<HTMLDivElement>(null)

  const [innerOption, setInnerOption] = useState(option)

  useEffect(() => {
    const ins = rmstCharts.init(containerRef.current)
    insRef.current = ins

    ins.setOption(option)
  }, [])

  const setOption = () => {
    insRef.current.setOption(innerOption)
  }

  return (
    <>
      <button onClick={setOption}>setOption</button>
      <hr />

      <section style={{ display: 'flex', gap: 10 }}>
        <div ref={containerRef} className="canvas-container"></div>

        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: 500,
            overflow: 'auto',
            border: '1px solid #eee'
          }}
        >
          <div style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
            <h2>配置</h2>
            <hr />
          </div>

          <textarea
            style={{ padding: 10, fontFamily: 'Consolas', width: '100%', flexGrow: 1 }}
            onChange={evt => {
              setInnerOption(JSON.parse(evt.target.value))
              insRef.current.setOption(JSON.parse(evt.target.value))
            }}
            value={JSON.stringify(innerOption, null, 2)}
          />
        </div>
      </section>
    </>
  )
}

export default ChartsTemplate
