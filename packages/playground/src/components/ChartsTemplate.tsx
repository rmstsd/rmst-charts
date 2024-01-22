import { message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import rmstCharts, { ChartRoot } from 'rmst-charts'

const ChartsTemplate: React.FC<{ option: ICharts.IOption }> = ({ option }) => {
  const insRef = useRef<ChartRoot>()
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

      <section className="flex gap-[10px]">
        <div ref={containerRef} className="w-[750px] h-[500px] border border-gray-300"></div>

        <div className="flex-grow flex flex-col h-[500px] overflow-auto border p-1">
          <div className="sticky top-0 bg-white">
            <h3 className="mt-2 ml-2">配置 (修改后实时生效)</h3>
          </div>

          <textarea
            className="p-[10px] w-full flex-grow font-[Consolas] outline-none border focus:border-gray-500"
            onChange={evt => {
              const option = parseJsonString(evt.target.value)
              setInnerOption(option)

              if (option) {
                message.destroy()
                insRef.current.setOption(option)
              } else {
                message.error('json 格式错误')
              }
            }}
            value={JSON.stringify(innerOption, null, 2)}
          />
        </div>
      </section>
    </>
  )
}

export default ChartsTemplate

function parseJsonString(value: string) {
  try {
    return JSON.parse(value)
  } catch {}
}
