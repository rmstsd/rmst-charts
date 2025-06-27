import React, { useRef } from 'react'
import { AnimatorSingle, calcMidPoint, calculateControlPoint, deg2rad, rad2deg } from 'rmst-render'
import {
  applyToPoint,
  applyToPoints,
  compose,
  flipX,
  flipY,
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

import '../../test'
import { clearWebSelection, startDrag } from '@/utils/util'
import { getTransformAngle, getTransformAngleByMt, Matrix } from '../../test'
import { InputNumber } from 'antd'

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

const Xg = observer(function TranslationCom() {
  const canvasRef = useRef<SVGSVGElement>()

  const clientToStageCoord = (p: Coord): Coord => {
    const rect = canvasRef.current.getBoundingClientRect()

    return { x: p.x - rect.left, y: p.y - rect.top }
  }

  const state = useLocalObservable(() => {
    const rect = {
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      // transform: [0.9330688558620611, 0.35969780402480117, -0.35969780402480117, 0.9330688558620611, 200, 100]
      transform: [1, 0, 0, 1, 200, 180]
    }

    const transformString = `matrix(${rect.transform.toString()})`
    const mt = compose(fromString(transformString))

    return { rect, mt, testCoord: { x: 0, y: 0 } }
  })

  const { rect, mt } = state

  // const rad = getTransformAngleByMt(mt)
  // const angle = rad2deg(rad)

  const p = { x: 1, y: 0 }
  const cmt = cloneDeep(mt)
  cmt.e = 0
  cmt.f = 0
  const tp = applyToPoint(cmt, p)
  const rad = Math.atan2(tp.y, tp.x)
  const angle = rad2deg(normalizeRadian(rad))

  const onTranslatePointerDown = (downEvt: React.PointerEvent) => {
    downEvt.preventDefault()
    clearWebSelection()

    const downMt = cloneDeep(mt)

    const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })
    const downLocalPos = applyToPoint(inverse(downMt), downPos)

    startDrag(downEvt, {
      onMove: moveEvt => {
        const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })
        const moveLocalPos = applyToPoint(inverse(downMt), movePos)

        {
          const dx = movePos.x - downPos.x
          const dy = movePos.y - downPos.y

          const tmt = translate(dx, dy)
          state.mt = compose(tmt, downMt)

          return
        }

        const dx = moveLocalPos.x - downLocalPos.x
        const dy = moveLocalPos.y - downLocalPos.y

        const tmt = translate(dx, dy)
        state.mt = compose(downMt, tmt)
      }
    })
  }

  const onScalePointerDown = (downEvt: React.PointerEvent, origin: TransformOrigin) => {
    const downRect = cloneDeep(rect)
    const downMt = cloneDeep(mt)

    const tl = { x: rect.x, y: rect.y }
    const tr = { x: rect.x + rect.width, y: rect.y }
    const br = { x: rect.x + rect.width, y: rect.y + rect.height }
    const bl = { x: rect.x, y: rect.y + rect.height }

    const t = { x: rect.x + rect.width / 2, y: rect.y }
    const r = { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
    const b = { x: rect.x + rect.width / 2, y: rect.y + rect.height }
    const l = { x: rect.x, y: rect.y + rect.height / 2 }

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

    const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })

    startDrag(downEvt, {
      onMove: moveEvt => {
        const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })
        const moveLocalPos = applyToPoint(inverse(downMt), movePos)

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
        const fixPosMt = translate(offset.x, offset.y)

        state.mt = compose(fixPosMt, nmt)
      }
    })
  }

  const onRotatePointerDown = (downEvt: React.PointerEvent) => {
    const downMt = cloneDeep(mt)
    const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })
    const downLocal = applyToPoint(inverse(downMt), downPos)

    const originLocal = { x: rect.width / 2, y: rect.height / 2 }
    const startRad = Math.atan2(downLocal.y - originLocal.y, downLocal.x - originLocal.x)

    startDrag(downEvt, {
      onMove: moveEvt => {
        const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })

        {
          const origin = applyToPoint(downMt, originLocal)
          const startRad = Math.atan2(downPos.y - origin.y, downPos.x - origin.x)
          const currRad = Math.atan2(movePos.y - origin.y, movePos.x - origin.x)
          const diffRad = currRad - startRad

          state.mt = compose(rotate(diffRad, origin.x, origin.y), downMt)

          return
        }

        const moveLocal = applyToPoint(inverse(downMt), movePos)

        const currRad = Math.atan2(moveLocal.y - originLocal.y, moveLocal.x - originLocal.x)
        const diffRad = currRad - startRad

        state.mt = compose(downMt, rotate(diffRad, originLocal.x, originLocal.y))
      }
    })
  }

  const tl = { x: rect.x, y: rect.y }
  const tr = { x: rect.x + rect.width, y: rect.y }
  const br = { x: rect.x + rect.width, y: rect.y + rect.height }
  const bl = { x: rect.x, y: rect.y + rect.height }

  const t = { x: rect.x + rect.width / 2, y: rect.y }
  const r = { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
  const b = { x: rect.x + rect.width / 2, y: rect.y + rect.height }
  const l = { x: rect.x, y: rect.y + rect.height / 2 }

  const rotateStyle = { x: t.x, y: t.y - 50 }

  const [tlCoord, trCoord, brCoord, blCoord] = applyToPoints(mt, [tl, tr, br, bl])
  const [tCoord, rCoord, bCoord, lCoord] = applyToPoints(mt, [t, r, b, l])
  const rotCoord = applyToPoint(mt, rotateStyle)

  const handSize = 10

  const onAngleChange = (value: number) => {
    let center = { x: rect.width / 2, y: rect.height / 2 }
    center = applyToPoint(mt, center)

    const nvRad = normalizeRadian(deg2rad(value))
    const rom = rotate(nvRad - rad, center.x, center.y)
    state.mt = compose(rom, mt)
  }

  return (
    <div className="translation-dd flex flex-col h-full">
      <div className="flex gap-2 mb-2">
        <div className="flex gap-2 items-center">
          <span>x: </span>
          <span>
            <input
              type="range"
              min={-100}
              max={600}
              step={10}
              value={mt.e}
              onChange={e => {
                const value = parseFloat(e.target.value)
                mt.e = value
              }}
            />
            <div>{mt.e.toFixed(10)}</div>
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <span>y: </span>
          <span>
            <input
              type="range"
              min={-100}
              max={600}
              step={10}
              value={mt.f}
              onChange={e => {
                const value = parseFloat(e.target.value)
                mt.f = value
              }}
            />
            <div>{mt.f.toFixed(10)}</div>
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <span>width: </span>
          <span>
            <input
              type="range"
              min={0}
              max={400}
              step={10}
              value={rect.width}
              onChange={e => (rect.width = parseFloat(e.target.value))}
            />
            <div>{rect.width.toFixed(10)}</div>
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <span>height: </span>
          <span>
            <input
              type="range"
              min={0}
              max={400}
              step={10}
              value={rect.height}
              onChange={e => (rect.height = parseFloat(e.target.value))}
            />
            <div>{rect.height.toFixed(10)}</div>
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <span>angle: </span>
          <span>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={angle}
              onChange={e => {
                const value = parseFloat(e.target.value)
                onAngleChange(value)
              }}
            />

            <InputNumber value={Math.round(angle)} step={4} onChange={onAngleChange} changeOnWheel />

            <div>{Math.round(angle)}</div>
          </span>
        </div>
      </div>

      <div className="mb-2 flex gap-2">
        <button
          onClick={() => {
            let startMt = cloneDeep(mt)

            const ani = new AnimatorSingle(1, -1, { duration: 300 })
            ani.onUpdate = val => {
              const rm = scale(val, 1, rect.width / 2, rect.height / 2)
              state.mt = compose(startMt, rm)
            }
            ani.start()
          }}
        >
          x 翻转 scale(-1)
        </button>
      </div>

      <main className="relative flex-grow overflow-hidden">
        <svg className="border border-pink-300 select-none" width={800} height={600} ref={canvasRef}>
          <rect
            id="controlled-rect"
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            // transform={`matrix(${1}, ${0}, ${0}, ${1}, ${mt.e}, ${mt.f})`}
            transform={toCSS(mt)}
            fill="pink"
            stroke="red"
            strokeWidth={4}
            onPointerDown={evt => onTranslatePointerDown(evt)}
            // vectorEffect="non-scaling-stroke"
            className="cursor-move"
          />

          <circle cx={mt.e} cy={mt.f} r={2} fill="red" />

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
          <g
            className="cursor-pointer"
            id="bl"
            onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.TopRight)}
          >
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
          {/* test */}
          <circle cx={state.testCoord.x} cy={state.testCoord.y} r={4} fill="blue" style={{ pointerEvents: 'none' }} />
        </svg>
      </main>
    </div>
  )
})

export default Xg

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
