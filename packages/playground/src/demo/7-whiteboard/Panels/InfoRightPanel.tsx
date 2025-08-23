import { useEffect, useState } from 'react'
import { useWbEditor } from '../context'
import { calcRotateRad, getScaleFromMatrix_x, getScaleFromMatrix_y } from '../constant'
import { deg2rad, rad2deg, UiBase } from 'rmst-render'
import { round } from 'es-toolkit'

import { WbInputNumber } from '../components/WbInputNumber'
import { applyToPoint, compose, inverse, rotate } from 'transformation-matrix'
import OpenColor from 'open-color'
import { SelectColor } from '../components/SelectColor'
import clsx from 'clsx'
import { ToolEnum } from '../class/ToolManager/constant'

import './right.less'

const bgColors = Object.keys(OpenColor)
  .filter(k => Array.isArray(OpenColor[k]))
  .map(k => OpenColor[k][3])

const strokeColors = Object.keys(OpenColor)
  .filter(k => Array.isArray(OpenColor[k]))
  .map(k => OpenColor[k][8])

const attrList = [
  { label: 'X', dataKey: 'mt_x', getValue: (shapeItem: UiBase) => shapeItem.data.mt.e },
  { label: 'Y', dataKey: 'mt_y', getValue: (shapeItem: UiBase) => shapeItem.data.mt.f },
  { label: 'W', dataKey: 'width', getValue: (shapeItem: UiBase) => shapeItem.data.width },
  { label: 'H', dataKey: 'height', getValue: (shapeItem: UiBase) => shapeItem.data.height },
  { label: 'R', dataKey: 'mt_rotate', getValue: (shapeItem: UiBase) => rad2deg(calcRotateRad(shapeItem.data.mt)) }
]

const colorAttrList = [
  { label: '背景', dataKey: 'fillStyle', getValue: (shapeItem: UiBase) => shapeItem.data.fillStyle, options: bgColors },
  { label: '描边', dataKey: 'strokeStyle', getValue: (shapeItem: UiBase) => shapeItem.data.strokeStyle, options: strokeColors }
]

const strokeWidthAttrList = [
  { label: '描边宽度', dataKey: 'lineWidth', getValue: (shapeItem: UiBase) => shapeItem.data.lineWidth, options: [1, 2, 3, 4] }
]

export default function InfoRightPanel() {
  const { wbEditor } = useWbEditor()

  const [zoom, setZoom] = useState(0)
  const [selectedItems, setSelectedItems] = useState<UiBase[]>([])

  useEffect(() => {
    const setData = () => {
      const data = wbEditor.selectManager.selectedGraphs
      setSelectedItems(data)
    }
    setData()
    const off = wbEditor.eventEmitter.on('render', () => {
      setData()
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

  const baseAttrData =
    selectedItems.length === 0
      ? []
      : attrList.map(item => {
          // 取到小数点后 5 位, 判断是否相等
          const values = new Set(selectedItems.map(shapeItem => round(item.getValue(shapeItem), 5)))
          const isMulti = values.size > 1

          return { ...item, isMulti, value: isMulti ? null : round([...values][0], 2) }
        })

  const colorAttrData =
    selectedItems.length === 0
      ? []
      : colorAttrList.map(item => {
          const values = new Set(selectedItems.map(shapeItem => item.getValue(shapeItem)))
          const isMulti = values.size > 1

          return { ...item, isMulti, value: isMulti ? null : [...values][0] }
        })

  const strokeWidthAttrData =
    selectedItems.length === 0
      ? []
      : strokeWidthAttrList.map(item => {
          const values = new Set(selectedItems.map(shapeItem => round(item.getValue(shapeItem), 5)))
          const isMulti = values.size > 1

          return { ...item, isMulti, value: isMulti ? null : round([...values][0], 2) }
        })

  const onChange = (item, value) => {
    switch (item.dataKey) {
      case 'mt_x': {
        selectedItems.forEach(shapeItem => {
          const mt = { ...shapeItem.data.mt }
          mt.e = value
          shapeItem.attr('mt', mt)
        })

        break
      }
      case 'mt_y': {
        selectedItems.forEach(shapeItem => {
          const mt = { ...shapeItem.data.mt }
          mt.f = value
          shapeItem.attr('mt', mt)
        })

        break
      }
      case 'mt_rotate': {
        const newRad = deg2rad(value)

        selectedItems.forEach(shapeItem => {
          const oldRad = calcRotateRad(shapeItem.data.mt)

          const origin = applyToPoint(shapeItem.data.mt, {
            x: shapeItem.data.width / 2,
            y: shapeItem.data.height / 2
          })

          const diffMt = rotate(newRad - oldRad, origin.x, origin.y)
          const newMt = compose(diffMt, shapeItem.data.mt)
          shapeItem.attr('mt', newMt)
        })

        break
      }

      default: {
        selectedItems.forEach(shapeItem => {
          // 铅笔工具不能设置背景颜色
          if (shapeItem.type === 'Path' && shapeItem.data.extraData.wbType === ToolEnum.Pencil && item.dataKey === 'fillStyle') {
            return
          }

          shapeItem.attr(item.dataKey as any, value)
        })
        break
      }
    }

    wbEditor.triggerRender()
  }

  return (
    <div className="right-attr-panel flex-shrink-0 p-2 overflow-auto " style={{ width: 200 }}>
      <div className="zoom-container flex flex-wrap bg-white rounded-lg p-2 border gap-1 items-center">
        <button onClick={() => wbEditor.camera.zoomOut()}>缩小</button>
        <span style={{ width: 90 }} className="text-center">
          zoom: {round(zoom * 100)}%
        </span>
        <button onClick={() => wbEditor.camera.zoomIn()}>放大</button>
        <button onClick={() => wbEditor.camera.zoomToValue(1)}>100%</button>
        <button onClick={() => wbEditor.camera.zoomToFit()}>适应画布</button>
      </div>

      <hr />

      <div className="attr-container">
        {baseAttrData.map(item => {
          return (
            <div className="form-item" key={item.label}>
              <div className="label">{item.label}</div>

              <WbInputNumber value={item.isMulti ? '多值' : item.value} onChange={value => onChange(item, value)} />
            </div>
          )
        })}
      </div>

      {colorAttrData.map(item => (
        <div className="mt-2" key={item.label}>
          <div className="my-1">{item.label}</div>
          <SelectColor
            value={item.isMulti ? null : (item.value as string)}
            options={item.options}
            onChange={val => onChange(item, val)}
          />
        </div>
      ))}

      {strokeWidthAttrData.map(item => (
        <div className="mt-2" key={item.label}>
          <div className="my-1">{item.label}</div>

          <div className="flex flex-wrap gap-2 items-center">
            {item.options.map(value => (
              <span
                key={value}
                className={clsx(
                  'shrink-0 w-5 h-5 flex rounded-sm items-center justify-center cursor-pointer border border-gray-300',
                  {
                    selected: value === item.value
                  }
                )}
                onClick={() => {
                  if (value === item.value) {
                    return
                  }

                  onChange(item, value)
                }}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
