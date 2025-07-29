import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useWbEditor } from '../context'
import { compose, translate } from 'transformation-matrix'
import { calcRotateRad, getScaleFromMatrix_x, getScaleFromMatrix_y } from '../constant'
import { IShape, rad2deg } from 'rmst-render'
import { round } from 'es-toolkit'

export default function InfoRightPanel() {
  const { wbEditor } = useWbEditor()

  const [zoom, setZoom] = useState(0)
  const [selectedItems, setSelectedItems] = useState<IShape[]>([])

  useEffect(() => {
    const off = wbEditor.eventEmitter.on('render', () => {
      const data = wbEditor.selectManager.selectedGraphs

      setSelectedItems(data)
    })

    setZoom(wbEditor.camera.zoom)
    const unBind = wbEditor.camera.eventEmitter.on('cameraChange', () => {
      setZoom(wbEditor.camera.zoom)
    })

    return () => {
      off()
      unBind()
    }
  }, [wbEditor])

  const [count, setCount] = useState(0)

  return (
    <div className="right-attr-panel flex-shrink-0 p-2 overflow-auto " style={{ width: 200 }}>
      <div className="zoom-container flex flex-wrap bg-white shadow-xl rounded-lg p-2 border flex gap-1 items-center">
        <button onClick={() => wbEditor.camera.zoomOut()}>缩小</button>
        <span style={{ width: 90 }} className="text-center">
          zoom: {round(zoom * 100)}%
        </span>
        <button onClick={() => wbEditor.camera.zoomIn()}>放大</button>
        <button onClick={() => wbEditor.camera.zoomToValue(1)}>100%</button>
        <button onClick={() => wbEditor.camera.zoomToFit()}>适应画布</button>
      </div>

      <WbInputNumber
        value={count}
        onChange={val => {
          console.log('val', val)
          setCount(val)
        }}
      />

      {selectedItems.map(item => {
        const { data } = item

        item.attr({})

        return (
          <div key={data.id}>
            <button onClick={() => {}}>检测</button>

            <hr />
            <div className="flex gap-2 items-center">
              <span>x</span>
              <WbInputNumber
                value={data.mt.e}
                onChange={val => {
                  item.attr({ mt: compose(translate(val - data.mt.e, 0), data.mt) })
                  wbEditor.triggerRender()
                }}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span>y</span>
              <WbInputNumber
                value={data.mt.f}
                onChange={val => {
                  item.attr({ mt: compose(translate(0, val - data.mt.f), data.mt) })
                  wbEditor.triggerRender()
                }}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span>width</span>
              <WbInputNumber
                value={data.width}
                onChange={val => {
                  item.attr({ width: val })

                  wbEditor.triggerRender()
                }}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span>height</span>
              <WbInputNumber
                value={data.height}
                onChange={val => {
                  item.attr({ height: val })
                  wbEditor.triggerRender()
                }}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span>rotate</span>
              <WbInputNumber value={rad2deg(calcRotateRad(data.mt))} onChange={val => {}} />
            </div>
            <div className="flex gap-2 items-center">
              <span>mt</span>
              <span style={{ height: 240 }}>{JSON.stringify(data.mt, null, 2)}</span>
            </div>

            <div className="flex gap-2 items-center">
              <span>scale</span>
              <span>
                {getScaleFromMatrix_x(data.mt)} {getScaleFromMatrix_y(data.mt)}
              </span>
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
        console.log('blur')
        onChange?.(num)
        inputRet.current.value = String(num)
      }}
    />
  )
}
