import React, { useRef } from 'react'
import { AnimatorSingle, calcMidPoint, calculateControlPoint, deg2rad, rad2deg } from 'rmst-render'
import dogPng from '@/assets/dog.png'
import {
  applyToPoint,
  applyToPoints,
  compose,
  fromString,
  identity,
  inverse,
  rotate,
  rotateDEG,
  scale,
  skew,
  toCSS,
  translate
} from 'transformation-matrix'
import { cloneDeep } from 'es-toolkit'

import { observer, useLocalObservable } from 'mobx-react-lite'
import { configure, toJS } from 'mobx'
configure({ enforceActions: 'never' })

import { clearWebSelection, startDrag } from '@/utils/util'
import { getTransformAngle, getTransformAngleByMt } from '../../test'
import { InputNumber } from 'antd'
import { mergeBox, recomputeTransformRect, toStageCoord } from './util'

interface Coord {
  x: number
  y: number
}

enum TransformOrigin {
  TopLeft = 'tl',
  TopRight = 'tr',
  BottomRight = 'br',
  BottomLeft = 'bl',

  Top = 'top',
  Right = 'r',
  Bottom = 'b',
  Left = 'l',

  Center = 'center'
}

const Xg_multi = observer(function TranslationCom() {
  const canvasRef = useRef<SVGSVGElement>()

  const clientToStageCoord = (p: Coord): Coord => {
    const rect = canvasRef.current.getBoundingClientRect()

    return { x: p.x - rect.left, y: p.y - rect.top }
  }

  const state = useLocalObservable(() => {
    const rect_1 = {
      id: 'pink',
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      // transform: [0.9330688558620611, 0.35969780402480117, -0.35969780402480117, 0.9330688558620611, 200, 100]
      // transform: [1, 0, 0, 1, 200, 180],
      mt: translate(200, 180),

      fill: 'pink',
      stroke: 'blue'
    }
    const rect_2 = {
      id: 'orange',
      x: 0,
      y: 0,
      width: 180,
      height: 80,
      mt: compose(translate(350, 230)),
      fill: 'orange',
      stroke: 'blue'
    }

    return { rects: [rect_1, rect_2], selected: new Set<string>() }
  })

  const { rects, selected } = state

  const selectedRects = rects.filter(item => selected.has(item.id))

  const rectsStageCoord = selectedRects.map(item => toStageCoord(item))
  const box = mergeBox(rectsStageCoord)
  const mergedRect =
    selected.size === 1
      ? (() => {
          const rs = rectsStageCoord[0]

          return { x: rs.tl.x, y: rs.tl.y, width: rs.br.x - rs.tl.x, height: rs.br.y - rs.tl.y }
        })()
      : { x: box.minX, y: box.minY, width: box.maxX - box.minX, height: box.maxY - box.minY }

  const onTranslatePointerDown = (downEvt: React.PointerEvent) => {
    downEvt.preventDefault()
    clearWebSelection()

    const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })

    const downSnap = selectedRects.map(item => ({
      downMt: cloneDeep(item.mt),
      downLocalPos: applyToPoint(inverse(item.mt), downPos)
    }))

    startDrag(downEvt, {
      onDragMove: moveEvt => {
        const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })

        selectedRects.forEach((item, index) => {
          const dSnap = downSnap[index]
          const moveLocalPos = applyToPoint(inverse(dSnap.downMt), movePos)

          const dx = moveLocalPos.x - dSnap.downLocalPos.x
          const dy = moveLocalPos.y - dSnap.downLocalPos.y

          const tmt = translate(dx, dy)

          item.mt = compose(dSnap.downMt, tmt)
        })
      }
    })
  }

  const onScalePointerDown = (downEvt: React.PointerEvent, origin: TransformOrigin) => {
    const isCtrl = downEvt.ctrlKey

    if (isCtrl && selected.size === 1) {
      const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })

      const rect = selectedRects[0]

      let originLocal = { x: 0, y: 0 }
      const downRect = cloneDeep(rect)
      const downMt = cloneDeep(rect.mt)

      const downLocal = applyToPoint(inverse(downMt), downPos)

      let startRad = Math.atan2(downLocal.y - originLocal.y, downLocal.x - originLocal.x)

      const d_90 = Math.PI / 2

      startRad = d_90 - startRad

      startDrag(downEvt, {
        onDragMove: moveEvt => {
          const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })
          const moveLocalPos = applyToPoint(inverse(downMt), movePos)

          let endRad = Math.atan2(moveLocalPos.y - originLocal.y, moveLocalPos.x - originLocal.x)

          endRad = d_90 - endRad

          const diff = endRad - startRad

          console.log(rad2deg(diff))

          rect.mt = compose(downRect.mt, skew(diff, 0))
        }
      })
      return
    }

    if (selected.size === 1) {
      const rect = selectedRects[0]
      const downRect = cloneDeep(rect)
      const downMt = cloneDeep(rect.mt)

      const tl = { x: downRect.x, y: downRect.y }
      const tr = { x: downRect.x + downRect.width, y: downRect.y }
      const br = { x: downRect.x + downRect.width, y: downRect.y + downRect.height }
      const bl = { x: downRect.x, y: downRect.y + downRect.height }

      const t = { x: downRect.x + downRect.width / 2, y: downRect.y }
      const r = { x: downRect.x + downRect.width, y: downRect.y + downRect.height / 2 }
      const b = { x: downRect.x + downRect.width / 2, y: downRect.y + downRect.height }
      const l = { x: downRect.x, y: downRect.y + downRect.height / 2 }

      let originLocalPos = { x: 0, y: 0 }
      switch (origin) {
        case TransformOrigin.TopLeft: {
          originLocalPos = tl
          break
        }
        case TransformOrigin.TopRight: {
          originLocalPos = tr
          break
        }
        case TransformOrigin.BottomRight: {
          originLocalPos = br
          break
        }
        case TransformOrigin.BottomLeft: {
          originLocalPos = bl
          break
        }
        case TransformOrigin.Bottom: {
          originLocalPos = b
          break
        }
        case TransformOrigin.Right: {
          originLocalPos = r
          break
        }
        case TransformOrigin.Left: {
          originLocalPos = l
          break
        }
        case TransformOrigin.Top: {
          originLocalPos = t
          break
        }

        default: {
          console.error('未匹配', origin)
          break
        }
      }

      startDrag(downEvt, {
        onDragMove: moveEvt => {
          const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })
          const moveLocalPos = applyToPoint(inverse(downMt), movePos)
          console.log(moveLocalPos)

          let nw = 0
          let nh = 0

          switch (origin) {
            case TransformOrigin.TopLeft: {
              nw = moveLocalPos.x - originLocalPos.x
              nh = moveLocalPos.y - originLocalPos.y
              break
            }
            case TransformOrigin.BottomRight: {
              nw = originLocalPos.x - moveLocalPos.x
              nh = originLocalPos.y - moveLocalPos.y
              break
            }
            case TransformOrigin.TopRight: {
              nw = originLocalPos.x - moveLocalPos.x
              nh = moveLocalPos.y - originLocalPos.y
              break
            }
            case TransformOrigin.BottomLeft: {
              nw = moveLocalPos.x - originLocalPos.x
              nh = originLocalPos.y - moveLocalPos.y
              break
            }
            case TransformOrigin.Top: {
              nw = rect.width
              nh = moveLocalPos.y - originLocalPos.y
              break
            }
            case TransformOrigin.Bottom: {
              nw = rect.width
              nh = originLocalPos.y - moveLocalPos.y
              break
            }
            case TransformOrigin.Right: {
              nw = originLocalPos.x - moveLocalPos.x
              nh = rect.height
              break
            }
            case TransformOrigin.Left: {
              nw = moveLocalPos.x - originLocalPos.x
              nh = rect.height
              break
            }

            default: {
              console.error('未匹配', origin)
              break
            }
          }

          rect.width = Math.abs(nw)
          rect.height = Math.abs(nh)

          // scaleX 和 scaleY 的值为 1 或 -1，用于实现翻转
          const scaleX = Math.sign(nw) || 1
          const scaleY = Math.sign(nh) || 1
          const scaleTransform = scale(scaleX, scaleY)

          const nmt = compose(downMt, scaleTransform)

          let newLocalOrigin = { x: 0, y: 0 }
          switch (origin) {
            case TransformOrigin.TopLeft: {
              newLocalOrigin = { x: 0, y: 0 }
              break
            }
            case TransformOrigin.BottomRight: {
              newLocalOrigin = { x: rect.width, y: rect.height }
              break
            }
            case TransformOrigin.TopRight: {
              newLocalOrigin = { x: rect.width, y: 0 }
              break
            }
            case TransformOrigin.BottomLeft: {
              newLocalOrigin = { x: 0, y: rect.height }
              break
            }

            case TransformOrigin.Top: {
              newLocalOrigin = { x: rect.width / 2, y: 0 }
              break
            }
            case TransformOrigin.Right: {
              newLocalOrigin = { x: rect.width, y: rect.height / 2 }
              break
            }
            case TransformOrigin.Bottom: {
              newLocalOrigin = { x: rect.width / 2, y: rect.height }
              break
            }
            case TransformOrigin.Left: {
              newLocalOrigin = { x: 0, y: rect.height / 2 }
              break
            }

            default: {
              console.error('未匹配', origin)
              break
            }
          }

          const newGlobalOrigin = applyToPoint(nmt, newLocalOrigin)
          const oldGlobalOrigin = applyToPoint(downMt, originLocalPos)

          const offset = { x: oldGlobalOrigin.x - newGlobalOrigin.x, y: oldGlobalOrigin.y - newGlobalOrigin.y }
          const mdf = translate(offset.x, offset.y)

          rect.mt = compose(mdf, nmt)
        },
        onDragEnd(upEvt) {
          console.log(cloneDeep(selectedRects))
        }
      })
    } else {
      let downMt = translate(mergedRect.x, mergedRect.y)
      let originLocalPos = { x: 0, y: 0 }

      const dsr = cloneDeep(selectedRects)

      startDrag(downEvt, {
        onDragMove: moveEvt => {
          const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })
          const moveLocalPos = applyToPoint(inverse(downMt), movePos)

          let nw = moveLocalPos.x - originLocalPos.x
          let nh = moveLocalPos.y - originLocalPos.y
          const sx = nw / mergedRect.width
          const sy = nh / mergedRect.height

          const scaleTransform = scale(sx, sy)

          const newMt = compose(downMt, scaleTransform)
          const varMt = compose(newMt, inverse(downMt))

          selectedRects.forEach((item, index) => {
            const dItem = dsr[index]

            const neMt = compose(varMt, dItem.mt)
            // item.mt = neMt
            // return

            const d = recomputeTransformRect({ id: dItem.id, width: dItem.width, height: dItem.height, mt: neMt })

            Object.assign(item, d)
          })
        },
        onDragEnd(upEvt) {
          console.log(cloneDeep(selectedRects))
        }
      })
    }
  }

  const onCanvasPointerDown = (downEvt: React.PointerEvent) => {
    const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })

    if (selected.size > 0) {
      const rect = selectedRects[0]

      let originLocal = { x: 0, y: 0 }
      const downRect = cloneDeep(rect)
      const downMt = cloneDeep(rect.mt)

      const downLocal = applyToPoint(inverse(downMt), downPos)
      // console.log('onCanvasPointerDown', downLocal)
    }
  }

  const onRotatePointerDown = (downEvt: React.PointerEvent) => {
    const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })

    const origin = { x: mergedRect.x + mergedRect.width / 2, y: mergedRect.y + mergedRect.height / 2 }
    let downSnap = selectedRects.map(item => {
      const downLocal = applyToPoint(inverse(item.mt), downPos)
      console.log(downLocal)
      const originLocal = applyToPoint(inverse(item.mt), origin)

      return {
        downMt: cloneDeep(item.mt),
        originLocal,
        startRad: Math.atan2(downLocal.y - originLocal.y, downLocal.x - originLocal.x)
      }
    })

    startDrag(downEvt, {
      onDragMove: moveEvt => {
        const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })
        {
          const startRad = Math.atan2(downPos.y - origin.y, downPos.x - origin.x)
          selectedRects.forEach((item, index) => {
            const dSnap = downSnap[index]

            const currRad = Math.atan2(movePos.y - origin.y, movePos.x - origin.x)
            const diffRad = currRad - startRad

            item.mt = compose(rotate(diffRad, origin.x, origin.y), dSnap.downMt)
          })
          return
        }
        selectedRects.forEach((item, index) => {
          const dSnap = downSnap[index]
          const origin = dSnap.originLocal

          const moveLocal = applyToPoint(inverse(dSnap.downMt), movePos)
          const currRad = Math.atan2(moveLocal.y - origin.y, moveLocal.x - origin.x)
          const diffRad = currRad - dSnap.startRad

          item.mt = compose(dSnap.downMt, rotate(diffRad, origin.x, origin.y))
        })
      }
    })
  }

  const renderFrameBox = () => {
    if (selected.size === 0) {
      return null
    }

    const calcFrame = () => {
      if (selected.size === 1) {
        const rect = selectedRects[0]

        const tl = { x: rect.x, y: rect.y }
        const tr = { x: rect.x + rect.width, y: rect.y }
        const br = { x: rect.x + rect.width, y: rect.y + rect.height }
        const bl = { x: rect.x, y: rect.y + rect.height }

        const t = { x: rect.x + rect.width / 2, y: rect.y }
        const r = { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
        const b = { x: rect.x + rect.width / 2, y: rect.y + rect.height }
        const l = { x: rect.x, y: rect.y + rect.height / 2 }

        const rotateStyle = { x: t.x, y: t.y - 50 }

        const [tlCoord, trCoord, brCoord, blCoord] = applyToPoints(rect.mt, [tl, tr, br, bl])
        const [tCoord, rCoord, bCoord, lCoord] = applyToPoints(rect.mt, [t, r, b, l])
        const rotCoord = applyToPoint(rect.mt, rotateStyle)

        const pointsString = [tlCoord, trCoord, brCoord, blCoord].reduce((pre, cur) => `${pre} ${cur.x},${cur.y}`, '')

        return { tlCoord, trCoord, brCoord, blCoord, tCoord, rCoord, bCoord, lCoord, rotCoord, pointsString }
      } else {
        const tlCoord = { x: mergedRect.x, y: mergedRect.y }
        const trCoord = { x: mergedRect.x + mergedRect.width, y: mergedRect.y }
        const brCoord = { x: mergedRect.x + mergedRect.width, y: mergedRect.y + mergedRect.height }
        const blCoord = { x: mergedRect.x, y: mergedRect.y + mergedRect.height }
        const pointsString = [tlCoord, trCoord, brCoord, blCoord].reduce((pre, cur) => `${pre} ${cur.x},${cur.y}`, '')

        const t = { x: mergedRect.x + mergedRect.width / 2, y: mergedRect.y }
        const r = { x: mergedRect.x + mergedRect.width, y: mergedRect.y + mergedRect.height / 2 }
        const b = { x: mergedRect.x + mergedRect.width / 2, y: mergedRect.y + mergedRect.height }
        const l = { x: mergedRect.x, y: mergedRect.y + mergedRect.height / 2 }

        const rotateStyle = { x: t.x, y: t.y - 50 }

        const [tCoord, rCoord, bCoord, lCoord] = [t, r, b, l]
        const rotCoord = rotateStyle

        return { tlCoord, trCoord, brCoord, blCoord, tCoord, rCoord, bCoord, lCoord, rotCoord, pointsString }
      }
    }

    const { tlCoord, trCoord, brCoord, blCoord, tCoord, rCoord, bCoord, lCoord, rotCoord, pointsString } = calcFrame()

    const handSize = 10

    return (
      <>
        <polygon
          points={pointsString}
          fill="rgba(255,0,0,0.05)"
          stroke="red"
          strokeWidth={2}
          onPointerDown={evt => onTranslatePointerDown(evt)}
          className="cursor-move"
        />
        <g
          className="cursor-pointer"
          id="tl"
          onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.BottomRight)}
        >
          <rect x={tlCoord.x} y={tlCoord.y} width={handSize} height={handSize} fill="red" stroke="blue" />
          <text x={tlCoord.x} y={tlCoord.y} textAnchor="middle" transform="translate(0, -2)">
            1
          </text>
        </g>

        <g
          className="cursor-pointer"
          id="tr"
          onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.BottomLeft)}
        >
          <rect x={trCoord.x} y={trCoord.y} width={handSize} height={handSize} fill="orange" stroke="blue" />
          <text x={trCoord.x} y={trCoord.y} textAnchor="middle" transform="translate(0, -2)">
            2
          </text>
        </g>
        <g className="cursor-pointer" id="br" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.TopLeft)}>
          <rect x={brCoord.x} y={brCoord.y} width={handSize} height={handSize} fill="blue" stroke="blue" />
          <text x={brCoord.x} y={brCoord.y} textAnchor="middle" transform="translate(0, -2)">
            3
          </text>
        </g>
        <g className="cursor-pointer" id="bl" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.TopRight)}>
          <rect x={blCoord.x} y={blCoord.y} width={handSize} height={handSize} fill="chartreuse" stroke="blue" />
          <text x={blCoord.x} y={blCoord.y} textAnchor="middle" transform="translate(0, -2)">
            4
          </text>
        </g>

        <g className="cursor-pointer" id="t" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.Bottom)}>
          <rect x={tCoord.x} y={tCoord.y} width={handSize} height={handSize} fill="papayawhip" stroke="blue" />
          <text x={tCoord.x} y={tCoord.y} textAnchor="middle" transform="translate(0, -2)">
            top
          </text>
        </g>
        <g className="cursor-pointer" id="r" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.Left)}>
          <rect x={rCoord.x} y={rCoord.y} width={handSize} height={handSize} fill="gold" stroke="blue" />
          <text x={rCoord.x} y={rCoord.y} textAnchor="middle" transform="translate(0, -2)">
            right
          </text>
        </g>
        <g className="cursor-pointer" id="b" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.Top)}>
          <rect x={bCoord.x} y={bCoord.y} width={handSize} height={handSize} fill="fuchsia" stroke="blue" />
          <text x={bCoord.x} y={bCoord.y} textAnchor="middle" transform="translate(0, -2)">
            bottom
          </text>
        </g>
        <g className="cursor-pointer" id="l" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.Right)}>
          <rect x={lCoord.x} y={lCoord.y} width={handSize} height={handSize} fill="aquamarine" stroke="blue" />
          <text x={lCoord.x} y={lCoord.y} textAnchor="middle" transform="translate(0, -2)">
            left
          </text>
        </g>

        <g className="cursor-grab" id="rotate" onPointerDown={onRotatePointerDown}>
          <rect x={rotCoord.x} y={rotCoord.y} width={handSize} height={handSize} fill="aquamarine" stroke="blue" />
          <text x={rotCoord.x} y={rotCoord.y} textAnchor="middle" transform="translate(0, -2)">
            rotate
          </text>
        </g>
      </>
    )
  }

  const onSelected = (id: string) => {
    selected.add(id)
  }

  return (
    <div className="translation-dd flex flex-col h-full">
      <div>
        <button onClick={() => selected.clear()}>清除选中</button>
      </div>

      <main className="relative flex-grow overflow-hidden">
        <svg
          className="border border-pink-300 select-none"
          width={800}
          height={600}
          ref={canvasRef}
          onPointerDown={onCanvasPointerDown}
        >
          {rects.map((item, index) => (
            // <image
            //   key={index}
            //   href={dogPng}
            //   width={item.width}
            //   height={item.height}
            //   transform={toCSS(item.mt)}
            //   onClick={() => onSelected(item.id)}
            // />
            <rect
              key={index}
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              transform={toCSS(item.mt)}
              fill={item.fill}
              stroke={item.stroke}
              strokeWidth={4}
              className="cursor-move"
              onClick={() => onSelected(item.id)}
            />
          ))}

          {renderFrameBox()}
        </svg>
      </main>
    </div>
  )
})

export default Xg_multi

const DOUBLE_PI = Math.PI * 2

/**
 * normalize radian, make it in [0, Math.PI * 2)
 */
export const normalizeRadian = (radian: number): number => {
  radian = radian % DOUBLE_PI
  if (radian < 0) {
    radian += DOUBLE_PI
  }
  return radian
}
