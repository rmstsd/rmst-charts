import { useEffect, useState } from 'react'
import { useWbEditor } from '../context'
import { calcRotateRad, getScaleFromMatrix_x, getScaleFromMatrix_y, isImageShape, isPencilShape } from '../constant'
import { deg2rad, rad2deg, RmstImage, UiBase } from 'rmst-render'
import { round } from 'es-toolkit'

import { WbInputNumber, WbInputNumberProps } from '../components/WbInputNumber'
import { applyToPoint, compose, inverse, rotate } from 'transformation-matrix'
import OpenColor from 'open-color'
import { SelectColor } from '../components/SelectColor'
import { showOpenFilePicker } from 'show-open-file-picker'
import clsx from 'clsx'

import './right.less'

const bgColors = Object.keys(OpenColor)
  .filter(k => Array.isArray(OpenColor[k]))
  .map(k => OpenColor[k][1])

const strokeColors = Object.keys(OpenColor)
  .filter(k => Array.isArray(OpenColor[k]))
  .map(k => OpenColor[k][7])
strokeColors.unshift(OpenColor.gray[3])

// 取到小数点后 2 位, 既是为了显示好看, 也用来判断是否相等
const attrList = [
  { label: 'X', dataKey: 'mt_x', getValue: (shapeItem: UiBase) => round(shapeItem.data.mt.e, 2) },
  { label: 'Y', dataKey: 'mt_y', getValue: (shapeItem: UiBase) => round(shapeItem.data.mt.f, 2) },
  { label: 'W', dataKey: 'width', getValue: (shapeItem: UiBase) => round(shapeItem.data.width, 2) },
  { label: 'H', dataKey: 'height', getValue: (shapeItem: UiBase) => round(shapeItem.data.height, 2) },
  { label: 'R', dataKey: 'mt_rotate', getValue: (shapeItem: UiBase) => round(rad2deg(calcRotateRad(shapeItem.data.mt)), 5) }
]

const colorAttrList = [
  {
    label: '背景',
    dataKey: 'fillStyle',
    support: (shapeItem: UiBase) => !isImageShape(shapeItem) && !isPencilShape(shapeItem),
    getValue: (shapeItem: UiBase) => shapeItem.data.fillStyle,
    options: bgColors
  },
  { label: '描边', dataKey: 'strokeStyle', getValue: (shapeItem: UiBase) => shapeItem.data.strokeStyle, options: strokeColors }
]

const strokeWidthAttrList = [
  { label: '描边宽度', dataKey: 'lineWidth', getValue: (shapeItem: UiBase) => shapeItem.data.lineWidth, options: [1, 2, 3, 4] }
]

const imageSrcAttrList = [
  {
    label: '图片',
    dataKey: 'src',
    support: (shapeItem: UiBase) => isImageShape(shapeItem),
    getValue: (shapeItem: RmstImage) => shapeItem.data.src
  }
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
          const values = new Set(selectedItems.map(shapeItem => item.getValue(shapeItem)))
          const isMulti = values.size > 1

          return { ...item, isMulti, value: isMulti ? null : [...values][0] }
        })

  const colorAttrData =
    selectedItems.length === 0
      ? []
      : colorAttrList
          .map(item => {
            const support = item.support || (() => true)
            const supportItems = selectedItems.filter(shapeItem => support(shapeItem))

            const values = new Set(supportItems.map(shapeItem => item.getValue(shapeItem)))
            const isMulti = values.size > 1

            return { ...item, isSupport: supportItems.length > 0, isMulti, value: isMulti ? null : [...values][0] }
          })
          .filter(item => item.isSupport)

  const strokeWidthAttrData =
    selectedItems.length === 0
      ? []
      : strokeWidthAttrList.map(item => {
          const values = new Set(selectedItems.map(shapeItem => round(item.getValue(shapeItem), 5)))
          const isMulti = values.size > 1

          return { ...item, isMulti, value: isMulti ? null : round([...values][0], 2) }
        })

  const imageSrcAttrListAttrData =
    selectedItems.length === 0
      ? []
      : imageSrcAttrList
          .map(item => {
            const support = item.support || (() => true)
            const supportItems = selectedItems.filter(shapeItem => support(shapeItem))

            const values = new Set(supportItems.map(shapeItem => item.getValue(shapeItem as RmstImage)))
            const isMulti = values.size > 1

            return { ...item, isSupport: supportItems.length > 0, isMulti, value: isMulti ? null : [...values][0] }
          })
          .filter(item => item.isSupport)

  const onValueChange = (item, value) => {
    switch (item.dataKey) {
      case 'mt_x': {
        selectedItems.forEach(shapeItem => {
          const mt = { ...shapeItem.data.mt, e: value }
          shapeItem.attr('mt', mt)
        })

        break
      }
      case 'mt_y': {
        selectedItems.forEach(shapeItem => {
          const mt = { ...shapeItem.data.mt, f: value }
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
        const support = item.support || (() => true)
        const supportItems = selectedItems.filter(shapeItem => support(shapeItem))

        supportItems.forEach(shapeItem => {
          shapeItem.attr(item.dataKey as any, value)
        })
        break
      }
    }

    wbEditor.triggerRender()
  }

  return (
    <div className="right-attr-panel flex-shrink-0 p-2 pt-0 overflow-auto " style={{ width: 200 }}>
      <div className="zoom-container flex flex-wrap bg-white p-2 border gap-1 items-center">
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

              <WbInputNumber value={item.isMulti ? '多值' : item.value} onChange={value => onValueChange(item, value)} />
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
            onChange={val => onValueChange(item, val)}
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
                  { selected: value === item.value }
                )}
                onClick={() => {
                  if (value === item.value) {
                    return
                  }

                  onValueChange(item, value)
                }}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      ))}

      {imageSrcAttrListAttrData.map(item => (
        <div className="mt-2" key={item.label}>
          <div className="my-1">{item.label}</div>

          <div className="flex items-end gap-1">
            <div className="w-16 h-16 content-center text-center border">
              {item.isMulti ? '多值' : <img src={item.value} className="w-full h-full object-cover" />}
            </div>
            <button
              onClick={async () => {
                const files = await showOpenFilePicker({
                  types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpeg', '.jpg'] } }]
                }).catch(() => Promise.reject())

                if (files.length === 0) {
                  return
                }

                const url = URL.createObjectURL(await files[0].getFile())

                onValueChange(item, url)
              }}
            >
              上传
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
