import { useEffect, useRef } from 'react'
import rmstCharts, { IChartInstance } from '@/rmst-charts-new'

const ChartsTemplate: React.FC<{ option: ICharts.IOption }> = ({ option }) => {
  const insRef = useRef<IChartInstance>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ins = rmstCharts.init(containerRef.current)
    insRef.current = ins

    ins.setOption(option)
  }, [])

  const setOption = () => {
    insRef.current.setOption(option)
  }

  return (
    <>
      <button onClick={setOption}>setOption</button>
      <hr />

      <section style={{ display: 'flex', gap: 10 }}>
        <div ref={containerRef} className="canvas-container"></div>

        <div style={{ flexGrow: 1, height: 500, overflow: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
            <h2>配置</h2>
            <hr />
          </div>
          <pre>{JSON.stringify(option, null, 2)}</pre>
        </div>
      </section>
    </>
  )
}

export default ChartsTemplate
