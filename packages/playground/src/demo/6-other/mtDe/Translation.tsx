import React, { CSSProperties, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { deg2rad, rad2deg } from 'rmst-render'
import { applyToPoint, compose, inverse, rotateDEG, scale, toCSS, translate } from 'transformation-matrix'

import { observer, useLocalObservable } from 'mobx-react-lite'
import { configure, toJS } from 'mobx'
import { stClone } from 'rmst-charts/utils'

configure({ enforceActions: 'never' })

const width = 100
const height = 50
const rect = { x: 300, y: 400, width, height }

const ctrlSize = 20

interface Coord {
  x: number
  y: number
}

type TransformOrigin =
  | 'left top'
  | 'right top'
  | 'left bottom'
  | 'right bottom'
  | 'center'
  | 'left'
  | 'top'
  | 'right'
  | 'bottom'

const originPosMap: Record<TransformOrigin, Coord> = {
  'left top': { x: 0, y: 0 },
  'right top': { x: width, y: 0 },
  'right bottom': { x: width, y: height },
  'left bottom': { x: 0, y: height },
  center: { x: width / 2, y: height / 2 },
  left: { x: 0, y: height / 2 },
  top: { x: width / 2, y: 0 },
  right: { x: width, y: height / 2 },
  bottom: { x: width / 2, y: height }
}

const origins: TransformOrigin[] = Object.keys(originPosMap) as TransformOrigin[]

const Translation = observer(function TranslationCom() {
  useEffect(() => {
    const abCt = new AbortController()
    document.addEventListener(
      'pointermove',
      () => {
        const sel = window.getSelection()
        if (sel.rangeCount > 0) sel.removeAllRanges()
      },
      { capture: true, signal: abCt.signal }
    )

    return () => {
      abCt.abort()
    }
  }, [])

  const state = useLocalObservable(() => ({
    transformOrigin: 'left top' as TransformOrigin,
    translateValue: { x: 0, y: 0 },
    rotateValue: 0,
    scaleValue: { x: 1, y: 1 }
  }))

  const updateOrigin = (nvOrigin: TransformOrigin) => {
    const newPos = originPosMap[nvOrigin]

    state.transformOrigin = nvOrigin
    const { rotateValue, scaleValue } = state

    const newMt = compose(
      // translate(translateValue.x, translateValue.y),
      rotateDEG(rotateValue, newPos.x, newPos.y),
      scale(scaleValue.x, scaleValue.y, newPos.x, newPos.y)
    )

    const translateMt = compose(mt, inverse(newMt))
    state.translateValue = { x: translateMt.e, y: translateMt.f }
  }

  const originPos = originPosMap[state.transformOrigin]
  const mt = compose(
    translate(state.translateValue.x, state.translateValue.y),
    rotateDEG(state.rotateValue, originPos.x, originPos.y),
    scale(state.scaleValue.x, state.scaleValue.y, originPos.x, originPos.y)
  )

  const tlPoint = applyToPoint(mt, { x: 0, y: 0 })
  const trPoint = applyToPoint(mt, { x: rect.width, y: 0 })
  const brPoint = applyToPoint(mt, { x: rect.width, y: rect.height })
  const blPoint = applyToPoint(mt, { x: 0, y: rect.height })

  const tlStyle = { left: rect.x + tlPoint.x, top: rect.y + tlPoint.y }
  const trStyle = { left: rect.x + trPoint.x, top: rect.y + trPoint.y }
  const brStyle = { left: rect.x + brPoint.x, top: rect.y + brPoint.y }
  const blStyle = { left: rect.x + blPoint.x, top: rect.y + blPoint.y }

  const c1Style = calcCenterPoint(tlStyle, trStyle)
  const c2Style = calcCenterPoint(trStyle, brStyle)
  const c3Style = calcCenterPoint(brStyle, blStyle)
  const c4Style = calcCenterPoint(blStyle, tlStyle)

  const pp =
    state.scaleValue.y >= 0
      ? [
          { x: tlStyle.left, y: tlStyle.top },
          { x: trStyle.left, y: trStyle.top }
        ]
      : [
          { x: blStyle.left, y: blStyle.top },
          { x: brStyle.left, y: brStyle.top }
        ]

  const result = calculatePointA(pp[0], pp[1], state.rotateValue, true)
  const rotateStyle: CSSProperties = { left: result.x, top: result.y }

  const pp2 =
    state.scaleValue.y >= 0
      ? [
          { x: blStyle.left, y: blStyle.top },
          { x: brStyle.left, y: brStyle.top }
        ]
      : [
          { x: tlStyle.left, y: tlStyle.top },
          { x: trStyle.left, y: trStyle.top }
        ]

  const result2 = calculatePointA(pp2[0], pp2[1], state.rotateValue, false)
  const rotateScaleStyle: CSSProperties = { left: result2.x, top: result2.y }

  const onTranslatePointerDown = (downEvt: React.PointerEvent) => {
    const downPos = { x: downEvt.clientX, y: downEvt.clientY }
    const translateValue = toJS(state.translateValue)

    startDrag(downEvt, {
      onMove: moveEvt => {
        const dx = moveEvt.clientX - downPos.x
        const dy = moveEvt.clientY - downPos.y

        state.translateValue = { x: translateValue.x + dx, y: translateValue.y + dy }
      }
    })
  }

  const onRotatePointerDown = (downEvt: React.PointerEvent) => {
    updateOrigin('center')

    const downPos = { x: downEvt.clientX, y: downEvt.clientY }

    const origin = { x: (tlStyle.left + brStyle.left) / 2, y: (tlStyle.top + brStyle.top) / 2 }
    const startAngle = Math.atan2(downPos.y - origin.y, downPos.x - origin.x)

    const rotateValue = toJS(state.rotateValue)

    startDrag(downEvt, {
      onMove: moveEvt => {
        const mx = moveEvt.clientX
        const my = moveEvt.clientY

        const currAngle = Math.atan2(my - origin.y, mx - origin.x)
        const diffAngle = rad2deg(currAngle) - rad2deg(startAngle)
        state.rotateValue = rotateValue + diffAngle
      }
    })
  }

  const onScalePointerDown = (downEvt: React.PointerEvent, origin: TransformOrigin) => {
    updateOrigin(origin)
    const originPos = originPosMap[origin]

    const mt = inverse(
      compose(
        translate(state.translateValue.x, state.translateValue.y),
        rotateDEG(rotateValue, originPos.x, originPos.y)
      )
    )

    const downPos = { x: downEvt.clientX - rect.x, y: downEvt.clientY - rect.y }
    const dd = applyToPoint(mt, downPos)

    const scaleValue = stClone(toJS(state.scaleValue))

    startDrag(downEvt, {
      onMove: moveEvt => {
        // 鼠标按下后 -> 同时控制缩放 和 旋转 (需要获取最新的 state.rotateValue)
        const mt = inverse(
          compose(
            translate(state.translateValue.x, state.translateValue.y),
            rotateDEG(state.rotateValue, originPos.x, originPos.y)
          )
        )

        const mmPos = { x: moveEvt.clientX - rect.x, y: moveEvt.clientY - rect.y }
        const mm = applyToPoint(mt, mmPos)

        let dx = 0
        let dy = 0

        switch (origin) {
          case 'left top': {
            dx = mm.x - dd.x
            dy = mm.y - dd.y
            break
          }
          case 'right top': {
            dx = -(mm.x - dd.x)
            dy = mm.y - dd.y
            break
          }
          case 'right bottom': {
            dx = -(mm.x - dd.x)
            dy = -(mm.y - dd.y)
            break
          }
          case 'left bottom': {
            dx = mm.x - dd.x
            dy = -(mm.y - dd.y)
            break
          }

          case 'top': {
            dy = mm.y - dd.y
            break
          }
          case 'right': {
            dx = -(mm.x - dd.x)
            break
          }
          case 'bottom': {
            dy = -(mm.y - dd.y)
            break
          }
          case 'left': {
            dx = mm.x - dd.x
            break
          }
          case 'center': {
            // dx = (mm.x - dd.x) * 2
            dy = (mm.y - dd.y) * 2
            break
          }

          default: {
            console.error('未匹配', origin)
            break
          }
        }

        const dsy = dy / rect.height
        const dsx = dx / rect.width
        // const dsx = dsy // 等比缩放

        state.scaleValue = { x: scaleValue.x + dsx, y: scaleValue.y + dsy }
      }
    })
  }

  const onRotateScalePointerDown = (downEvt: React.PointerEvent) => {
    onRotatePointerDown(downEvt)
    onScalePointerDown(downEvt, 'center')
  }

  const { translateValue, rotateValue, scaleValue } = state

  const tool = (
    <div>
      <div className="my-2 flex gap-2 items-center">
        <span className="text-lg">修改原点:</span>
        {origins.map(item => (
          <button
            key={item}
            className={item === state.transformOrigin ? ' bg-blue-500 text-white' : ''}
            onClick={() => updateOrigin(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="my-2 flex gap-2 items-center">
        <span className="text-lg">translateValue.x: </span>
        <input
          type="range"
          min={-100}
          max={100}
          step={10}
          value={translateValue.x}
          onChange={e => (state.translateValue = { x: +e.target.value, y: translateValue.y })}
        />
        <button onClick={() => (state.translateValue = { x: 0, y: translateValue.y })}>tx 0</button>

        <span className="mx-1">|</span>

        <span className="text-lg">translateValue.y: </span>
        <input
          type="range"
          min={-100}
          max={100}
          step={10}
          value={translateValue.y}
          onChange={e => (state.translateValue = { x: translateValue.x, y: +e.target.value })}
        />
        <button onClick={() => (state.translateValue = { x: translateValue.x, y: 0 })}>ty 0</button>
      </div>

      <div className="my-2 flex gap-2 items-center">
        <span className="text-lg">scaleX: </span>
        <input
          type="range"
          min={-3}
          max={5}
          step={0.2}
          value={scaleValue.x}
          onChange={e => (state.scaleValue = { x: +e.target.value, y: scaleValue.y })}
        />
        <button onClick={() => (state.scaleValue = { x: scaleValue.x, y: 1 })}>sx 1</button>

        <span className="mx-1">|</span>

        <span className="text-lg">scaleY: </span>
        <input
          type="range"
          min={-3}
          max={5}
          step={0.2}
          value={scaleValue.y}
          onChange={e => (state.scaleValue = { x: scaleValue.x, y: +e.target.value })}
        />
        <button onClick={() => (state.scaleValue = { x: 1, y: scaleValue.y })}>sy 1</button>

        <span className="mx-1">|</span>

        <input
          type="range"
          min={0}
          max={360}
          step={15}
          value={rotateValue}
          onChange={e => (state.rotateValue = +e.target.value)}
        />
        <button onClick={() => (state.rotateValue = 0)}>rotate 0</button>
      </div>

      <div className="flex gap-4 text-lg">
        <span>transformOrigin: {state.transformOrigin}</span>
      </div>

      <div className="flex gap-4 text-lg">
        <span>translate: {JSON.stringify(translateValue)}</span>
      </div>

      <div className="flex gap-4 text-lg">
        <span>rotate: {rotateValue}</span>
        <span>scale: {JSON.stringify(scaleValue)}</span>
      </div>
    </div>
  )

  const obbTt = compose(mt, inverse(scale(scaleValue.x, scaleValue.y)))

  const obbTopLeft_v2 = scaleValue.x > 0 ? pp[0] : pp[1]

  const obbTl = { x: rect.x, y: rect.y }
  const obbRb = { x: rect.x + rect.width * scaleValue.x, y: rect.y + rect.height * scaleValue.y }
  const obbLeft = obbTopLeft_v2.x // Math.min(obbTl.x, obbRb.x)
  const obbTop = obbTopLeft_v2.y // Math.min(obbTl.y, obbRb.y)
  const obbWidth = Math.abs(rect.width * scaleValue.x)
  const obbHeight = Math.abs(rect.height * scaleValue.y)

  return (
    <div className="translation-dd">
      {tool}

      {createPortal(
        <>
          <div
            className="controlled-rect bg-pink-300 cursor-move box-border z-50"
            onPointerDown={onTranslatePointerDown}
            style={{
              position: 'fixed',
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              // transformOrigin: '0 0',
              // transform: toCSS(mt)
              transformOrigin: state.transformOrigin,
              transform: `translate(${translateValue.x}px, ${translateValue.y}px) rotate(${rotateValue}deg) scale(${scaleValue.x}, ${scaleValue.y}) `
              // translate: `${translateValue.x}px ${translateValue.y}px`,
              // rotate: `${rotateValue}deg`,
              // scale: `${scaleValue.x} ${scaleValue.y}`
            }}
          ></div>
          <div className="edit-tool">
            <div
              className="obb fixed z-50 border border-2 border-red-500 pointer-events-none"
              style={{
                left: obbLeft,
                top: obbTop,
                width: obbWidth,
                height: obbHeight,
                transformOrigin: '0 0',
                // transform: toCSS(obbTt)
                // transform: `translate(${tt.e}px, ${tt.f}px) rotate(${rotateValue}deg)`
                transform: `rotate(${rotateValue}deg)`
              }}
            ></div>

            <div
              data-action="rotate"
              className="fixed z-50 bg-red-400 cursor-grab rounded-full"
              onPointerDown={onRotatePointerDown}
              style={{
                width: ctrlSize,
                height: ctrlSize,
                ...rotateStyle,
                translate: '-50% -50%',
                rotate: `${rotateValue}deg`
              }}
            >
              r
            </div>

            <div
              className="fixed z-50 bg-teal-400 cursor-grab rounded-full"
              onPointerDown={onRotateScalePointerDown}
              style={{
                width: ctrlSize,
                height: ctrlSize,
                ...rotateScaleStyle,
                translate: '-50% -50%',
                rotate: `${rotateValue}deg`
              }}
            >
              rs
            </div>
            <div
              className="fixed z-50 bg-blue-500 cursor-pointer "
              style={{
                width: ctrlSize,
                height: ctrlSize,
                ...tlStyle,
                translate: '-50% -50%',
                rotate: `${rotateValue}deg`
              }}
              onPointerDown={evt => onScalePointerDown(evt, 'right bottom')}
            >
              1
            </div>
            <div
              className="fixed z-50 bg-cyan-500 cursor-pointer "
              style={{
                width: ctrlSize * 2,
                height: ctrlSize,
                ...c1Style,
                translate: '-50% -50%',
                rotate: `${rotateValue}deg`
              }}
              onPointerDown={evt => onScalePointerDown(evt, 'bottom')}
            >
              c1
            </div>
            <div
              className="fixed z-50 bg-lime-400 cursor-pointer "
              style={{
                width: ctrlSize,
                height: ctrlSize,
                ...trStyle,
                translate: '-50% -50%',
                rotate: `${rotateValue}deg`
              }}
              onPointerDown={evt => onScalePointerDown(evt, 'left bottom')}
            >
              2
            </div>
            <div
              className="fixed z-50 bg-fuchsia-400 cursor-pointer"
              style={{
                width: ctrlSize,
                height: ctrlSize * 2,
                ...c2Style,
                translate: '-50% -50%',
                rotate: `${rotateValue}deg`
              }}
              onPointerDown={evt => onScalePointerDown(evt, 'left')}
            >
              c2
            </div>
            <div
              className="fixed z-50 bg-amber-500 cursor-pointer"
              style={{
                width: ctrlSize,
                height: ctrlSize,
                ...brStyle,
                translate: '-50% -50%',
                rotate: `${rotateValue}deg`
              }}
              onPointerDown={evt => onScalePointerDown(evt, 'left top')}
            >
              3
            </div>
            <div
              className="fixed z-50 bg-yellow-500 cursor-pointer"
              style={{
                width: ctrlSize * 2,
                height: ctrlSize,
                ...c3Style,
                translate: '-50% -50%',
                rotate: `${rotateValue}deg`
              }}
              onPointerDown={evt => onScalePointerDown(evt, 'top')}
            >
              c3
            </div>
            <div
              className="fixed z-50 bg-teal-400 cursor-pointer"
              style={{
                width: ctrlSize,
                height: ctrlSize,
                ...blStyle,
                translate: `-50% -50%`,
                rotate: `${rotateValue}deg`
              }}
              onPointerDown={evt => onScalePointerDown(evt, 'right top')}
            >
              4
            </div>
            <div
              className="fixed z-50 bg-violet-500 cursor-pointer"
              style={{
                width: ctrlSize,
                height: ctrlSize * 2,
                ...c4Style,
                translate: '-50% -50%',
                rotate: `${rotateValue}deg`
              }}
              onPointerDown={evt => onScalePointerDown(evt, 'right')}
            >
              c4
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
})
export default Translation

const startDrag = (
  downEvt: React.PointerEvent,
  { onMove, onUp }: { onMove?: (moveEvt: PointerEvent) => void; onUp?: (upEvt: PointerEvent) => void }
) => {
  const abCt = new AbortController()

  document.addEventListener(
    'pointermove',
    moveEvt => {
      onMove?.(moveEvt)
    },
    { signal: abCt.signal }
  )

  document.addEventListener(
    'pointerup',
    evt => {
      abCt.abort()

      onUp?.(evt)
    },
    { signal: abCt.signal }
  )
}

// 已知一个点 和 指定角度, 求在这个角度下延长的坐标
function calculatePointA(p1: Coord, p2: Coord, rotateValue: number, isRotate: boolean) {
  // 计算中点的坐标
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2

  const rad = deg2rad(isRotate ? rotateValue : rotateValue + 180)

  const distance = 40
  const y = Math.cos(rad) * distance
  const x = Math.sin(rad) * distance

  return { x: mx + x, y: my - y }
}

function calcCenterPoint(p1, p2) {
  const mx = (p1.left + p2.left) / 2
  const my = (p1.top + p2.top) / 2

  return { left: mx, top: my }
}

function Test() {
  const tx = 20
  const ty = 30

  const rotate = 30
  const sx = 1.5
  const sy = 1.2

  const origin = { x: 40, y: 50 }

  const mt = compose(translate(tx, ty), rotateDEG(rotate, origin.x, origin.y), scale(sx, sy, origin.x, origin.y))

  return (
    <div
      className="fixed top-0 left-0 bg-orange-400 z-50"
      style={{
        width: 100,
        height: 100,
        transformOrigin: `${origin.x}px ${origin.y}px`,
        // transformOrigin: `${0}px ${0}px`,
        // transform: toCSS(mt)
        transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg) scale(${sx}, ${sy})`
      }}
    ></div>
  )
}
