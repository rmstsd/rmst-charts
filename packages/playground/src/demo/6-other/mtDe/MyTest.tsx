import * as React from 'react'
import { getStroke, getStrokePoints } from 'perfect-freehand'
import fitCurve from 'fit-curve'
import dogPng from '@/assets/zy.jpg'
import jntmPng from '@/assets/jntm.png'
import { Box, deg2rad, rad2deg, System } from 'detect-collisions'

import oc from 'open-color'
import { applyToPoint, compose, rotate, rotateDEG, skew, toCSS, translate } from 'transformation-matrix'
import { startDrag } from '@/utils/util'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { cloneDeep } from 'es-toolkit'
import clsx from 'clsx'

const Example = observer(function Example() {
  const rect1 = {
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    mt: compose(rotateDEG(30), skew(0.3, 0.4))
  }

  const state = useLocalObservable(() => {
    const box_sel = {
      x: 90,
      y: 90,
      width: 50,
      height: 50
    }
    return { box_sel, cursor: 'move', bool: true }
  })
  const { box_sel } = state

  const system = new System()

  const points = [
    { x: rect1.x, y: rect1.y },
    { x: rect1.x + rect1.width, y: rect1.y },
    { x: rect1.x + rect1.width, y: rect1.y + rect1.height },
    { x: rect1.x, y: rect1.y + rect1.height }
  ].map(item => applyToPoint(rect1.mt, item))

  const r_1 = system.createPolygon({ x: 0, y: 0 }, points)
  const sel = system.createBox({ x: box_sel.x, y: box_sel.y }, box_sel.width, box_sel.height)

  const isCollision = system.checkCollision(sel, r_1)

  return (
    <svg className={clsx('border', state.bool ? 'move-cursor' : 'pointer-cursor')} width={700} height={600}>
      <g transform={toCSS(translate(10, 10))}>
        <rect {...rect1} stroke="red" fill={isCollision ? 'pink' : 'none'} transform={toCSS(rect1.mt)} />

        <rect
          {...box_sel}
          stroke="blue"
          fill="rgba(0, 0, 0, 0.1)"
          onPointerDown={downEvt => {
            const downRect = cloneDeep(box_sel)

            startDrag(downEvt, {
              onDragMove: moveEvt => {
                const dx = moveEvt.clientX - downEvt.clientX
                const dy = moveEvt.clientY - downEvt.clientY
                state.box_sel.x = downRect.x + dx
                state.box_sel.y = downRect.y + dy

                state.bool = false
              }
            })
          }}
        />
      </g>
    </svg>
  )
})

export default Example

export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return ''

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const index = (i + 1) % arr.length

      const [x1, y1] = arr[index]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...stroke[0], 'Q']
  )

  d.push('Z')
  return d.join(' ')
}
