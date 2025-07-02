import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useWbEditor } from './context'
import { IGraph } from './type'

export default function InfoRightPanel() {
  const { wbEditor } = useWbEditor()

  const [selectedItems, setSelectedItems] = useState<IGraph[]>([])

  useEffect(() => {
    const off = wbEditor.eventEmitter.on('render', () => {
      const data = wbEditor.selectManager.selectedGraphs

      setSelectedItems(data)
    })

    return off
  }, [wbEditor])

  return (
    <div className="flex-shrink-0 p-2 " style={{ width: 200 }}>
      {selectedItems.map(item => {
        const { id, graphShape } = item
        const data = graphShape.data

        return (
          <div key={item.id}>
            <div className="flex gap-2 items-center">
              <span>x</span>
              <WbInputNumber
                value={data.mt.e}
                onChange={val => {
                  console.log(val)
                }}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span>y</span>
              <WbInputNumber
                value={data.mt.f}
                onChange={val => {
                  console.log(val)
                }}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span>width</span>
              <WbInputNumber
                value={data.width}
                onChange={val => {
                  console.log(val)

                  graphShape.attr({ width: val })

                  wbEditor.triggerRender()
                }}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span>height</span>
              <WbInputNumber
                value={data.height}
                onChange={val => {
                  console.log(val)
                  graphShape.attr({ height: val })
                  wbEditor.triggerRender()
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const WbInputNumber = props => {
  const { value, onChange } = props

  const inputRet = useRef<HTMLInputElement>()

  useLayoutEffect(() => {
    inputRet.current.value = value
  }, [value])

  return (
    <input
      className="p-2 border border-gray-400 rounded-md focus:border-blue-600 outline-blue-600 "
      style={{ width: '100%' }}
      ref={inputRet}
      onBlur={evt => {
        let num = parseFloat(evt.target.value)
        if (Number.isNaN(num)) {
          num = 0
        }

        onChange?.(num)
      }}
    />
  )
}
